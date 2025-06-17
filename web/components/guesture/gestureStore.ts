import { create } from 'zustand';
import { Gesture, GestureStore } from './types';

export const useGestureStore = create<GestureStore>((set) => ({
  // 初始状态为空闲
  gesture: { type: 'idle', payload: null, timestamp: Date.now() },
  
  // Action: 用于更新手势状态
  setGesture: (newGesture) => set({ gesture: newGesture }),
}));