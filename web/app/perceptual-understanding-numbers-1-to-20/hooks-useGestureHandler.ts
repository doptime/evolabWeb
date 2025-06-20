"use client";
import React, { useEffect } from 'react';
import { useGestureStore, GestureState } from "../../components/guesture/gestureStore";
import useGameStore from './store-gameStore';

// Define GestureType and ClickPayload for better type safety
interface ClickPayload {
  targetId?: string;
}

export function useGestureHandler() {
  const { gesture, setGesture } = useGestureStore();
  const { 
    applyModifier, 
    triggerJudgment, 
    undoLastAction, 
    redoLastAction 
  } = useGameStore();

  // Gesture event processor
  React.useEffect(() => {
    if (gesture.type && gesture.type !== 'idle') {
      handleGestureEvent(gesture);
    }
  }, [gesture]); // Dependency on gesture ensures this effect runs when gesture changes

  function handleGestureEvent(gesture: GestureState) {
    switch(gesture.type) {
      case 'click':
        handleButtonClick(gesture.payload);
        break;
      // Add other gesture types as needed
      default:
        // console.log(`Unhandled gesture type: ${gesture.type}`);
        break;
    }
  }

  function handleButtonClick(payload: ClickPayload) {
    if (!payload.targetId) return;

    // Modifier buttons have format 'modifier-<operation>-<value>' e.g., 'modifier-add-1'
    if (payload.targetId.startsWith('modifier-')) {
      const parts = payload.targetId.split('-');
      if (parts.length === 3) {
        const operation = parts[1] as 'add' | 'subtract';
        const value = parseInt(parts[2]);
        if (!isNaN(value)) {
          applyModifier(value, operation);
          // Clear the gesture state after a successful click to prevent re-triggering
          setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
          // Audio feedback for modifier click will be handled in ModifierButton component for better context
        }
      }
    } else if (payload.targetId === 'judgment-btn') {
      triggerJudgment();
      // Clear the gesture state after a successful click to prevent re-triggering
      setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
      // Audio feedback for judgment click will be handled in JudgmentButton component
    } else if (payload.targetId === 'start-challenge-btn') {
      // The click handler for start-challenge-btn is in StartChallengeButton component.
      // No need to handle it here, but if you wanted to, you would call startChallenge() and clear gesture.
    }
    // Add other button click handlers here if necessary
  }

  // Add other gesture handling functions as needed (e.g., for drag, transform)

  return {
    // Expose any necessary functions or states if needed by parent components
  };
}
