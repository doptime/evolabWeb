'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, DopamineEvent } from './store-game';
import { useGameActions } from './store-game';

const eventStyles: { [key in DopamineEvent['type']]?: string } = {
    PERFECT_HIT: 'text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-lg',
    CRITICAL_HIT: 'text-4xl font-bold text-orange-500',
    LUCKY_HIT: 'text-4xl font-bold text-green-500',
    COMBO_UP: 'text-3xl font-semibold text-purple-600',
    COMBO_BREAK: 'text-3xl font-semibold text-gray-500',
    NEAR_MISS: 'text-lg text-center text-gray-700 bg-gray-100/80 p-3 rounded-lg',
    SOCIAL_REWARD: 'text-2xl text-blue-600',
    GROWTH_STORY: 'text-2xl text-violet-600',
    FSRS_UPDATE: 'text-2xl text-yellow-600',
    COIN_REWARD: 'text-2xl font-bold text-yellow-500',
};

const eventAnimations = {
    initial: { opacity: 0, y: 50, scale: 0.5 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.3 } },
};


const FeedbackItem: React.FC<{ event: DopamineEvent }> = ({ event }) => {
    const { clearDopamineEvent } = useGameActions();

    useEffect(() => {
        const timer = setTimeout(() => {
            clearDopamineEvent(event.id);
        }, event.type === 'NEAR_MISS' ? 3000 : 1500); // Longer display for near miss text

        return () => clearTimeout(timer);
    }, [event, clearDopamineEvent]);

    const className = eventStyles[event.type] || 'text-gray-800';

    return (
        <motion.div
            layout
            variants={eventAnimations}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`absolute ${className}`}
        >
            {event.message}
        </motion.div>
    );
};

export default function DopamineFeedback() {
    const events = useGameStore(state => state.dopamineEvents);

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center pointer-events-none z-[1000]">
            <AnimatePresence>
                {events.map((event) => (
                    <FeedbackItem key={event.id} event={event} />
                ))}
            </AnimatePresence>
        </div>
    );
}
