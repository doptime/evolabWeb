'use client';

import * as Tone from 'tone';

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            utterance.onend = () => {
                resolve();
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                resolve(); // 即使出错也解决Promise
            };
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('SpeechSynthesis not supported in this browser or environment.');
            resolve();
        }
    });
};

export const playSound = (note: string): Promise<void> => {
    return new Promise(async (resolve) => {
        // 确保Tone.js已初始化
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        const synth = new Tone.Synth().toDestination();
        // 播放音符并确保在音符结束后解决Promise
        synth.triggerAttackRelease(note, "8n").toDestination().sync().start();
        Tone.Transport.scheduleOnce(() => {
            synth.dispose(); // 释放合成器资源
            resolve();
        }, Tone.Transport.immediate() + Tone.Time("8n").toSeconds()); // 在音符持续时间后解决
        Tone.Transport.start();
    });
};
