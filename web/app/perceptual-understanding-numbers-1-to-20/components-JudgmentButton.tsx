import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { useEffect, useRef, useCallback } from 'react';
import { playJudgmentSound, playErrorVibration, playDing, playError } from './utils-audio'; // Import playDing and playError for feedback

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
  const { gameState, triggerJudgment, resetToAdjusting, startChallenge, challengeValue, currentValue } = useGameStore(); // Added startChallenge and values for feedback
  const { gesture, setGesture } = useGestureStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pulseAnimation, shakeAnimation } = useJudgmentAnimations();

  // Determine button text and animation based on game state
  let buttonText;
  let animationProps;
  let isInteractionEnabled = true; // Assume enabled by default, then disable if needed

  switch (gameState) {
    case 'adjusting':
      buttonText = '开始审判';
      animationProps = pulseAnimation;
      break;
    case 'correct':
      buttonText = '新的挑战';
      animationProps = null; // No animation for 'correct' state
      break;
    case 'great':
      buttonText = '新的挑战';
      animationProps = null;
      break;
    case 'good':
      buttonText = '新的挑战';
      animationProps = null;
      break;
    case 'incorrect':
      buttonText = '再次尝试';
      animationProps = shakeAnimation;
      break;
    case 'idle':
    default:
      buttonText = '等待挑战';
      animationProps = null;
      isInteractionEnabled = false; // Disable button when idle
      break;
  }

  // Check if the button is being pressed by gesture
  const isPressed = gesture.type === 'click' && gesture.payload.targetId === 'judgment-btn';

  // Calculate difference for feedback intensity
  const difference = Math.abs(currentValue - challengeValue);
  
  // Handle the click action
  const handleClick = useCallback(() => {
    if (!isInteractionEnabled) return; // Prevent action if not enabled

    if (gameState === 'adjusting') {
      triggerJudgment();
      playJudgmentSound();
    } else if (gameState === 'incorrect') { // Handle '再次尝试' click
      resetToAdjusting(); // Reset to adjusting state
    } else if (gameState === 'correct' || gameState === 'great' || gameState === 'good') { // Handle '新的挑战' click
      startChallenge(); // Start a new challenge
    }
    setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' }); // Clear gesture after any click
  }, [gameState, triggerJudgment, resetToAdjusting, startChallenge, setGesture, isInteractionEnabled]);

  // Effect to play sounds and vibrations based on state changes
  useEffect(() => {
    if (gameState === 'incorrect') {
      playErrorVibration(); // Play vibration for incorrect state
      playError(); // Play error sound
    } else if (gameState === 'correct' || gameState === 'great' || gameState === 'good') {
      playDing(); // Play general success sound for all success states
    }
  }, [gameState]); 

  return (
    <motion.button
      ref={buttonRef}
      id="judgment-btn"
      onClick={handleClick}
      disabled={!isInteractionEnabled}
      className={`${ 
        gameState === 'incorrect' 
          ? 'bg-red-600/30 border-red-500'
          : (gameState === 'correct' || gameState === 'great' || gameState === 'good')
            ? 'bg-green-600/30 border-green-500'
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
      ${!isInteractionEnabled ? 'opacity-60 cursor-not-allowed' : ''} 
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