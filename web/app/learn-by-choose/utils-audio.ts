'use client';
import * as Tone from 'tone';

// --- State Management for Audio ---
let isAudioContextStarted = false;
let speechVoices: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

// 模拟的问题答题时间记录（实际应该从游戏中获取）
const problemResponseTimes: number[] = [3000, 5000, 4000, 6000, 3500, 4500];
const userResponseTimes: number[] = [2000, 3500, 4000, 4500, 3000, 5000];

function playOggSound(filename: string, times: number = 1, delay: number = 200): void {
    let count = 0;
    const audio = new Audio(filename);

    const playNext = () => {
        if (count < times) {
            audio.currentTime = 0;
            audio.play();
            count++;
            if (count < times && delay > 0) {
                setTimeout(playNext, delay);
            }
        }
    };

    playNext();
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

/**
 * 改进的文本朗读函数，增加错误处理和重试机制
 */
export const speak = async (text: string, lang = 'zh-CN', options: { rate?: number; pitch?: number; retryCount?: number } = {}): Promise<void> => {
    const retryCount = options.retryCount || 3; // 默认重试3次

    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('Browser does not support speech synthesis.');
            return resolve();
        }

        try {
            // 立即取消任何正在进行的语音合成
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            currentUtterance = utterance;
            utterance.lang = lang;
            utterance.rate = options.rate ?? 1.0;
            utterance.pitch = options.pitch ?? 1.0;
            utterance.volume = 1.0; // 确保音量足够

            const voices = await getSpeechVoices();
            console.log(`Available voices: ${voices.map(v => v.name + " " + v.lang + v.default + v.voiceURI + v.localService).join(', ')}`);

            // 优化语音选择逻辑
            //voices.find(v => v.name === "Samantha") ||
            //Lilian Han
            const voice = voices.find(v => v.lang === lang && v.name === "Lilian" && v.localService)
                 || voices.find(v => v.name === "Meijia")
                // || voices.find(v => v.lang.startsWith('zh-CN'))
                // || voices.find(v => v.lang.startsWith('zh'))
                // || voices[0]; // 默认选择第一个语音

            if (voice) utterance.voice = voice;

            let retryAttempts = 0;

            const speakWithRetry = () => {
                console.log(`speak called with text: "${text}", lang: "${lang}", rate: ${options.rate}`);

                utterance.onend = () => {
                    currentUtterance = null;
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.error(`SpeechSynthesis Error for text "${text}":`, event.error);

                    if (retryAttempts < retryCount) {
                        retryAttempts++;
                        console.log(`Retrying speak... (attempt ${retryAttempts}/${retryCount})`);
                        setTimeout(() => {
                            window.speechSynthesis.cancel();
                            speakWithRetry();
                        }, 1000 * retryAttempts);
                    } else {
                        console.error('Max retry attempts reached for speak function');
                        if (currentUtterance) currentUtterance = null;
                        resolve(); // Resolve anyway to not block the game flow
                    }
                };

                try {
                    window.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Failed to initiate speech synthesis:', error);
                    if (currentUtterance) currentUtterance = null;
                    resolve();
                }
            };

            speakWithRetry();

        } catch (error) {
            console.error('Failed to initiate speech synthesis:', error);
            if (currentUtterance) currentUtterance = null;
            resolve();
        }
    });
};

/**
 * 改进的音频播放函数，支持动态音量和更好的错误处理
 */
export const playSound = async (type: SoundType, pitch: number = 4, volume: number = 1.0): Promise<void> => {
    return new Promise(async (resolve) => {
        await ensureAudioContextStarted();
        try {
            console.log(`playSound called with type: ${type}, pitch: ${pitch}, volume: ${volume}`);

            const synth = soundGenerators[type]();
            let durationInSeconds = 0.2;

            try {
                switch (type) {
                    case 'correct':
                        // 根据rewardEarned调整音量和音高
                        if (pitch >= 10) {
                            playOggSound('coin16.ogg', 1, 0); // 高音效
                        } else if (pitch >= 4) {
                            playOggSound('coin4.ogg', 1, 0); // 中音效
                        } else {
                            playOggSound('coin1.ogg', 1, 0); // 低音效
                        }
                        break;

                    case 'incorrect':
                        synth.volume.value = -10 + (volume * 5); // 根据音量调整
                        synth.triggerAttackRelease('C3', '8n');
                        durationInSeconds = Tone.Time('8n').toSeconds();
                        break;

                    case 'crit':
                        synth.volume.value = -5 + (volume * 8);
                        synth.triggerAttackRelease('G5', '4n');
                        durationInSeconds = Tone.Time('4n').toSeconds();
                        break;

                    case 'comboUp':
                        (synth as Tone.PluckSynth).volume.value = -3 + (volume * 6);
                        (synth as Tone.PluckSynth).triggerAttackRelease('C6', '8n');
                        durationInSeconds = Tone.Time('8n').toSeconds();
                        break;

                    case 'comboBreak':
                        (synth as Tone.NoiseSynth).volume.value = -8 + (volume * 4);
                        (synth as Tone.NoiseSynth).triggerAttackRelease('16n');
                        durationInSeconds = Tone.Time('16n').toSeconds();
                        break;

                    case 'coin':
                        synth.volume.value = -2 + (volume * 7);
                        synth.triggerAttackRelease('A5', '16n');
                        durationInSeconds = Tone.Time('16n').toSeconds();
                        break;

                    default:
                        console.warn(`Unknown sound type: ${type}`);
                }

            } catch (soundError) {
                console.error(`Sound generation error for type ${type}:`, soundError);
                // 如果声音生成失败，直接resolve
            }

            // 延迟清理synth对象
            setTimeout(() => {
                try {
                    if (synth && !synth.disposed) {
                        synth.dispose();
                    }
                } catch (disposeError) {
                    console.warn('Error disposing synth:', disposeError);
                }
                resolve();
            }, durationInSeconds * 1000 + 50);

        } catch (error) {
            console.error(`Failed to play sound [${type}]:`, error);
            resolve();
        }
    });
};

/**
 * 时间分位数计算函数（从游戏store中提取的独立版本）
 * 这个函数可以在需要时独立调用
 */
export const calculateTimePercentile = (
    responseTime: number,
    problemTimes: number[],
    userTimes: number[],
    k: number = 10
): number => {
    // 计算特定问题的百分位数
    const sortedProblemTimes = [...problemTimes, responseTime].sort((a, b) => a - b);
    const percentile_problem = sortedProblemTimes.indexOf(responseTime) / Math.max(1, sortedProblemTimes.length - 1);

    // 计算用户的百分位数
    const sortedUserTimes = [...userTimes, responseTime].sort((a, b) => a - b);
    const percentile_user = sortedUserTimes.indexOf(responseTime) / Math.max(1, sortedUserTimes.length - 1);

    // 计算权重
    const w_problem = Math.sqrt(sortedProblemTimes.length + k) /
        (Math.sqrt(sortedProblemTimes.length + k) + Math.sqrt(sortedUserTimes.length + k));
    const w_user = Math.sqrt(sortedUserTimes.length + k) /
        (Math.sqrt(sortedProblemTimes.length + k) + Math.sqrt(sortedUserTimes.length + k));

    // 计算几何平均值作为最终时间百分位数
    return Math.pow(Math.max(0.01, percentile_problem), w_problem) *
        Math.pow(Math.max(0.01, percentile_user), w_user);
};

/**
 * 年级计算函数（从游戏store中提取的独立版本）
 * 这个函数可以在需要时独立调用
 */
export const calculateGrade = (
    correctness: number,
    timePercentile: number,
    N_user: number,
    k: number = 10
): number => {
    // 根据用户答题数量动态调整α和β权重
    let alpha, beta;
    if (N_user < 50) {
        alpha = 0.7;  // 新用户优先考虑正确性
        beta = 0.3;
    } else if (N_user < 200) {
        alpha = 0.6;  // 中级用户
        beta = 0.4;
    } else {
        alpha = 0.5;  // 有经验用户平衡速度和正确性
        beta = 0.5;
    }

    // 计算年级，严格按照公式：Grade=4*sqrt(α*(correctness^2)+β*(1-timePercentile)^2)
    const grade = 4 * Math.sqrt(
        alpha * Math.pow(correctness, 2) +
        beta * Math.pow(1 - timePercentile, 2)
    );

    return parseFloat(grade.toFixed(2));
};

/**
 * 导供游戏其他模块使用的时间分位数计算函数
 */
export const getTimePercentile = (responseTime: number): number => {
    return calculateTimePercentile(responseTime, problemResponseTimes, userResponseTimes);
};

/**
 * 导供游戏其他模块使用的年级计算函数
 */
export const getGrade = (correctness: number, timePercentile: number): number => {
    return calculateGrade(correctness, timePercentile, 100); // 使用默认的N_user=100
};