'use client';

import * as Tone from 'tone';

// --- State Management for Audio ---
let isAudioContextStarted = false;
let speechVoices: SpeechSynthesisVoice[] = [];
// **FIX**: Keep a reference to the utterance to prevent it from being garbage-collected,
// which is a common cause of speech synthesis failure.
let currentUtterance: SpeechSynthesisUtterance | null = null;

// --- Initialization ---

// Function to get voices, handles async loading
const getSpeechVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            return resolve([]);
        }
        speechVoices = window.speechSynthesis.getVoices();
        if (speechVoices.length > 0) {
            return resolve(speechVoices);
        }
        window.speechSynthesis.onvoiceschanged = () => {
            speechVoices = window.speechSynthesis.getVoices();
            resolve(speechVoices);
        };
    });
};


// Ensure AudioContext is started by user interaction.
const ensureAudioContextStarted = async () => {
    if (isAudioContextStarted || typeof window === 'undefined') return;
    try {
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log("AudioContext started successfully.");
        }
        if (speechVoices.length === 0) {
            await getSpeechVoices();
            console.log("Speech voices loaded.");
        }
        isAudioContextStarted = true;
    } catch (e) {
        console.error("Could not start AudioContext:", e);
        isAudioContextStarted = false; // Allow retrying
    }
};

// Attach interaction listeners only on the client
if (typeof window !== 'undefined') {
    const events: (keyof DocumentEventMap)[] = ['mousedown', 'touchstart', 'keydown', 'click'];
    const startAudio = () => ensureAudioContextStarted().then(() => {
        events.forEach(event => document.documentElement.removeEventListener(event, startAudio, { capture: true }));
    });
    events.forEach(event =>
        document.documentElement.addEventListener(event, startAudio, { once: true, capture: true })
    );
    getSpeechVoices(); // Pre-warm voices
}

export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();

        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('Browser does not support speech synthesis.');
            return resolve();
        }

        // The game logic awaits each speak call, so canceling previous speech is not desired here.
        // window.speechSynthesis.cancel();

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            currentUtterance = utterance; // **FIX**: Assign to the module-level variable.

            utterance.lang = 'en-US';
            utterance.rate = rate;

            const voices = await getSpeechVoices();
            for (const voice of voices) {
                if (voice.lang.indexOf("zh-")<0>) {
                    continue
                }
                console.log(voice.lang + `Available voice: ${voice.name}`);
            }

            //const voice = voices.find(v => v.lang === lang && v.localService) || voices.find(v => v.lang === lang && v.name == "Tingting");
            //- Tingting     
            //- Yu-shu
            //- Google 普通话（中国大陆）
            //- Li-Mu
            const voice = voices.find(v => v.lang === lang && v.name == "Tingting" && v.localService) || voices.find(v => v.name == "Meijia");

            if (voice) {
                utterance.voice = voice;
                console.log(`Using voice: ${voice.name} for language '${lang}'`);
            } else {
                console.warn(`No voice found for language '${lang}'. Using browser default.`);
            }

            utterance.onend = () => {
                console.log(`SpeechSynthesis finished for text: "${text}"`);
                currentUtterance = null; // Clear reference on completion.
                resolve();
            };

            utterance.onerror = (event) => {
                // **FIX**: Log the actual error from `event.error`.
                console.error(`SpeechSynthesis Error for text "${text}":`, event.error);
                currentUtterance = null; // Clear reference on error.
                resolve(); // Resolve anyway to not block the game flow.
            };

            console.log(`speak called with text: "${text}", lang: "${lang}", rate: ${rate}`);
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Failed to initiate speech synthesis:', error);
            if (currentUtterance) currentUtterance = null;
            resolve(); // Resolve to not block game flow.
        }
    });
};

export const playSound = (note: string): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();

        try {
            const synth = new Tone.Synth().toDestination();
            const duration = "8n";
            const durationInSeconds = Tone.Time(duration).toSeconds();

            synth.triggerAttackRelease(note, duration);

            setTimeout(() => {
                if (synth && !synth.disposed) {
                    synth.dispose();
                }
                resolve();
            }, durationInSeconds * 1000 + 50); // Add a small buffer for safety
        } catch (error) {
            console.error("Failed to play sound with Tone.js:", error);
            resolve(); // Resolve even if sound fails
        }
    });
};
