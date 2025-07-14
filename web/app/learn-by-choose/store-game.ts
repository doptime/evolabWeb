'use client';

import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
import { Topic, KnowledgePoint, mockTopics } from './data-mock'; // Import new data structures

// --- New Interfaces ---

// Represents a single choice in one of the four tabs.
export interface TabOption extends KnowledgePoint {
    ownerTopicId: string;
}

// Represents one of the four tabs, containing one option from each topic in the learning group.
export type OptionTab = TabOption[];

// Represents the user's selection in a tab.
export interface Selection {
    tabIndex: number;
    selectedOptionId: string;
    isCorrect: boolean;
}

interface GameState {
    // Game Structure
    topicList: Topic[];
    targetTopic: Topic | null;
    learningGroup: Topic[];
    optionTabs: OptionTab[];

    // Round State
    roundId: number; // To help with re-rendering
    gameState: 'loading' | 'question' | 'answering' | 'feedback' | 'round_over';
    selections: Selection[]; // User's selections for the current round
    clickChain: number; // For reward multiplier
}


// --- Helper Functions ---

const shuffleArray = <T>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

// --- Zustand Store ---

export const useGameStore = create<GameState>((set, get) => ({
    // Game Structure State
    topicList: [],
    targetTopic: null,
    learningGroup: [],
    optionTabs: [],

    // Round State
    roundId: 1,
    gameState: 'loading',
    selections: [],
    clickChain: 0,

    // --- Actions ---

    initializeGame: async () => {
        // In a real app, this would be an API call.
        // We use the mock data for now.
        set({ topicList: mockTopics, gameState: 'loading' });
        get().startNewRound();
    },

    startNewRound: () => {
        const { topicList } = get();
        if (topicList.length === 0) return;

        // 1. Select target topic and neighbor (k=1 for now)
        const shuffledTopics = shuffleArray(topicList);
        const targetTopic = shuffledTopics[0];
        const neighborTopic = shuffledTopics[1];
        const learningGroup = [targetTopic, neighborTopic];

        // 2. Create the four option tabs
        const newOptionTabs: OptionTab[] = [[], [], [], []];
        learningGroup.forEach(topic => {
            const shuffledKps = shuffleArray(topic.knowledgePoints);
            shuffledKps.forEach((kp, index) => {
                newOptionTabs[index].push({ ...kp, ownerTopicId: topic.id });
            });
        });
        // Shuffle the items within each tab
        newOptionTabs.forEach(tab => shuffleArray(tab));

        set(state => ({
            targetTopic,
            learningGroup,
            optionTabs: newOptionTabs,
            selections: [],
            clickChain: 0,
            gameState: 'question', // Initial state for the round
            roundId: state.roundId + 1,
        }));

        // Announce the new question
        speak(`请找出与 "${targetTopic.question}" 相关的内容`, 'zh-CN');
    },

    selectOption: async (tabIndex, optionId) => {
        const { gameState, selections, optionTabs, targetTopic, clickChain } = get();

        // Prevent selection if not in answering state or tab already answered
        if (gameState !== 'question' && gameState !== 'answering') return;
        if (selections.some(s => s.tabIndex === tabIndex)) return;

        const option = optionTabs[tabIndex].find(o => o.id === optionId);
        if (!option || !targetTopic) return;

        const isCorrect = option.ownerTopicId === targetTopic.id;
        const newClickChain = isCorrect ? clickChain + 1 : 0;

        if (isCorrect) {
            await playSound('C5');
            // Immediate reward logic can be added here
        } else {
            await playSound('C3');
            // "Near miss" feedback can be triggered here
        }

        const newSelections = [...selections, { tabIndex, selectedOptionId: optionId, isCorrect }];

        set({ 
            selections: newSelections,
            clickChain: newClickChain,
            gameState: 'answering'
        });

        // 4. If all tabs are answered, move to feedback state
        if (newSelections.length === 4) {
            set({ gameState: 'feedback' });
            // Final round feedback logic (calculating grade 'g', FSRS update, etc.) goes here
            await speak('本轮完成！', 'zh-CN');
        }
    },
}));
