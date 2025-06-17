import { useGameStore } from './store-gameStore';
import { useGestureStore } from '../store-gestureStore';
import { playCollisionSound } from '../utils-audio';

export const TrayStateManager = () => {
  const { recordAction, undo, redo } = useGameStore();
  const { gesture } = useGestureStore();

  // 事务回滚机制
  useEffect(() => {
    if (gesture.type === 'click' && gesture.payload.targetId) {
      recordAction({
        type: 'modifier',
        value: parseInt(gesture.payload.targetId.split('-')[1]),
        operation: gesture.payload.targetId.includes('add') ? 'add' : 'subtract'
      });
    }
  }, [gesture]);

  // 内存占用监控
  useEffect(() => {
    const checkMemory = () => {
      const memoryUsage = performance.memory.usedJSHeapSize;
      if (memoryUsage > 100 * 1024 * 1024) { // 100MB阈值
        console.warn('Memory usage warning:', memoryUsage);
      }
    };
    
    checkMemory();
    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  // 碰撞事件声音反馈
  useGameStore.subscribe('collisionEvents', events => {
    events.forEach(event => {
      playCollisionSound({
        velocity: event.velocity,
        position: event.position
      });
    });
  });

  return null;
};