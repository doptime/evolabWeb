import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { useEffect, useRef, useCallback } from 'react';
import { playJudgmentSound, playErrorVibration, playDing, playError } from './utils-audio';

const useJudgmentAnimations = () => {
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

  const shakeAnimation = {
    animate: {
      x: [0, -5, 5, 0],
      y: [0, 5, -5, 0],
      transition: {
        duration: 0.3,
        type: 'keyframes',
        times: [0, 0.25, 0.75, 1],
        ease: 'easeInOut'
      }
    }
  };

  return { pulseAnimation, shakeAnimation };
};

export const JudgmentButton = () => {
  const { gameState, triggerJudgment } = useGameStore();
  const { gesture, setGesture } = useGestureStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pulseAnimation } = useJudgmentAnimations(); // Only pulseAnimation needed here

  let buttonText = '开始审判';
  let animationProps;
  let isInteractionEnabled = false; 
  let isHidden = false; 

  switch (gameState) {
    case 'adjusting':
      buttonText = '开始审判';
      animationProps = pulseAnimation;
      isInteractionEnabled = true;
      isHidden = false; 
      break;
    case 'correct':
    case 'great':
    case 'good':
    case 'incorrect': 
      buttonText = ''; // Hidden, so text doesn't matter
      animationProps = null;
      isInteractionEnabled = false;
      isHidden = true; // Hide the button when feedback is displayed
      break;
    case 'idle':
    default:
      buttonText = '等待挑战';
      animationProps = null;
      isInteractionEnabled = false;
      isHidden = true; // Hide in idle state, StartChallengeButton handles it
      break;
  }

  const isPressed = gesture.type === 'click' && gesture.payload.targetId === 'judgment-btn';

  // Handle the click action
  const handleClick = useCallback(() => {
    if (!isInteractionEnabled) return;

    if (gameState === 'adjusting') {
      triggerJudgment();
      playJudgmentSound();
    }
    setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
  }, [gameState, triggerJudgment, setGesture, isInteractionEnabled]);

  // Effect to play sounds and vibrations based on state changes (now largely handled by FeedbackContainer for final states)
  // This useEffect could be removed if all final state sounds are in FeedbackContainer
  useEffect(() => {
    // If any specific sound for judgment button click itself is needed, keep it here
    // For correctness/incorrectness sounds, FeedbackContainer is better suited
  }, [gameState]); 

  if (isHidden) {
    return null; // Don't render the button if hidden
  }

  return (
    <motion.button
      ref={buttonRef}
      id="judgment-btn"
      onClick={handleClick}
      disabled={!isInteractionEnabled}
      className={`${ 
        gameState === 'incorrect' 
          ? 'bg-red-600/30 border-red-500' // Incorrect state styling
          : (gameState === 'correct' || gameState === 'great' || gameState === 'good')
            ? 'bg-green-600/30 border-green-500' // Correct/Great/Good state styling
            : gameState === 'adjusting'
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400' // Adjusting state styling
              : 'bg-gray-700/30 border-gray-500' // Default/Idle state styling
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
}