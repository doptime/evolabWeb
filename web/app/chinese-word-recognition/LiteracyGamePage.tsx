'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './components-GameCard';
import GestureCursor from './components-GestureCursor';
import { SpeakerIcon, RefreshIcon } from './components-Icons';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { speak, playSound } from './utils-audio';
import { useGameStore } from './store-game'; // The store now handles its own data

// --- MAIN APP COMPONENT ---
export default function LiteracyGame() {
    const { gameId, options, selectedCardId, gameState, initializeGame, selectCard, targetWord, nextGame } = useGameStore();
    const gesture = useGestureStore((state) => state.gesture);
    const lastProcessedGestureTimestamp = useRef(0);

    useEffect(() => {
        // The call is now simpler, as the store manages its data source.
        initializeGame();
    }, [initializeGame]); // initializeGame is stable, so this runs once.

    useEffect(() => {
        if (gesture.timestamp === lastProcessedGestureTimestamp.current) {
            return; 
        }

        if (gesture.type === 'click' && gesture.payload?.targetId) {
            const { targetId } = gesture.payload;

            if (targetId.startsWith('card-')) {
                selectCard(targetId);
                lastProcessedGestureTimestamp.current = gesture.timestamp;
            } else if (targetId === 'control-button') {
                if (gameState === 'revealed') {
                    nextGame();
                    lastProcessedGestureTimestamp.current = gesture.timestamp;
                } else if (targetWord) {
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
    }, [gesture, selectCard, gameState, nextGame, targetWord, options]);

    const isRevealed = gameState === 'revealed';

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
                        {/* Use targetWord.word which is consistent in the new ProcessedWord structure */}
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
                            onClick={() => {
                                useGestureStore.getState().setGesture({
                                    type: 'click',
                                    payload: { x: 0, y: 0, targetId: option.id },
                                    timestamp: Date.now(),
                                });
                            }}
                        >
                            <GameCard
                                option={option}
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

