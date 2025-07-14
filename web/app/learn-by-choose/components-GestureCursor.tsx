'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { useGameStore } from './store-game'; // Import game store to get click chain

const GestureCursor = () => {
    const gesture = useGestureStore((state) => state.gesture);
    const { type: gestureType, payload: gesturePayload } = gesture;
    const clickChain = useGameStore((state) => state.clickChain);
    
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isActive, setIsActive] = useState(false);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (gesturePayload && 'x' in gesturePayload && 'y' in gesturePayload) {
            const screenX = (1 - gesturePayload.x) * window.innerWidth;
            const screenY = gesturePayload.y * window.innerHeight;
            setPosition({ x: screenX, y: screenY });
        }
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }
        if (gestureType === 'click' || gestureType === 'dragstart') {
            setIsActive(true);
            clickTimeoutRef.current = setTimeout(() => setIsActive(false), 200);
        } else {
            setIsActive(false);
        }

    }, [gestureType, gesturePayload]);

    const getCursorContent = () => {
        // Change cursor based on clickChain per product goal
        if (clickChain >= 2) return '🔨³'; // 3rd click and onwards
        if (clickChain === 1) return '🔨²'; // 2nd click
        if (clickChain === 0) return '🔨'; // 1st click
        return '';
    };

    return (
        <motion.div
            className="fixed top-0 left-0 w-12 h-12 rounded-full bg-sky-500/50 border-2 border-white shadow-lg pointer-events-none z-[10001] flex items-center justify-center text-2xl"
            animate={{
                x: position.x - 24, 
                y: position.y - 24,
                scale: isActive ? 1.5 : 1,
                opacity: isActive ? 1 : 0.7
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
            {getCursorContent()}
        </motion.div>
    );
}; 

export default GestureCursor;