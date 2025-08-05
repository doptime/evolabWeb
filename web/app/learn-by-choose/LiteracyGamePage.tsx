'use client';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { TabOption, useGameStore } from './store-game.ts';
import GoldPool from './components-GoldPool';
import { speak } from './utils-audio';

export default function LiteracyGamePage() {
    const {
        roundId,
        targetTopic,
        optionTabs,
        selections,
        gameState,
        clickCountInRound,
        initializeGame,
        selectOption,
        startNewRound,
        rewardMessage,
        nearMissMessage,
        socialMessage,
        growthMessage,
        fsrsUpdateMessage,
    } = useGameStore();

    const gesture = useGestureStore((state) => state.gesture);
    const hoverTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        if (gesture.type === 'click' && gesture.payload?.targetId) {
            const { targetId } = gesture.payload;
            if (targetId.startsWith('option-')) {
                const [, tabIndexStr, optionId] = targetId.split('-');
                const tabIndex = parseInt(tabIndexStr, 10);
                handleCardClick(tabIndex, optionId);
            }
        }
    }, [gesture, selectOption]);

    const isRevealed = gameState === 'feedback';

    const handleCardClick = (tabIndex: number, optionId: string) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        selectOption(tabIndex, optionId);
    };

    const handleNextRoundClick = () => {
        if (gameState === 'feedback') {
            startNewRound();
        }
    };

    // Req 6: Handler to replay question audio
    const handleQuestionClick = () => {
        if (targetTopic) {
            // Use questionForTTS if available, otherwise fallback to question
            speak(targetTopic.questionForTTS || `请找出 ${targetTopic.question}`, 'zh-CN');
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans relative overflow-hidden p-8">
            <GestureCursor />
            <GoldPool />
            
            <div className="text-center mb-8 h-16 cursor-pointer" onClick={handleQuestionClick}>
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={`title-${roundId}`}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 30, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl font-bold text-gray-800"
                    >
                        {targetTopic ? `请找出 ${targetTopic.question}` : '正在加载...'}
                    </motion.h1>
                </AnimatePresence>
            </div>

            <div className="flex flex-row items-start justify-center gap-6 w-full max-w-6xl">
                {optionTabs.map((tab, tabIndex) => {
                    const selectionForTab = selections.find(s => s.tabIndex === tabIndex);
                    const isTabCompleted = !!selectionForTab;

                    let glowClass = '';
                    if ((gameState === 'question' || gameState === 'answering') && !isTabCompleted) {
                        if (clickCountInRound === 0) {
                            glowClass = 'animate-pulse border-amber-500 shadow-lg shadow-amber-500/50';
                        } else if (clickCountInRound === 1) {
                            glowClass = 'animate-pulse border-slate-400 shadow-lg shadow-slate-400/50';
                        }
                    }
                    
                    const tabContainerClasses = `
                        relative bg-gray-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-center 
                        border-2 border-dashed transition-all duration-300
                        ${isTabCompleted ? 'border-gray-400' : 'border-gray-300'}
                        ${glowClass}
                    `;

                    return (
                        <div
                            key={`tab-${tabIndex}-${roundId}`}
                            className={tabContainerClasses.trim().replace(/\s+/g, ' ')}
                            style={{ minHeight: '20rem' }} // Give tabs a consistent height
                        >
                            {/* REQ: Improved lock effect with reward display */}
                            {isTabCompleted && (
                                <div className="absolute inset-0 bg-gray-400/60 rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none">
                                    <span className="text-6xl opacity-70">🔒</span>
                                    {selectionForTab.isCorrect && selectionForTab.rewardAmount > 0 && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5, duration: 0.3 }}
                                            className="mt-2 text-2xl font-bold text-yellow-600 drop-shadow-md"
                                        >
                                            +{Math.floor(selectionForTab.rewardAmount)}
                                        </motion.span>
                                    )}
                                </div>
                            )}

                            {/* NEW: 2x2 grid layout for 4 options */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {tab.map((option, index) => {
                                    const isSelected = selectionForTab?.selectedOptionId === option.id;
                                    // Use the new isCorrectOption flag from the TabOption itself
                                    const isCorrectForTarget = option.isCorrectOption; 
                                    
                                    return (
                                        <motion.div
                                            key={option.id}
                                            id={`option-${tabIndex}-${option.id}`}
                                            onClick={() => !isTabCompleted && handleCardClick(tabIndex, option.id)}
                                            onMouseEnter={() => {
                                                if (isTabCompleted) return;
                                                if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                                hoverTimer.current = setTimeout(() => {
                                                    speak(option.textForTTS, 'zh-CN');
                                                }, 1000);
                                            }}
                                            onMouseLeave={() => {
                                                if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <GameCard
                                                option={option}
                                                isSelected={isSelected}
                                                isRevealed={isRevealed}
                                                isCorrectForTarget={isCorrectForTarget}
                                                isTabCompleted={isTabCompleted}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 h-24 flex items-center justify-center">
                <AnimatePresence>
                    {isRevealed && (
                         <motion.button
                            id="control-button-next"
                            onClick={handleNextRoundClick}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center px-8 py-4 rounded-full text-white font-bold shadow-lg bg-blue-500 hover:bg-blue-600 focus:outline-none"
                        >
                            <RefreshIcon className="w-6 h-6 mr-2" />
                            <span>下一轮</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Reward Display Section */}
            <div className="absolute bottom-24 w-full text-center pointer-events-none">
                {[rewardMessage, nearMissMessage, socialMessage, growthMessage, fsrsUpdateMessage].map((msg, index) => (
                    msg && <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl font-bold text-purple-600 drop-shadow-md mb-2"
                    >
                        {msg}
                    </motion.p>
                ))}
            </div>

            {/* Game Over Screen */}
            <AnimatePresence>
                {gameState === 'game_over' && (
                    <motion.div
                        className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h2 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">游戏结束!</h2>
                        <p className="text-3xl text-yellow-400 mb-8 drop-shadow-md">恭喜你完成了所有挑战！</p>
                        <motion.button
                            onClick={initializeGame} // 调用 initializeGame 重置游戏
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-green-500 text-white font-bold rounded-full text-xl shadow-xl"
                        >
                            重新开始
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
