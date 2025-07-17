'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store-game';

const GoldPool = () => {
  const { totalGoldCoins } = useGameStore();
  const prevTotalGold = useRef(totalGoldCoins);
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    const newCoins = totalGoldCoins - prevTotalGold.current;
    if (newCoins > 0) {
      const newParticles = Array.from({ length: Math.min(20, Math.floor(newCoins)) }).map(() => ({
        id: Math.random(),
        x: Math.random() * 100, // Start x position in vw
      }));
      setParticles(prev => [...prev, ...newParticles]);
    }
    prevTotalGold.current = totalGoldCoins;
  }, [totalGoldCoins]);

  
  const onAnimationComplete = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  // The water level fills up a 1000-coin bucket.
  const waterLevelPercentage = (totalGoldCoins % 1000) / 10;

  return (
    <>
      {/* Coin Particles Container */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[5000]">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-5 h-5 bg-yellow-400 rounded-full"
              initial={{ x: `${particle.x}vw`, y: '-5vh', scale: Math.random() * 0.5 + 0.5 }}
              animate={{
                y: '85vh', // Animate to the vertical position of the pool
                x: 'calc(8rem)', // Animate to the horizontal position of the pool
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.2, ease: 'easeIn' }}
              onAnimationComplete={() => onAnimationComplete(particle.id)}
            >
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      
      {/* Gold Pool */}
      <motion.div
        className="fixed left-8 bottom-8 w-24 h-24 bg-yellow-200 rounded-full border-4 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg"
      >
        {/* Water Level */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-yellow-300 opacity-70"
          initial={false}
          animate={{ height: `${waterLevelPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
        </motion.div>
        {/* Text Display */}
        <div className="relative text-xl font-bold text-yellow-700 z-10">
          {Math.floor(totalGoldCoins)}
        </div>
      </motion.div>
    </>
  );
};

export default GoldPool;