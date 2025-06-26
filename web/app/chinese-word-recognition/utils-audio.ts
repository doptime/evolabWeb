'use client';

import * as Tone from 'tone';

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // 移除 window.speechSynthesis.cancel(); 避免取消正在进行的语音，导致 onerror
            // 注意：在某些浏览器中，连续快速调用 speak 可能会导致语音队列问题，
            // 但在这里移除 cancel 是为了确保当前 utterance 能完成。
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            utterance.onend = () => {
                resolve();
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                resolve(); // 即使出错也解决Promise，避免Promise悬挂
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
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
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
        
        // Ensure Tone.Transport is started for scheduled events to execute.
        // This check prevents unnecessary calls if it's already running.
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    });
};