"use client";
import { motion } from 'framer-motion';
import { useGestureStore } from "../../components/guesture/gestureStore";
import useGameStore from './store-gameStore';
import { playEnergyBallSound } from './utils-audio';
import { useFrame } from '@react-three/fiber';
import { Physics, useSphere } from '@react-three/cannon';
import React, { useEffect, useRef, useMemo } from 'react';

const EnergyBall = ({ id, initialPosition }) => {
  const { gameState } = useGameStore();
  const { gesture } = useGestureStore();
  
  // Initialize useSphere hook. The ref is a React ref that will be attached to the mesh.
  // api is an object with methods to control the physics body.
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    args: [0.5], // Sphere radius
    restitution: 0.8, // Bounciness
    friction: 0.3 // Friction
  }));

  const safeGameState = gameState || 'idle';
  const color = {
    idle: '#ffffff',
    adjusting: '#00ff00',
    judging: '#ffff00',
    correct: '#00ff00',
    incorrect: '#ff0000'
  }[safeGameState] || '#ffffff';
  const emissiveColor = {
    idle: '#222',
    adjusting: '#444',
    judging: '#fff',
    correct: '#0f0',
    incorrect: '#f00'
  }[safeGameState] || '#222';

  // useFrame hook runs every frame.
  useFrame(() => {
    // No direct manipulation of ref.current.position here, as it's controlled by physics.
    // If you need to read the current position, access ref.current.position.x, .y, .z
    // or api.position.get() for the physics body's position.
  });

  // Collision sound effect
  useEffect(() => {
    const handleCollision = (e) => {
      // e.contact.velocity is an array [vx, vy, vz]
      const velocityMagnitude = Math.hypot(...e.contact.impactVelocity);
      playEnergyBallSound('collision', {
        velocity: velocityMagnitude,
        position: ref.current ? ref.current.position.toArray() : [0, 0, 0] // Safely get position
      });
    };

    const currentRef = ref.current;
    if (currentRef) {
      // Add event listener for collision
      currentRef.addEventListener('collide', handleCollision);
    }

    return () => {
      if (currentRef) {
        // Clean up event listener
        currentRef.removeEventListener('collide', handleCollision);
      }
    };
  }, [ref]); // Depend on ref to ensure listener is re-attached if ref changes

  return (
    <mesh
      ref={ref} // Attach the physics ref to the mesh
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
      />
    </mesh>
  );
};

// Memoize the component to prevent unnecessary re-renders
// initialPosition comparison is removed as it's only used once on mount
export default React.memo(EnergyBall, (prev, next) => {
  return prev.id === next.id; // Only compare id for memoization
});