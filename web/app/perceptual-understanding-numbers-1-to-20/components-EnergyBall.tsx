"use client";
import { motion } from 'framer-motion';
import { useGestureStore } from "../../components/guesture/gestureStore";
import useGameStore from './store-gameStore';
import { playEnergyBallSound } from './utils-audio';
import { useFrame } from '@react-three/fiber';
import { Physics, useSphere } from '@react-three/cannon';
import React, { useEffect, useRef, useMemo } from 'react';

// Define a unique type for the energy ball's physics body
interface EnergyBallProps {
  id: string;
  initialPosition: [number, number, number];
}

const EnergyBall = ({ id, initialPosition }: EnergyBallProps) => {
  const { gameState } = useGameStore();
  const { gesture } = useGestureStore();
  
  // Initialize useSphere hook. The ref is a React ref that will be attached to the mesh.
  // api is an object with methods to control the physics body.
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    args: [0.2], // Sphere radius, adjusted for better scale in new scene
    restitution: 0.7, // Bounciness, slightly reduced
    friction: 0.5, // Friction, slightly increased
    linearDamping: 0.8, // Add linear damping to reduce infinite bouncing
    angularDamping: 0.8, // Add angular damping
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

  // Collision sound effect
  useEffect(() => {
    // Ensure the ref.current and its 'api' (from useSphere) are available
    if (api && api.addEventListener) {
      const unsubscribe = api.addEventListener('collide', (e) => {
        const velocityMagnitude = Math.hypot(...e.contact.impactVelocity);
        // Only play sound if collision velocity is significant to avoid constant noise
        if (velocityMagnitude > 0.5) {
          playEnergyBallSound('collision', {
            velocity: velocityMagnitude,
            position: ref.current ? ref.current.position.toArray() : [0, 0, 0]
          });
        }
      });
      return () => {
        // Clean up event listener when component unmounts or api changes
        unsubscribe();
      };
    }
  }, [api]); // Depend on api to ensure listener is re-attached if api changes

  return (
    <mesh
      ref={ref} // Attach the physics ref to the mesh
    >
      <sphereGeometry args={[0.2, 32, 32]} /> {/* Adjusted radius */}
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={gameState === 'judging' ? 1.5 : 0.5} // Make balls glow more during judging
      />
    </mesh>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(EnergyBall, (prevProps, nextProps) => {
  // Only re-render if the id changes (meaning it's a new ball or removed/re-added)
  // or if initialPosition significantly changes (though physics will handle movement)
  // or if game state changes affecting visual properties.
  return prevProps.id === nextProps.id &&
         prevProps.initialPosition[0] === nextProps.initialPosition[0] &&
         prevProps.initialPosition[1] === nextProps.initialPosition[1] &&
         prevProps.initialPosition[2] === nextProps.initialPosition[2];
});
