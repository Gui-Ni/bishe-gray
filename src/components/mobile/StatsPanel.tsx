import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Sparkles, Target, ChevronRight } from 'lucide-react';
import { useSession } from '../../contexts';
import { Achievement } from '../../types';
import AchievementBadge from '../shared/AchievementBadge';
import AchievementDetail from '../shared/AchievementDetail';
import InspirationLibrary from '../shared/InspirationLibrary';

type Period = 'day' | 'week' | 'month';

interface StatsPanelProps {
  onClose: () => void;
}

/**
 * Statistics panel showing user progress and history
 */
const StatsPanel: React.FC<StatsPanelProps> = ({ onClose }) => {
  const { profile, sessionHistory, achievements, unlockedAchievements, inspirationCards, removeInspirationCard } = useSession();
  const [period, setPeriod] = useState<Period>('day');
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showInspirationLibrary, setShowInspirationLibrary] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Filter sessions by period
  const getFilteredSessions = () => {
    const now = new Date();
    return sessionHistory.filter(s => {
      const date = new Date(s.timestamp);
      if (period === 'day') {
        return date.toDateString() === now.toDateString();
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      }
    });
  };

  const filteredSessions = getFilteredSessions();

  // Calculate stats
  const totalTimeMinutes = Math.round(profile.totalTime / 60);
  const recentSessions = sessionHistory.slice(0, 7);
  const avgCompletion = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((sum, s) => sum + s.percent, 0) / recentSessions.length)
    : 0;

  // Calculate period stats
  const periodTimeSeconds = filteredSessions.reduce((sum, s) => {
    const duration = s.mode === 'recharge' ? 600 : 720;
    return sum + Math.round(duration * (s.percent / 100));
  }, 0);
  const periodSessions = filteredSessions.length;

  // Calculate streak
  const getStreakDays = () => {
    if (sessionHistory.length === 0) return 0;
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const sessionDates = new Set(
      sessionHistory.map(s => new Date(s.timestamp).toDateString())
    );
    while (sessionDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  // Calculate mode distribution
  const getModeDistribution = () => {
    const total = filteredSessions.length;
    if (total === 0) return { recharge: 0, inspiration: 0 };
    const recharge = filteredSessions.filter(s => s.mode === 'recharge').length;
    const inspiration = filteredSessions.filter(s => s.mode === 'inspiration').length;
    return {
      recharge: Math.round((recharge / total) * 100),
      inspiration: Math.round((inspiration / total) * 100),
    };
  };

  const distribution = getModeDistribution();

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full mx-auto flex flex-col gap-4 flex-1 overflow-y-auto hide-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#4FACFE] text-xs tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          返回
        </button>
        <h2 className="text-xl tracking-[0.2em] font-light" style={{ paddingLeft: '0.2em' }}>
          数据统计
        </h2>
        <div className="w-12" />
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              period === p
                ? 'bg-[#4FACFE] text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {p === 'day' ? '今日' : p === 'week' ? '本周' : '本月'}
          </button>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{formatTime(periodTimeSeconds)}</div>
          <div className="text-white/40 text-[10px] tracking-wider mt-1">周期专注时长</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{getStreakDays()}</div>
          <div className="text-white/40 text-[10px] tracking-wider mt-1">连续天数 🔥</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{periodSessions}</div>
          <div className="text-white/40 text-[10px] tracking-wider mt-1">专注次数</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{avgCompletion}%</div>
          <div className="text-white/40 text-[10px] tracking-wider mt-1">平均完成</div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-[#4FACFE]" />
            <span className="text-white/40 text-[10px] tracking-widest">总次数</span>
          </div>
          <p className="text-2xl font-semibold text-white">{profile.totalSessions}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-[#4FACFE]" />
            <span className="text-white/40 text-[10px] tracking-widest">总时长</span>
          </div>
          <p className="text-2xl font-semibold text-white">{totalTimeMinutes}分钟</p>
        </div>
      </div>

      {/* Mode Distribution */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm text-white/60 tracking-widest mb-4">模式分布</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#4FACFE]/20 to-transparent rounded-xl p-3 text-center">
            <div className="text-xl mb-1">⚡</div>
            <div className="text-xl font-bold text-white">{distribution.recharge}%</div>
            <div className="text-white/40 text-[10px]">精神充能</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-transparent rounded-xl p-3 text-center">
            <div className="text-xl mb-1">💫</div>
            <div className="text-xl font-bold text-white">{distribution.inspiration}%</div>
            <div className="text-white/40 text-[10px]">灵感触发</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-white/60 tracking-widest">成就进度</h3>
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="text-[#4FACFE] text-xs hover:text-white transition-colors"
          >
            {showAllAchievements ? '收起' : '查看全部'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#4FACFE]/10 border border-[#4FACFE]/30 flex items-center justify-center">
            <span className="text-xl font-bold text-[#4FACFE]">{unlockedAchievements.length}</span>
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm">已解锁 {unlockedAchievements.length}/{achievements.length} 个成就</p>
            <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4FACFE] rounded-full transition-all"
                style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievement badges */}
        {showAllAchievements ? (
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((a) => (
              <AchievementBadge
                key={a.id}
                achievement={a}
                size="small"
                isLocked={!profile.achievements.includes(a.id)}
                onClick={profile.achievements.includes(a.id) ? () => setSelectedAchievement(a) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {unlockedAchievements.slice(0, 5).map((a) => (
              <AchievementBadge key={a.id} achievement={a} size="small" onClick={() => setSelectedAchievement(a)} />
            ))}
            {unlockedAchievements.length === 0 && (
              <p className="text-white/30 text-xs w-full text-center py-2">暂无成就，继续努力！</p>
            )}
          </div>
        )}
      </div>

      {/* Total cards collected */}
      <button
        onClick={() => setShowInspirationLibrary(true)}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:border-[#4FACFE]/30 transition-colors active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-[#4FACFE]" />
            <span className="text-white/60 text-xs tracking-widest">灵感卡片</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{profile.totalCards}</span>
            <ChevronRight size={18} className="text-white/30" />
          </div>
        </div>
        <p className="text-white/30 text-xs mt-2">
          {inspirationCards.length > 0 ? '点击查看全部' : '点击查看'}
        </p>
      </button>

      <AnimatePresence>
        {showInspirationLibrary && (
          <InspirationLibrary
            cards={inspirationCards}
            onRemove={removeInspirationCard}
            onClose={() => setShowInspirationLibrary(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAchievement && (
          <AchievementDetail
            achievement={selectedAchievement}
            unlockedAt={profile.achievementsUnlockedAt[selectedAchievement.id]}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatsPanel;
