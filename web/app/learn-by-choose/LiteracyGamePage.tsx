'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { useGameStore } from './store-game';
import GoldPool from './components-GoldPool';

export default function LiteracyGamePage() {
    const {
        roundId,
        targetTopic,
        optionTabs,
        selections,
        gameState,
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

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        if (gesture.type === 'click' && gesture.payload?.targetId) {
            const { targetId } = gesture.payload;
            if (targetId.startsWith('option-')) {
                const [, tabIndexStr, optionId] = targetId.split('-');
                const tabIndex = parseInt(tabIndexStr, 10);
                selectOption(tabIndex, optionId);
            }
        }
    }, [gesture, selectOption]);

    const isRevealed = gameState === 'feedback';
    const clickCount = selections.length;

    const handleCardClick = (tabIndex: number, optionId: string) => {
        selectOption(tabIndex, optionId);
    };

    const handleNextRoundClick = () => {
        if (gameState === 'feedback') {
            startNewRound();
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans relative overflow-hidden p-8">
            <GestureCursor />
            <GoldPool />
            
            <div className="text-center mb-8 h-16">
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={`title-${roundId}`}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 30, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl font-bold text-gray-800"
                    >
                        {targetTopic ? `请找出与 "${targetTopic.question}" 相关的内容` : '正在加载...'}
                    </motion.h1>
                </AnimatePresence>
            </div>

            {/* Req 7: Changed to a flex layout for 3 tabs */}
            <div className="flex flex-row items-start justify-center gap-6 w-full max-w-6xl">
                {optionTabs.map((tab, tabIndex) => {
                    // Req 1: Check if tab is completed
                    const isTabCompleted = selections.some(s => s.tabIndex === tabIndex);

                    // Req 2: Determine glow class for active, uncompleted tabs
                    let glowClass = '';
                    if ((gameState === 'question' || gameState === 'answering') && !isTabCompleted) {
                        if (clickCount === 0) {
                            glowClass = 'animate-pulse border-yellow-400 shadow-lg shadow-yellow-400/50'; // Gold
                        } else if (clickCount === 1) {
                            glowClass = 'animate-pulse border-slate-400 shadow-lg shadow-slate-400/50'; // Silver
                        } else if (clickCount === 2) {
                            glowClass = 'animate-pulse border-orange-500 shadow-lg shadow-orange-500/50'; // Bronze
                        }
                    }
                    
                    const tabContainerClasses = `
                        bg-gray-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 
                        border-2 border-dashed transition-all duration-300
                        ${isTabCompleted ? 'bg-gray-400/30 border-gray-400 pointer-events-none' : 'border-gray-300'}
                        ${glowClass}
                    `;

                    return (
                        <div
                            key={`tab-${tabIndex}-${roundId}`}
                            className={tabContainerClasses.trim().replace(/\s+/g, ' ')}
                            style={{ minHeight: '20rem' }} // Give tabs a consistent height
                        >
                            {tab.map((option) => {
                                const selection = selections.find(s => s.tabIndex === tabIndex);
                                const isSelected = selection?.selectedOptionId === option.id;
                                const isCorrectForTarget = option.ownerTopicId === targetTopic?.id;
                                
                                return (
                                    <motion.div
                                        key={option.id}
                                        id={`option-${tabIndex}-${option.id}`}
                                        onClick={() => !isTabCompleted && handleCardClick(tabIndex, option.id)}
                                        className="cursor-pointer"
                                    >
                                        <GameCard
                                            option={option}
                                            isSelected={isSelected}
                                            isRevealed={isRevealed}
                                            isCorrectForTarget={isCorrectForTarget}
                                        />
                                    </motion.div>
                                );
                            })}
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
        </div>
    );
}
