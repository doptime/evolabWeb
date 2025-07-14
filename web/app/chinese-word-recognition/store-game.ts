'use client';

import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
// Import the new API and data structures
import { apiWordSensationData, WordLearningData } from './data-words';

// This is the new internal representation for a processed word.
// It helps bridge the gap between the new API data and what the components need.
interface ProcessedWord {
    word: string;
    isNumeric: boolean;
    displayHint: string;
}

// The CardOption remains mostly the same, but we adapt how it's created.
interface CardOption {
    id: string;
    word: string;
    isCorrect: boolean;
    displayHint: string;
    isNumeric: boolean;
    // SVG is removed for simplicity as it's not in the new data structure.
}

interface GameState {
    gameId: number;
    targetWord: ProcessedWord | null; // Use the processed word structure
    options: CardOption[];
    selectedCardId: string | null;
    gameState: 'playing' | 'revealed';
    wordList: WordLearningData[]; // Cache the fetched word list
    initializeGame: () => void; // No longer takes arguments
    selectCard: (cardId: string) => void;
    nextGame: () => void;
}

// Helper to convert from API data to our internal structure
const processSensationData = (data: WordLearningData): ProcessedWord => {
    const isNumeric = !!data.Word.match(/^[0-9]+$/);
    return {
        word: data.Word,
        isNumeric: isNumeric,
        displayHint: data.AssociativeLearningBulletNotes,
    };
};

export const useGameStore = create<GameState>((set, get) => ({
    gameId: 1,
    targetWord: null,
    options: [],
    selectedCardId: null,
    gameState: 'playing',
    wordList: [], // Initialize empty word list

    initializeGame: async () => {
        let currentWords = get().wordList;

        // Fetch words only if the list is empty
        if (currentWords.length === 0) {
            try {
                const defaultWords = ["苹果", "窗户", "小说", "开心", "快乐", "1", "2", "3"];
                const data = await apiWordSensationData(defaultWords);
                if (data && data.length > 0) {
                    currentWords = data;
                    set({ wordList: data });
                } else {
                    console.error("Failed to fetch word data or data is empty.");
                    return;
                }
            } catch (error) {
                console.error("Error fetching word data:", error);
                return; // Exit if API call fails
            }
        }

        const processedWords = currentWords.map(processSensationData);

        const target = processedWords[Math.floor(Math.random() * processedWords.length)];

        const correctOption: Omit<CardOption, 'id'> = {
            word: target.word,
            isCorrect: true,
            displayHint: target.displayHint,
            isNumeric: target.isNumeric,
        };

        const incorrectOptions = processedWords
            .filter(w => w.word !== target.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(w => ({
                word: w.word,
                isCorrect: false,
                displayHint: w.displayHint,
                isNumeric: w.isNumeric,
            }));

        const allOptionsRaw = [correctOption, ...incorrectOptions];

        const shuffledOptions = allOptionsRaw
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }, i) => ({ ...value, id: `card-${i}` }));

        set({
            targetWord: target,
            options: shuffledOptions,
            selectedCardId: null,
            gameState: 'playing',
            gameId: get().gameId + 1,
        });

        await playSound("C4");
        await speak(`请找出: ${target.word}`, 'zh-CN', 1.0);
        await speak(target.word, 'zh-CN', 0.3);
    },

    selectCard: async (cardId) => {
        const state = get();
        if (state.gameState !== 'playing') {
            const selectedCard = state.options.find(o => o.id === cardId);
            if (selectedCard && state.targetWord) {
                const feedbackText = selectedCard.isCorrect
                    ? `正确！这就是 ${state.targetWord.word}。`
                    : `这是 ${selectedCard.word}。正确答案是 ${state.targetWord.word}。`;
                await speak(feedbackText, 'zh-CN', 1.0);
            }
            return;
        }

        const selectedCard = state.options.find(o => o.id === cardId);
        if (!selectedCard || !state.targetWord) return;

        let feedbackText = '';
        if (selectedCard.isCorrect) {
            await playSound("C5");
            feedbackText = `太棒了！正确答案就是 ${state.targetWord.word}。`;
            await speak(feedbackText, 'zh-CN', 1.0);
        } else {
            await playSound("C3");
            feedbackText = `很遗憾，你选择了 ${selectedCard.word}。正确答案是 ${state.targetWord.word}。`;
            await speak(feedbackText, 'zh-CN', 1.0);
        }
        set({ selectedCardId: cardId, gameState: 'revealed' });
    },

    nextGame: () => {
        set({
            selectedCardId: null,
            gameState: 'playing',
        });
        get().initializeGame(); // Call without arguments
    }
}));
