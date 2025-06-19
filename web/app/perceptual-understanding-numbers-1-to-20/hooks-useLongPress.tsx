'use client';
import {useGestureStore } from "../../components/guesture/gestureStore"
import useGameStore from './store-gameStore';
export const useLongPress = (callback) => {
  const { gesture } = useGestureStore();
  const { increase, decrease } = useGameStore();
  useEffect(() => {
    if (gesture.type === 'contextmenu' && gesture.payload.targetId) {
      const value = parseInt(gesture.payload.targetId.split('-')[1]);
      if (gesture.payload.targetId.includes('add')) {
        callback(increase(value));
      } else {
        callback(decrease(value));
      }
    }
  }, [gesture]);
};
