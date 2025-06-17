"use client";
import { motion, useMotionValue, useTransform, willChange } from 'framer-motion';
import { useGestureStore } from '../store-gestureStore';
import { useGameStore } from './store-gameStore';
import { playEnergyBallSound } from '../utils-audio';
import { useFrame } from '@react-three/fiber';
import { Physics, useSphere } from '@react-three/cannon';
import { useEffect, useRef, useMemo } from 'react';

const EnergyBall = ({ id, initialPosition }) => {
  const { gameState, currentValue } = useGameStore();
  const { isDragging, velocity, position } = useGestureStore();
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
      const pos = ref.current.position();
      x.set(pos[0]);
      y.set(pos[1]);
    }
  });

  // 拖拽轨迹预览线
  const trailPoints = useRef([]);
  useEffect(() => {
    if (isDragging) {
      trailPoints.current.push([x.get(), y.get()]);
      if (trailPoints.current.length > 10) trailPoints.current.shift();
    }
  }, [isDragging, x, y]);

  // 碰撞事件处理
  useEffect(() => {
    const handleCollision = (event) => {
      playEnergyBallSound('collision', { 
        velocity: Math.hypot(...event.contact!.velocity),
        position: [x.get(), y.get()]
      });
    };

    ref.addEventListener('collision', handleCollision);
    return () => ref.removeEventListener('collision', handleCollision);
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
            .map(([x, y], i) => i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
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