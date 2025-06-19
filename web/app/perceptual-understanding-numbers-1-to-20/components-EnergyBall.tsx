"use client";
import { motion, useMotionValue, useTransform, willChange } from 'framer-motion';
import { useGestureStore } from "../../components/guesture/gestureStore"
import useGameStore from './store-gameStore';
import { playEnergyBallSound } from '../utils-audio';
import { useFrame } from '@react-three/fiber';
import { Physics, useSphere } from '@react-three/cannon';
import { useEffect, useRef, useMemo } from 'react';

const EnergyBall = ({ id, initialPosition }) => {
  const { gameState, currentValue } = useGameStore();
  // Removed unused isDragging, velocity, position from useGestureStore
  const { gesture } = useGestureStore();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    args: [0.5],
    restitution: 0.8, // 弹性系数调整
    friction: 0.3 // 摩擦系数调整
  }));

  const x = useMotionValue(initialPosition[0]);
  const y = useMotionValue(initialPosition[1]);
  const scale = useMotionValue(1);

  // 动态颜色映射
  const color = useTransform(gameState, {
    idle: '#ffffff',
    adjusting: '#00ff00',
    judging: '#ffff00',
    correct: '#00ff00',
    incorrect: '#ff0000',
  });

  // 物理引擎与Framer Motion同步
  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position.toArray(); // Use toArray() to get position
      x.set(pos[0]);
      y.set(pos[1]);
    }
  });

  // 拖拽轨迹预览线
  const trailPoints = useRef([]);
  useEffect(() => {
    if (gesture.type === 'drag' || gesture.type === 'dragstart') {
      trailPoints.current.push([x.get(), y.get()]);
      if (trailPoints.current.length > 10) trailPoints.current.shift();
    } else if (gesture.type === 'dragend') {
      trailPoints.current = []; // Clear trail on drag end
    }
  }, [gesture, x, y]);

  // Collision event handling
  useEffect(() => {
    const handleCollision = (e) => {
      // Assuming playEnergyBallSound is imported correctly and handles 'collision' type
      playEnergyBallSound('collision', {
        velocity: Math.hypot(...e.contact.velocity),
        position: [x.get(), y.get()]
      });
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener('collide', handleCollision);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('collide', handleCollision);
      }
    };
  }, [ref, x, y]);

  return (
    <Physics>
      <motion.mesh
        ref={ref}
        position={[x, y, 0]}
        scale={scale}
        style={{ willChange: willChange(['position', 'scale']) }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={useTransform(gameState, {
            idle: '#222',
            adjusting: '#444',
            judging: '#fff',
            correct: '#0f0',
            incorrect: '#f00',
          })}
        />
      </motion.mesh>

      {/* 拖拽轨迹预览 */}
      {trailPoints.current.length > 1 && (
        <motion.path
          d={trailPoints.current
            .map(([px, py], i) => i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`)
            .join(' ')}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </Physics>
  );
};

export default React.memo(EnergyBall, (prev, next) => {
  return prev.id === next.id && prev.initialPosition.every((v, i) => v === next.initialPosition[i]);
});
