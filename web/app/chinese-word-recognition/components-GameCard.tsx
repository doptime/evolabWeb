'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NumberSVG from './components-NumberSVG';

// This interface is now simpler, matching the one from the store
interface CardOption {
    id: string;
    word: string;
    isCorrect: boolean;
    displayHint: string;
    isNumeric: boolean;
    // The 'svg' prop is no longer available in the new data structure.
}

interface GameCardProps {
    option: CardOption;
    isSelected: boolean;
    isRevealed: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ option, isSelected, isRevealed }) => {
    const isFlipped = isRevealed && isSelected;
    const isEnlarged = isRevealed && isSelected && option.isCorrect;
    const rotation = isFlipped ? (option.isCorrect ? 360 : 180) : 0;

    const innerCardAnimate = {
        rotateY: rotation,
        scale: isEnlarged ? 1.2 : 1,
        y: isEnlarged ? -20 : 0,
        zIndex: isEnlarged ? 10 : (isSelected ? 5 : 1),
    };

    return (
        <div className="w-64 h-80 perspective-1000">
            <motion.div
                id={option.id}
                className="relative w-full h-full text-center transform-style-3d"
                animate={innerCardAnimate}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                {/* Card Front */}
                <div className="absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-2xl shadow-xl bg-white border border-gray-200 flex flex-col items-center justify-center cursor-pointer">
                     <div className="flex-grow flex items-center justify-center w-full text-6xl font-bold text-gray-700">
                        {/* New logic for displaying content without SVG prop */}
                        {option.isNumeric ? (
                            <NumberSVG number={parseInt(option.word, 10)} />
                        ) : (
                            <span>{option.word}</span>
                        )}
                    </div>
                    <p 
                        className="text-gray-600 text-sm mt-4 whitespace-pre-wrap text-center" 
                        style={{ lineHeight: '1.3' }} 
                        dangerouslySetInnerHTML={{ __html: option.displayHint.replace(/\n/g, '<br/>') }}
                    ></p>
                </div>

                {/* Card Back */}
                <div className={`absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center transform-gpu rotate-y-180 ${option.isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <p className="text-6xl font-bold">{option.word}</p>
                    {option.isCorrect ? (
                        <p className="text-green-600 mt-4 text-2xl">正确答案</p>
                    ) : (
                        <p className="text-red-600 mt-4 text-2xl">错误</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}; 

export default GameCard;