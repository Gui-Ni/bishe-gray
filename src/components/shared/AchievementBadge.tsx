import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Flame, Heart, Star, Clock, Hourglass, Crown } from 'lucide-react';
import { Achievement } from '../../types';

// Icon mapping
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
}

/**
 * Small achievement badge for display
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'small',
}) => {
  const isSmall = size === 'small';

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`
        rounded-full bg-[#1A1A1A] border border-[#4FACFE]/30
        flex items-center justify-center gap-1.5
        ${isSmall ? 'min-w-[32px] min-h-[32px] px-2 py-1' : 'px-3 py-1.5'}
      `}
      title={`${achievement.title}: ${achievement.description}`}
    >
      <span className="text-[#4FACFE] flex items-center justify-center">
        {ICON_MAP[achievement.icon] || <Sparkles size={14} />}
      </span>
      {!isSmall && (
        <span className="text-white/80 text-xs">{achievement.title}</span>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
