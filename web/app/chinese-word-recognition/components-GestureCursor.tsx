'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';

const GestureCursor = () => {
    const gesture = useGestureStore((state) => state.gesture);
    const { type: gestureType, payload: gesturePayload } = gesture;
    
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isActive, setIsActive] = useState(false);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const lastRenderedPosition = useRef({ x: -100, y: -100 });
    const positionTolerance = 2; // px

    useEffect(() => {
        if (gesturePayload && 'x' in gesturePayload && 'y' in gesturePayload) {
            const screenX = (1 - gesturePayload.x) * window.innerWidth;
            const screenY = gesturePayload.y * window.innerHeight;

            if (Math.abs(lastRenderedPosition.current.x - screenX) > positionTolerance || 
                Math.abs(lastRenderedPosition.current.y - screenY) > positionTolerance) {
                setPosition({ x: screenX, y: screenY });
                lastRenderedPosition.current = { x: screenX, y: screenY };
            }
        }

        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }

        if (gestureType === 'click' || gestureType === 'dragstart') {
            setIsActive(true);
            clickTimeoutRef.current = setTimeout(() => setIsActive(false), 200);
        } else if (gestureType === 'drag') {
            setIsActive(true);
        } else { // 'point', 'dragend', 'idle'
            setIsActive(false);
        }

    }, [gestureType, gesturePayload]);

    return (
        <motion.div
            // The key fix: increase z-index to be on top of all other elements, including the control button (z-10000)
            className="fixed top-0 left-0 w-8 h-8 rounded-full bg-sky-500/50 border-2 border-white shadow-lg pointer-events-none z-[10001]"
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
