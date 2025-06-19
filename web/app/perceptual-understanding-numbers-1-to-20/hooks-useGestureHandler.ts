"use client";
import React, { useEffect } from 'react';
import { useGestureStore } from "../../components/guesture/gestureStore";
import useGameStore from './store-gameStore';

// Define GestureType and ClickPayload for better type safety
interface GestureType {
  type: 'idle' | 'point' | 'click' | 'dragstart' | 'drag' | 'dragend' | 'contextmenu' | 'swipe' | 'cancel' | 'transformstart' | 'transform' | 'transformend';
  payload: any;
  timestamp: number;
  sequenceId: string;
}

interface ClickPayload {
  targetId?: string;
}

export function useGestureHandler() {
  const { gesture } = useGestureStore();
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

  function handleGestureEvent(gesture: GestureType) {
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
          // Audio feedback for modifier click will be handled in ModifierButton component for better context
        }
      }
    } else if (payload.targetId === 'judgment-btn') {
      triggerJudgment();
      // Audio feedback for judgment click will be handled in JudgmentButton component
    }
    // Add other button click handlers here if necessary
  }

  // Add other gesture handling functions as needed (e.g., for drag, transform)

  return {
    // Expose any necessary functions or states if needed by parent components
  };
}
