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
  const { gameState, triggerJudgment, currentValue, challengeValue } = useGameStore();
  const { gesture, setGesture } = useGestureStore(); // Import setGesture to clear gesture after click
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
      // Clear the gesture state after a successful click
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
    }
  }, [gameState, triggerJudgment, setGesture]);

  // Effect to play sounds and vibrations based on state changes
  useEffect(() => {
    if (gameState === 'correct') {
      // Optionally play a success sound or animation here
    } else if (gameState === 'incorrect') {
      playErrorVibration(); // Play vibration for incorrect state
    }
  }, [gameState]);

  // Handle gesture targeting for visual feedback
  // This effect ensures that if a 'point' gesture targets this button, 
  // we are aware of it for visual feedback. However, the actual click handling is separate.
  useEffect(() => {
    // No specific action needed here for 'point' targeting for this button's functionality. 
    // The 'isPressed' state handles the visual feedback for the actual click.
  }, [gesture]);

  return (
    <motion.button
      ref={buttonRef}
      id="judgment-btn"
      onClick={handleClick}
      disabled={gameState !== 'adjusting'} // Button is only clickable in 'adjusting' state
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
      ${gameState !== 'adjusting' ? 'opacity-60 cursor-not-allowed' : ''}
      will-change-transform
      w-48 h-16 text-xl
      `}
      {...(animationProps as any)} // Apply animation props dynamically
      style={{ willChange: 'transform, opacity' }}
      aria-label={buttonText}
    >
      {buttonText}
    </motion.button>
  );
};
