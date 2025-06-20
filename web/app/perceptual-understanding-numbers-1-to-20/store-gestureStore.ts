import create from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface GestureState {
  type: 'idle' | 'point' | 'click' | 'dragstart' | 'drag' | 'dragend' | 'contextmenu' | 'swipe' | 'cancel' | 'transformstart' | 'transform' | 'transformend';
  payload: {
    x?: number;
    y?: number;
    targetId?: string;
    dx?: number;
    dy?: number;
    distance?: number;
    angle?: number;
    velocity?: { x: number; y: number };
    scale?: number;
    rotation?: number;
  };
  timestamp: number;
  sequenceId: string;
}

interface GestureStore {
  gesture: GestureState;
  setGesture: (newGesture: GestureState) => void;
  gestureHistory: GestureState[];
  recordGesture: (gesture: GestureState) => void;
  replayGestures: () => void;
  clearGestureHistory: () => void;
}

const useGestureStore = create<GestureStore>((set) => ({
  gesture: { type: 'idle', payload: {}, timestamp: 0, sequenceId: '' },
  setGesture: (newGesture) => set({ gesture: newGesture }),
  gestureHistory: [],
  recordGesture: (newGesture) => set((state) => ({
    gestureHistory: [...state.gestureHistory, newGesture]
  })),
  replayGestures: () => {
    // Implementation for replaying gestures
    // This part needs to be filled in based on the desired replay functionality.
    // For now, it's a placeholder.
    console.log('Replaying gestures...');
    // Example: iterate through history and trigger actions based on gesture type
    state.gestureHistory.forEach(g => {
      // Simulate gesture events or call appropriate handlers
      console.log(`Replaying: ${g.type}`);
      // In a real implementation, you'd likely trigger the same logic that handles live gestures.
    });
  },
  clearGestureHistory: () => {
    set({ gestureHistory: [] });
  }
}));

export default useGestureStore;
