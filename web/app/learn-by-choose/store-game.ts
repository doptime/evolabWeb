import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
import { Topic, KnowledgePoint, mockTopics } from './data-mock';

// --- New Interfaces ---

export interface TabOption extends KnowledgePoint {
    ownerTopicId: string;
}

type OptionTab = TabOption[];

interface Selection {
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
    roundId: number;
    gameState: 'loading' | 'question' | 'answering' | 'feedback' | 'round_over';
    selections: Selection[];
    clickChain: number;

    // --- New Reward-Related State ---
    totalGoldCoins: number;
    currentRoundGoldCoins: number;
    lastRewardAmount: number; // Add this to trigger animations
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


// --- Helper Functions ---

const shuffleArray = <T>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};


// --- Mock/Placeholder Functions ---
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


// --- Zustand Store ---

export const useGameStore = create<GameState>((set, get) => ({
    topicList: [],
    targetTopic: null,
    learningGroup: [],
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
        set({ topicList: mockTopics, gameState: 'loading' });
        get().startNewRound();
    },

    startNewRound: () => {
        const { topicList } = get();
        if (topicList.length === 0) return;

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

        const shuffledTopics = shuffleArray(topicList);
        const targetTopic = shuffledTopics[0];
        const neighborTopic = shuffledTopics.length > 1 ? shuffledTopics[1] : targetTopic;
        const learningGroup = [targetTopic, neighborTopic];

        const newOptionTabs: OptionTab[] = [[], [], [], []];
        learningGroup.forEach(topic => {
            const shuffledKps = shuffleArray(topic.knowledgePoints);
            shuffledKps.forEach((kp, index) => {
                if (newOptionTabs[index]) {
                    newOptionTabs[index].push({ ...kp, ownerTopicId: topic.id });
                }
            });
        });
        
        // Req 5: The following line ensures that the items within each tab are shuffled randomly.
        // This prevents the correct answer from always appearing in a predictable position.
        newOptionTabs.forEach(tab => shuffleArray(tab));

        set(state => ({
            targetTopic,
            learningGroup,
            optionTabs: newOptionTabs,
            roundId: state.roundId + 1,
            gameState: 'question',
        }));

        speak(`请找出与 "${targetTopic.question}" 相关的内容`, 'zh-CN');
    },

    selectOption: async (tabIndex, optionId) => {
        const { gameState, selections, optionTabs, targetTopic, clickChain, clickCountInRound } = get();

        if (gameState !== 'question' && gameState !== 'answering') return;
        if (selections.some(s => s.tabIndex === tabIndex)) return;

        const option = optionTabs[tabIndex].find(o => o.id === optionId);
        if (!option || !targetTopic) return;
        const isCorrect = option.ownerTopicId === targetTopic.id;
        const newClickChain = isCorrect ? clickChain + 1 : 0;
        const newClickCountInRound = clickCountInRound + 1;

        set({ rewardMessage: null, nearMissMessage: null, lastRewardAmount: 0 });

        let rewardEarned = 0;
        let currentRewardMessage: string | null = null;
        let currentNearMissMessage: string | null = null;
        let newConsecutivePerfectHits = get().consecutivePerfectHits;

        if (isCorrect) {
            const gamma = 0.2;
            const k_exploration = 10;
            const explorationFactor = 1 / Math.sqrt(N_user_mock + k_exploration);
            const chainMultiplier = 1 + 0.1 * clickChain;

            let baseReward = option.weight * (1 + gamma * explorationFactor) * chainMultiplier;
            await playSound('correct', baseReward);

            if (newClickCountInRound === 1 && option.weight === Math.max(...targetTopic.knowledgePoints.map(kp => kp.weight))) {
                const critMultiplier = 1.9 + Math.random() * 0.2;
                rewardEarned = baseReward * critMultiplier;
                currentRewardMessage = "完美命中！";
                newConsecutivePerfectHits++;
            } else if (newClickCountInRound === 2 && (option.weight === Math.max(...targetTopic.knowledgePoints.map(kp => kp.weight)) || option.weight === Math.max(...targetTopic.knowledgePoints.filter(kp => kp.weight !== Math.max(...targetTopic.knowledgePoints.map(k => k.weight))).map(kp => kp.weight)))) {
                const critMultiplier = 0.9 + Math.random() * 0.2;
                rewardEarned = baseReward * critMultiplier;
                currentRewardMessage = "非常重要！";
                newConsecutivePerfectHits++;
            } else {
                rewardEarned = baseReward;
                newConsecutivePerfectHits = 0;
            }

            if (newConsecutivePerfectHits >= 3) {
                const superCritMultiplier = 3 + Math.random() * 0.5;
                rewardEarned = baseReward * superCritMultiplier;
                currentRewardMessage = "超级暴击！";
                set(state => ({ superCritsAccumulated: state.superCritsAccumulated + 1 }));
            }

            set(state => ({
                totalGoldCoins: state.totalGoldCoins + rewardEarned,
                currentRoundGoldCoins: state.currentRoundGoldCoins + rewardEarned,
                lastRewardAmount: rewardEarned, // Set amount for animation
                rewardMessage: currentRewardMessage,
                consecutivePerfectHits: newConsecutivePerfectHits,
            }));

        } else {
            await playSound('incorrect');
            // Req 8: If the user clicks a wrong item, the regret message should come from the CORRECT item in that tab.
            const correctOptionInTab = optionTabs[tabIndex].find(o => o.ownerTopicId === targetTopic.id);
            const regretMessage = correctOptionInTab 
                ? correctOptionInTab.innerActivitiesWhenFail 
                : "这个好像不对哦..."; // Fallback message

            currentNearMissMessage = `哇！差一点点！原来... ${regretMessage}`;
            speak(currentNearMissMessage, 'zh-CN');

            set({
                nearMissMessage: currentNearMissMessage,
                consecutivePerfectHits: 0, // Reset perfect hit streak
                clickChain: 0, // Reset click chain
            });
        }

        const newSelections = [...selections, { tabIndex, selectedOptionId: optionId, isCorrect }];

        set({
            selections: newSelections,
            clickCountInRound: newClickCountInRound,
            gameState: 'answering',
            clickChain: newClickChain,
        });

        if (newSelections.length === 4) {
            set({ gameState: 'feedback' });

            const correctSelectionsCount = newSelections.filter(s => s.isCorrect).length;
            const correctness = correctSelectionsCount / 4;
            const mockTimePercentile = 0.5;
            const grade = calculateGrade(correctness, mockTimePercentile, N_user_mock, get().learningGroup.length - 1);
            set({ lastCalculatedGrade: grade });

            if (grade >= 3) {
                set({ socialMessage: "您排名靠前，非常优秀！" });
                await speak("您排名靠前，非常优秀！", 'zh-CN');
            }

            if (grade <= 2 && grade > 1) {
                set({ growthMessage: "了不起的努力！这次进步啦~！" });
                await speak("了不起的努力！这次进步啦~！", 'zh-CN');
            }

            if (correctSelectionsCount === 4) {
                updateFSRSStability(5);
                set({ fsrsUpdateMessage: "哇，你的探索链让知识更稳固啦！" });
                await speak("哇，你的探索链让知识更稳固啦！", 'zh-CN');
            }

            if (get().superCritsAccumulated >= 2 && Math.random() < 0.5) {
                set(state => ({ easterEggCount: state.easterEggCount + 1 }));
                await speak("嘭！一个巨大的金彩蛋出现了！", 'zh-CN');
            }

            await speak('本轮完成！', 'zh-CN');
        }
    },
}));
