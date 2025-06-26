'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    const { gameId, options, selectedCardId, gameState, initializeGame, selectCard, targetWord, nextGame } = useGameStore();
    // 优化：只订阅手势的类型和payload，减少不必要的组件重新渲染
    const gesture = useGestureStore((state) => state.gesture);

    // 使用一个ref来跟踪上一次处理的手势时间戳，避免重复处理
    const lastProcessedGestureTimestamp = useRef(0);

    useEffect(() => {
        initializeGame(wordDatabase);
    }, [initializeGame]);

    // 统一处理手势和鼠标点击事件
    useEffect(() => {
        // 检查时间戳，确保只处理最新的手势事件
        if (gesture.timestamp === lastProcessedGestureTimestamp.current) {
            return; // 已经处理过此手势，跳过
        }

        if (gesture.type === 'click' && gesture.payload?.targetId) {
            const { targetId } = gesture.payload;
            console.log(`Processing click on targetId: ${targetId}, gameState: ${gameState}`);

            if (targetId.startsWith('card-')) {
                // 只有在“playing”状态下才允许选择卡片
                if (gameState === 'playing') {
                    selectCard(targetId);
                    lastProcessedGestureTimestamp.current = gesture.timestamp;
                } else if (gameState === 'revealed') {
                    // 如果已经揭示，重复播报结果
                    const selectedCard = options.find(o => o.id === targetId);
                    if (selectedCard) {
                        const feedbackText = selectedCard.isCorrect
                            ? `正确！这就是 ${targetWord?.word}。`
                            : `这是 ${selectedCard.word}。正确答案是 ${targetWord?.word}。`;
                        speak(feedbackText, 'zh-CN', 1.0);
                    }
                    lastProcessedGestureTimestamp.current = gesture.timestamp;
                }
            } else if (targetId === 'control-button') {
                // 控制按钮的逻辑
                if (gameState === 'revealed') {
                    nextGame();
                    lastProcessedGestureTimestamp.current = gesture.timestamp;
                } else if (targetWord) {
                    // 在非揭示状态下点击控制按钮，则播放目标单词发音
                    const playInitialAudio = async () => {
                        await playSound("A4");
                        await speak(targetWord.word, 'zh-CN', 1.0);
                        await speak(targetWord.word, 'zh-CN', 0.3);
                    };
                    playInitialAudio();
                    lastProcessedGestureTimestamp.current = gesture.timestamp;
                }
            }
        }
    }, [gesture, selectCard, gameState, nextGame, targetWord, options]); // 依赖于整个 gesture 对象

    const isRevealed = gameState === 'revealed';

    // 鼠标点击的逻辑现在直接在按钮和卡片的 onClick 中调用，并模拟手势更新
    // 这确保了鼠标点击也能通过 useGestureStore 被统一处理

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
                            // 鼠标点击模拟手势点击，确保逻辑统一
                            onClick={() => {
                                // 模拟手势点击，更新 gestureStore，以便 useEffect 捕获
                                useGestureStore.getState().setGesture({
                                    type: 'click',
                                    payload: { x: 0, y: 0, targetId: option.id }, // x, y 可以是任意值，因为我们主要依赖 targetId
                                    timestamp: Date.now(),
                                });
                            }}
                        >
                            <GameCard
                                option={option}
                                onSelect={selectCard} // 保留 onSelect prop，尽管 GameCard 内部不再直接使用
                                isSelected={selectedCardId === option.id}
                                isRevealed={isRevealed}
                             />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-12 relative z-[10000]">
                <motion.button
                    id="control-button"
                    onClick={() => {
                        // 鼠标点击时也模拟手势点击，确保逻辑统一
                        useGestureStore.getState().setGesture({
                            type: 'click',
                            payload: { x: 0, y: 0, targetId: 'control-button' },
                            timestamp: Date.now(),
                        });
                    }}
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