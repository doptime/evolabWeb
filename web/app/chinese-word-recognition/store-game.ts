'use client';

import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
import { wordDatabase } from './data-words';

interface WordData {
    id: string;
    word: string;
    isNumeric?: boolean; // 新增字段，标记是否为数字命题
    hints: {
        en: string;
        jp: string;
        es: string;
        emoji: string;
        root: string;
        association: string;
        svg: React.FC | null; // 可以是null，如果isNumeric为true，则渲染NumberSVG
    };
}

interface CardOption {
    id: string;
    word: string;
    isCorrect: boolean;
    displayHint: string;
    isNumeric?: boolean;
    svg: React.FC | null;
}

interface GameState {
    gameId: number;
    targetWord: WordData | null;
    options: CardOption[];
    selectedCardId: string | null;
    gameState: 'playing' | 'revealed';
    initializeGame: (words: WordData[]) => void;
    selectCard: (cardId: string) => void;
    nextGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    gameId: 1,
    targetWord: null,
    options: [],
    selectedCardId: null,
    gameState: 'playing',

    initializeGame: (words) => {
        // 50% 概率选择数字命题，50% 概率选择普通单词命题
        const numericWords = words.filter(w => w.isNumeric);
        const nonNumericWords = words.filter(w => !w.isNumeric);

        let target: WordData;
        const useNumericChallenge = Math.random() < 0.5 && numericWords.length > 0; // 确保有数字单词才可能选择

        if (useNumericChallenge) {
            target = numericWords[Math.floor(Math.random() * numericWords.length)];
        } else {
            target = nonNumericWords[Math.floor(Math.random() * nonNumericWords.length)];
        }

        // 构建提示语，确保长度凑到60个符号左右
        const buildHint = (word: WordData) => {
            if (word.isNumeric) {
                return ` ${word.hints.emoji} ${word.hints.en} ${word.hints.jp} \n数学: ${word.word}的计数单位。 \n联想: ${word.hints.association.substring(0, 15)}...`;
            } else {
                return `${word.hints.emoji} ${word.hints.en} ${word.hints.jp} \n词根: ${word.hints.root.substring(0, 10)}... \n联想: ${word.hints.association.substring(0, 15)}...`;
            }
        };

        const correctOption: CardOption = {
            id: 'card-correct',
            word: target.word,
            isCorrect: true,
            displayHint: buildHint(target),
            isNumeric: target.isNumeric,
            svg: target.hints.svg,
        };

        // 筛选出与目标单词不同且类型（数字/非数字）匹配的单词作为错误选项
        const potentialIncorrectWords = words.filter(w => 
            w.word !== target.word && w.isNumeric === target.isNumeric
        );

        // 如果匹配类型不足2个，则尝试从所有单词中选择不重复的
        let selectedIncorrectWords = [];
        while (selectedIncorrectWords.length < 2 && potentialIncorrectWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * potentialIncorrectWords.length);
            const selectedWord = potentialIncorrectWords.splice(randomIndex, 1)[0];
            if (selectedWord.word !== target.word) {
                selectedIncorrectWords.push(selectedWord);
            }
        }

        // 如果仍然不足两个，随机从其他类型中选择，并确保word不同
        if (selectedIncorrectWords.length < 2) {
             const allOtherWords = words.filter(w => w.word !== target.word && !selectedIncorrectWords.includes(w));
             while (selectedIncorrectWords.length < 2 && allOtherWords.length > 0) {
                const randomIndex = Math.floor(Math.random() * allOtherWords.length);
                selectedIncorrectWords.push(allOtherWords.splice(randomIndex, 1)[0]);
             }
        }


        const incorrectOptions: CardOption[] = selectedIncorrectWords.map((wordData, index) => ({
            id: `card-incorrect-${index + 1}`,
            word: wordData.word,
            isCorrect: false,
            displayHint: buildHint(wordData),
            isNumeric: wordData.isNumeric,
            svg: wordData.hints.svg,
        }));
        
        const allOptions = [correctOption, ...incorrectOptions.slice(0, 2)];
        
        const shuffledOptions = allOptions
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)           
            .map(({ value }, i) => ({ ...value, id: `card-${i}` })); // Assign new IDs after shuffling

        set({
            targetWord: target,
            options: shuffledOptions,
            selectedCardId: null,
            gameState: 'playing',
            gameId: get().gameId + 1,
        });

        // 延迟朗读目标单词
        // 确保先播放音效，再进行语音播报
        setTimeout(() => {
            playSound("C4").then(() => {
                // 播放正常速度语音
                speak(target.word, 'zh-CN', 1.0).then(() => {
                    // 正常速度语音结束后，再播放慢速语音
                    setTimeout(() => {
                        speak(target.word, 'zh-CN', 0.3);
                    }, 500);
                });
            });
        }, 500);
    },

    selectCard: (cardId) => {
        if (get().gameState === 'playing') {
            const selectedCard = get().options.find(o => o.id === cardId);
            if(selectedCard?.isCorrect){
                playSound("C5").then(() => {
                    // 延迟播放语音，让音效先完成
                    setTimeout(() => speak("正确！你真棒！"), 100);
                });
            } else {
                playSound("C3").then(() => {
                    // 延迟播放语音，让音效先完成
                    setTimeout(() => speak("不对哦，再试一次吧！"), 100);
                });
            }
            set({ selectedCardId: cardId, gameState: 'revealed' });
        }
    },

    nextGame: () => {
        get().initializeGame(wordDatabase);
    }
}));