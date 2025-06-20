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
  return <mesh ref={ref}><planeGeometry args={[args[0], args[1]]} /><meshStandardMaterial color="#888888" transparent opacity={0.7} visible={true} /></mesh>; // Increased opacity, visible
};

// Physics Wall component for the tray boundaries
const Wall = ({ position, args }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position: position,
    args: args,
    restitution: 0.8,
  }));
  return <mesh ref={ref}><boxGeometry args={args} /><meshStandardMaterial color="#888888" transparent opacity={0.7} visible={true} /></mesh>; // Increased opacity, visible
};

// Helper function to generate initial positions for balls within a tray
const generateInitialPositions = (count, offsetX) => {
  const positions = [];
  const trayWidth = 3.5; // Increased tray width
  const trayDepth = 3.5; // Increased tray depth
  const startY = 3; // Starting Y position, higher to ensure visibility as they fall

  for (let i = 0; i < count; i++) {
    // Adjusted to ensure balls are generated well within the tray boundaries
    const x = offsetX + (Math.random() - 0.5) * (trayWidth * 0.9); // 90% of tray width
    const y = startY + (Math.random() * 1.0); // More variation in Y to prevent initial stacking
    const z = (Math.random() - 0.5) * (trayDepth * 0.9); // 90% of tray depth
    positions.push([x, y, z]);
  }
  return positions;
};

export default function OracleScale() {
  const { gameState, triggerJudgment, challengeValue, currentValue } = useGameStore();
  const { gesture, setGesture } = useGestureStore();

  // Memoize ball positions to prevent re-generation on every render
  const challengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, -2), [challengeValue]);
  const workspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, 2), [currentValue]);

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

  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-between p-4 bg-gray-900" // Brighter background
      animate={{ scale: gameState === 'correct' ? 1.05 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Scene for both trays */}
      <div className="w-full flex-grow flex items-center justify-around">
        <Canvas camera={{ position: [0, 8, 8], fov: 45 }} className="w-full h-full">
          <ambientLight intensity={1.0} /> {/* Increased ambient light */}
          <pointLight position={[0, 10, 10]} intensity={1.5} /> {/* Stronger point light */}
          <directionalLight position={[5, 10, 5]} intensity={0.8} /> {/* Added directional light */}
          <directionalLight position={[-5, -10, -5]} intensity={0.5} />

          <Physics>
            {/* Left Tray (Challenge) Boundaries */}
            <FloorPlane position={[-2, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[4, 4]} /> {/* Floor, larger */}
            <Wall position={[-2 - 2, 1.5, 0]} args={[0.1, 4, 3]} /> {/* Left Wall, adjusted height/width */}
            <Wall position={[-2 + 2, 1.5, 0]} args={[0.1, 4, 3]} /> {/* Right Wall */}
            <Wall position={[-2, 1.5, -2]} args={[4, 3, 0.1]} /> {/* Back Wall */}
            <Wall position={[-2, 1.5, 2]} args={[4, 3, 0.1]} /> {/* Front Wall */}

            {/* Right Tray (Workspace) Boundaries */}
            <FloorPlane position={[2, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[4, 4]} /> {/* Floor, larger */}
            <Wall position={[2 - 2, 1.5, 0]} args={[0.1, 4, 3]} /> {/* Left Wall */}
            <Wall position={[2 + 2, 1.5, 0]} args={[0.1, 4, 3]} /> {/* Right Wall */}
            <Wall position={[2, 1.5, -2]} args={[4, 3, 0.1]} /> {/* Back Wall */}
            <Wall position={[2, 1.5, 2]} args={[4, 3, 0.1]} /> {/* Front Wall */}

            {/* Challenge Balls */}
            {challengeBallPositions.map((pos, i) => (
              <EnergyBall key={`ch-ball-${i}`} id={`ch-ball-${i}`} initialPosition={pos} />
            ))}

            {/* Workspace Balls */}
            {workspaceBallPositions.map((pos, i) => (
              <EnergyBall key={`ws-ball-${i}`} id={`ws-ball-${i}`} initialPosition={pos} />
            ))}
          </Physics>
        </Canvas>
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