"use client";
import useGameStore from './store-gameStore';
import {useGestureStore } from "../../components/guesture/gestureStore"
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ModifierButton } from './components-ModifierButton';
import { JudgmentButton } from './components-JudgmentButton';
import FeedbackContainer from './components-FeedbackContainer';
import { playDing, initAudio } from './utils-audio'; // Import audio utilities

export default function OracleScale() {
  const { challengeValue, currentValue, gameState, triggerJudgment, applyModifier, recordAction } = useGameStore();
  const { gesture, setGesture } = useGestureStore();

  // Effect to trigger judgment based on gesture
  useEffect(() => {
    // Initialize audio on first render or user interaction
    // The initAudio call is now handled by StartChallengeButton click.

    // Handle click gesture on the judgment button
    if (gesture.type === 'click' && gesture.payload.targetId === 'judgment-btn') {
      // Ensure we only trigger judgment when in the 'adjusting' state
      if (gameState === 'adjusting') {
        triggerJudgment();
        // Removed playDing() here as it's better handled by JudgmentButton itself
        // Clear the gesture state after a successful click
        setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
      }
    }
    // Handle clicks on modifier buttons
    if (gesture.type === 'click' && gesture.payload.targetId?.startsWith('modifier-')) {
        const parts = gesture.payload.targetId.split('-');
        if (parts.length === 3) {
          const operation = parts[1] as 'add' | 'subtract';
          const value = parseInt(parts[2]);
          if (!isNaN(value) && gameState === 'adjusting') {
            applyModifier(value, operation);
            recordAction({ type: operation, value });
            // Removed playDing() here as it's better handled by ModifierButton itself
            // Clear the gesture state after a successful click
            setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
          }
        }
      }
  }, [gesture, triggerJudgment, gameState, applyModifier, recordAction, setGesture]); // Added necessary dependencies

  // Effect to handle state transitions after judgment
  useEffect(() => {
    // This effect is for handling side effects after a state change, e.g., showing feedback.
    // The actual state transitions are handled by the store and triggered by gestures.
    if (gameState === 'correct') {
      // Logic for correct state, e.g., show success message and prepare for next round
    } else if (gameState === 'incorrect') {
      // Logic for incorrect state, e.g., show error message and allow re-attempt
    }
  }, [gameState]);

  return (
    <motion.div 
      className="relative w-full h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black"
      animate={{
        scale: gameState === 'correct' ? 1.1 : (gameState === 'incorrect' ? 0.95 : 1),
        transition: { duration: 0.5, ease: 'easeInOut' }
      }}
    >
      {/* Top Section: Challenge and Workspace */}
      <div className="w-full flex-grow flex items-center justify-around mb-10">
        {/* Left Tray: Challenge */}
        <div className="w-1/3 flex flex-col items-center">
          <div className="text-6xl font-bold text-white mb-4 glow-text">
            {challengeValue}
          </div>
          <div className="text-lg text-gray-400">命题端</div>
          {/* Placeholder for energy balls on the challenge side if needed */}
        </div>

        {/* Right Tray: Workspace */}
        <div className="w-1/3 flex flex-col items-center relative">
          <div className="text-5xl font-bold text-white mb-4 glow-text">
            {currentValue}
          </div>
          <div className="text-lg text-gray-400">解答端</div>
          {/* Placeholder for energy balls in the workspace */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* This is a placeholder for where EnergyBall components would be rendered */}
             {/* For example: <EnergyBall id="ws-ball-1" initialPosition={[0, 0, 0]} /> */}
          </div>
        </div>
      </div>

      {/* Middle Section: The Scale */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 flex items-center justify-center">
        {/* SVG for the scale can be placed here */}
        <svg className='w-full h-full' viewBox='0 0 200 200'>
          <g id='physics-scale'>
            {/* Scale beam */}
            <rect x='50' y='50' width='100' height='20' rx='10' fill='#222' />
            {/* Scale pivot */}
            <circle cx='100' cy='40' r='10' fill='#444' />
            {/* Placeholder for the pointer */}
            <motion.line 
              id='scale-pointer'
              x1='100' y1='40'
              x2='100' y2='10'
              stroke='white' 
              strokeWidth='4'
              strokeLinecap='round'
              animate={{
                // Basic pointer animation based on value difference. Needs actual calculation.
                rotate: (currentValue - challengeValue) * 2, // Simplified rotation
                transformOrigin: 'center bottom'
              }}
              style={{ willChange: 'transform' }}
            />
          </g>
        </svg>
      </div>

      {/* Bottom Section: Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
        {/* Modifier Buttons */}
        <div className="flex gap-4">
          <ModifierButton value={1} operation="subtract" />
          <ModifierButton value={3} operation="subtract" />
          <ModifierButton value={1} operation="add" />
          <ModifierButton value={3} operation="add" />
        </div>
        {/* Judgment Button */}
        <JudgmentButton />
      </div>
      
      {/* Feedback Container for correct/incorrect messages */}
      <FeedbackContainer />
    </motion.div>
  );
}
