'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NumberSVG from './components-NumberSVG';

interface CardOption {
    id: string;
    word: string;
    isCorrect: boolean;
    displayHint: string;
    isNumeric?: boolean;
    svg: React.FC | null;
}

interface GameCardProps {
    option: CardOption;
    onSelect: (id: string) => void; 
    isSelected: boolean; // Is this the card the user picked?
    isRevealed: boolean; // Has the answer been revealed for this round?
}

const GameCard: React.FC<GameCardProps> = ({ option, isSelected, isRevealed }) => {
    // Refined logic for visual feedback based on user request.
    // 1. Only the selected card flips.
    const isFlipped = isRevealed && isSelected;
    // 2. Only the correct card is enlarged.
    const isEnlarged = isRevealed && option.isCorrect;
    // 3. The selected card flips 180deg. If it's also the correct one, it flips 360deg (back to front).
    const rotation = isFlipped ? (option.isCorrect ? 360 : 180) : 0;
    // 4. Other cards (not selected, not the correct one) have no visual feedback. This is implicitly handled.

    const innerCardAnimate = {
        rotateY: rotation,
        scale: isEnlarged ? 1.2 : 1,
        y: isEnlarged ? -20 : 0,
        zIndex: isEnlarged ? 10 : 1,
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
                     <div className="flex-grow flex items-center justify-center w-full">
                        {option.isNumeric ? (
                            <NumberSVG number={parseInt(option.word)} className="text-8xl" />
                        ) : (
                            option.svg ? <option.svg className="w-24 h-24" /> : null
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
