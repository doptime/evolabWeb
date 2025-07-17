'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store-game';

// A reusable sub-component for displaying a single pool
const Pool = ({ label, amount, maxAmount, heightClass, widthClass, targetId }) => {
    const waterLevelPercentage = Math.min(100, (amount / maxAmount) * 100);
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                id={targetId}
                className={`relative bg-yellow-200/70 rounded-lg border-4 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg ${heightClass} ${widthClass}`}
            >
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-300 opacity-80"
                    initial={false}
                    animate={{ height: `${waterLevelPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                </motion.div>
                <div className="relative text-xl font-bold text-yellow-800 z-10 drop-shadow-sm">
                    {Math.floor(amount)}
                </div>
            </div>
            <span className="text-sm font-semibold text-yellow-900/80">
                {label}
            </span>
        </div>
    );
};

const GoldPool = () => {
  const { totalGoldCoins, currentRoundGoldCoins, lastRewardAmount } = useGameStore();
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);

  // Trigger particle effect based on the last reward amount
  useEffect(() => {
    if (lastRewardAmount > 0) {
      const newParticles = Array.from({ length: Math.min(20, Math.floor(lastRewardAmount)) }).map(() => ({
        id: Math.random(),
        x: Math.random() * 100, // Random start x position in vw
      }));
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [lastRewardAmount]); // Depend on lastRewardAmount

  const onAnimationComplete = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      {/* Coin Particles Container */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[5000]">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-5 h-5 bg-yellow-400 rounded-full"
              style={{
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
                background: 'radial-gradient(circle, #fef08a, #facc15)' // Add a gradient background for more visual appeal
              }}
              initial={{ x: `${particle.x}vw`, y: '-5vh', scale: Math.random() * 0.5 + 0.5 }}
              animate={{
                // Req 3 & 4: Animate to the horizontal center of the current round pool
                // Total pool: left-8(2rem), w-24(6rem). Gap: gap-4(1rem). Current pool: w-16(4rem).
                // Current pool starts at 2+6+1=9rem. Its center is at 9rem + 4rem/2 = 11rem.
                x: '11rem', 
                // Animate to the vertical position of the current round pool
                // Pool container is at bottom-8(2rem). Current pool height is h-12(3rem).
                // Animate to a point within the pool.
                y: 'calc(100vh - 5rem)', 
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.2, ease: 'easeIn' }}
              onAnimationComplete={() => onAnimationComplete(particle.id)}
            >
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Req 3: Two pools layout */}
      <div className="fixed left-8 bottom-8 flex items-end gap-4 z-10">
        {/* Total Pool */}
        <Pool
            label="总奖池"
            amount={totalGoldCoins}
            maxAmount={1000} // A full pool represents 1000 coins
            heightClass="h-36" // Main pool height
            widthClass="w-24"
            targetId="total-pool"
        />
        {/* Current Round Pool */}
        <Pool
            label="本轮"
            amount={currentRoundGoldCoins}
            maxAmount={100} // A full round pool is 100 coins
            heightClass="h-12" // Req 3: 1/3 height of total pool (36/3=12)
            widthClass="w-16"
            targetId="current-round-pool"
        />
      </div>
    </>
  );
};

export default GoldPool;