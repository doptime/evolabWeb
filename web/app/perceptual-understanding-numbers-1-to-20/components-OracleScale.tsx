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
import { Text } from '@react-three/drei'; // Import Text component for 3D text

// Define tray dimensions and spacing
const TRAY_WIDTH = 12; 
const TRAY_DEPTH = 12; 
const TRAY_HEIGHT = 4;
const FLOOR_Y = -1;
const WALL_Y = TRAY_HEIGHT / 2;
const BALL_START_Y = 5;
const TRAY_SPACING = 2; // Adjusted spacing to bring trays closer

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
  // Calculate a grid-like arrangement to encourage flat packing, with some randomness
  const cols = Math.ceil(Math.sqrt(count));
  const rowSpacing = (trayDepth * 0.7) / cols;
  const colSpacing = (trayWidth * 0.7) / cols;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = trayOffsetX + (col - cols / 2 + 0.5) * colSpacing + (Math.random() - 0.5) * 0.5; 
    const y = startY + (Math.random() * 1.0); 
    const z = (row - cols / 2 + 0.5) * rowSpacing + (Math.random() - 0.5) * 0.5;
    positions.push([x, y, z]);
  }
  return positions;
};

export default function OracleScale() {
  const { gameState, challengeValue, currentValue, isNumericChallenge } = useGameStore();
  // No need for setGesture here as it's not directly used for clearing state in OracleScale itself

  // Adjust trayOffsetX to center the trays relative to the scene and bring them closer
  const leftTrayOffsetX = -(TRAY_WIDTH + TRAY_SPACING) / 2; 
  const rightTrayOffsetX = (TRAY_WIDTH + TRAY_SPACING) / 2; 

  // Re-generate positions only when challengeValue or currentValue changes
  const challengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, leftTrayOffsetX, TRAY_WIDTH, TRAY_DEPTH, BALL_START_Y), [challengeValue, leftTrayOffsetX]);
  const workspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, rightTrayOffsetX, TRAY_WIDTH, TRAY_DEPTH, BALL_START_Y), [currentValue, rightTrayOffsetX]);

  // Animation for the scale beam and pointer
  const scaleTransition = {
    type: "spring",
    stiffness: 30, 
    damping: 15,
    duration: 4 
  };

  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-between p-4 bg-gray-100"
      animate={{ scale: gameState === 'correct' ? 1.05 : 1 }} // Slight scale on perfect success
      transition={{ duration: 0.5 }}
    >
      {/* 3D Scene for both trays */}
      <div className="w-full flex-grow flex items-center justify-around">
        <Canvas camera={{ position: [0, 10, 15], fov: 40 }} className="w-full h-full"> 
          <ambientLight intensity={1.8} />
          <pointLight position={[0, 15, 15]} intensity={2.5} />
          <directionalLight position={[7, 12, 7]} intensity={1.2} />
          <directionalLight position={[-7, -12, -7]} intensity={1.0} />

          <Physics>
            {/* Left Tray (Challenge) Boundaries */}
            <FloorPlane position={[leftTrayOffsetX, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[TRAY_WIDTH, TRAY_DEPTH]} />
            <Wall position={[leftTrayOffsetX - TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> 
            <Wall position={[leftTrayOffsetX + TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> 
            <Wall position={[leftTrayOffsetX, WALL_Y, -TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> 
            <Wall position={[leftTrayOffsetX, WALL_Y, TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> 

            {/* Right Tray (Workspace) Boundaries */}
            <FloorPlane position={[rightTrayOffsetX, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[TRAY_WIDTH, TRAY_DEPTH]} />
            <Wall position={[rightTrayOffsetX - TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> 
            <Wall position={[rightTrayOffsetX + TRAY_WIDTH / 2, WALL_Y, 0]} args={[0.1, TRAY_HEIGHT, TRAY_DEPTH]} /> 
            <Wall position={[rightTrayOffsetX, WALL_Y, -TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> 
            <Wall position={[rightTrayOffsetX, WALL_Y, TRAY_DEPTH / 2]} args={[TRAY_WIDTH, TRAY_HEIGHT, 0.1]} /> 

            {/* Challenge Content */}
            {isNumericChallenge ? (
              <motion.group
                position={[leftTrayOffsetX, BALL_START_Y + 0.5, 0]} // Position slightly above the tray
                animate={{ scale: 1.5, y: BALL_START_Y + 1 }} // Animation for emphasis
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <Text
                  position={[0, 0, 0]} // Position relative to group
                  fontSize={1.5}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {challengeValue}
                </Text>
              </motion.group>
            ) : (
              // Render energy balls for non-numeric challenge or if challengeValue is zero
              (challengeValue > 0 ? challengeBallPositions : []).map((pos, i) => (
                <EnergyBall key={`ch-ball-${i}`} id={`ch-ball-${i}`} initialPosition={pos} trayWidth={TRAY_WIDTH} trayDepth={TRAY_DEPTH} trayOffsetX={leftTrayOffsetX} />
              ))
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
              style={{ transformOrigin: '100px 65px' }} 
              animate={{ rotate: (currentValue - challengeValue) * 2 }} 
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
              style={{ transformOrigin: '100px 65px' }} 
              animate={{ rotate: (currentValue - challengeValue) * 2 }} 
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