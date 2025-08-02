'use client';
import * as Tone from 'tone';

// --- State Management for Audio ---
let isAudioContextStarted = false;
let speechVoices: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;
function playOggSound(filename, times, delay = 200) {
    let count = 0;
    const audio = new Audio(filename);
    audio.currentTime = 0; // Rewind to the beginning
    audio.play();
}
// --- Sound Library ---
const soundGenerators = {
    correct: () => new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 } }).toDestination(),
    incorrect: () => new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    crit: () => new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 5, envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
    comboUp: () => new Tone.PluckSynth({ attackNoise: 0.5, dampening: 4000, resonance: 0.7 }).toDestination(),
    comboBreak: () => new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).toDestination(),
    coin: () => new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
};

type SoundType = keyof typeof soundGenerators;

// --- Initialization ---
const getSpeechVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return resolve([]);
        speechVoices = window.speechSynthesis.getVoices();
        if (speechVoices.length > 0) return resolve(speechVoices);
        window.speechSynthesis.onvoiceschanged = () => {
            speechVoices = window.speechSynthesis.getVoices();
            resolve(speechVoices);
        };
    });
};

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
        isAudioContextStarted = false;
    }
};


if (typeof window !== 'undefined') {
    const events: (keyof DocumentEventMap)[] = ['mousedown', 'touchstart', 'keydown', 'click'];
    const startAudio = () => ensureAudioContextStarted().then(() => {
        events.forEach(event => document.documentElement.removeEventListener(event, startAudio, { capture: true }));
    });
    events.forEach(event =>
        document.documentElement.addEventListener(event, startAudio, { once: true, capture: true })
    );
    getSpeechVoices();
}

export const speak = (text: string, lang = 'zh-CN', options: { rate?: number, pitch?: number } = {}): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('Browser does not support speech synthesis.');
            return resolve();
        }

        try {
            // BUG FIX: Immediately cancel any ongoing or queued speech.
            // This prevents a backlog of audio cues when the user clicks quickly,
            // ensuring that the audio feedback is always relevant to the latest action.
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            currentUtterance = utterance;
            utterance.lang = lang;
            utterance.rate = options.rate ?? 1.0;
            utterance.pitch = options.pitch ?? 1.0;

            const voices = await getSpeechVoices();

            //- Tingting     
            //- Yu-shu
            //- Google 普通话（中国大陆）
            const voice = voices.find(v => v.lang === lang && v.name === "Tingting" && v.localService) || voices.find(v => v.name === "Meijia") || voices.find(v => v.lang.startsWith('zh'));
            if (voice) utterance.voice = voice;

            utterance.onend = () => { currentUtterance = null; resolve(); };
            utterance.onerror = (event) => {
                // **FIX**: Log the actual error from `event.error`.
                console.error(`SpeechSynthesis Error for text "${text}":`, event.error);
                currentUtterance = null; // Clear reference on error.
                resolve(); // Resolve anyway to not block the game flow.
            };

            console.log(`speak called with text: "${text}", lang: "${lang}", rate: ${options.rate}`);
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Failed to initiate speech synthesis:', error);
            if (currentUtterance) currentUtterance = null;
            resolve(); // Resolve to not block game flow.
        }
    });
};
export const playSound = (type: SoundType, creditscore: number = 1): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();
        try {
            console.log(`playSound called with type: ${type}`);
            const synth = soundGenerators[type]();
            let durationInSeconds = 0.2;

            switch (type) {
                case 'correct':
                    // synth.triggerAttackRelease('C5', '8n');
                    // durationInSeconds = Tone.Time('8n').toSeconds();
                    if (creditscore < 4) {
                        playOggSound('coin1.ogg', creditscore << 0); // play ogg sound coin1.ogg
                    } else if (creditscore < 10) {
                        playOggSound('coin4.ogg', creditscore << 2); // play ogg sound coin1.ogg
                    } else {
                        playOggSound('coin16.ogg', creditscore << 4); // play ogg sound coin1.ogg
                    }
                    break;
                case 'incorrect':
                    synth.triggerAttackRelease('C3', '8n');
                    durationInSeconds = Tone.Time('8n').toSeconds();
                    break;
                case 'crit':
                    synth.triggerAttackRelease('G5', '4n');
                    durationInSeconds = Tone.Time('4n').toSeconds();
                    break;
                case 'comboUp':
                    (synth as Tone.PluckSynth).triggerAttack('C6');
                    durationInSeconds = 0.3;
                    break;
                case 'comboBreak':
                    (synth as Tone.NoiseSynth).triggerAttackRelease('16n');
                    durationInSeconds = Tone.Time('16n').toSeconds();
                    break;
                case 'coin':
                    synth.triggerAttackRelease('A5', '16n');
                    durationInSeconds = Tone.Time('16n').toSeconds();
                    break;
            }

            setTimeout(() => {
                if (synth && !synth.disposed) synth.dispose();
                resolve();
            }, durationInSeconds * 1000 + 50);
        } catch (error) {
            console.error(`Failed to play sound [${type}]:`, error);
            resolve();
        }
    });
};

// ... rest of the file remains the same ...