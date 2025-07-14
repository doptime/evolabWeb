'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TabOption } from '../store-game'; // Import the new option type

interface GameCardProps {
    option: TabOption;
    isSelected: boolean;
    isRevealed: boolean;
    isCorrectForTarget: boolean; // Is this card the correct one for the current round's target?
}

const GameCard: React.FC<GameCardProps> = ({ option, isSelected, isRevealed, isCorrectForTarget }) => {
    // The card flips when the round is over (isRevealed)
    const isFlipped = isRevealed;
    const rotation = isFlipped ? 180 : 0;
    
    // Highlight the selected card
    const cardScale = isSelected ? 1.05 : 1;
    const cardShadow = isSelected ? 'shadow-2xl' : 'shadow-lg';

    const innerCardAnimate = {
        rotateY: rotation,
        scale: cardScale,
    };

    return (
        // Smaller card size to fit in the new layout
        <div className="w-48 h-32 perspective-1000">
            <motion.div
                className="relative w-full h-full text-center transform-style-3d"
                animate={innerCardAnimate}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                {/* Card Front */}
                <div className={`absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-xl ${cardShadow} bg-white border border-gray-200 flex flex-col items-center justify-center`}>
                     <div className="flex-grow flex items-center justify-center w-full text-3xl font-bold text-gray-800">
                        <span>{option.text}</span>
                    </div>
                    {/* Displaying weight for debugging, can be removed */}
                    <p className="text-gray-400 text-xs">weight: {option.weight}</p>
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