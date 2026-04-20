import React from 'react';
import { motion } from 'motion/react';
import { SyncLogoProps } from '../../types';

// Animation dot configuration - dots closer and wrapping around the circles
const DOT_CONFIG = [
  { size: 4, y: -35, x: 3 },
  { size: 5, y: -18, x: 10 },
  { size: 6, y: 0, x: 13 },
  { size: 7, y: 18, x: 10 },
  { size: 5, y: 35, x: 3 },
  { size: 4, y: 50, x: -5 },
];

// Size presets
const SIZE_PRESETS = {
  large: { base: 160, mid: 120, dots: DOT_CONFIG },
  medium: { base: 100, mid: 75, dots: DOT_CONFIG },
  small: { base: 70, mid: 52, dots: DOT_CONFIG.slice(0, 5) },
};

/**
 * Animated SYNC Logo component with breathing effect and pulsing dots
 */
const SyncLogo: React.FC<SyncLogoProps> = ({
  size = 'large',
  className = '',
  isSyncing = false,
}) => {
  const preset = SIZE_PRESETS[size];

  return (
    <div
      className={`sync-totem flex items-center justify-center w-full ${
        !isSyncing ? 'breathing' : ''
      } ${className}`}
    >
      <div
        className="flex items-center justify-center relative"
        style={{ transform: 'translateX(-4%)' }}
      >
        {/* Main gradient circle */}
        <motion.div
          animate={
            isSyncing
              ? { scale: [1, 0.95, 1], opacity: [0.9, 0.7, 0.9] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="sync-circle relative z-20"
          style={{
            width: `${preset.base}px`,
            height: `${preset.base}px`,
            background: 'linear-gradient(to left, #4FACFE 0%, rgba(255, 255, 255, 0.9) 100%)',
          }}
        />

        {/* Secondary gradient circle */}
        <motion.div
          animate={
            isSyncing
              ? { scale: [1, 0.9, 1], opacity: [0.8, 0.6, 0.8] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="sync-circle relative z-10"
          style={{
            width: `${preset.mid}px`,
            height: `${preset.mid}px`,
            marginLeft: size === 'large' ? '-2px' : '-1px',
            background: 'linear-gradient(to right, #4FACFE 0%, rgba(255, 255, 255, 0.9) 100%)',
          }}
        />

        {/* Animated dots - all sizes */}
        {(size === 'large' || size === 'medium' || size === 'small') && (
          <div className="relative h-full ml-4 flex items-center">
            {preset.dots.map((dot, i) => (
              <motion.div
                key={i}
                className="absolute bg-[#4FACFE] rounded-full opacity-90"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  top: `calc(50% + ${dot.y}px - ${dot.size / 2}px)`,
                  left: `${dot.x}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncLogo;
