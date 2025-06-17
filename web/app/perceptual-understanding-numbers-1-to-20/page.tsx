"use client";
import React, { useState, useEffect } from 'react';
import useGameStore from './store-gameStore';
import { useSceneTransition } from './hooks-useSceneTransition';
import { useGestureBoundary } from './hooks-useGestureHandler';
import { ErrorBoundary } from './components-ErrorBoundary';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './components-LoadingSpinner';
import {  useCallback, useMemo, lazy, Suspense } from 'react';
import {useGestureStore } from "../../components/guesture/gestureStore"
import {GestureCaptureProvider} from '../../components/guesture/GestureCaptureProvider';
import {PerformanceDashboard } from './components-PerformanceDashboard'

// 代码分割优化
const AdjustingPhase = lazy(() => import('./components-AdjustingPhase'));
const JudgingPhase = lazy(() => import('./components-JudgingPhase'));
const IdlePhase = lazy(() => import('./components-IdlePhase'));

const renderGamePhase = () => {
  const gameState = useGameStore(state => state.gameState);
  switch(gameState) {
    case 'idle':
      return <IdlePhase />;
    case 'adjusting':
      return <AdjustingPhase />;
    case 'judging':
      return <JudgingPhase />;
    default:
      return <IdlePhase />;
  }
};

export default function Index() {
  // 优化后的状态订阅
  const gameState = useGameStore(state => state.gameState);
  const challengeValue = useGameStore(state => state.challengeValue);
  const currentValue = useGameStore(state => state.currentValue);
  const difficultyLevel = useGameStore(state => state.difficultyLevel);

  // 用户行为分析集成
  const analyzeUserBehavior = useCallback(() => {
    const { operationHistory, accuracy } = useGameStore.getState().getUserMetrics();
    useGameStore.getState().updateDifficulty(
      base => base * (1 + (accuracy > 0.8 ? 0.1 : -0.05))
    );
  }, []);

  // 手势事件回放优化
  const [gesturePlayback, setGesturePlayback] = useState([]);
  useEffect(() => {
    const unsubscribe = useGestureStore.subscribe((state) => {
      setGesturePlayback(prev => [...prev, state]);
    });
    return () => unsubscribe();
  }, []);

  // 错误回退增强
  const handleRecovery = useCallback((error) => {
    console.error('Recovering from error:', error);
    const recoveryState = useGameStore.getState().getRecoveryState();
    useGameStore.getState().restoreState(recoveryState);
    return <ErrorBoundary fallback={recoveryState} />;
  }, []);

  return (
    <ErrorBoundary onRecover={handleRecovery}>
      <motion.div 
        className="relative w-full h-screen"
        animate={useSceneTransition.isAnimating ? useSceneTransition.animateSceneTransition : undefined}
      >
        <GestureCaptureProvider />
        <Suspense fallback={<LoadingSpinner />}> 
          {renderGamePhase()}
          <PerformanceDashboard 
            fps={useSceneTransition.fps}
            renderCount={gesturePlayback.length}
          />
        </Suspense>
      </motion.div>
    </ErrorBoundary>
  );
}

// 添加单元测试钩子
if (process.env.NODE_ENV === 'test') {
  test('gesture to action mapping', () => {
    // 测试手势处理逻辑
  });
}