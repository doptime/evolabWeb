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

// Physics Plane component for the bottom of the tray
const FloorPlane = ({ position, rotation, args }) => {
  const [ref] = usePlane(() => ({
    mass: 0,
    position: position,
    rotation: rotation,
    restitution: 0.8,
    args: args
  }));
  return <mesh ref={ref}><planeGeometry args={[args[0], args[1]]} /><meshStandardMaterial color="#AAAAAA" transparent opacity={0.9} visible={true} /></mesh>; // Lighter floor, increased opacity
};

// Physics Wall component for the tray boundaries
const Wall = ({ position, args }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position: position,
    args: args,
    restitution: 0.1, // Reduced restitution for walls
    friction: 1.0, // Increased friction for walls
  }));
  return <mesh ref={ref}><boxGeometry args={args} /><meshStandardMaterial color="#AAAAAA" transparent opacity={0.0} visible={false} /></mesh>; // Lighter walls, fully transparent and invisible
};

// Helper function to generate initial positions for balls within a tray
const generateInitialPositions = (count, offsetX, trayWidth, trayDepth, startY) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const x = offsetX + (Math.random() - 0.5) * (trayWidth * 0.6); // Use 60% of tray width for placement to avoid edge cases
    const y = startY + (Math.random() * 2.0); // More variation in Y to prevent initial stacking and give better drop effect
    const z = (Math.random() - 0.5) * (trayDepth * 0.6); // Use 60% of tray depth for placement
    positions.push([x, y, z]);
  }
  return positions;
};

export default function OracleScale() {
  const { gameState, triggerJudgment, challengeValue, currentValue, startChallenge } = useGameStore();
  const { gesture, setGesture } = useGestureStore();

  // Define tray dimensions and starting Y position
  const trayWidth = 6; // Increased tray width for more space
  const trayDepth = 6; // Increased tray depth for more space
  const trayHeight = 4; // Height of the walls
  const floorY = -1; // Y position for the floor
  const wallY = trayHeight / 2;
  const ballStartY = 5; // Starting Y position for balls, higher to ensure visibility as they fall

  // Memoize ball positions to prevent re-generation on every render
  const challengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, -2.5, trayWidth, trayDepth, ballStartY), [challengeValue]);
  const workspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, 2.5, trayWidth, trayDepth, ballStartY), [currentValue]);

  useEffect(() => {
    if (gesture.type === 'click') {
      const target = document.getElementById(gesture.payload.targetId);
      if (target) {
        if (target instanceof HTMLButtonElement) {
            target.click();
        }
        // Important: Clear gesture state after processing to avoid re-triggering
        setGesture({ type: 'idle', payload: {}, timestamp: Date.now(), sequenceId: '' });
      }
    }
  }, [gesture, setGesture]);

  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-between p-4 bg-gray-100" // Even lighter background
      animate={{ scale: gameState === 'correct' ? 1.05 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Scene for both trays */}
      <div className="w-full flex-grow flex items-center justify-around">
        <Canvas camera={{ position: [0, 8, 10], fov: 50 }} className="w-full h-full"> {/* Adjusted camera position and FOV for more overhead view */}
          <ambientLight intensity={1.8} /> {/* Increased ambient light */}
          <pointLight position={[0, 15, 15]} intensity={2.5} /> {/* Stronger point light, higher up */}
          <directionalLight position={[7, 12, 7]} intensity={1.2} /> {/* Added directional light */}
          <directionalLight position={[-7, -12, -7]} intensity={1.0} />

          <Physics>
            {/* Left Tray (Challenge) Boundaries */}
            <FloorPlane position={[-2.5, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[trayWidth, trayDepth]} /> {/* Floor, centered */}
            <Wall position={[-2.5 - trayWidth / 2, wallY, 0]} args={[0.1, trayHeight, trayDepth]} /> {/* Left Wall */}
            <Wall position={[-2.5 + trayWidth / 2, wallY, 0]} args={[0.1, trayHeight, trayDepth]} /> {/* Right Wall */}
            <Wall position={[-2.5, wallY, -trayDepth / 2]} args={[trayWidth, trayHeight, 0.1]} /> {/* Back Wall */}
            <Wall position={[-2.5, wallY, trayDepth / 2]} args={[trayWidth, trayHeight, 0.1]} /> {/* Front Wall */}

            {/* Right Tray (Workspace) Boundaries */}
            <FloorPlane position={[2.5, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[trayWidth, trayDepth]} /> {/* Floor, centered */}
            <Wall position={[2.5 - trayWidth / 2, wallY, 0]} args={[0.1, trayHeight, trayDepth]} /> {/* Left Wall */}
            <Wall position={[2.5 + trayWidth / 2, wallY, 0]} args={[0.1, trayHeight, trayDepth]} /> {/* Right Wall */}
            <Wall position={[2.5, wallY, -trayDepth / 2]} args={[trayWidth, trayHeight, 0.1]} /> {/* Back Wall */}
            <Wall position={[2.5, wallY, trayDepth / 2]} args={[trayWidth, trayHeight, 0.1]} /> {/* Front Wall */}

            {/* Challenge Balls */}
            {challengeBallPositions.map((pos, i) => (
              <EnergyBall key={`ch-ball-${i}`} id={`ch-ball-${i}`} initialPosition={pos} trayWidth={trayWidth} trayDepth={trayDepth} trayOffsetX={-2.5} />
            ))}

            {/* Workspace Balls */}
            {workspaceBallPositions.map((pos, i) => (
              <EnergyBall key={`ws-ball-${i}`} id={`ws-ball-${i}`} initialPosition={pos} trayWidth={trayWidth} trayDepth={trayDepth} trayOffsetX={2.5} />
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