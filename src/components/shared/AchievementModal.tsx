import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Flame, Heart, Star, Clock, Hourglass, Crown } from 'lucide-react';
import { Achievement } from '../../types';

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={32} />,
  Zap: <Zap size={32} />,
  Flame: <Flame size={32} />,
  Heart: <Heart size={32} />,
  Star: <Star size={32} />,
  Clock: <Clock size={32} />,
  Hourglass: <Hourglass size={32} />,
  Crown: <Crown size={32} />,
  Cards: <Star size={32} />,
};

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
};

// Generate confetti data once
const CONFETTI_COLORS = ['#4FACFE', '#7CC2E8', '#FFD700', '#FF6B6B', '#4ECDC4'];
const generateConfetti = () =>
  [...Array(20)].map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[i % 5],
  }));

/**
 * Achievement unlock modal with animation
 */
const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const confettiData = useMemo(() => generateConfetti(), []);

  useEffect(() => {
    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {confettiData.map((c, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${c.left}%`,
                  backgroundColor: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Achievement card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#4FACFE]/30 rounded-3xl p-8 max-w-sm mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-[#4FACFE]/10 blur-xl" />

          {/* Content */}
          <div className="relative flex flex-col items-center text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4FACFE]/20 to-[#4FACFE]/5 flex items-center justify-center mb-6 border border-[#4FACFE]/30"
            >
              <div className="text-[#4FACFE]">
                {ICON_MAP[achievement.icon] || <Sparkles size={32} />}
              </div>
            </motion.div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#4FACFE] text-xs tracking-[0.3em] uppercase mb-2"
            >
              成就解锁
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-3"
            >
              {achievement.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/50 text-sm mb-6"
            >
              {achievement.description}
            </motion.p>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#4FACFE]/10 border border-[#4FACFE]/30 text-[#4FACFE] text-sm hover:bg-[#4FACFE]/20 transition-colors"
            >
              太棒了！
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementModal;
