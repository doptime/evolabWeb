"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import useGameStore from './store-gameStore';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { motion } from 'framer-motion';
import { ModifierButton } from './components-ModifierButton';
import { JudgmentButton } from './components-JudgmentButton';
import FeedbackContainer from './components-FeedbackContainer';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import EnergyBall from './components-EnergyBall';

// Define tray dimensions and spacing
const TRAY_WIDTH = 10; // Increased width significantly
const TRAY_DEPTH = 10; // Increased depth significantly
const TRAY_HEIGHT = 4;
const FLOOR_Y = -1;
const WALL_Y = TRAY_HEIGHT / 2;
const BALL_START_Y = 5;
const TRAY_SPACING = 15; // Increased spacing to ensure no overlap

// Physics Plane component for the bottom of the tray
const FloorPlane = ({ position, rotation, args }) => {
  const [ref] = usePlane(() => ({
    mass: 0,
    position: position,
    rotation: rotation,
    restitution: 0.8,
    args: args
  }));
  return <mesh ref={ref}><planeGeometry args={[args[0], args[1]]} /><meshStandardMaterial color="#AAAAAA" transparent opacity={0.9} visible={true} /></mesh>;
};

// Physics Wall component for the tray boundaries
const Wall = ({ position, args }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position: position,
    args: args,
    restitution: 0.1,
    friction: 1.0,
  }));
  return <mesh ref={ref}><boxGeometry args={args} /><meshStandardMaterial color="#AAAAAA" transparent opacity={0.0} visible={false} /></mesh>;
};

// Helper function to generate initial positions for balls within a tray
const generateInitialPositions = (count, trayOffsetX, trayWidth, trayDepth, startY) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    // Distribute balls more evenly within the tray
    const x = trayOffsetX + (Math.random() - 0.5) * (trayWidth * 0.8); // Use 80% of tray width
    const y = startY + (Math.random() * 1.5); // Slightly less Y variation for a flatter look
    const z = (Math.random() - 0.5) * (trayDepth * 0.8); // Use 80% of tray depth
    positions.push([x, y, z]);
  }
  return positions;
};

export default function OracleScale() {
  const { gameState, triggerJudgment, challengeValue, currentValue, startChallenge, isNumericChallenge } = useGameStore();
  const { gesture, setGesture } = useGestureStore();

  // Memoize ball positions to prevent re-generation on every render
  // Adjust trayOffsetX to center the trays relative to the scene
  const leftTrayOffsetX = -TRAY_SPACING / 2 - TRAY_WIDTH / 2; // Adjusted to account for tray width
  const rightTrayOffsetX = TRAY_SPACING / 2 + TRAY_WIDTH / 2; // Adjusted to account for tray width

  const challengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, leftTrayOffsetX, TRAY_WIDTH, TRAY_DEPTH, BALL_START_Y), [challengeValue, leftTrayOffsetX]);
  const workspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, rightTrayOffsetX, TRAY_WIDTH, TRAY_DEPTH, BALL_START_Y), [currentValue, rightTrayOffsetX]);

  useEffect(() => {
    if (gesture.type === 'click') {
      const target = document.getElementById(gesture.payload.targetId);
      if (target) {
        if (target instanceof HTMLButtonElement) {
            target.click();
        }
        setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
      }
    }
  }, [gesture, setGesture]);

  // Calculate the total width needed for the canvas to accommodate both trays with spacing
  const totalCanvasWidth = TRAY_WIDTH * 2 + TRAY_SPACING;

  // Animation for the scale beam and pointer
  const scaleAnimation = {
    rotate: (currentValue - challengeValue) * 2, // Rotate based on difference
  };

  // Transition for the scale animation
  const scaleTransition = {
    type: "spring",
    stiffness: 30, // Lower stiffness for slower, more pronounced movement
    damping: 15,
    duration: 4 // Set transition duration to 4 seconds
  };

  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-between p-4 bg-gray-100"
      animate={{ scale: gameState === 'correct' ? 1.05 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Scene for both trays */}
      <div className="w-full flex-grow flex items-center justify-around">
        <Canvas camera={{ position: [0, 10, 15], fov: 40 }} className="w-full h-full"> {/* Adjusted camera position and FOV for more俯视视角 and larger view */}
          <ambientLight intensity={1.8} />
          <pointLight position={[0, 15, 15]} intensity={2.5} />
          <directionalLight position={[7, 12, 7]} intensity={1.2} />
          <directionalLight position={[-7, -12, -7]} intensity={1.0} />

          <Physics>
            {/* Left Tray (Challenge) Boundaries */}
            <FloorPlane position={[leftTrayOffsetX, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[TRAY_WIDTH, TRAY_DEPTH]} />
            <Wall position={[leftTrayOffsetX - TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> {/* Left Wall */}
            <Wall position={[leftTrayOffsetX + TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> {/* Right Wall */}
            <Wall position={[leftTrayOffsetX, WALL_Y, -TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> {/* Back Wall */}
            <Wall position={[leftTrayOffsetX, WALL_Y, TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> {/* Front Wall */}

            {/* Right Tray (Workspace) Boundaries */}
            <FloorPlane position={[rightTrayOffsetX, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[TRAY_WIDTH, TRAY_DEPTH]} />
            <Wall position={[rightTrayOffsetX - TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> {/* Left Wall */}
            <Wall position={[rightTrayOffsetX + TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> {/* Right Wall */}
            <Wall position={[rightTrayOffsetX, WALL_Y, -TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> {/* Back Wall */}
            <Wall position={[rightTrayOffsetX, WALL_Y, TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> {/* Front Wall */}

            {/* Challenge Balls */}
            {!isNumericChallenge && challengeBallPositions.map((pos, i) => (
              <EnergyBall key={`ch-ball-${i}`} id={`ch-ball-${i}`} initialPosition={pos} trayWidth={TRAY_WIDTH} trayDepth={TRAY_DEPTH} trayOffsetX={leftTrayOffsetX} />
            ))}
            {/* Numeric Challenge Display */}
            {isNumericChallenge && (gameState === 'adjusting' || gameState === 'judging') && (
              <motion.group
                position={[leftTrayOffsetX, BALL_START_Y + 1, 0]} // Position above the tray
                animate={{ scale: 1.5, y: BALL_START_Y + 1.5 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <mesh>
                  <boxGeometry args={[challengeValue.toString().length * 0.8 + 0.5, 2.5, 0.5]} /> {/* Background for text */}
                  <meshStandardMaterial color="#333333" transparent opacity={0.7} />
                </mesh>
                <Text
                  position={[0, 0, 0.26]}
                  fontSize={1.5}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {challengeValue}
                </Text>
              </motion.group>
            )}

            {/* Workspace Balls */}
            {workspaceBallPositions.map((pos, i) => (
              <EnergyBall key={`ws-ball-${i}`} id={`ws-ball-${i}`} initialPosition={pos} trayWidth={TRAY_WIDTH} trayDepth={TRAY_DEPTH} trayOffsetX={rightTrayOffsetX} />
            ))}
          </Physics>
        </Canvas>
      </div>

      {/* Middle Section: The Scale */}
      <div className='relative w-full max-w-lg h-32 flex items-center justify-center my-4'>
        <svg className='w-full h-full' viewBox='0 0 200 100'>
          <g id='physics-scale'>
            {/* Scale base */}
            <path d='M 90 90 L 100 70 L 110 90 Z' fill='#444' />
            {/* Scale beam */}
            <motion.rect 
              x='40' y='60' width='120' height='10' rx='5' fill='#222' 
              style={{ transformOrigin: '100px 65px' }} // Set transform origin for rotation
              animate={{ rotate: (currentValue - challengeValue) * 2 }} // Rotate based on difference
              transition={scaleTransition}
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
              style={{ transformOrigin: '100px 65px' }} // Set transform origin for rotation
              animate={{ rotate: (currentValue - challengeValue) * 2 }} // Rotate based on difference
              transition={scaleTransition}
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