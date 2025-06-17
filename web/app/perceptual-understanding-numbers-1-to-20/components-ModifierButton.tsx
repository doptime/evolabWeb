import { useGameStore } from './store-gameStore';
import { useGestureStore } from '../store-gestureStore';
import { motion, AnimatePresence } from 'framer-motion';
import { playDing, playError } from '../utils-audio';
import { useEffect, useRef } from 'react';

interface ModifierButtonProps {
  value: 1 | 3;
  operation: 'add' | 'subtract';
}

export const ModifierButton = ({ value, operation }: ModifierButtonProps) => {
  const { gameState, currentValue, addToHistory, undo, redo } = useGameStore();
  const { gesture, triggerHaptic } = useGestureStore();
  const lastPressTime = useRef(0);
  const pressInterval = useRef<NodeJS.Timeout | null>(null);

  // 状态派生
  const isPressed = gesture.type === 'click' && gesture.payload.targetId === `modifier-${operation}-${value}`;
  const isLongPress = gesture.type === 'contextmenu' && gesture.payload.targetId === `modifier-${operation}-${value}`;
  const isCorrectState = gameState === 'correct';
  const isIncorrectState = gameState === 'incorrect';

  // 触觉反馈力度曲线优化
  const calculateHapticStrength = (value: number, isLongPress: boolean) => {
    const baseStrength = value === 1 ? 0.3 : 0.6;
    const durationFactor = isLongPress ? 0.7 : 1.0;
    return Math.min(1.0, baseStrength * durationFactor);
  };

  // 处理单次操作
  const handleSinglePress = () => {
    if (operation === 'add') {
      useGameStore.getState().increase(value);
      playDing();
      triggerHaptic('light', calculateHapticStrength(value, false));
      addToHistory({ type: 'add', value });
    } else {
      useGameStore.getState().decrease(value);
      playDing();
      triggerHaptic('light', calculateHapticStrength(value, false));
      addToHistory({ type: 'subtract', value });
    }
  };

  // 长按连续操作
  useEffect(() => {
    if (isLongPress) {
      pressInterval.current = setInterval(() => {
        const now = Date.now();
        const timeDiff = now - lastPressTime.current;
        
        // 防止操作过快
        if (timeDiff > 300) {
          handleSinglePress();
          lastPressTime.current = now;
        }
      }, 300);
    }
    return () => {
      if (pressInterval.current) {
        clearInterval(pressInterval.current);
      }
    };
  }, [isLongPress, operation, value]);

  // 检测手势变化取消长按
  useEffect(() => {
    if (isLongPress && gesture.type !== 'contextmenu') {
      if (pressInterval.current) {
        clearInterval(pressInterval.current);
      }
    }
  }, [gesture.type, isLongPress]);

  // 防止误触逻辑
  const isGestureValid = () => {
    const now = Date.now();
    const timeDiff = now - lastPressTime.current;
    return timeDiff > 150; // 最小操作间隔150ms
  };

  return (
    <motion.button
      id={`modifier-${operation}-${value}`}
      onClick={handleSinglePress}
      className={`glass-morphic p-4 rounded-lg flex flex-col items-center justify-center gap-1 
        ${isCorrectState ? 'bg-green-500/20' : ''} 
        ${isIncorrectState ? 'bg-red-500/20' : ''}`}]
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        transition: { delay: isPressed ? 0.1 : 0 }
      }}
    >
      <span className="text-sm font-bold">
        {operation === 'add' ? '+' : '-'}{value}
      </span>
      <AnimatePresence>
        {isPressed && (
          <motion.span
            className="text-xs text-white/60"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {currentValue}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};