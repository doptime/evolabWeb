import { useGameStore } from './store-gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestureStore } from '../store-gestureStore';
import { useEffect, useRef, useCallback } from 'react';
import { playErrorVibration, playJudgmentSound } from '../utils-audio';
import { useSpring } from 'framer-motion';
import { Physics, useBox } from '@react-three/fiber';

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
        type: 'spring',
        bounce: 0.2
      }
    }
  };

  return { pulseAnimation, shakeAnimation };
};

export const JudgmentButton = () => {
  const { gameState, triggerJudgment } = useGameStore();
  const { isJudgmentPressed, cancelGesture } = useGestureStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pulseAnimation, shakeAnimation } = useJudgmentAnimations();
  const [restitution, setRestitution] = useState(0.8);

  const getButtonStyle = useCallback(() => {
    if (window.innerWidth < 640) {
      return 'text-sm py-3 px-6';
    }
    return 'text-base py-4 px-8';
  }, []);

  const applyPhysicsFeedback = useCallback((state: string) => {
    if (state === 'incorrect') {
      playErrorVibration();
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }
    if (state === 'judging') {
      playJudgmentSound();
    }
  }, []);

  useEffect(() => {
    applyPhysicsFeedback(gameState);
  }, [gameState, applyPhysicsFeedback]);

  const handleGestureCancel = useCallback(() => {
    if (cancelGesture) {
      // Add physics-based rebound animation
      setRestitution(prev => Math.min(prev + 0.1, 1.0));
      setTimeout(() => setRestitution(0.8), 300);
    }
  }, [cancelGesture]);

  useEffect(() => {
    const handleCancel = () => handleGestureCancel();
    useGestureStore.subscribe('cancel', handleCancel);
    return () => useGestureStore.unsubscribe('cancel', handleCancel);
  }, [handleGestureCancel]);

  const getAriaLabel = useCallback(() => {
    switch (gameState) {
      case 'adjusting': return '开始审判按钮，当前处于调整状态';
      case 'correct': return '完美均衡状态';
      case 'incorrect': return '再次尝试按钮，当前处于错误状态';
      default: return '等待挑战';
    }
  }, [gameState]);

  return (
    <motion.button
      ref={buttonRef}
      className={`${
        gameState === 'incorrect' 
          ? 'bg-red-600/30 border-red-500' 
          : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400'
      } ${
        getButtonStyle()
      }
      glass-morphic 
      border-2 
      rounded-2xl 
      text-white 
      font-bold 
      transition-all 
      focus:outline-none 
      focus:ring-2 
      focus:ring-white/50
      ${isJudgmentPressed ? 'scale-95' : ''}`}
      onClick={triggerJudgment}
      aria-label={getAriaLabel()}
      {...(gameState === 'adjusting' 
        ? pulseAnimation 
        : gameState === 'incorrect' 
          ? shakeAnimation 
          : {}) }
      style={{ willChange: 'transform, opacity' }}
    >
      {gameState === 'adjusting' 
        ? '开始审判' 
        : gameState === 'correct' 
          ? '完美均衡' 
          : gameState === 'incorrect' 
            ? '再次尝试' 
            : '等待挑战'}
    </motion.button>
  );
};