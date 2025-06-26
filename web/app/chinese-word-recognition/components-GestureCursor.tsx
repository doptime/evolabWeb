'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';

const GestureCursor = () => {
    // Select specific parts of the gesture state to avoid re-renders for unrelated changes
    const gestureType = useGestureStore((state) => state.gesture.type);
    const gesturePayload = useGestureStore((state) => state.gesture.payload);
    const [position, setPosition] = useState({ x: -100, y: -100 }); // 初始化为屏幕外，避免初始闪烁
    const [isActive, setIsActive] = useState(false);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 使用 useRef 存储定时器ID

    useEffect(() => {
        // Update cursor position only if it's a 'point' gesture and coordinates are valid
        if (gestureType === 'point' && gesturePayload && 'x' in gesturePayload && 'y' in gesturePayload) {
            // 将归一化坐标转换为屏幕像素坐标
            const screenX = gesturePayload.x * window.innerWidth;
            const screenY = gesturePayload.y * window.innerHeight;

            // 只有当位置显著改变时才更新状态，避免微小抖动引起的频繁渲染
            const tolerance = 2; // 像素容忍度
            if (Math.abs(position.x - screenX) > tolerance || Math.abs(position.y - screenY) > tolerance) {
                setPosition({ x: screenX, y: screenY });
            }
            setIsActive(false); // Pointing state is not 'active' in the sense of click/drag

        } else if (gestureType === 'click' || gestureType === 'dragstart') {
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
        } else if (gestureType === 'drag') {
            // 对于拖拽，光标应持续活跃
            if (gesturePayload && 'x' in gesturePayload && 'y' in gesturePayload) {
                const screenX = gesturePayload.x * window.innerWidth;
                const screenY = gesturePayload.y * window.innerHeight;
                setPosition({ x: screenX, y: screenY });
            }
            setIsActive(true);
            // 清除任何可能的点击定时器，因为现在是拖拽
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        } else if (gestureType === 'dragend' || gestureType === 'idle') {
            setIsActive(false);
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        }
    }, [gestureType, gesturePayload]); // 依赖于整个 payload 对象，但内部逻辑会判断具体属性是否变化

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full bg-sky-500/50 border-2 border-white shadow-lg pointer-events-none z-50"
            // 这里的 x 和 y 是基于屏幕像素的，所以直接使用 position.x 和 position.y
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
