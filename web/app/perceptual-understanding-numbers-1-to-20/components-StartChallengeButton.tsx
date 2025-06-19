"use client";
import { motion } from 'framer-motion';
import useGameStore from './store-gameStore';
import { useGestureStore } from "../../components/guesture/gestureStore";
import { playClickSound, initAudio } from './utils-audio'; // Import initAudio here

const StartChallengeButton = () => {
  const { gameState, startChallenge } = useGameStore();
  const { gesture, setGesture } = useGestureStore(); // Import setGesture to clear gesture after click

  // Determine if the button should be interactive based on game state
  const isInteractionEnabled = gameState === 'idle';

  // Dynamic button styling based on game state
  const buttonStyle = {
    idle: 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:shadow-xl',
    correct: 'bg-gradient-to-r from-green-500 to-teal-500 shadow-lg hover:shadow-xl',
    incorrect: 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg hover:shadow-xl',
    default: 'bg-gray-600 shadow-md hover:shadow-lg'
  };

  const handleClick = async () => { // Make handleClick async to await initAudio
    if (isInteractionEnabled) {
      await initAudio(); // Ensure audio is initialized before starting the challenge
      startChallenge(); // Call the startChallenge action from the store
      playClickSound();
      // triggerHapticFeedback(); // This might not be needed on the start button
      // Clear the gesture state after a successful click to prevent re-triggering
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
        ${isInteractionEnabled ? buttonStyle[gameState] : buttonStyle.default}
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
      // Conditionally render the button based on game state
      hidden={gameState !== 'idle'}
    >
      {gameState === 'idle' ? 'Start Challenge' : 'Next Challenge'} {/* Text changes based on state */}
    </motion.button>
  );
};

export default StartChallengeButton;
