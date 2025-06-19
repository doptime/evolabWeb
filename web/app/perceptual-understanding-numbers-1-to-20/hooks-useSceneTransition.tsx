"use client";
import useGameStore from './store-gameStore';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

export const useSceneTransition = () => {
  const { gameState } = useGameStore();
  
  const animateSceneTransition = useCallback(() => {
    return {
      transition: {
        duration: 0.8,
        ease: 'easeInOut'
      }
    };
  }, [gameState]);

  return {
    isAnimating: gameState === 'judging',
    animateSceneTransition
  };
};
