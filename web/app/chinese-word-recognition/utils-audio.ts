'use client';

import * as Tone from 'tone';

// --- State Management for Audio ---
let isAudioContextStarted = false;
let speechVoices: SpeechSynthesisVoice[] = [];
// FIX: Keep a reference to the utterance to prevent it from being garbage-collected.
let currentUtterance: SpeechSynthesisUtterance | null = null;

// --- Initialization ---

// Function to get voices, handles async loading
const getSpeechVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            return resolve([]);
        }
        // Try to get voices immediately
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            speechVoices = voices;
            return resolve(speechVoices);
        }
        // If not available, wait for the onvoiceschanged event
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
        // Also ensure voices are loaded on the first interaction
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
    events.forEach(event => 
        document.documentElement.addEventListener(event, ensureAudioContextStarted, { once: true, capture: true })
    );
    // Pre-warm the voices
    getSpeechVoices();
}


export const speak = (text: string, lang = 'zh-CN', rate = 1.0): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();

        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('SpeechSynthesis not supported.');
            return resolve();
        }

        // Wait a brief moment after cancel to avoid race condition
        window.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;

            // Get voices and set the appropriate one
            const voices = await getSpeechVoices();
            const voice = voices.find(v => v.lang === lang) || 
                          voices.find(v => v.lang.startsWith(lang.split('-')[0]));
            
            if (voice) {
                utterance.voice = voice;
                // Some browsers require this to be set after voice assignment
                utterance.lang = lang;
            }

            // Store reference
            currentUtterance = utterance;

            const cleanUp = () => {
                currentUtterance = null;
                resolve();
            };

            utterance.onend = cleanUp;
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event.error);
                cleanUp();
            };

            // Add a small delay to ensure everything is ready
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 10);
        } catch (error) {
            console.error('Error in speak function:', error);
            resolve();
        }
    });
};

export const playSound = (note: string): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();

        try {
            // Use a specific synth to avoid conflicts and ensure disposal
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
