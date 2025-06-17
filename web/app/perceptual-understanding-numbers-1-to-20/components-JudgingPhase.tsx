import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';

export default function JudgingPhase() {
  const { gameState } = useGameStore();

  return (
    <motion.div
      className="w-full h-screen flex items-center justify-center"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
    >
      <div className="text-4xl">
        {gameState === 'judging' && '判定中...'}
      </div>
    </motion.div>
  );
};