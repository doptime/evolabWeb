'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../../components/guesture/gestureStore';
import { useGameStore } from './store-game';

const GestureCursor = () => {
    const gesture = useGestureStore((state) => state.gesture);
    const { type: gestureType, payload: gesturePayload } = gesture;
    // Use clickCountInRound to determine the *next* click's predicted value
    const { comboCount } = useGameStore(); 
    const selections = useGameStore(state => state.selections);
    const clickCountInRound = selections.length;

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
        // Corrected Logic: The biggest hammer predicts the reward for the FIRST click (count is 0).
        switch (clickCountInRound) {
            case 0: return '🔨³'; // Predicts high reward for the 1st click
            case 1: return '🔨²'; // Predicts medium reward for the 2nd click
            case 2: return '🔨';  // Predicts low reward for the 3rd click
            default: return ''; // No special prediction for the 4th click
        }
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
