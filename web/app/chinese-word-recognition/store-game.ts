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
            // 确保substring操作不会超出字符串长度
            const rootHint = word.hints.root ? `词根: ${word.hints.root.substring(0, Math.min(word.hints.root.length, 10))}...` : '';
            const associationHint = word.hints.association ? `联想: ${word.hints.association.substring(0, Math.min(word.hints.association.length, 15))}...` : '';

            if (word.isNumeric) {
                return ` ${word.hints.emoji} ${word.hints.en} ${word.hints.jp} \n数学: ${word.word}的计数单位。 \n${associationHint}`; // 使用 \n 实现换行
            } else {
                return `${word.hints.emoji} ${word.hints.en} ${word.hints.jp} \n${rootHint} \n${associationHint}`; // 使用 \n 实现换行
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
            if (selectedWord.word !== target.word) { // 再次确认不与目标单词重复
                selectedIncorrectWords.push(selectedWord);
            }
        }

        // 如果仍然不足两个，随机从所有单词中选择不重复的，且不与已选的重复
        if (selectedIncorrectWords.length < 2) {
            const allOtherWords = words.filter(w =>
                w.word !== target.word &&
                !selectedIncorrectWords.some(siw => siw.word === w.word)
            );
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

        // 确保先播放音效，再进行语音播报，并且语音播报之间有顺序
        const playInitialAudio = async () => {
            await playSound("C4");
            await speak(target.word, 'zh-CN', 1.0); // 正常速度
            await speak(target.word, 'zh-CN', 0.3); // 慢速
        };
        // 延迟一点时间开始播放，给UI渲染留出空间
        setTimeout(() => {
            playInitialAudio();
        }, 500); // 延迟0.5秒
    },
    selectCard: async (cardId) => { // 标记为 async 函数
        const state = get();
        // Allow selection/feedback even if revealed, to repeat the audio feedback
        if (state.gameState === 'revealed') {
            const selectedCard = state.options.find(o => o.id === cardId);
            const feedbackText = selectedCard?.isCorrect
                ? `正确！这就是 ${state.targetWord?.word}。`
                : `这是 ${selectedCard?.word}。正确答案是 ${state.targetWord?.word}。`;
            await speak(feedbackText, 'zh-CN', 1.0);
            return; // Do not change state, just give feedback
        }

        if (state.gameState === 'playing') {
            const selectedCard = state.options.find(o => o.id === cardId);
            let feedbackText = '';
            if (selectedCard?.isCorrect) {
                await playSound("C5"); // 播放正确音效
                feedbackText = `太棒了！正确答案就是 ${state.targetWord?.word}。`;
                await speak(feedbackText, 'zh-CN', 1.0); // 播报正确结果
            } else {
                await playSound("C3"); // 播放错误音效
                // 如果 targetWord 存在，则播报正确答案；否则只说“不对哦”
                if (state.targetWord) {
                    feedbackText = `很遗憾，你选择了 ${selectedCard?.word || '一个选项'}。正确答案是 ${state.targetWord.word}。`;
                } else {
                    feedbackText = `不对哦，再试一次吧！`;
                }
                await speak(feedbackText, 'zh-CN', 1.0); // 播报错误结果
            }
            set({ selectedCardId: cardId, gameState: 'revealed' });
        }
    },

    nextGame: () => {
        // 重置状态到初始，然后重新初始化游戏
        set({
            selectedCardId: null,
            gameState: 'playing',
        });
        get().initializeGame(wordDatabase); // 使用 wordDatabase 来初始化游戏
    }
}));