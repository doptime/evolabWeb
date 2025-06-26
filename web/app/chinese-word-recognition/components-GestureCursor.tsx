'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';

const GestureCursor = () => {
    // Select specific parts of the gesture state to avoid re-renders for unrelated changes
    const gesture = useGestureStore((state) => state.gesture);
    const { type: gestureType, payload: gesturePayload, timestamp: gestureTimestamp } = gesture;
    
    const [position, setPosition] = useState({ x: -100, y: -100 }); // 初始化为屏幕外，避免初始闪烁
    const [isActive, setIsActive] = useState(false);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 使用 useRef 存储定时器ID

    // 追踪上一次光标更新的时间戳或手势对象，防止过度渲染
    const lastRenderedPosition = useRef({ x: -100, y: -100 });
    const positionTolerance = 2; // 像素容忍度，减少微小抖动引起的更新

    useEffect(() => {
        // 更新光标位置和状态的逻辑
        if (gesturePayload && 'x' in gesturePayload && 'y' in gesturePayload) {
            // 将归一化坐标转换为屏幕像素坐标，并镜像X坐标以匹配镜像的视频流
            const screenX = (1 - gesturePayload.x) * window.innerWidth;
            const screenY = gesturePayload.y * window.innerHeight;

            // 只有当位置显著改变时才更新状态，避免微小抖动引起的频繁渲染
            if (Math.abs(lastRenderedPosition.current.x - screenX) > positionTolerance || 
                Math.abs(lastRenderedPosition.current.y - screenY) > positionTolerance) {
                setPosition({ x: screenX, y: screenY });
                lastRenderedPosition.current = { x: screenX, y: screenY };
            }
        }

        if (gestureType === 'point') {
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
    }, [gestureType, gesturePayload, gestureTimestamp]); // 依赖于手势类型、payload和时间戳

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