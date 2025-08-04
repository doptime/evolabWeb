'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TabOption } from './store-game';

interface GameCardProps {
    option: TabOption;
    isSelected: boolean;
    isRevealed: boolean;
    isCorrectForTarget: boolean;
    isTabCompleted: boolean; // Req 1: Add prop to know if the parent tab is locked
}

const GameCard: React.FC<GameCardProps> = ({ option, isSelected, isRevealed, isCorrectForTarget, isTabCompleted }) => {
    // Req 6: Refined reveal logic.
    // - Incorrect cards flip to show their red "back".
    // - Correct cards stay on the "front", get a green highlight, and scale up for emphasis.
    const rotation = isRevealed && !isCorrectForTarget ? 180 : 0;
    const scale = isRevealed && isCorrectForTarget ? 1.2 : (isSelected ? 1.05 : 1);
    const zIndex = isRevealed && isCorrectForTarget ? 10 : 1; // Ensure correct cards appear on top
    const cardShadow = isSelected ? 'shadow-2xl' : 'shadow-lg';

    // Req 1: Apply grayscale and reduced opacity if the tab is completed and revealed
    const lockedStyle = isTabCompleted ? 'grayscale opacity-60' : '';

    // The front of the card gets a green highlight when it's revealed as a correct answer.
    const frontStyle = isRevealed && isCorrectForTarget 
        ? 'bg-green-200 border-2 border-green-500'
        : 'bg-white border border-gray-200';

    // Add dynamic text wrapping and responsive font size
    const textClass = "text-center text-lg font-bold text-gray-800 leading-tight p-2";

    return (
        <div className={`w-32 h-24 perspective-1000 ${lockedStyle}`} style={{ zIndex }}>
            <motion.div
                className="relative w-full h-full text-center transform-style-3d"
                animate={{
                    rotateY: rotation,
                    scale: scale,
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                {/* Card Front */}
                <div className={`absolute top-0 left-0 w-full h-full p-2 backface-hidden rounded-xl ${cardShadow} ${frontStyle} flex flex-col items-center justify-center`}>
                    <div className="flex-grow flex items-center justify-center w-full">
                        <span className={textClass}>
                            {option.text}
                        </span>
                    </div>
                </div>

                {/* Card Back (Only shown for incorrect cards during reveal) */}
                <div className={`absolute top-0 left-0 w-full h-full p-2 backface-hidden rounded-xl shadow-xl flex flex-col items-center justify-center transform-gpu rotate-y-180 bg-red-100 border-2 border-red-500`}>
                    <p className="text-lg font-bold">{option.text}</p>
                    <p className="text-red-600 mt-2 text-sm">混淆项</p>
                </div>
            </motion.div>
        </div>
    );
};

export default GameCard;