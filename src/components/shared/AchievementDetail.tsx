import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Flame, Heart, Star, Clock, Hourglass, Crown, Check } from 'lucide-react';
import { Achievement } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={24} />,
  Zap: <Zap size={24} />,
  Flame: <Flame size={24} />,
  Heart: <Heart size={24} />,
  Star: <Star size={24} />,
  Clock: <Clock size={24} />,
  Hourglass: <Hourglass size={24} />,
  Crown: <Crown size={24} />,
  Cards: <Star size={24} />,
};

interface AchievementDetailProps {
  achievement: Achievement;
  unlockedAt?: number;
  onClose: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const AchievementDetail: React.FC<AchievementDetailProps> = ({ achievement, unlockedAt, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[280px] bg-[#1A1A1A] rounded-2xl border border-[#4FACFE]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with icon */}
        <div className="bg-gradient-to-br from-[#4FACFE]/20 to-transparent p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#4FACFE]/20 border border-[#4FACFE]/30 flex items-center justify-center text-[#4FACFE] mb-3">
            {ICON_MAP[achievement.icon] || <Sparkles size={24} />}
          </div>
          <h3 className="text-lg font-medium text-white">{achievement.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-[#4FACFE] text-xs">
            <Check size={12} />
            <span>已解锁</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-white/40 text-xs tracking-wider mb-1">成就描述</p>
            <p className="text-white/80 text-sm">{achievement.description}</p>
          </div>

          <div>
            <p className="text-white/40 text-xs tracking-wider mb-1">解锁日期</p>
            <p className="text-white/60 text-sm">{unlockedAt ? formatDate(unlockedAt) : '未记录'}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors mt-2"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementDetail;
