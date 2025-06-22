import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Define the possible states for the game
export type GameState = 'idle' | 'adjusting' | 'judging' | 'correct' | 'incorrect' | 'great' | 'good' | 'hidden'; // Added 'great', 'good' and 'hidden' for finer feedback and UI control

interface GameStateStore {
  challengeValue: number; // The target value to reach
  currentValue: number;   // The current value in the workspace
  gameState: GameState;   // The current state of the game
  dragVelocity: { x: number; y: number }; // Velocity of drag gestures (currently unused but kept for future)
  sequenceId: string;     // Unique identifier for a game sequence
  isNumericChallenge: boolean; // Flag to indicate if the challenge is numeric

  // Actions to update the game state
  updateGameState: (newState: Partial<GameStateStore>) => void;
  generateChallenge: () => void; // Generates a new challenge
  applyModifier: (value: number, operation: 'add' | 'subtract') => void; // Applies +1 or -1, +3 or -3
  triggerJudgment: () => void; // Initiates the judgment phase
  startChallenge: () => void; // Resets and starts a new challenge
  resetToAdjusting: () => void; // New action to reset to adjusting state
  hideFeedback: () => void; // New action to hide feedback and allow interaction
}

const useGameStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      challengeValue: 0,
      currentValue: 0,
      gameState: 'idle',
      dragVelocity: { x: 0, y: 0 },
      sequenceId: '',
      isNumericChallenge: true, // Default to numeric challenge

      updateGameState: (newState) => set(newState),

      generateChallenge: () => {
        const newValue = Math.floor(Math.random() * 20) + 1; // Challenge value from 1 to 20
        let initialCurrentValue = Math.floor(Math.random() * 20) + 1;
        // Ensure initialCurrentValue is different from newValue to guarantee adjustment is needed
        while (initialCurrentValue === newValue) {
          initialCurrentValue = Math.floor(Math.random() * 20) + 1;
        }

        // 50% chance for numeric challenge, 50% for graphical
        const isNumeric = Math.random() < 0.5;

        set({
          challengeValue: newValue,
          currentValue: initialCurrentValue,
          gameState: 'adjusting',
          sequenceId: uuidv4(),
          isNumericChallenge: isNumeric,
        });
      },

      applyModifier: (value: number, operation: 'add' | 'subtract') => {
        const { currentValue, gameState } = get();
        if (gameState !== 'adjusting') return;

        let newValue = operation === 'add' ? currentValue + value : currentValue - value;

        // Prevent negative ball count
        if (newValue < 0) {
          newValue = 0;
        }

        set({
          currentValue: newValue,
          dragVelocity: { x: 0, y: 0 },
        });
      },

      triggerJudgment: () => {
        const { currentValue, challengeValue, gameState } = get();
        if (gameState !== 'adjusting') return;

        const difference = Math.abs(currentValue - challengeValue);

        // Success判定逻辑: 差值在3以内视为成功
        if (difference === 0) {
          set({ gameState: 'correct' }); // Perfect match
        } else if (difference === 1) {
          set({ gameState: 'great' }); // Great match
        } else if (difference <= 3) {
          set({ gameState: 'good' }); // Good match
        } else {
          set({ gameState: 'incorrect' }); // Outside the acceptable range
        }
      },

      startChallenge: () => {
        // Reset state to start a new challenge
        get().generateChallenge();
      },

      resetToAdjusting: () => {
        set({ gameState: 'adjusting' });
      },

      hideFeedback: () => {
        set({ gameState: 'adjusting' }); // Transition back to adjusting or a state that allows starting a new challenge
      },
    }),
    {
      name: 'game-store',
      storage: {
        getItem: (name) => { if (typeof window === 'undefined') return null; return localStorage.getItem(name); },
        setItem: (name, value) => { if (typeof window === 'undefined') return; localStorage.setItem(name, value); }
      }
    }
  )
);

export default useGameStore;