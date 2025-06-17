import { motion } from 'framer-motion';
import { useGameStore } from './store-gameStore';
import { useGestureStore } from '../store-gestureStore';
import { playClickSound, triggerHapticFeedback } from '../utils-audio';

const StartChallengeButton = () => {
  const { gameState, startChallenge } = useGameStore();
  const { gesture } = useGestureStore();

  const isInteractionEnabled = gameState === 'idle';
  const buttonColor = {
    'idle': 'bg-gradient-to-r from-blue-500 to-purple-500',
    'correct': 'bg-gradient-to-r from-green-500 to-teal-500',
    'incorrect': 'bg-gradient-to-r from-red-500 to-orange-500'
  }[gameState];

  const handleClick = () => {
    if (isInteractionEnabled) {
      startChallenge();
      playClickSound();
      triggerHapticFeedback();
    }
  };

  const handleGestureCancel = () => {
    // Add physical rebound animation on gesture cancel
    if (gesture.type === 'drag') {
      // Implement spring-based rebound animation
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onPointerUp={handleGestureCancel}
      whileTap={{ 
        scale: 0.95, 
        transition: { delay: 0.1, type: 'spring', stiffness: 400, damping: 15 } 
      }}
      className={`
        ${buttonColor} 
        glass-morphic 
        px-8 py-4 rounded-2xl 
        text-white font-bold 
        shadow-lg 
        transition-all duration-300 
        ${isInteractionEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
        will-change-transform
      `}
      aria-label="Start Challenge"
      aria-disabled={!isInteractionEnabled}
    >
      {gameState === 'idle' ? 'Start Challenge' : 'Next Challenge'}
      <motion.span
        className="absolute -inset-1 border-2 border-white/20 rounded-2xl"
        animate={{
          opacity: gesture.type === 'point' ? 1 : 0,
          scale: gesture.type === 'point' ? 1.05 : 1
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      />
      {/* Multi-touch synchronization indicator */}
      {gesture.type === 'transform' && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      )}
    </motion.button>
  );
};

export default StartChallengeButton;
