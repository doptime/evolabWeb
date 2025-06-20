"use client";
import React, { useEffect } from 'react';
import useGameStore from './store-gameStore';
import { useGestureStore } from "../../components/guesture/gestureStore";
import { motion } from 'framer-motion';
import { ModifierButton } from './components-ModifierButton';
import { JudgmentButton } from './components-JudgmentButton';
import FeedbackContainer from './components-FeedbackContainer';
import { ChallengeCanvas, WorkspaceCanvas } from './components-GameCanvas'; // Import the new canvases

export default function OracleScale() {
  const { gameState, triggerJudgment, challengeValue, currentValue } = useGameStore();
  const { gesture, setGesture } = useGestureStore();

  useEffect(() => {
    if (gesture.type === 'click') {
      const target = document.getElementById(gesture.payload.targetId);
      if (target) {
        target.click();
        setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
      }
    }
  }, [gesture, setGesture]);

  useEffect(() => {
    // No direct action needed here as generateChallenge is called in page.tsx
  }, [gameState]);

  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-between p-4"
      animate={{ scale: gameState === 'correct' ? 1.05 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Section: Challenge and Workspace */}
      <div className="w-full flex-grow flex items-center justify-around">
        {/* Left Tray: Challenge */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center">
          <div className="text-lg text-gray-400 mb-2">命题端</div>
          <div className="w-full h-[calc(100%-40px)] relative">
            <ChallengeCanvas /> 
          </div>
        </div>

        {/* Right Tray: Workspace */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center">
          <div className="text-lg text-gray-400 mb-2">解答端</div>
          <div className="w-full h-[calc(100%-40px)] relative">
            <WorkspaceCanvas />  {/* 启用 WorkspaceCanvas 的渲染 */}
          </div>
        </div>
      </div>

      {/* Middle Section: The Scale */}
      <div className="relative w-full max-w-lg h-32 flex items-center justify-center my-4">
        <svg className='w-full h-full' viewBox='0 0 200 100'>
          <g id='physics-scale'>
            {/* Scale base */}
            <path d="M 90 90 L 100 70 L 110 90 Z" fill="#444" />
            {/* Scale beam */}
            <motion.rect 
              x='50' y='60' width='100' height='10' rx='5' fill='#222' 
              initial={{ rotate: 0 }}
              animate={{
                rotate: (currentValue - challengeValue) * 2,
                transformOrigin: 'center 65px'
              }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            />
            {/* Scale pivot */}
            <circle cx='100' cy='65' r='8' fill='#666' />
            {/* Scale pointer (simplified) */}
            <motion.line
              x1='100' y1='65'
              x2='100' y2='50'
              stroke='white'
              strokeWidth='3'
              strokeLinecap='round'
              animate={{
                rotate: (currentValue - challengeValue) * 2,
                transformOrigin: 'center 65px'
              }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            />
          </g>
        </svg>
      </div>

      {/* Bottom Section: Controls */}
      <div className="flex flex-col items-center gap-4">
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