'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NumberSVG from './components-NumberSVG';
import { playSound } from './utils-audio'; // 导入分离后的音频工具

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
    isSelected: boolean;
    isRevealed: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ option, onSelect, isSelected, isRevealed }) => {
    // isFlipped 决定卡片是否翻面
    // isSelected 决定卡片是否被选中，这会影响其放大和二次翻转状态
    const isCurrentlySelected = isSelected && isRevealed; // 只有当卡片被选中且游戏状态为revealed时，才进行二次翻转和放大

    const handleCardClick = () => {
        if (!isRevealed) { // 只有在未揭示状态下才能点击选择
            onSelect(option.id);
        }
    };

    return (
        <div className="w-64 h-80 perspective-1000">
            <motion.div
                id={option.id}
                className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d 
                           ${isCurrentlySelected ? 'z-10' : ''}`} // 确保选中卡片在最上层
                animate={{
                    rotateY: isCurrentlySelected ? 360 : (isRevealed && option.isCorrect) ? 180 : 0, // 正确答案卡片翻转180度，选中卡片翻转360度
                    scale: isCurrentlySelected ? 1.2 : 1, // 选中卡片放大
                    x: isCurrentlySelected ? 0 : 0, // 确保放大时不会偏移
                    y: isCurrentlySelected ? -20 : 0 // 略微上浮
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                onClick={handleCardClick}
            >
                {/* Card Front */}
                <div className="absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-2xl shadow-xl bg-white border border-gray-200 flex flex-col items-center justify-center cursor-pointer">
                     <div className="flex-grow flex items-center justify-center w-full">
                        {option.isNumeric ? (
                            <NumberSVG number={parseInt(option.word)} className="text-8xl" />
                        ) : (
                            option.svg ? <option.svg className="w-24 h-24" /> : null // 确保SVG有尺寸
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mt-4 whitespace-pre-wrap text-center" style={{ lineHeight: '1.2' }}>{option.displayHint}</p>
                </div>

                {/* Card Back */}
                <div className={`absolute top-0 left-0 w-full h-full p-4 backface-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center transform-gpu rotate-y-180 ${option.isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <p className="text-6xl font-bold">{option.word}</p>
                    {option.isCorrect && <p className="text-green-600 mt-4 text-2xl">正确答案</p>}
                     {!option.isCorrect && <p className="text-red-600 mt-4 text-2xl">错误</p>}
                </div>
            </motion.div>
        </div>
    );
};

export default GameCard;