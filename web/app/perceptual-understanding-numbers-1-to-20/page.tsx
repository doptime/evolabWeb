"use client";
import React, { useEffect } from 'react';
import useGameStore from './store-gameStore';
import { ErrorBoundary } from './components-ErrorBoundary';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './components-LoadingSpinner';
import { lazy, Suspense } from 'react';
import StartChallengeButton from './components-StartChallengeButton';
import OracleScale from './components-OracleScale';
import { GestureCaptureProvider } from '../../components/guesture/GestureCaptureProvider'; // Corrected path
import { initAudio } from './utils-audio'; // Import initAudio
import { useGestureHandler } from './hooks-useGestureHandler'; // Import the handler

export default function Index() {
  const { gameState } = useGameStore();

  // Initialize and activate the gesture handler
  // The gesture handler is responsible for listening to and processing gesture events.
  // It's crucial that this hook is called to start the gesture processing logic.
  useGestureHandler();

  // Initialize audio on user interaction, e.g., clicking the start button
  // We will trigger initAudio from the StartChallengeButton's click handler.

  return (
    <ErrorBoundary>
      {/* GestureCaptureProvider should wrap the elements that capture gestures */}
      {/* It provides the necessary context for gesture detection. */}
      <GestureCaptureProvider>
        <motion.div 
          className="relative w-full h-screen overflow-hidden"
        > 
          
          <Suspense fallback={<LoadingSpinner />}> 
            <OracleScale />
            {/* Render StartChallengeButton only when the game is in the idle state */}
            {gameState === 'idle' && <StartChallengeButton />}
          </Suspense>
        </motion.div>
      </GestureCaptureProvider>
    </ErrorBoundary>
  );
}