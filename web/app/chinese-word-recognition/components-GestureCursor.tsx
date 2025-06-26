'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';

const GestureCursor = () => {
    // Select specific parts of the gesture state to avoid re-renders for unrelated changes
    const gestureType = useGestureStore((state) => state.gesture.type);
    const gesturePayload = useGestureStore((state) => state.gesture.payload);
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isActive, setIsActive] = useState(false);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 使用 useRef 存储定时器ID

    useEffect(() => {
        // Update cursor position only if it's a 'point' gesture and coordinates are valid
        if (gestureType === 'point' && gesturePayload?.x != null && gesturePayload?.y != null) {
            // 只有当位置显著改变时才更新状态，避免微小抖动引起的频繁渲染
            // 容忍度应与 gestureProcessor 中的保持一致或略大
            const tolerance = 0.001; // 更小的容忍度，因为这里是最终渲染
            if (Math.abs(position.x - gesturePayload.x) > tolerance || Math.abs(position.y - gesturePayload.y) > tolerance) {
                setPosition({ x: gesturePayload.x, y: gesturePayload.y });
            }
        }

        // Handle click or dragstart gestures for activation state
        if (gestureType === 'click' || gestureType === 'dragstart') {
            // Clear previous timer to prevent issues with rapid consecutive clicks
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            setIsActive(true);
            // Set new timer to deactivate after 200ms
            clickTimeoutRef.current = setTimeout(() => {
                setIsActive(false);
                clickTimeoutRef.current = null; // Clear reference
            }, 200);
        }

        // Cleanup function: clear any pending timers when component unmounts or dependencies change
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, [gestureType, gesturePayload]); // 依赖于整个 payload 对象，但内部逻辑会判断具体属性是否变化

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full bg-sky-500/50 border-2 border-white shadow-lg pointer-events-none z-50"
            animate={{ 
                x: position.x - 16, 
                y: position.y - 16,
                scale: isActive ? 1.5 : 1,
                opacity: isActive ? 1 : 0.7
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    );
};

export default GestureCursor;