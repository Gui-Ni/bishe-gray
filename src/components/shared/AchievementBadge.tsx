import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Flame, Heart, Star, Clock, Hourglass, Crown, Lock } from 'lucide-react';
import { Achievement } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={14} />,
  Zap: <Zap size={14} />,
  Flame: <Flame size={14} />,
  Heart: <Heart size={14} />,
  Star: <Star size={14} />,
  Clock: <Clock size={14} />,
  Hourglass: <Hourglass size={14} />,
  Crown: <Crown size={14} />,
  Cards: <Star size={14} />,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium';
  isLocked?: boolean;
  onClick?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'small',
  isLocked = false,
  onClick,
}) => {
  const isSmall = size === 'small';
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.div
        whileHover={isLocked ? {} : { scale: 1.1 }}
        onClick={() => {
          if (onClick) onClick();
          else setShowTooltip(true);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          rounded-full border flex items-center justify-center gap-1.5 cursor-pointer
          ${isLocked
            ? 'bg-white/5 border-white/10 opacity-40 grayscale'
            : 'bg-[#1A1A1A] border-[#4FACFE]/30'
          }
          ${isSmall ? 'min-w-[32px] min-h-[32px] px-2 py-1' : 'px-3 py-1.5'}
        `}
        title={isLocked ? `${achievement.title} (未解锁)` : `${achievement.title}: ${achievement.description}`}
      >
        <span className={`flex items-center justify-center ${isLocked ? 'text-white/30' : 'text-[#4FACFE]'}`}>
          {isLocked ? <Lock size={12} /> : (ICON_MAP[achievement.icon] || <Sparkles size={14} />)}
        </span>
        {!isSmall && (
          <span className={`text-xs ${isLocked ? 'text-white/30' : 'text-white/80'}`}>
            {isLocked ? '???' : achievement.title}
          </span>
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg border
            ${isLocked
              ? 'bg-[#1A1A1A] border-white/10'
              : 'bg-[#1A1A1A] border-[#4FACFE]/30'
            }
            whitespace-nowrap z-50 pointer-events-none
          `}
        >
          <p className={`text-xs font-medium ${isLocked ? 'text-white/30' : 'text-white/80'}`}>
            {isLocked ? '???' : achievement.title}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            {isLocked ? '继续努力解锁' : achievement.description}
          </p>
          {isLocked && (
            <p className="text-[10px] text-[#4FACFE]/60 mt-1">未解锁</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AchievementBadge;
