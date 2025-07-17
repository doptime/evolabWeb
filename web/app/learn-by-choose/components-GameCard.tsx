'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TabOption } from '../store-game';

interface GameCardProps {
    option: TabOption;
    isSelected: boolean;
    isRevealed: boolean;
    isCorrectForTarget: boolean;
    isCompleted: boolean; // New prop to indicate if this option was already completed
}

const GameCard: React.FC<GameCardProps> = ({ option, isSelected, isRevealed, isCorrectForTarget, isCompleted }) => {
    const rotation = isRevealed ? 180 : 0;
    const cardScale = isSelected ? 1.05 : 1;
    const cardShadow = isSelected ? 'shadow-2xl' : 'shadow-lg';

    // Different background for completed cards
    const completedStyle = isCompleted 
        ? 'bg-green-500 border-2 border-green-400'
        : 'bg-white border border-gray-200';

    return (
        <div className="w-48 h-32 perspective-1000">
            <motion.div
                className="relative w-full h-full text-center transform-style-3d"
                animate={{
                    rotateY: rotation,
                    scale: cardScale,
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                {/* Card Front */}
                <div className={`absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-xl ${cardShadow} ${completedStyle} flex flex-col items-center justify-center`}>
                    <div className="flex-grow flex items-center justify-center w-full text-3xl font-bold text-gray-800">
                        <span>{option.text}</span>
                    </div>
                    {isCompleted && (
                        <div className="absolute top-1 right-1 text-green-500 text-xs font-bold">
                            ✓
                        </div>
                    )}
                </div>

                {/* Card Back */}
                <div className={`absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-xl shadow-xl flex flex-col items-center justify-center transform-gpu rotate-y-180 ${isCorrectForTarget ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <p className="text-3xl font-bold">{option.text}</p>
                    {isCorrectForTarget ? (
                        <p className="text-green-600 mt-2 text-lg">正确</p>
                    ) : (
                        <p className="text-red-600 mt-2 text-lg">混淆项</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GameCard;