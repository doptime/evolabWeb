"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GameState = {
  challengeValue: number;
  currentValue: number;
  gameState: 'idle' | 'adjusting' | 'judging' | 'correct' | 'incorrect';
  startChallenge: () => void;
  increase: (value: number) => void;
  decrease: (value: number) => void;
  triggerJudgment: () => void;
  reset: () => void;
};

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      challengeValue: 0,
      currentValue: 0,
      gameState: 'idle',
      startChallenge: () => set(() => ({
        challengeValue: Math.floor(Math.random() * 20) + 1,
        currentValue: Math.floor(Math.random() * 20) + 1,
        gameState: 'adjusting'
      })),
      increase: (value) => set((state) => ({
        currentValue: state.currentValue + value
      })),
      decrease: (value) => set((state) => ({
        currentValue: state.currentValue - value
      })),
      triggerJudgment: () => set((state) => ({
        gameState: state.challengeValue === state.currentValue ? 'correct' : 'incorrect'
      })),
      reset: () => set({
        challengeValue: 0,
        currentValue: 0,
        gameState: 'idle'
      })
    }),
    {
      name: 'game-store',
      storage: {
        getItem: (name) => JSON.parse(localStorage.getItem(name) || 'null'),
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value))
      }
    }
  )
);

export default useGameStore;