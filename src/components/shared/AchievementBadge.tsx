import React from 'react';
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

  return (
    <div
      onClick={onClick}
      className={`
        rounded-full border flex items-center justify-center gap-1.5 cursor-pointer
        ${isLocked
          ? 'bg-white/5 border-white/10 opacity-40 grayscale cursor-default'
          : 'bg-[#1A1A1A] border-[#4FACFE]/30 cursor-pointer'
        }
        ${isSmall ? 'min-w-[32px] min-h-[32px] px-2 py-1' : 'px-3 py-1.5'}
      `}
      title={isLocked ? '继续努力解锁' : achievement.description}
    >
      <span className={`flex items-center justify-center ${isLocked ? 'text-white/30' : 'text-[#4FACFE]'}`}>
        {isLocked ? <Lock size={12} /> : (ICON_MAP[achievement.icon] || <Sparkles size={14} />)}
      </span>
      {!isSmall && (
        <span className={`text-xs ${isLocked ? 'text-white/30' : 'text-white/80'}`}>
          {isLocked ? '???' : achievement.title}
        </span>
      )}
    </div>
  );
};

export default AchievementBadge;
