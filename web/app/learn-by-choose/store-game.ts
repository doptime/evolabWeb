'use client';
import { create } from 'zustand';
import { speak, playSound } from './utils-audio';
import mockTopics,{ Topic, KnowledgePoint, mockTopics1 } from './data-mock';

export interface TabOption extends KnowledgePoint {
    ownerTopicId: string;
}

type OptionTab = TabOption[];

interface Selection {
    tabIndex: number;
    selectedOptionId: string;
    isCorrect: boolean;
    rewardAmount: number; // 新增：记录单次选择的奖励金额
}


interface GameState {
    topicList: Topic[];
    remainingTopics: Topic[]; // 新增：用于跟踪未学习的主题
    targetTopic: Topic | null;
    learningGroup: Topic[];
    optionTabs: OptionTab[];
    roundId: number;
    gameState: 'loading' | 'question' | 'answering' | 'feedback' | 'round_over' | 'game_over'; // 修改：增加 game_over 状态
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

// BUG FIX: Replaced the biased sort-based shuffle with the robust Fisher-Yates algorithm.
// This ensures true randomization for options and tabs, fixing the bug where the
// layout could be predictable.
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
    remainingTopics: [], // 新增
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
        const shuffledTopics = shuffleArray(mockTopics);
        set({ 
            topicList: mockTopics, 
            remainingTopics: shuffledTopics, // 初始化时就设定好本轮游戏的题目顺序
            gameState: 'loading',
            // 重置总分等游戏全局状态
            totalGoldCoins: 0,
            roundId: 0,
            easterEggCount: 0,
        });
        get().startNewRound();
    },

    startNewRound: () => {
        const { remainingTopics, topicList } = get();
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
        const targetTopic = newRemainingTopics.shift()!; // 从待办列表中取出一个，并更新列表

        // 从所有主题中（除了当前目标）随机选一个作为邻居
        const neighborCandidates = topicList.filter(t => t.id !== targetTopic.id);
        const neighborTopic = shuffleArray(neighborCandidates)[0] ?? targetTopic;
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
        
        // 先随机化每个选项卡内部的内容，再随机化所有选项卡的顺序
        const tabsWithShuffledContent = newOptionTabs.map(tab => shuffleArray(tab));
        const finalShuffledTabs = shuffleArray(tabsWithShuffledContent);

        set(state => ({
            targetTopic,
            learningGroup,
            optionTabs: finalShuffledTabs, // 使用完全随机化的选项卡
            roundId: state.roundId + 1,
            gameState: 'question',
            remainingTopics: newRemainingTopics, // 更新剩余题目列表
        }));

        speak(`请找出 ${targetTopic.question}`, 'zh-CN');
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
            
            await playSound('correct', rewardEarned);

            set(state => ({
                totalGoldCoins: state.totalGoldCoins + rewardEarned,
                currentRoundGoldCoins: state.currentRoundGoldCoins + rewardEarned,
                lastRewardAmount: rewardEarned,
                rewardMessage: currentRewardMessage,
                consecutivePerfectHits: newConsecutivePerfectHits,
            }));

        } else {
            await playSound('incorrect');
            const correctOptionInTab = optionTabs[tabIndex].find(o => o.ownerTopicId === targetTopic.id);
            const regretMessage = correctOptionInTab 
                ? correctOptionInTab.innerActivitiesWhenFail 
                : "这个好像不对哦...";

            currentNearMissMessage = `哇！差一点点！原来... ${regretMessage}`;
            speak(currentNearMissMessage, 'zh-CN');

            set({
                nearMissMessage: currentNearMissMessage,
                consecutivePerfectHits: 0, 
                clickChain: 0, 
            });
        }

        const newSelections = [...selections, { tabIndex, selectedOptionId: optionId, isCorrect, rewardAmount: rewardEarned }];

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
                // set({ fsrsUpdateMessage: "哇，你的探索链让知识更稳固啦！" });
                // await speak("哇，你的探索链让知识更稳固啦！", 'zh-CN');
            }

            if (get().superCritsAccumulated >= 2 && Math.random() < 0.5) {
                set(state => ({ easterEggCount: state.easterEggCount + 1 }));
                await speak("嘭！一个巨大的金彩蛋出现了！", 'zh-CN');
            }

            // 此处不再调用 speak('本轮完成！')，因为下一轮的语音提示会紧接着发生
        }
    },
}));