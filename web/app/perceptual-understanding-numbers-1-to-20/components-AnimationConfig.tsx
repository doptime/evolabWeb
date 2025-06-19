import { motion } from 'framer-motion';

export const pulseAnimation = {
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

export const shakeAnimation = {
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
