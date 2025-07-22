'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store-game';

// A reusable sub-component for displaying a single pool
// Req 3: Changed heightClass to a style prop `height` to support vh units.
const Pool = ({ label, amount, maxAmount, height, widthClass, targetId }) => {
    const waterLevelPercentage = Math.min(100, (amount / maxAmount) * 100);
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                id={targetId}
                className={`relative bg-yellow-200/70 rounded-lg border-4 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg ${widthClass}`}
                style={{ height: height }} // Use inline style for dynamic height
            >
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-300 opacity-80"
                    initial={false}
                    animate={{ height: `${waterLevelPercentage}%` }} // This is the water level effect
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
  // The store was updated to include lastRewardAmount to specifically trigger animations
  const { totalGoldCoins, currentRoundGoldCoins, lastRewardAmount } = useGameStore();
  const [particles, setParticles] = useState<{ id: number; x: string }[]>([]);

  // Trigger particle effect based on the last reward amount
  useEffect(() => {
    if (lastRewardAmount > 0) {
      const newParticles = Array.from({ length: Math.min(20, Math.floor(lastRewardAmount)) }).map(() => ({
        id: Math.random(),
        // Req 4: Randomize start position within the horizontal area of the current pool.
        // Current pool area: left: 9rem, width: 4rem. So from 9rem to 13rem.
        x: `${9 + Math.random() * 4}rem`,
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
                background: 'radial-gradient(circle, #fef08a, #facc15)',
                left: particle.x, // Use left for positioning
              }}
              initial={{ y: '-5vh', scale: Math.random() * 0.5 + 0.5 }}
              animate={{
                // Req 4: Animate vertically into the current round pool area.
                // Pool container is at bottom-8 (2rem), current pool height is 23vh.
                // We make it fall somewhere inside the pool's vertical space.
                y: `calc(100vh - 8rem - ${Math.random() * 10}vh)`,
                scaleX: [1, 0.2], // Req 4: Narrowing effect
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, ease: 'easeIn' }} // Req 4: Duration is 0.8s
              onAnimationComplete={() => onAnimationComplete(particle.id)}
            >
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Req 3: Two pools layout with specified vh heights */}
      <div className="fixed left-8 bottom-8 flex items-end gap-4 z-10">
        {/* Total Pool */}
        <Pool
            label="总奖池"
            amount={totalGoldCoins}
            maxAmount={1000} // A full pool represents 1000 coins
            height="70vh" // Req 3: Set height to 70vh
            widthClass="w-24"
            targetId="total-pool"
        />
        {/* Current Round Pool */}
        <Pool
            label="本轮"
            amount={currentRoundGoldCoins}
            maxAmount={100} // A full round pool is 100 coins
            height="23vh" // Req 3: Set height to 23vh
            widthClass="w-16"
            targetId="current-round-pool"
        />
      </div>
    </>
  );
};

export default GoldPool;
