'use client';

import * as Tone from 'tone';

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // 移除 window.speechSynthesis.cancel(); 避免取消正在进行的语音，导致 onerror
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
        const synth = new Tone.Synth().toDestination(); // Synth is connected to destination here
        
        // Play the note. Removed invalid chaining of .toDestination().sync().start()
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