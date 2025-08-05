'use client';
import React, { useEffect, useRef, useState } from 'react';
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
    const [lastSpokenText, setLastSpokenText] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const cancelSpeakRef = useRef<() => void>();

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
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        cancelSpeech(); // 取消可能正在进行的语音
        selectOption(tabIndex, optionId);
    };

    const handleNextRoundClick = () => {
        if (gameState === 'feedback') {
            cancelSpeech(); // 切换轮次时取消语音
            startNewRound();
        }
    };

    const cancelSpeech = () => {
        if (cancelSpeakRef.current) {
            cancelSpeakRef.current();
            cancelSpeakRef.current = undefined;
            setIsSpeaking(false);
            setLastSpokenText('');
        }
    };

    // Req 6: Handler to replay question audio
    const handleQuestionClick = () => {
        if (targetTopic) {
            cancelSpeech(); // 先取消当前播放
            const textToSpeak = targetTopic.questionForTTS || `请找出 ${targetTopic.question}`;
            setLastSpokenText(textToSpeak);
            speakWithCleanup(textToSpeak);
        }
    };

    // 改进的语音播放函数，支持取消和清理
    const speakWithCleanup = async (text: string) => {
        if (!text || text === lastSpokenText) {
            return; // 避免重复播放相同内容
        }

        cancelSpeech(); // 取消之前的播放

        try {
            setIsSpeaking(true);
            setLastSpokenText(text);
            
            new Promise<void>((resolve, reject) => {
                cancelSpeakRef.current = () => {
                    reject(new Error('Speech cancelled'));
                };
            });

            await speak(text, 'zh-CN');
        } catch (error) {
            // 取消播放是正常的，不报错
            if (error.message !== 'Speech cancelled') {
                console.error('语音播放错误:', error);
            }
        } finally {
            setIsSpeaking(false);
            cancelSpeakRef.current = undefined;
        }
    };

    const handleOptionHover = (option: TabOption) => {
        if (gameState === 'feedback') return; // 反馈阶段不播放语音

        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
        }

        hoverTimer.current = setTimeout(async () => {
            if (!option.textForTTS) return;

            // 只有在选项未完成时才播放
            const selectionForTab = selections.find(s => s.tabIndex === optionTabs.indexOf(optionTabs.find(tab => tab.includes(option))?.tabIndex ?? 0));
            if (selectionForTab) return;

            try {
                await speakWithCleanup(option.textForTTS);
            } catch (error) {
                // 取消播放是正常的
            }
        }, 1000);
    };

    const handleOptionMouseLeave = () => {
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
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
                        relative bg-gray-200/50 rounded-2xl p-4 flex flex-col items-center justify-center 
                        border-2 border-dashed transition-all duration-300
                        ${isTabCompleted ? 'border-gray-400' : 'border-gray-300'}
                        ${glowClass}
                    `;

                    return (
                        <div
                            key={`tab-${tabIndex}-${roundId}`}
                            className={tabContainerClasses.trim().replace(/\s+/g, ' ')}
                            style={{ minHeight: '20rem' }}
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

                            {/* NEW: 1x2 grid layout for 2 options - changed from grid-cols-2 to flex-col */}
                            <div className="flex flex-col gap-6 w-full">
                                {tab.map((option, index) => {
                                    const isSelected = selectionForTab?.selectedOptionId === option.id;
                                    const isCorrectForTarget = option.isCorrectOption;
                                    
                                    return (
                                        <motion.div
                                            key={option.id}
                                            id={`option-${tabIndex}-${option.id}`}
                                            onClick={() => !isTabCompleted && handleCardClick(tabIndex, option.id)}
                                            onMouseEnter={() => handleOptionHover(option)}
                                            onMouseLeave={handleOptionMouseLeave}
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
                            onClick={() => {
                                cancelSpeech();
                                initializeGame();
                            }}
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