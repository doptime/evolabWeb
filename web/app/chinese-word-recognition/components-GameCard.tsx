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
    onSelect: (id: string) => void; // 尽管这里不再直接使用，但为了接口兼容性保留
    isSelected: boolean; // 表示此卡片是否是用户选中的卡片
    isRevealed: boolean; // 表示游戏是否进入揭示阶段
}

const GameCard: React.FC<GameCardProps> = ({ option, onSelect, isSelected, isRevealed }) => {
    // isFlipped 决定卡片是否翻面
    // isSelected 决定卡片是否被选中，这会影响其放大和二次翻转状态
    const isCurrentlySelected = isSelected && isRevealed; // 只有当卡片被选中且游戏状态为revealed时，才进行二次翻转和放大

    return (
        <div className="w-64 h-80 perspective-1000">
            <motion.div
                id={option.id} // 确保ID存在，以便手势系统可以识别
                className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d 
                           ${isCurrentlySelected ? 'z-20' : ''}`} // 选中卡片提高z-index
                animate={{
                    // 如果游戏已揭示:
                    //   如果此卡片是正确答案: 
                    //     如果同时是用户选中的卡片，则翻转360度（二次翻转）
                    //     否则，翻转180度
                    //   如果此卡片是错误答案: 翻转180度
                    // 如果游戏未揭示: 翻转0度
                    rotateY: isRevealed ? (option.isCorrect ? (isCurrentlySelected ? 360 : 180) : 180) : 0,
                    scale: isCurrentlySelected ? 1.2 : 1,
                    x: isCurrentlySelected ? 0 : 0,
                    y: isCurrentlySelected ? -20 : 0
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
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
                    {/* 使用 dangerouslySetInnerHTML 来解析 \n 字符为换行 */}
                    <p className="text-gray-600 text-sm mt-4 whitespace-pre-wrap text-center" style={{ lineHeight: '1.2' }} dangerouslySetInnerHTML={{ __html: option.displayHint.replace(/\n/g, '<br/>') }}></p>
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