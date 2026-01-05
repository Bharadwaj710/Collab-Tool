import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            {/* Aurora Blobs Container - CRITICAL: pointer-events-none to prevent hover interference */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Blob 1: Top Right - Deep Indigo */}
                <motion.div
                    className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full filter blur-[80px] pointer-events-none"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
                        opacity: 0.9,
                        willChange: 'transform'
                    }}
                    animate={{
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Blob 2: Bottom Left - Purple/Blue */}
                <motion.div
                    className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full filter blur-[70px] pointer-events-none"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        opacity: 0.8,
                        willChange: 'transform'
                    }}
                    animate={{
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />

                {/* Blob 3: Top Center - Cyan/Blue (Floating) */}
                <motion.div
                    className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full filter blur-[85px] pointer-events-none"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
                        opacity: 0.85,
                        willChange: 'transform'
                    }}
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                />
            </div>

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                 }} 
            />
        </div>
    );
};

export default BackgroundEffect;
