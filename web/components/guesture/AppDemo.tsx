"use client";
import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGestureStore } from './gestureStore';

interface JudgmentButtonProps {
  id: string; // 每个可交互元素都有一个唯一ID
  onClick: () => void;
}

export const JudgmentButton = ({ id, onClick }: JudgmentButtonProps) => {
  const controls = useAnimation();

  // ⭐ 使用选择器订阅手势状态
  const lastClick = useGestureStore(state => 
    state.gesture.type === 'click' ? state.gesture : null
  );

  useEffect(() => {
    if (lastClick && lastClick.payload.targetId === id) {
      // 确认是点击了本按钮
      console.log(`Button ${id} was clicked!`);
      
      // 执行父组件传来的点击逻辑
      onClick();
      
      // 触发Framer Motion动画
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.2 }
      });
    }
    // 依赖项是整个 lastClick 对象，确保每次点击都触发
  }, [lastClick, id, onClick, controls]);

  return (
    <motion.button
      id={id}
      animate={controls}
      className="judgment-button"
      // 注意：我们不在这里使用 React 的 onClick 事件
    >
      开始审判
    </motion.button>
  );
};