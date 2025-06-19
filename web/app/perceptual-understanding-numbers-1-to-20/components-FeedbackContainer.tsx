"use client";
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from './store-gameStore';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { useEffect, useMemo, useState } from 'react';
import { playDing, playError } from './utils-audio'; // Assuming these audio functions exist
import FeedbackIcon from './components-FeedbackIcon';

export default function FeedbackContainer() {
  const { gameState, challengeValue, currentValue } = useGameStore();
  const { gesture } = useGestureStore(); // Not directly used here, but could be for gesture-based dismissal
  const [animationPerformance, setAnimationPerformance] = useState({ fps: 60 }); // Placeholder for performance metrics

  // Determine the feedback content based on the game state
  const feedbackContent = useMemo(() => {
    if (gameState === 'correct') {
      return {
        title: '完美均衡',
        message: `恭喜你！ ${challengeValue} 对比 ${currentValue}`, // Display values for context
        icon: 'success',
        color: 'text-green-400',
      };
    } else if (gameState === 'incorrect') {
      return {
        title: '再次尝试',
        message: `还差一点！ ${currentValue} vs ${challengeValue}`, // Display values for context
        icon: 'error',
        color: 'text-red-500',
      };
    }
    return null; // No feedback needed for other states
  }, [gameState, challengeValue, currentValue]);

  // Effect to play audio feedback based on state changes
  useEffect(() => {
    if (feedbackContent) {
      if (feedbackContent.icon === 'success') {
        playDing(); // Use playDing for success feedback
      } else if (feedbackContent.icon === 'error') {
        playError();
      }
    } 
  }, [feedbackContent]);

  // If no feedback is needed, return null
  if (!feedbackContent) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Only render the feedback container when there's content */}
      <motion.div
        key="feedback"
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <motion.div
          className="bg-black bg-opacity-70 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-sm text-center"
          whileTap={{ scale: 0.98 }}
        >
          <FeedbackIcon type={feedbackContent.icon} />
          <motion.h2 className={`text-3xl font-bold mb-3 ${feedbackContent.color}`}>
            {feedbackContent.title}
          </motion.h2>
          <motion.p className="text-lg text-white mb-6">
            {feedbackContent.message}
          </motion.p>
          {/* Optionally add a button to dismiss or proceed */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
