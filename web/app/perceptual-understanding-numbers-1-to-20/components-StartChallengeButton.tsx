"use client";
import { motion } from 'framer-motion';
import useGameStore from './store-gameStore';
import { useGestureStore } from "../../components/guesture/gestureStore";
import { playClickSound, initAudio } from './utils-audio';

const StartChallengeButton = () => {
  const { gameState, startChallenge } = useGameStore();
  const { gesture, setGesture } = useGestureStore(); 

  // The button should only be interactive and visible when the game is truly idle (initial state)
  // After a challenge, FeedbackContainer's button handles starting the next one.
  const isInteractionEnabled = gameState === 'idle';

  const handleClick = async () => { 
    if (isInteractionEnabled) {
      await initAudio(); 
      startChallenge(); 
      playClickSound();
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
    }
  };

  // Check if the button is being targeted by a gesture for visual feedback
  const isGestureTargeted = gesture.type === 'click' && gesture.payload.targetId === 'start-challenge-btn';

  return (
    <motion.button
      id="start-challenge-btn"
      onClick={handleClick}
      whileTap={{
        scale: 0.95,
        transition: { delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }
      }}
      className={`
        ${isInteractionEnabled ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:shadow-xl' : 'bg-gray-600 shadow-md hover:shadow-lg'}
        glass-morphic 
        px-8 py-4 rounded-2xl 
        text-white font-bold 
        transition-all duration-300 
        ${isInteractionEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
        will-change-transform
        ${isGestureTargeted ? 'ring-2 ring-yellow-400' : ''} 
        w-64 h-16 text-xl
      `}
      aria-label="Start Challenge"
      aria-disabled={!isInteractionEnabled}
      // Hide the button unless the game is in the 'idle' state
      hidden={gameState !== 'idle'} 
    >
      Start Challenge
    </motion.button>
  );
};

export default StartChallengeButton;