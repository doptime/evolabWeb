import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { useEffect, useRef, useCallback } from 'react';
import { playJudgmentSound, playErrorVibration } from './utils-audio';

const useJudgmentAnimations = () => {
  // Animation for the 'Start Judgment' button pulsing
  const pulseAnimation = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Animation for the 'Try Again' button shaking on incorrect state
  const shakeAnimation = {
    animate: {
      x: [0, -5, 5, 0],
      y: [0, 5, -5, 0],
      transition: {
        duration: 0.3,
        type: 'keyframes', // Changed from 'spring' to 'keyframes'
        times: [0, 0.25, 0.75, 1], // Added times for keyframes
        ease: 'easeInOut' // Using easeInOut for smoother animation
      }
    }
  };

  return { pulseAnimation, shakeAnimation };
};

export const JudgmentButton = () => {
  const { gameState, triggerJudgment, resetToAdjusting } = useGameStore(); // Added resetToAdjusting
  const { gesture, setGesture } = useGestureStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pulseAnimation, shakeAnimation } = useJudgmentAnimations();

  // Determine button text and animation based on game state
  const buttonText = {
    adjusting: '开始审判',
    correct: '完美均衡',
    incorrect: '再次尝试',
    idle: '等待挑战'
  }[gameState] || '开始审判';

  const animationProps = {
    adjusting: pulseAnimation,
    incorrect: shakeAnimation,
    // No animation for 'correct' or 'idle' states by default
  }[gameState];

  // Check if the button is being pressed by gesture
  const isPressed = gesture.type === 'click' && gesture.payload.targetId === 'judgment-btn';

  // Handle the click action
  const handleClick = useCallback(() => {
    if (gameState === 'adjusting') {
      triggerJudgment();
      playJudgmentSound(); // Play sound on judgment trigger
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
    } else if (gameState === 'incorrect') { // Handle '再次尝试' click
      resetToAdjusting();
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
    }
  }, [gameState, triggerJudgment, resetToAdjusting, setGesture]);

  // Effect to play sounds and vibrations based on state changes
  useEffect(() => {
    if (gameState === 'correct') {
      // Optionally play a success sound or animation here
    } else if (gameState === 'incorrect') {
      playErrorVibration(); // Play vibration for incorrect state
    }
  }, [gameState]);

  return (
    <motion.button
      ref={buttonRef}
      id="judgment-btn"
      onClick={handleClick}
      disabled={gameState === 'idle' || gameState === 'correct'} // Only disabled in idle or correct states
      className={`${ 
        gameState === 'incorrect' 
          ? 'bg-red-600/30 border-red-500'
          : gameState === 'adjusting'
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400'
            : 'bg-gray-700/30 border-gray-500'
      } 
      glass-morphic 
      border-2 
      rounded-2xl 
      text-white 
      font-bold 
      transition-all duration-300 
      focus:outline-none 
      focus:ring-2 
      focus:ring-white/50
      ${isPressed ? 'scale-95' : ''}
      ${(gameState === 'idle' || gameState === 'correct') ? 'opacity-60 cursor-not-allowed' : ''} // Adjusted disabled visual state
      will-change-transform
      w-48 h-16 text-xl
      `} 
      {...(animationProps as any)}
      style={{ willChange: 'transform, opacity' }}
      aria-label={buttonText}
    >
      {buttonText}
    </motion.button>
  );
};