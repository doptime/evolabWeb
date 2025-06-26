'use client';

import * as Tone from 'tone';

// 全局变量，标记AudioContext是否已启动
let isAudioContextStarted = false;

// 确保AudioContext在用户交互后启动
const ensureAudioContextStarted = async () => {
    if (!isAudioContextStarted) {
        try {
            // 检查 Tone.context 的状态
            if (Tone.context.state === 'suspended') {
                await Tone.context.resume();
                console.log("Tone.js AudioContext resumed.");
            } else if (Tone.context.state === 'closed') {
                // 如果已关闭，则重新启动 Tone.js，这将创建新的 AudioContext
                await Tone.start();
                console.log("Tone.js AudioContext started from closed state.");
            } else if (Tone.context.state === 'running') {
                // 如果已经运行，则不需要做任何事
                console.log("Tone.js AudioContext is already running.");
            }
            isAudioContextStarted = true;
        } catch (e) {
            console.error("Error starting/resuming Tone.js AudioContext:", e);
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
    document.documentElement.addEventListener('click', ensureAudioContextStarted, { once: true, capture: true });
}

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted(); // 确保 AudioContext 已启动

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;

            // 确保在语音开始前设置 onend 和 onerror
            utterance.onend = () => {
                console.log(`Speech synthesis ended for: "${text}"`);
                resolve();
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror: An error occurred during speech synthesis.', event);
                // 即使发生错误，也解决 Promise 以避免阻止后续流程
                resolve();
            };

            // 确保在speak之前，浏览器已经加载了对应的语言包
            // 遍历所有可用的声音，选择一个匹配语言的声音
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === lang);
            if (voice) {
                utterance.voice = voice;
            } else {
                console.warn(`No voice found for language: ${lang}. Using default.`);
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('SpeechSynthesis not supported in this browser or environment.');
            resolve(); // 如果不支持，也直接解决Promise
        }
    });
};


export const playSound = (note: string): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted(); // 确保 AudioContext 已启动

        const synth = new Tone.Synth().toDestination();
        
        // 使用 Tone.Time() 来解析音符持续时间，确保它是一个有效的数字
        // Tone.Time("8n") 表示八分音符的时长
        const noteDurationSeconds = Tone.Time("8n").toSeconds();
        synth.triggerAttackRelease(note, "8n"); 

        // Resolve the promise after the note's duration.
        setTimeout(() => {
            // Disposing the synth is good practice for memory management.
            if (synth && !synth.disposed) {
                synth.dispose();
            }
            resolve();
        }, noteDurationSeconds * 1000 + 100); // 增加少量延迟以确保声音完全播放，并留出缓冲时间
    });
};