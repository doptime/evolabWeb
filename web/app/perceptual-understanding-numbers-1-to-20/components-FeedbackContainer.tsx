"use client";
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from './store-gameStore';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { useEffect, useMemo, useState } from 'react';
import { playDing, playError } from './utils-audio';
import FeedbackIcon from './components-FeedbackIcon';

export default function FeedbackContainer() {
  const { gameState, challengeValue, currentValue, startChallenge } = useGameStore(); // Removed hideFeedback, using startChallenge for dismissal
  const { gesture, setGesture } = useGestureStore(); 
  const [animationPerformance, setAnimationPerformance] = useState({ fps: 60 }); // Currently unused

  // Determine the feedback content based on the game state
  const feedbackContent = useMemo(() => {
    // No need to calculate difference here, as gameState already reflects it
    let title = '';
    let message = '';
    let icon = '';
    let color = '';
    const difference = Math.abs(currentValue - challengeValue);

    switch (gameState) {
      case 'correct':
        title = '完美均衡！';
        message = `恭喜你！挑战值 ${challengeValue} 与当前值 ${currentValue} 完全匹配！`;
        icon = 'success';
        color = 'text-green-400';
        break;
      case 'great':
        title = '非常接近！';
        message = `你只差一点点！挑战值 ${challengeValue}，当前值 ${currentValue}。`;
        icon = 'success'; // Still a success, but less perfect
        color = 'text-yellow-400';
        break;
      case 'good':
        title = '做得不错！';
        message = `你已经很接近了！挑战值 ${challengeValue}，当前值 ${currentValue}。`;
        icon = 'success'; // Still a success
        color = 'text-orange-400';
        break;
      case 'incorrect':
        title = '再次尝试';
        message = `还差一点！挑战值 ${challengeValue}，当前值 ${currentValue}。`;
        icon = 'error';
        color = 'text-red-500';
        break;
      default:
        return null; // No feedback needed for other states
    }
    return { title, message, icon, color };
  }, [gameState, challengeValue, currentValue]);

  // Effect to play audio feedback based on state changes
  useEffect(() => {
    if (feedbackContent) {
      if (gameState === 'correct' || gameState === 'great' || gameState === 'good') {
        playDing(); // Play a general success sound, can be refined to different 'ding' sounds for each level of success
      } else if (gameState === 'incorrect') {
        playError();
      }
    }
  }, [feedbackContent, gameState]);

  // Handle button click to dismiss feedback or start new challenge
  const handleDismiss = () => {
    // Always start a new challenge when dismissing feedback after a judgment
    startChallenge(); 
    setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' }); // Clear gesture after click
  };

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
          <motion.button
            id="feedback-dismiss-btn"
            onClick={handleDismiss}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {feedbackContent.icon === 'error' ? '再次尝试' : '新的挑战'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}