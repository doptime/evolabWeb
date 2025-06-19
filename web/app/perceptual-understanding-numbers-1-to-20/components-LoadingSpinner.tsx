"use client";
import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
  return (
    <motion.div 
      className="flex items-center justify-center w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
};
