import useGameStore from './store-gameStore';
import { useGestureStore } from "../../components/guesture/gestureStore";
import { motion } from 'framer-motion';
import { ModifierButton } from './components-ModifierButton';
import { JudgmentButton } from './components-JudgmentButton';
import FeedbackContainer from './components-FeedbackContainer';

export default function OracleScale() {
  const { gameState, triggerJudgment } = useGameStore();
  const { gesture } = useGestureStore();

  // 增强的手势事件处理
  useEffect(() => {
    if (gesture.type === 'click') {
      const target = document.getElementById(gesture.payload.targetId);
      if (target) {
        target.focus();
        target.click();
      }
    }
  }, [gesture]);

  // 游戏初始化强化逻辑
  useEffect(() => {
    if (gameState === 'idle') {
      document.getElementById('start-challenge-btn')?.focus();
    }
  }, [gameState]);

  return (
    <motion.div 
      className="w-full h-screen"
      animate={{ scale: gameState === 'correct' ? 1.1 : 1 }}
    >
      {/* Top Section: Challenge and Workspace */}
      <div className="w-full flex-grow flex items-center justify-around mb-10">
        {/* Left Tray: Challenge */}
        <div className="w-1/3 flex flex-col items-center">
          <div className="text-6xl font-bold text-white mb-4 glow-text">
            {challengeValue}
          </div>
          <div className="text-lg text-gray-400">命题端</div>
          {/* Placeholder for energy balls on the challenge side if needed */}
        </div>

        {/* Right Tray: Workspace */}
        <div className="w-1/3 flex flex-col items-center relative">
          <div className="text-5xl font-bold text-white mb-4 glow-text">
            {currentValue}
          </div>
          <div className="text-lg text-gray-400">解答端</div>
          {/* Placeholder for energy balls in the workspace */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* This is a placeholder for where EnergyBall components would be rendered */}
             {/* For example: <EnergyBall id="ws-ball-1" initialPosition={[0, 0, 0]} /> */}
          </div>
        </div>
      </div>

      {/* Middle Section: The Scale */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 flex items-center justify-center">
        {/* SVG for the scale can be placed here */}
        <svg className='w-full h-full' viewBox='0 0 200 200'>
          <g id='physics-scale'>
            {/* Scale beam */}
            <rect x='50' y='50' width='100' height='20' rx='10' fill='#222' />
            {/* Scale pivot */}
            <circle cx='100' cy='40' r='10' fill='#444' />
            {/* Placeholder for the pointer */}
            <motion.line 
              id='scale-pointer'
              x1='100' y1='40'
              x2='100' y2='10'
              stroke='white' 
              strokeWidth='4'
              strokeLinecap='round'
              animate={{
                // Basic pointer animation based on value difference. Needs actual calculation.
                rotate: (currentValue - challengeValue) * 2, // Simplified rotation
                transformOrigin: 'center bottom'
              }}
              style={{ willChange: 'transform' }}
            />
          </g>
        </svg>
      </div>

      {/* Bottom Section: Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
        {/* Modifier Buttons */}
        <div className="flex gap-4">
          <ModifierButton value={1} operation="subtract" />
          <ModifierButton value={3} operation="subtract" />
          <ModifierButton value={1} operation="add" />
          <ModifierButton value={3} operation="add" />
        </div>
        {/* Judgment Button */}
        <JudgmentButton />
      </div>
      
      {/* Feedback Container for correct/incorrect messages */}
      <FeedbackContainer />
    </motion.div>
  );
}
