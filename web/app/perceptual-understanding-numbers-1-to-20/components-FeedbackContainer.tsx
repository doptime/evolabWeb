import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store-gameStore';
import { useGestureStore } from './store-gestureStore';
import { useEffect, useMemo, useState } from 'react';
import { playVictory, playError } from './utils-audio';
import FeedbackIcon from './components-FeedbackIcon';

export default function FeedbackContainer() {
  const { gameState, challengeValue, currentValue } = useGameStore();
  const { gesture } = useGestureStore();
  const [animationPerformance, setAnimationPerformance] = useState({ fps: 60 });

  const feedbackContent = useMemo(() => {
    if (gameState === 'correct') {
      return {
        title: '完美均衡',
        message: '恭喜你找到了正确的平衡！',
        icon: 'success',
        color: 'text-green-400',
      };
    } else if (gameState === 'incorrect') {
      return {
        title: '再次尝试',
        message: '很遗憾，再试一次吧！',
        icon: 'error',
        color: 'text-red-500',
      };
    }
    return null;
  }, [gameState]);

  if (!feedbackContent) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <motion.div
          className="bg-black bg-opacity-60 p-8 rounded-2xl shadow-2xl flex flex-col items-center"
          whileTap={{ scale: 0.98 }}
        >
          <FeedbackIcon type={feedbackContent.icon} />
          <motion.h2 className="text-2xl font-bold mb-2 text-white">
            {feedbackContent.title}
          </motion.h2>
          <motion.p className="text-white text-center mb-6">
            {feedbackContent.message}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};