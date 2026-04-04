'use client';

import { motion } from 'motion/react';
import { useTheme } from './theme-provider';

export function AmbientBackground() {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const orbColor = isDark ? 'rgba(108,139,103,0.18)' : 'rgba(154,177,143,0.2)';
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Orb 1 */}
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ background: orbColor, width: '40vw', height: '40vw' }}
        animate={{
          x: ['-10vw', '20vw', '-10vw'],
          y: ['-10vh', '30vh', '-10vh'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Orb 2 */}
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{ background: orbColor, width: '35vw', height: '35vw', right: '-10vw', top: '20vh' }}
        animate={{
          x: ['10vw', '-20vw', '10vw'],
          y: ['10vh', '-10vh', '10vh'],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Orb 3 */}
      <motion.div
        className="absolute rounded-full blur-[90px]"
        style={{ background: orbColor, width: '45vw', height: '45vw', left: '20vw', bottom: '-20vh' }}
        animate={{
          x: ['-15vw', '15vw', '-15vw'],
          y: ['15vh', '-25vh', '15vh'],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
    </div>
  );
}
