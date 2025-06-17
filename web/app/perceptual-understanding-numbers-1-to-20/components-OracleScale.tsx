"use client";
import { useGameStore } from './store-gameStore';
import { useGestureStore } from './store-gestureStore';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function OracleScale() {
  const { challengeValue, currentValue, gameState, triggerJudgment } = useGameStore();
  const { gesture } = useGestureStore();

  useEffect(() => {
    if (gesture.type === 'click' && gesture.payload.targetId === 'judgment-btn') {
      triggerJudgment();
    }
  }, [gesture, triggerJudgment]);

  return (
    <motion.div 
      className="relative w-full h-screen"
      animate={{ 
        scale: gameState === 'correct' ? 1.1 : 1,
        transition: { duration: 0.5 }
      }}
    >
      <div className="w-full h-48 bg-gray-800">
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
          <div className="text-white text-4xl">{challengeValue}</div>
        </div>
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
          <div className="text-white text-4xl">{currentValue}</div>
        </div>
        <button
          id="judgment-btn"
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full"
        >
          {gameState === 'adjusting' ? '开始审判' : gameState === 'correct' ? '完美均衡' : '再次尝试'}
        </button>
      </div>
    </motion.div>
  );
}