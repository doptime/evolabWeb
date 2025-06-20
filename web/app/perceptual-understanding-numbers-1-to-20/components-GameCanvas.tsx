"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import EnergyBall from './components-EnergyBall';
import useGameStore from './store-gameStore';

// Helper function to generate initial positions for balls within a tray
const generateInitialPositions = (count, offsetX) => {
  const positions = [];
  const trayWidth = 4; // Approximate width of the tray area
  const trayHeight = 3; // Approximate height of the tray area
  const startY = 1; // Starting Y position to allow balls to fall into place
  
  for (let i = 0; i < count; i++) {
    const x = offsetX + (Math.random() - 0.5) * trayWidth;
    const y = startY + (Math.random() * trayHeight); 
    const z = (Math.random() - 0.5) * 0.5; // Small depth variation
    positions.push([x, y, z]);
  }
  return positions;
};

// ChallengeCanvas for the left tray
export const ChallengeCanvas = () => {
  const { challengeValue } = useGameStore();
  const initialChallengeBallPositions = React.useMemo(() => generateInitialPositions(challengeValue, 0), [challengeValue]); // Offset X for challenge tray

  const ChallengePlane = () => {
    const [ref] = usePlane(() => ({
      mass: 0,
      position: [0, -2, 0],
      rotation: [-Math.PI / 2, 0, 0],
    }));
    return <mesh ref={ref}><planeGeometry args={[100, 100]} /><meshStandardMaterial visible={false} /></mesh>;
  };

  const ChallengeWalls = () => {
    // Define wall properties locally within the component
    const wallProps = {
      mass: 0,
    };

    return (
      <>
        {/* Left boundary */}
        <mesh {...wallProps} position={[-2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.1, 5, 5]} />{/* Use boxGeometry for walls */}
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Right boundary */}
        <mesh {...wallProps} position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.1, 5, 5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Back boundary */}
        <mesh {...wallProps} position={[0, 0, -2.5]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Front boundary */}
        <mesh {...wallProps} position={[0, 0, 2.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Top boundary (ceiling) */}
        <mesh {...wallProps} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[5, 0.1, 5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </>
    );
  };

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} />
      <Physics>
        <ChallengePlane />
        <ChallengeWalls />

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
  const initialWorkspaceBallPositions = React.useMemo(() => generateInitialPositions(currentValue, 0), [currentValue]); // Offset X for workspace tray

  const WorkspacePlane = () => {
    const [ref] = usePlane(() => ({
      mass: 0,
      position: [0, -2, 0],
      rotation: [-Math.PI / 2, 0, 0],
    }));
    return <mesh ref={ref}><planeGeometry args={[100, 100]} /><meshStandardMaterial visible={false} /></mesh>;
  };

  const WorkspaceWalls = () => {
    const wallProps = {
      mass: 0,
    };

    return (
      <>
        {/* Left boundary */}
        <mesh {...wallProps} position={[-2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.1, 5, 5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Right boundary */}
        <mesh {...wallProps} position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.1, 5, 5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Back boundary */}
        <mesh {...wallProps} position={[0, 0, -2.5]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Front boundary */}
        <mesh {...wallProps} position={[0, 0, 2.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial visible={false} />
        </mesh>
        {/* Top boundary (ceiling) */}
        <mesh {...wallProps} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[5, 0.1, 5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </>
    );
  };

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} />
      <Physics>
        <WorkspacePlane />
        <WorkspaceWalls />
        {initialWorkspaceBallPositions.map((pos, i) => (
          <EnergyBall key={`ws-ball-${i}`} id={`ws-ball-${i}`} initialPosition={pos} />
        ))}
      </Physics>
    </Canvas>
  );
};