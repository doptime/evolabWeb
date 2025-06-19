import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Define the possible states for the game
export type GameState = 'idle' | 'adjusting' | 'judging' | 'correct' | 'incorrect';

interface GameStateStore {
  challengeValue: number; // The target value to reach
  currentValue: number;   // The current value in the workspace
  gameState: GameState;   // The current state of the game
  dragVelocity: { x: number; y: number }; // Velocity of drag gestures
  sequenceId: string;     // Unique identifier for a game sequence
  history: { type: 'add' | 'subtract', value: number }[]; // History for undo/redo
  historyIndex: number;   // Current index in the history
  counterZIndex: number; // Added from NumberCounter.tsx

  // Actions to update the game state
  updateGameState: (newState: Partial<GameStateStore>) => void;
  generateChallenge: () => void; // Generates a new challenge
  applyModifier: (value: number, operation: 'add' | 'subtract') => void; // Applies +1 or -1, +3 or -3
  triggerJudgment: () => void; // Initiates the judgment phase
  startChallenge: () => void; // Resets and starts a new challenge
  undoLastAction: () => void;
  redoLastAction: () => void;
  recordAction: (action: { type: 'add' | 'subtract', value: number }) => void;
  setCounterZIndex: (zIndex: number) => void; // Added from NumberCounter.tsx
}

const useGameStore = create<GameStateStore>()(
 persist(
 (set, get) => ({
 challengeValue: 0,
 currentValue: 0,
 gameState: 'idle',
 dragVelocity: { x: 0, y: 0 },
 sequenceId: '',
 history: [],
 historyIndex: -1,
 counterZIndex: 5, // Initial value from NumberCounter.tsx

 updateGameState: (newState) => set(newState),

 generateChallenge: () => {
 const newValue = Math.floor(Math.random() * 20) + 1;
 // Reset history for a new challenge
 set({
 challengeValue: newValue,
 // Initialize currentValue with a random value, perhaps slightly different from challengeValue
 currentValue: Math.floor(Math.random() * 20) + 1,
 gameState: 'adjusting', // Start in adjusting state
 sequenceId: uuidv4(),
 history: [],
 historyIndex: -1,
 });
 },

 applyModifier: (value: number, operation: 'add' | 'subtract') => {
 const { currentValue, challengeValue, gameState, history, historyIndex } = get();
 if (gameState !== 'adjusting') return; // Only allow adjustments in 'adjusting' state

 const newValue = operation === 'add' ? currentValue + value : currentValue - value;

 // Record action for undo/redo
 const newHistory = [...history.slice(0, historyIndex + 1), { type: operation, value }];

 set({
 currentValue: newValue,
 dragVelocity: { x: 0, y: 0 },
 history: newHistory,
 historyIndex: historyIndex + 1,
 });
 },

 triggerJudgment: () => {
 const { currentValue, challengeValue, gameState } = get();
 if (gameState !== 'adjusting') return;

 // Determine if the values match
 if (currentValue === challengeValue) {
 set({ gameState: 'correct' });
 } else {
 set({ gameState: 'incorrect' });
 }
 },

 startChallenge: () => {
 // Reset state to start a new challenge
 get().generateChallenge(); // Call generateChallenge to set up new values and state
 },

 recordAction: (action: { type: 'add' | 'subtract', value: number }) => {
 const { history, historyIndex } = get();
 const newHistory = [...history.slice(0, historyIndex + 1), action];
 set({
 history: newHistory,
 historyIndex: historyIndex + 1,
 });
 },

 undoLastAction: () => {
 const { history, historyIndex, currentValue } = get();
 if (historyIndex < 0) return;

 const previousAction = history[historyIndex];
 let newValue;
 if (previousAction.type === 'add') {
 newValue = currentValue - previousAction.value;
 } else {
 newValue = currentValue + previousAction.value;
 }

 set({
 currentValue: newValue,
 historyIndex: historyIndex - 1,
 });
 },

 redoLastAction: () => {
 const { history, historyIndex, currentValue } = get();
 if (historyIndex >= history.length - 1) return;

 const nextAction = history[historyIndex + 1];
 let newValue;
 if (nextAction.type === 'add') {
 newValue = currentValue + nextAction.value;
 } else {
 newValue = currentValue - nextAction.value;
 }

 set({
 currentValue: newValue,
 historyIndex: historyIndex + 1,
 });
 },

 setCounterZIndex: (zIndex) => set({ counterZIndex: zIndex }),

 }),
 {
 name: 'game-store',
 storage: {
 getItem: (name) => {
 // Use SSR-safe localStorage access
 if (typeof window === 'undefined') return null;
 return localStorage.getItem(name);
 },
 setItem: (name, value) => {
 // Use SSR-safe localStorage access
 if (typeof window === 'undefined') return;
 localStorage.setItem(name, value);
 }
 }
 }
 )
);

export default useGameStore;
