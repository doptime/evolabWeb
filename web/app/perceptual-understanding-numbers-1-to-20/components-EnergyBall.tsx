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
  trayWidth: number; // Add tray dimensions for boundary checks
  trayDepth: number;
  trayOffsetX: number;
}

const getRandomBrightColor = () => {
  const colors = [
    '#FF6347', // Tomato
    '#FFD700', // Gold
    '#ADFF2F', // GreenYellow
    '#00CED1', // DarkTurquoise
    '#BA55D3', // MediumOrchid
    '#FF69B4', // HotPink
    '#00BFFF', // DeepSkyBlue
    '#7FFF00', // Chartreuse
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const EnergyBall = ({ id, initialPosition, trayWidth, trayDepth, trayOffsetX }: EnergyBallProps) => {
  const { gameState } = useGameStore();
  const { gesture } = useGestureStore();
  const randomColor = useMemo(() => getRandomBrightColor(), []); // Memoize color

  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    args: [0.3], // Increased sphere radius for larger appearance
    restitution: 0.7,
    friction: 0.5,
    linearDamping: 0.8,
    angularDamping: 0.8,
  }));

  // Use useFrame for continuous boundary checking and correction
  useFrame(() => {
    if (ref.current) {
      const [x, y, z] = ref.current.position.toArray();
      const halfWidth = trayWidth / 2;
      const halfDepth = trayDepth / 2;
      const radius = 0.3; // Ball radius, should match args

      // Correct X position
      if (x < trayOffsetX - halfWidth + radius) {
        api.position.set(trayOffsetX - halfWidth + radius, y, z);
        api.velocity.set(0, api.velocity.current[1], api.velocity.current[2]); // Stop x velocity
      } else if (x > trayOffsetX + halfWidth - radius) {
        api.position.set(trayOffsetX + halfWidth - radius, y, z);
        api.velocity.set(0, api.velocity.current[1], api.velocity.current[2]); // Stop x velocity
      }

      // Correct Z position
      if (z < -halfDepth + radius) {
        api.position.set(x, y, -halfDepth + radius);
        api.velocity.set(api.velocity.current[0], api.velocity.current[1], 0); // Stop z velocity
      } else if (z > halfDepth - radius) {
        api.position.set(x, y, halfDepth - radius);
        api.velocity.set(api.velocity.current[0], api.velocity.current[1], 0); // Stop z velocity
      }
    }
  });

  // Collision sound effect
  useEffect(() => {
    if (api && api.addEventListener) {
      const unsubscribe = api.addEventListener('collide', (e) => {
        const velocityMagnitude = Math.hypot(...e.contact.impactVelocity);
        if (velocityMagnitude > 0.5) {
          playEnergyBallSound('collision', {
            velocity: velocityMagnitude,
            position: ref.current ? ref.current.position.toArray() : [0, 0, 0]
          });
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [api, ref]);

  const emissiveColor = {
    idle: '#444',
    adjusting: randomColor, // Use random bright color during adjusting
    judging: '#ffff00',
    correct: '#00ff00',
    incorrect: '#ff0000'
  }[gameState] || randomColor;

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 32, 32]} /> {/* Sphere radius should match args */}
      <meshStandardMaterial
        color={randomColor}
        emissive={emissiveColor}
        emissiveIntensity={gameState === 'judging' ? 1.5 : 0.5}
      />
    </mesh>
  );
};

export default React.memo(EnergyBall, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id &&
         prevProps.initialPosition[0] === nextProps.initialPosition[0] &&
         prevProps.initialPosition[1] === nextProps.initialPosition[1] &&
         prevProps.initialPosition[2] === nextProps.initialPosition[2] &&
         prevProps.trayWidth === nextProps.trayWidth &&
         prevProps.trayDepth === nextProps.trayDepth &&
         prevProps.trayOffsetX === nextProps.trayOffsetX;
});