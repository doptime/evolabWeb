'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { SpeakerIcon, RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { speak, playSound } from './utils-audio';
import { wordDatabase } from './data-words';
import { useGameStore } from './store-game'; // 导入分离后的游戏状态Store

// --- MAIN APP COMPONENT ---
export default function LiteracyGame() {
    const { gameId, options, selectedCardId, gameState, initializeGame, selectCard, targetWord } = useGameStore();
    // 优化：只订阅手势的类型和payload，减少不必要的组件重新渲染
    const gestureType = useGestureStore((state) => state.gesture.type);
    const gesturePayload = useGestureStore((state) => state.gesture.payload);
    const gestureTimestamp = useGestureStore((state) => state.gesture.timestamp);

    // 使用一个ref来跟踪上一次处理的手势时间戳，避免重复处理
    const lastProcessedGestureTimestamp = React.useRef(0);

    useEffect(() => {
        initializeGame(wordDatabase);
    }, [initializeGame]);

    // 只用useEffect处理卡片点击手势
    useEffect(() => {
        if (gestureTimestamp === lastProcessedGestureTimestamp.current) {
            return;
        }

        if (gestureType === 'click' && gesturePayload?.targetId) {
            const { targetId } = gesturePayload;
            if (targetId.startsWith('card-') && gameState === 'playing') {
                selectCard(targetId);
                lastProcessedGestureTimestamp.current = gestureTimestamp;
            }
        }
    }, [gestureType, gesturePayload, gestureTimestamp, selectCard, gameState]);

    const isRevealed = gameState === 'revealed';

    // 将按钮点击逻辑（手势或鼠标）统一到onClick处理器
    const handleControlButtonClick = async () => {
        if (isRevealed) {
            useGameStore.getState().nextGame();
        } else {
            if (targetWord) {
                await playSound("A4");
                await speak(targetWord.word, 'zh-CN', 1.0);
                await speak(targetWord.word, 'zh-CN', 0.3);
            }
        }
    };

    return (
        <div
            className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans relative overflow-hidden"
        >
            <GestureCursor />

            <div className="text-center mb-12">
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={`title-${gameId}`}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 30, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold text-gray-800"
                    >
                        请找出: "{targetWord?.word}"
                    </motion.h1>
                </AnimatePresence>
            </div>

            <div className="flex space-x-8">
                <AnimatePresence>
                    {options.map((option, index) => (
                        <motion.div
                            key={option.id + '-' + gameId}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.15, duration: 0.5, ease: 'easeOut' } }}
                            exit={{ opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.3, ease: 'easeIn' } }}
                        >
                            <GameCard
                                option={option}
                                onSelect={selectCard} 
                                isSelected={selectedCardId === option.id}
                                isRevealed={isRevealed}
                             />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-12">
                <motion.button
                    id="control-button"
                    onClick={handleControlButtonClick} // 添加onClick处理器
                    key={isRevealed ? 'next' : 'speak'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center px-8 py-4 rounded-full text-white font-bold shadow-lg focus:outline-none ${isRevealed ? 'bg-blue-500 hover:bg-blue-600' : 'bg-teal-500 hover:bg-teal-600'}`}
                >
                    <AnimatePresence mode="wait">
                        {isRevealed ? (
                            <motion.div
                                key="next-icon"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center"
                            >
                                <RefreshIcon className="w-6 h-6 mr-2" />
                                <span>开始新游戏</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="speak-icon"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center"
                            >
                                <SpeakerIcon className="w-8 h-8" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
}