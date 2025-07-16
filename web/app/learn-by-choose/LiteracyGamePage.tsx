'use client';
import React, { useEffect, Fragment } from 'react';
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
        totalGoldCoins,
        currentRoundGoldCoins,
        rewardMessage,
        nearMissMessage,
        socialMessage,
        growthMessage,
        fsrsUpdateMessage,
        dopamineLevel
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
            <motion.div
                className="fixed right-8 bottom-8 w-24 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                animate={{
                    scaleX: [0, dopamineLevel/100, 1],
                    opacity: [0, 1, dopamineLevel > 0 ? 1 : 0]
                }}
            >
                <div className="text-xs text-white text-center">多巴胺: {dopamineLevel?.toFixed(0)}</div>
            </motion.div>

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
                                    id={`option-${tabIndex}-${option.id}`}
                                    onClick={() => handleCardClick(tabIndex, option.id)}
                                    className="cursor-pointer"
                                >
                                    <GameCard
                                        option={option}
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

            {/* Reward Display Section */}
            <div className="mt-8 w-full text-center">
                {rewardMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl text-green-600 mb-4"
                    >
                        {rewardMessage}
                    </motion.p>
                )}

                {nearMissMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl text-red-600 mb-4"
                    >
                        {nearMissMessage}
                    </motion.p>
                )}

                {socialMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl text-blue-600 mb-4"
                    >
                        {socialMessage}
                    </motion.p>
                )}

                {growthMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl text-purple-600 mb-4"
                    >
                        {growthMessage}
                    </motion.p>
                )}

                {fsrsUpdateMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-2xl text-yellow-600 mb-4"
                    >
                        {fsrsUpdateMessage}
                    </motion.p>
                )}

                <div className="text-2xl font-bold text-gray-800 mb-4">
                    当前金币: {currentRoundGoldCoins.toFixed(2)} / 总金币: {totalGoldCoins.toFixed(2)}
                </div>
            </div>
        </div>
    );
}
