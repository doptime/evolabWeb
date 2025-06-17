"use client";
import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';

export default function IdlePhase() {
  const { gameState } = useGameStore();

  return (
    <motion.div
      className="w-full h-screen flex items-center justify-center"
      initial={{ y: 20 }}
      animate={{ y: 0 }}
    >
      <div className="text-4xl">
        {gameState === 'idle' && '等待挑战开始'}
      </div>
    </motion.div>
  );
};