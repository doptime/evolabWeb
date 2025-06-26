'use client';

import * as Tone from 'tone';

// 全局变量，标记AudioContext是否已启动
let isAudioContextStarted = false;

// 确保AudioContext在用户交互后启动
const ensureAudioContextStarted = async () => {
    if (!isAudioContextStarted) {
        try {
            // 只有在AudioContext状态为'suspended'时才尝试resume，避免不必要的Tone.start()
            if (Tone.context.state === 'suspended') {
                await Tone.context.resume();
            } else { // 如果AudioContext未启动或已关闭，则重新启动Tone
                await Tone.start();
            }
            isAudioContextStarted = true;
            console.log("Tone.js AudioContext started/resumed.");
        } catch (e) {
            console.error("Error starting Tone.js AudioContext:", e);
            isAudioContextStarted = false;
        }
    }
};

// 监听用户交互事件来启动AudioContext
// 仅在客户端环境执行
if (typeof window !== 'undefined') {
    // 使用 capture: true 确保在事件捕获阶段触发，提高启动成功率
    // 添加一次性事件监听，防止重复绑定
    document.documentElement.addEventListener('mousedown', ensureAudioContextStarted, { once: true, capture: true });
    document.documentElement.addEventListener('touchstart', ensureAudioContextStarted, { once: true, capture: true });
    document.documentElement.addEventListener('keydown', ensureAudioContextStarted, { once: true, capture: true });
}

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        // 确保Tone.js AudioContext已启动，这对于Web Speech API也很有帮助，尽管不是直接依赖
        // Web Speech API 的启动可能不需要明确的Tone.start()，但这里确保了用户交互
        // 已经发生，有助于克服浏览器自动播放策略。
         await ensureAudioContextStarted(); 

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // 移除 cancel() 调用，以允许语音排队
            // if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            //     window.speechSynthesis.cancel();
            // }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            utterance.onend = () => {
                console.log(`Speech synthesis ended for: "${text}"`);
                resolve();
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror: An error occurred during speech synthesis.', event);
                // 即使发生错误，也解决 Promise 以避免阻止后续流程
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('SpeechSynthesis not supported in this browser or environment.');
            resolve(); // 如果不支持，也直接解决Promise
        }
    });
};

export const playSound = (note: string): Promise<void> => {
    return new Promise(async (resolve) => {
        // 确保Tone.js已初始化
        await ensureAudioContextStarted(); // 确保AudioContext已启动

        const synth = new Tone.Synth().toDestination(); // Synth is connected to destination here
        
        // Play the note.
        synth.triggerAttackRelease(note, "8n"); 

        // Schedule the dispose and promise resolution after the note duration.
        // Tone.Transport.now() gets the current time on the transport timeline.
        // Adding the duration ensures the dispose happens after the note finishes.
        Tone.Transport.scheduleOnce(() => {
            synth.dispose(); // Release synthesizer resources
            resolve();
        }, Tone.Transport.now() + Tone.Time("8n").toSeconds()); 
        
        // Tone.Transport 会在 Tone.start() 之后自动启动，这里不再需要额外调用
        // if (Tone.Transport.state !== 'started') {
        //     Tone.Transport.start(); // 确保Transport正在运行，以触发scheduleOnce
        // }
    });
};