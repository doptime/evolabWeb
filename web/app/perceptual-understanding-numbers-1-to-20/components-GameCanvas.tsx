"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import EnergyBall from './components-EnergyBall';
import useGameStore from './store-gameStore';

// Helper function to generate initial positions for balls within a tray
const generateInitialPositions = (count, offsetX) => {
  const positions = [];
  const trayWidth = 4; // Approximate width of the tray area
  const trayDepth = 4; // Approximate depth of the tray area
  const startY = 5; // Starting Y position to allow balls to fall into place, increased to prevent dropping out

  for (let i = 0; i < count; i++) {
    const x = offsetX + (Math.random() - 0.5) * trayWidth; // Random X within tray width
    const y = startY + (Math.random() * 2); // Random Y slightly above the tray
    const z = (Math.random() - 0.5) * trayDepth; // Random Z within tray depth
    positions.push([x, y, z]);
  }
  return positions;
};

// Physics Plane component for the bottom of the tray
const FloorPlane = ({ position, rotation }) => {
  const [ref] = usePlane(() => ({
    mass: 0,
    position: position,
    rotation: rotation,
    restitution: 0.8,
  }));
  return <mesh ref={ref}><planeGeometry args={[10, 10]} /><meshStandardMaterial visible={false} /></mesh>;
};

// Physics Wall component for the tray boundaries
const Wall = ({ position, args }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position: position,
    args: args,
    restitution: 0.8,
  }));
  return <mesh ref={ref}><boxGeometry args={args} /><meshStandardMaterial visible={false} /></mesh>;
};

// ChallengeCanvas for the left tray
export const ChallengeCanvas = () => {
  const { challengeValue } = useGameStore();
  const initialChallengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, 0), [challengeValue]);

  return (
    <Canvas camera={{ position: [0, 1, 7], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} />
      <Physics>
        <FloorPlane position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        {/* Walls forming a container for the challenge tray */}
        <Wall position={[-2.5, 0.5, 0]} args={[0.1, 5, 5]} /> {/* Left boundary */}
        <Wall position={[2.5, 0.5, 0]} args={[0.1, 5, 5]} />  {/* Right boundary */}
        <Wall position={[0, 0.5, -2.5]} args={[5, 5, 0.1]} /> {/* Back boundary */}
        <Wall position={[0, 0.5, 2.5]} args={[5, 5, 0.1]} />  {/* Front boundary */}
        <Wall position={[0, 3, 0]} args={[5, 0.1, 5]} />     {/* Top boundary (ceiling) */}

        {initialChallengeBallPositions.map((pos, i) => (
          <EnergyBall key={`ch-ball-${i}`} id={`ch-ball-${i}`} initialPosition={pos} />
        ))}
      </Physics>
    </Canvas>
  );
};

// WorkspaceCanvas for the right tray
export const WorkspaceCanvas = () => {
  const { currentValue } = useGameStore();
  const initialWorkspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, 0), [currentValue]);

  return (
    <Canvas camera={{ position: [0, 1, 7], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} />
      <Physics>
        <FloorPlane position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        {/* Walls forming a container for the workspace tray */}
        <Wall position={[-2.5, 0.5, 0]} args={[0.1, 5, 5]} /> {/* Left boundary */}
        <Wall position={[2.5, 0.5, 0]} args={[0.1, 5, 5]} />  {/* Right boundary */}
        <Wall position={[0, 0.5, -2.5]} args={[5, 5, 0.1]} /> {/* Back boundary */}
        <Wall position={[0, 0.5, 2.5]} args={[5, 5, 0.1]} />  {/* Front boundary */}
        <Wall position={[0, 3, 0]} args={[5, 0.1, 5]} />     {/* Top boundary (ceiling) */}

        {initialWorkspaceBallPositions.map((pos, i) => (
          <EnergyBall key={`ws-ball-${i}`} id={`ws-ball-${i}`} initialPosition={pos} />
        ))}
      </Physics>
    </Canvas>
  );
};