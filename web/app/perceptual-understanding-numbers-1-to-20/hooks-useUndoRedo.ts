import { useGameStore } from './store-gameStore';
export const useUndoRedo = () => {
  const { undoLastAction, redoLastAction } = useGameStore();
  return {
    handleUndo: () => undoLastAction(),
    handleRedo: () => redoLastAction()
  };
};