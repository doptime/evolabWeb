'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';

const GestureCursor = () => {
    const gesture = useGestureStore((state) => state.gesture);
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (gesture.type === 'point' && gesture.payload?.x != null && gesture.payload?.y != null) {
            setPosition({ x: gesture.payload.x, y: gesture.payload.y });
        }
        if(gesture.type === 'click' || gesture.type === 'dragstart'){
            setIsActive(true);
            setTimeout(() => setIsActive(false), 200);
        }
    }, [gesture]);

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