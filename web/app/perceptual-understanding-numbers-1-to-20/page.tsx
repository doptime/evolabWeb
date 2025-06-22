"use client";
import React, { useEffect } from 'react';
import useGameStore from './store-gameStore';
import { ErrorBoundary } from './components-ErrorBoundary';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './components-LoadingSpinner';
import { lazy, Suspense } from 'react';
import StartChallengeButton from './components-StartChallengeButton';
import OracleScale from './components-OracleScale';
import { GestureCaptureProvider } from '../../components/guesture/GestureCaptureProvider';
import { initAudio } from './utils-audio';
import { useGestureHandler } from './hooks-useGestureHandler';

export default function Index() {
  const { gameState, generateChallenge } = useGameStore();
  
  useEffect(() => {
    console.log('Index component mounted',"gameState:", gameState);
    // Generate a challenge when the component mounts and gameState is idle
    // This logic is now handled more robustly within the game flow after a feedback dismissal.
    // Keep it for initial load, but FeedbackContainer drives subsequent challenges.
    if (gameState === 'idle') {
      generateChallenge();
    }
    // Initialize audio when the component mounts
    initAudio();
  }, [gameState, generateChallenge]);

  // Initialize and activate the gesture handler
  useGestureHandler();

  return (
    <ErrorBoundary>
      <GestureCaptureProvider>
        <motion.div 
          className="relative w-full h-screen overflow-hidden"
        > 
          
          <Suspense fallback={<LoadingSpinner />}> 
            <OracleScale />
            {/* StartChallengeButton should only appear when game is idle */}
            {gameState === 'idle' && <StartChallengeButton />}
          </Suspense>
        </motion.div>
      </GestureCaptureProvider>
    </ErrorBoundary>
  );
}