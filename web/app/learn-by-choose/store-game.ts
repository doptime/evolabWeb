'use client';
import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
// Explicitly import the default export and types
import mockTopics, { type Topic, type KnowledgePoint } from './data-mock';

// REFACTOR: This file has been updated to align with the new single-topic-per-round logic.
// 1. Topic Selection: Topics are now presented sequentially as defined in the data source, following the intended learning path.
// 2. Option Generation: Each round focuses on one target topic. For each of the topic's knowledge points, a corresponding option tab is created. Each tab contains one correct option (the knowledge point's main text) and distractors generated from the `distractorText` of the *other* knowledge points in the same topic.
// 3. State Simplification: The 'learningGroup' state has been removed as it's now obsolete.

export interface TabOption extends KnowledgePoint {
    ownerTopicId: string;
    isCorrectOption: boolean; // true if this is the correct answer for the slot, false if it's a distractor
}

type OptionTab = TabOption[];

interface Selection {
    tabIndex: number;
    selectedOptionId: string;
    isCorrect: boolean;
    rewardAmount: number; // Record the reward for a single selection
}


interface GameState {
    topicList: Topic[];
    remainingTopics: Topic[]; // Tracks unlearned topics
    targetTopic: Topic | null;
    optionTabs: OptionTab[];
    roundId: number;
    gameState: 'loading' | 'question' | 'answering' | 'feedback' | 'round_over' | 'game_over';
    selections: Selection[];
    clickChain: number;
    totalGoldCoins: number;
    currentRoundGoldCoins: number;
    lastRewardAmount: number;
    clickCountInRound: number;
    consecutivePerfectHits: number;
    superCritsAccumulated: number;
    easterEggCount: number;
    lastCalculatedGrade: number;
    rewardMessage: string | null;
    nearMissMessage: string | null;
    socialMessage: string | null;
    growthMessage: string | null;
    fsrsUpdateMessage: string | null;
}

// Use the robust Fisher-Yates algorithm for true randomization.
const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

let N_user_mock = 100;
const updateFSRSStability = (s: number) => {
    console.log(`FSRS Stability updated by ${s}%`);
};

const calculateGrade = (correctness: number, timePercentile: number, N_user: number, k: number): number => {
    let alpha = 0.5, beta = 0.5;
    if (N_user < 50) { alpha = 0.7; beta = 0.3; }
    else if (N_user < 200) { alpha = 0.6; beta = 0.4; }

    const mockTimePercentile = 0.5;
    const g = 4 * Math.sqrt(alpha * (correctness ** 2) + beta * (1 - mockTimePercentile) ** 2);
    return parseFloat(g.toFixed(2));
};

export const useGameStore = create<GameState>((set, get) => ({
    topicList: [],
    remainingTopics: [],
    targetTopic: null,
    optionTabs: [],
    roundId: 1,
    gameState: 'loading',
    selections: [],
    clickChain: 0,
    totalGoldCoins: 0,
    currentRoundGoldCoins: 0,
    lastRewardAmount: 0,
    clickCountInRound: 0,
    consecutivePerfectHits: 0,
    superCritsAccumulated: 0,
    easterEggCount: 0,
    lastCalculatedGrade: 0,
    rewardMessage: null,
    nearMissMessage: null,
    socialMessage: null,
    growthMessage: null,
    fsrsUpdateMessage: null,

    initializeGame: async () => {
        // REQ 1: Load topics and set remaining topics in their original order. No shuffling.
        set({
            topicList: mockTopics,
            remainingTopics: [...mockTopics], // Initialize remaining topics in the defined sequence
            gameState: 'loading',
            // Reset global game state
            totalGoldCoins: 0,
            roundId: 0,
            easterEggCount: 0,
        });
        get().startNewRound();
    },

    startNewRound: () => {
        const { remainingTopics } = get();
        if (remainingTopics.length === 0) {
            set({ gameState: 'game_over' });
            speak("恭喜你，完成了所有学习！", 'zh-CN');
            return;
        }

        set({
            selections: [],
            clickCountInRound: 0,
            currentRoundGoldCoins: 0,
            lastRewardAmount: 0,
            rewardMessage: null,
            nearMissMessage: null,
            socialMessage: null,
            growthMessage: null,
            fsrsUpdateMessage: null,
            gameState: 'loading',
        });

        const newRemainingTopics = [...remainingTopics];
        const targetTopic = newRemainingTopics.shift()!;

        if (!targetTopic || !targetTopic.knowledgePoints || targetTopic.knowledgePoints.length === 0) {
            console.error("Invalid topic or no knowledge points, skipping round.", targetTopic);
            set({ remainingTopics: newRemainingTopics });
            get().startNewRound();
            return;
        }

        const newOptionTabs: OptionTab[] = [];
        // Shuffle knowledge points to randomize which one is correct for which tab.
        const shuffledKnowledgePoints = shuffleArray([...targetTopic.knowledgePoints]);

        // FIX: Loop through all knowledge points to create a tab for each one.
        for (const correctOptionForThisTab of shuffledKnowledgePoints) {
            const currentTabOptions: TabOption[] = [];

            // 1. Add the correct option to the current tab.
            currentTabOptions.push({
                ...correctOptionForThisTab,
                ownerTopicId: targetTopic.id,
                isCorrectOption: true,
            });

            // 2. Use the `distractorText` from the *other* knowledge points as distractors.
            const potentialDistractorSources = targetTopic.knowledgePoints.filter(
                kp => kp.id !== correctOptionForThisTab.id
            );

            for (const distractorSourceKP of potentialDistractorSources) {
                currentTabOptions.push({
                    id: `${distractorSourceKP.id}-distractor-for-${correctOptionForThisTab.id}`, // Unique ID
                    text: distractorSourceKP.distractorText || `干扰项`, // Use the distractor text
                    textForTTS: distractorSourceKP.distractorTextForTTS || `干扰项`,
                    innerActivitiesWhenFail: '', // Not applicable for distractors
                    distractorText: distractorSourceKP.distractorText,
                    distractorTextForTTS: distractorSourceKP.distractorTextForTTS,
                    innerActivitiesWhenDistractorClicked: distractorSourceKP.innerActivitiesWhenDistractorClicked,
                    weight: 0, // Distractors have no weight
                    ownerTopicId: targetTopic.id,
                    isCorrectOption: false, // This is a distractor
                });
            }
            // 3. Shuffle options within the tab and add to the list of all tabs.
            newOptionTabs.push(shuffleArray(currentTabOptions));
        }
        
        set(state => ({
            targetTopic,
            optionTabs: newOptionTabs,
            roundId: state.roundId + 1,
            gameState: 'question',
            remainingTopics: newRemainingTopics, // Update remaining topics list
        }));

        speak(targetTopic.questionForTTS || `请找出 ${targetTopic.question}`, 'zh-CN');
    },

    selectOption: async (tabIndex, optionId) => {
        const { gameState, selections, optionTabs, targetTopic, clickChain, clickCountInRound } = get();

        if (gameState !== 'question' && gameState !== 'answering') return;
        if (selections.some(s => s.tabIndex === tabIndex)) return;

        const option = optionTabs[tabIndex].find(o => o.id === optionId);
        if (!option || !targetTopic) return;

        const isCorrectSelection = option.isCorrectOption;

        const newClickChain = isCorrectSelection ? clickChain + 1 : 0;
        const newClickCountInRound = clickCountInRound + 1;

        set({ rewardMessage: null, nearMissMessage: null, lastRewardAmount: 0 });

        let rewardEarned = 0;
        let currentRewardMessage: string | null = null;
        let currentNearMissMessage: string | null = null;
        let newConsecutivePerfectHits = get().consecutivePerfectHits;

        if (isCorrectSelection) {
            const gamma = 0.2;
            const k_exploration = 10;
            const explorationFactor = 1 / Math.sqrt(N_user_mock + k_exploration);
            const chainMultiplier = 1 + 0.1 * (newClickChain -1) ; // chain starts from 1, so multiplier starts from 1.

            let baseReward = option.weight * (1 + gamma * explorationFactor) * chainMultiplier;
            
            const originalCorrectKPs = targetTopic.knowledgePoints;
            const maxWeight = Math.max(...originalCorrectKPs.map(kp => kp.weight));
            const secondMaxWeight = Math.max(...originalCorrectKPs.filter(kp => kp.weight !== maxWeight).map(kp => kp.weight));

            if (newClickCountInRound === 1 && option.weight === maxWeight) {
                const critMultiplier = 1.9 + Math.random() * 0.2;
                rewardEarned = baseReward * critMultiplier;
                currentRewardMessage = "完美命中！";
                newConsecutivePerfectHits++;
            } else if (newClickCountInRound === 2 && (option.weight === maxWeight || option.weight === secondMaxWeight)) {
                const critMultiplier = 0.9 + Math.random() * 0.2;
                rewardEarned = baseReward * critMultiplier;
                currentRewardMessage = "非常重要！";
                newConsecutivePerfectHits = 0; // Reset unless it's a perfect hit chain
            } else {
                rewardEarned = baseReward;
                newConsecutivePerfectHits = 0;
            }

            if (get().consecutivePerfectHits >= 2 && newClickCountInRound === 1 && option.weight === maxWeight) { // Chain of perfect hits leads to super crit
                const superCritMultiplier = 3 + Math.random() * 0.5;
                rewardEarned = baseReward * superCritMultiplier;
                currentRewardMessage = "超级暴击！";
                set(state => ({ superCritsAccumulated: state.superCritsAccumulated + 1 }));
            } else {
                 set({ consecutivePerfectHits: newConsecutivePerfectHits });
            }
            
            await playSound('correct', rewardEarned);

            set(state => ({
                totalGoldCoins: state.totalGoldCoins + rewardEarned,
                currentRoundGoldCoins: state.currentRoundGoldCoins + rewardEarned,
                lastRewardAmount: rewardEarned,
                rewardMessage: currentRewardMessage,
            }));

        } else { // User clicked a distractor
            await playSound('incorrect');
            
            const correctOptionInThisTab = optionTabs[tabIndex].find(o => o.isCorrectOption);
            const feedbackMessage = correctOptionInThisTab ? 
                `哇！我错过了！ 我怎么没想到... (${correctOptionInThisTab.innerActivitiesWhenFail || '原来这个是正确答案！'})` :
                (option.innerActivitiesWhenDistractorClicked || "这个好像不对哦...");

            currentNearMissMessage = feedbackMessage;
            speak(currentNearMissMessage, 'zh-CN');

            set({
                nearMissMessage: currentNearMissMessage,
                consecutivePerfectHits: 0, 
                clickChain: 0, 
            });
        }

        const newSelections = [...selections, { tabIndex, selectedOptionId: optionId, isCorrect: isCorrectSelection, rewardAmount: rewardEarned }];

        set({
            selections: newSelections,
            clickCountInRound: newClickCountInRound,
            gameState: 'answering',
            clickChain: newClickChain,
        });

        // FIX: Make round end condition and scoring dynamic based on number of tabs
        if (newSelections.length === optionTabs.length) {
            set({ gameState: 'feedback' });

            const correctSelectionsCount = newSelections.filter(s => s.isCorrect).length;
            const correctness = optionTabs.length > 0 ? correctSelectionsCount / optionTabs.length : 0;
            const mockTimePercentile = 0.5;
            const grade = calculateGrade(correctness, mockTimePercentile, N_user_mock, 0);
            set({ lastCalculatedGrade: grade });

            if (grade >= 3) {
                set({ socialMessage: "您排名靠前，非常优秀！" });
                speak("您排名靠前，非常优秀！", 'zh-CN');
            }

            if (grade <= 2 && grade > 1) {
                set({ growthMessage: "了不起的努力！这次进步啦~！" });
                speak("了不起的努力！这次进步啦~！", 'zh-CN');
            }

            if (correctness === 1) { // All correct
                updateFSRSStability(5);
                set({ fsrsUpdateMessage: "哇，你的探索链让知识更稳固啦！" });
                speak("哇，你的探索链让知识更稳固啦！", 'zh-CN');
            }

            if (get().superCritsAccumulated >= 2 && Math.random() < 0.5) {
                set(state => ({ easterEggCount: state.easterEggCount + 1, superCritsAccumulated: 0 })); // Reset after trigger
                speak("嘭！一个巨大的金彩蛋出现了！", 'zh-CN');
            }
        }
    },
}));
