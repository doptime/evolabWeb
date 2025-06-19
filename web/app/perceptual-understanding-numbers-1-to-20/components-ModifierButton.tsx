import useGameStore from './store-gameStore';
import { useGestureStore } from "../../components/guesture/gestureStore"
import { motion, AnimatePresence } from 'framer-motion';
import { playDing } from './utils-audio'; // Assuming playDing is appropriate for modifiers
import { useEffect } from 'react';

interface ModifierButtonProps {
  value: 1 | 3;
  operation: 'add' | 'subtract';
}

export const ModifierButton = ({ value, operation }: ModifierButtonProps) => {
  const { gameState, applyModifier, recordAction } = useGameStore();
  const { gesture, setGesture } = useGestureStore(); // Import setGesture to clear gesture after click
  
  // Check if the button is currently targeted by a gesture
  const isGestureTargeted = gesture.type === 'click' && gesture.payload.targetId === `modifier-${operation}-${value}`;

  // Determine if the button should be active based on game state
  const isActive = gameState === 'adjusting';

  const handleModifierClick = () => {
    if (isActive) {
      applyModifier(value, operation);
      playDing(); // Play a sound effect for modifier actions
      recordAction({ type: operation, value }); // Record the action for undo/redo
      // Clear the gesture state after a successful click to prevent re-triggering
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
    }
  };

  // Handle gesture targeting for visual feedback
  useEffect(() => {
    // No specific action needed here for 'point' targeting for this button's functionality.
    // The 'isGestureTargeted' state correctly uses the current gesture from the store.
  }, [gesture, operation, value]); // Dependency array includes gesture, operation, and value

  return (
    <motion.button
      id={`modifier-${operation}-${value}`}
      onClick={handleModifierClick}
      disabled={!isActive}
      className={`glass-morphic p-4 rounded-lg flex flex-col items-center justify-center gap-1 
        ${isActive ? 'border-blue-400/50' : 'border-gray-600/50'} 
        ${isGestureTargeted ? 'bg-yellow-500/30 border-yellow-400' : (isActive ? 'bg-white/10' : 'bg-white/5')} 
        transition-all duration-300 ease-in-out
        w-20 h-20 text-2xl font-bold
      `}
      whileTap={{
        scale: isGestureTargeted ? 0.95 : 1,
        transition: { delay: isGestureTargeted ? 0.1 : 0 }
      }}
      animate={{
        scale: isGestureTargeted ? 0.9 : 1,
        opacity: isActive ? 1 : 0.6,
        transition: { delay: isGestureTargeted ? 0.1 : 0 }
      }}
    >
      <span className="text-xl font-bold">
        {operation === 'add' ? '+' : '-'}{value}
      </span>
      <AnimatePresence>
        {/* Displaying current value might be too much; consider feedback like '+' or '-' */}
        {isGestureTargeted && (
          <motion.span
            className="text-xs text-white/60"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {operation === 'add' ? '+' : '-'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
