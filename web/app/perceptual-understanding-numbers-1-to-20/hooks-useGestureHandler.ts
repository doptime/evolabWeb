import { useGestureStore } from '../store-gestureStore';
import { useGameStore } from './store-gameStore';
import { useFrame } from 'react-three-fiber';
import { useSpring, AnimatePresence } from 'framer-motion';
import { playAudio } from '../utils-audio';

export function useGestureHandler() {
  const { gesture, recordGesture, replayGestures, clearGestureHistory } = useGestureStore();
  const { 
    challengeValue, 
    currentValue, 
    gameState, 
    increase, 
    decrease, 
    triggerJudgment, 
    undoLastAction, 
    redoLastAction 
  } = useGameStore();

  // Spring animations for physics-based interactions
  const tiltSpring = useSpring({ 
    rotateX: 0, 
    stiffness: 300, 
    damping: 20 
  });

  // Gesture event processor with performance optimization
  useFrame(() => {
    if (gesture.type) {
      handleGestureEvent(gesture);
      recordGesture(gesture); // Record for debugging
      requestAnimationFrame(() => {
        playAudio('feedback', { 
          timestamp: performance.now(), 
          gestureType: gesture.type 
        });
      });
    }
  });

  function handleGestureEvent(gesture: GestureType) {
    switch(gesture.type) {
      case 'click':
        handleButtonClick(gesture.payload);
        break;
      case 'drag':
        handleDragOperation(gesture.payload);
        break;
      case 'transform':
        handleScaleTransform(gesture.payload);
        break;
      case 'replay':
        replayGestures();
        break;
      case 'undo':
        undoLastAction();
        break;
      case 'redo':
        redoLastAction();
        break;
      // ... other cases
    }
  }

  function handleButtonClick(payload: ClickPayload) {
    switch(payload.targetId) {
      case 'modifier-+1':
        increase(1);
        playAudio('ding');
        break;
      case 'modifier--1':
        decrease(1);
        playAudio('swoosh');
        break;
      case 'judgment-btn':
        triggerJudgment();
        playAudio('judgment');
        break;
      // ... other cases
    }
  }

  function handleDragOperation(payload: DragPayload) {
    // Add physics-based boundary validation
    const bounds = getEnergyBallBounds();
    if (isOutOfBounds(payload.position, bounds)) {
      applyBoundaryRebound(payload.position, bounds);
      playAudio('collision', { 
        velocity: payload.velocity, 
        position: payload.position 
      });
    }
    // Multi-touch conflict resolution
    resolveMultiTouchConflicts(payload);
  }

  // Add physics-based animations and gesture-to-state mapping
  // Add collision detection optimization
  // Add multi-touch gesture handling

  return {
    tiltSpring,
    handleGestureEvent,
    replayGestures,
    clearGestureHistory
  };
}

// Add gesture-to-state mapping table
const gestureStateMap = {
  'click': 'adjusting',
  'drag': 'adjusting',
  'transform': 'scaling',
  'replay': 'replaying',
  'undo': 'undoing',
  'redo': 'redoning',
  // ... other mappings
};