'use client';
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from './store-game';

export default function GoldPool() {
  const controls = useAnimation();
  const poolRef = useRef<HTMLDivElement>(null);
  const { totalGoldCoins, currentRoundGoldCoins } = useGameStore();

  useEffect(() => {
    const animateCoinDrop = async () => {
      if (currentRoundGoldCoins > 0) {
        await controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        });
        
        if (poolRef.current) {
          const particles = [];
          const particleCount = Math.min(10, Math.floor(currentRoundGoldCoins));
          
          for (let i = 0; i < particleCount; i++) {
            particles.push(
              <motion.div
                key={`coin-${i}`}
                className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.random() * 100 - 50,
                  y: Math.random() * -80 - 20,
                  opacity: 0,
                  scale: [1, 1.5, 0.5]
                }}
                transition={{ duration: 1 + Math.random() }}
              />
            );
          }
          return particles;
        }
      }
    };

    animateCoinDrop();
  }, [currentRoundGoldCoins, controls]);

  return (
    <motion.div 
      ref={poolRef}
      animate={controls}
      className="fixed left-8 bottom-8 w-24 h-24 bg-yellow-200 rounded-full border-4 border-yellow-400 flex items-center justify-center overflow-hidden"
    >
      <div className="text-xl font-bold text-yellow-700 z-10">
        {Math.floor(totalGoldCoins)}
      </div>
      <div className="absolute inset-0 bg-yellow-300 opacity-50" 
           style={{ height: `${Math.min(100, (totalGoldCoins % 1000)/10)}%` }} />
    </motion.div>
  );
}
