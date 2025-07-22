'use client';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { useGameStore } from './store-game';
import GoldPool from './components-GoldPool';
import { speak } from './utils-audio'; // Req 6 & 7: Import speak utility

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
    const hoverTimer = useRef<NodeJS.Timeout | null>(null); // Req 7: Ref for hover timer

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
        if (hoverTimer.current) clearTimeout(hoverTimer.current); // Clear hover timer on click
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
            speak(`请找出与 "${targetTopic.question}" 相关的内容`, 'zh-CN');
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans relative overflow-hidden p-8">
            <GestureCursor />
            <GoldPool />
            
            {/* Req 6: Added cursor-pointer and onClick handler to replay question audio */}
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
                        {targetTopic ? `请找出与 "${targetTopic.question}" 相关的内容` : '正在加载...'}
                    </motion.h1>
                </AnimatePresence>
            </div>

            <div className="flex flex-row items-start justify-center gap-6 w-full max-w-6xl">
                {optionTabs.map((tab, tabIndex) => {
                    const isTabCompleted = selections.some(s => s.tabIndex === tabIndex);

                    // Req 2: Implement breathing light effect for reward hints.
                    let glowClass = '';
                    if ((gameState === 'question' || gameState === 'answering') && !isTabCompleted) {
                        if (clickCountInRound === 0) {
                            // Deep golden-yellow for high reward hint
                            glowClass = 'animate-pulse border-amber-500 shadow-lg shadow-amber-500/50';
                        } else if (clickCountInRound === 1) {
                            // Silver for medium reward hint
                            glowClass = 'animate-pulse border-slate-400 shadow-lg shadow-slate-400/50';
                        }
                    }
                    
                    const tabContainerClasses = `
                        relative bg-gray-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 
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
                            {/* Req 1: Add a lock overlay for completed tabs */}
                            {isTabCompleted && (
                                <div className="absolute inset-0 bg-gray-400/40 rounded-2xl flex items-center justify-center z-20 pointer-events-none">
                                    <span className="text-6xl opacity-70">🔒</span>
                                </div>
                            )}

                            {tab.map((option) => {
                                const selection = selections.find(s => s.tabIndex === tabIndex);
                                const isSelected = selection?.selectedOptionId === option.id;
                                const isCorrectForTarget = option.ownerTopicId === targetTopic?.id;
                                
                                return (
                                    <motion.div
                                        key={option.id}
                                        id={`option-${tabIndex}-${option.id}`}
                                        onClick={() => !isTabCompleted && handleCardClick(tabIndex, option.id)}
                                        // Req 7: Add hover handlers to play audio after 1 second
                                        onMouseEnter={() => {
                                            if (isTabCompleted) return;
                                            if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                            hoverTimer.current = setTimeout(() => {
                                                speak(option.text, 'zh-CN');
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
                                            // Req 1: Pass completion status to the card for styling
                                            isTabCompleted={isTabCompleted}
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
