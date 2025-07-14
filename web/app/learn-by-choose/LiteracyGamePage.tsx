'use client';

import React, { useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { useGameStore } from './store-game';

// --- Main Game Page Component ---
export default function LiteracyGamePage() {
    const {
        roundId,
        targetTopic,
        optionTabs,
        selections,
        gameState,
        initializeGame,
        selectOption,
        startNewRound
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

    const handleCardClick = (tabIndex: number, optionId: string) => {
        // Allow direct mouse clicks for debugging/accessibility
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

            <div className="grid grid-cols-2 grid-rows-2 gap-6 w-full max-w-5xl h-[70vh]">
                {optionTabs.map((tab, tabIndex) => (
                    <div
                        key={`tab-${tabIndex}-${roundId}`}
                        className="bg-gray-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 border-2 border-dashed border-gray-300"
                    >
                        {tab.map((option) => {
                            const selection = selections.find(s => s.tabIndex === tabIndex);
                            const isSelected = selection?.selectedOptionId === option.id;
                            
                            return (
                                <motion.div
                                    key={option.id}
                                    id={`option-${tabIndex}-${option.id}`} // Unique ID for gesture detection
                                    onClick={() => handleCardClick(tabIndex, option.id)}
                                    className="cursor-pointer"
                                >
                                    <GameCard
                                        option={option} // The TabOption object
                                        isSelected={isSelected}
                                        isRevealed={isRevealed}
                                        isCorrectForTarget={option.ownerTopicId === targetTopic?.id}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-8 h-16 flex items-center justify-center">
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
        </div>
    );
}
