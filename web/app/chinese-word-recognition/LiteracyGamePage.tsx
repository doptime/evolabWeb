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
    const { gameId, options, selectedCardId, gameState, initializeGame, selectCard, nextGame } = useGameStore();
    const gesture = useGestureStore((state) => state.gesture);
    const setGesture = useGestureStore((state) => state.setGesture); // For simulation

    useEffect(() => {
        initializeGame(wordDatabase);
    }, [initializeGame]);

    // Listen to gesture changes
    useEffect(() => {
        if (gesture.type === 'click' && gesture.payload?.targetId) {
            const { targetId } = gesture.payload;
            if (targetId.startsWith('card-')) {
                selectCard(targetId);
            } else if (targetId === 'control-button') {
                if(gameState === 'revealed') {
                    playSound("E5").then(() => {
                        nextGame();
                    });
                } else {
                    const targetWord = useGameStore.getState().targetWord;
                    if(targetWord) {
                        playSound("A4").then(() => {
                            speak(targetWord.word, 'zh-CN', 1.0);
                            setTimeout(() => {
                                speak(targetWord.word, 'zh-CN', 0.3);
                            }, 1000);
                        });
                    }
                }
            }
        }
    }, [gesture, selectCard, nextGame, gameState]);

    // Mouse simulation for gesture
    const handleMouseMove = (e: React.MouseEvent) => {
        setGesture({ type: 'point', payload: { x: e.clientX, y: e.clientY }, timestamp: Date.now()});
    };
    
    const handleMouseClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const interactiveTarget = target.closest('[id^="card-"], [id="control-button"]');
        if (interactiveTarget) {
            setGesture({ type: 'click', payload: { x: e.clientX, y: e.clientY, targetId: interactiveTarget.id }, timestamp: Date.now()});
        }
    };

    const isRevealed = gameState === 'revealed';

    const handleControlButtonClick = () => {
         if (isRevealed) {
            playSound("E5").then(() => {
                nextGame();
            });
        } else {
            const targetWord = useGameStore.getState().targetWord;
             if(targetWord) {
                playSound("A4").then(() => {
                    speak(targetWord.word, 'zh-CN', 1.0);
                    setTimeout(() => {
                        speak(targetWord.word, 'zh-CN', 0.3);
                    }, 1000);
                });
            }
        }
    }

    return (
        <div 
            className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans relative overflow-hidden"
            onMouseMove={handleMouseMove} // Simulate 'point'
            onClick={handleMouseClick} // Simulate 'click'
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
                       请找出: "{useGameStore.getState().targetWord?.word}"
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
                    key={isRevealed ? 'next' : 'speak'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center px-8 py-4 rounded-full text-white font-bold shadow-lg focus:outline-none ${isRevealed ? 'bg-blue-500 hover:bg-blue-600' : 'bg-teal-500 hover:bg-teal-600'}`}
                    onClick={handleControlButtonClick}
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
             <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                Gesture simulation via mouse. Move to point, click to select.
            </div>
        </div>
    );
}