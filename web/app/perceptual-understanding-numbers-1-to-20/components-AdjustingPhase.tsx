import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';

export default function AdjustingPhase() {
  const { challengeValue, currentValue, gameState } = useGameStore();

  return (
    <motion.div
      className="w-full h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-4xl">
        调整阶段: {challengeValue} vs {currentValue}
      </div>
    </motion.div>
  );
};