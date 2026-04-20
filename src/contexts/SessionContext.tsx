import React, { createContext, useContext, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks';
import {
  SessionResult,
  UserProfile,
  Achievement,
} from '../types';

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  totalSessions: 0,
  totalTime: 0,
  favoriteMode: null,
  achievements: [],
  streak: 0,
  lastSession: 0,
  totalCards: 0,
  maxCompletion: 0,
};

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'xinyue_profile',
  HISTORY: 'xinyue_history',
  SETTINGS: 'xinyue_settings',
} as const;

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sync',
    title: '初次同步',
    description: '完成你的第一次心跃体验',
    icon: 'Sparkles',
    condition: (p) => p.totalSessions >= 1,
  },
  {
    id: 'recharge_master',
    title: '充能大师',
    description: '累计完成10次精神充能',
    icon: 'Zap',
    condition: (p) => p.totalSessions >= 10,
  },
  {
    id: 'inspiration_seeker',
    title: '灵感探索者',
    description: '累计完成10次灵感触发',
    icon: 'Sparkles',
    condition: (p) => p.totalSessions >= 10,
  },
  {
    id: 'streak_3',
    title: '三日连跃',
    description: '连续3天使用心跃',
    icon: 'Flame',
    condition: (p) => p.streak >= 3,
  },
  {
    id: 'streak_7',
    title: '一周同心',
    description: '连续7天使用心跃',
    icon: 'Heart',
    condition: (p) => p.streak >= 7,
  },
  {
    id: 'card_collector_5',
    title: '灵感初录',
    description: '收集5张灵感卡片',
    icon: 'Cards',
    condition: (p) => p.totalCards >= 5,
  },
  {
    id: 'card_collector_20',
    title: '灵感收藏家',
    description: '收集20张灵感卡片',
    icon: 'Star',
    condition: (p) => p.totalCards >= 20,
  },
  {
    id: 'deep_sync',
    title: '深度同步',
    description: '单次体验完成度超过80%',
    icon: 'Heart',
    condition: (p) => p.maxCompletion >= 80,
  },
  {
    id: 'deep_sync_100',
    title: '完美同步',
    description: '单次体验完成度达到100%',
    icon: 'Crown',
    condition: (p) => p.maxCompletion >= 100,
  },
  {
    id: 'time_investor_60',
    title: '时间投资者',
    description: '累计体验时间超过60分钟',
    icon: 'Clock',
    condition: (p) => p.totalTime >= 3600,
  },
  {
    id: 'time_investor_300',
    title: '深度投入',
    description: '累计体验时间超过300分钟',
    icon: 'Hourglass',
    condition: (p) => p.totalTime >= 18000,
  },
];

// Context interface
interface SessionContextValue {
  // User profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Session history
  sessionHistory: SessionResult[];
  addSessionResult: (result: SessionResult) => void;
  clearHistory: () => void;

  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  checkAndUnlockAchievements: () => Achievement[];

  // Utility
  resetAllData: () => void;
}

// Create context
const SessionContext = createContext<SessionContextValue | null>(null);

// Provider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Persisted state
  const [profile, setProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.PROFILE,
    DEFAULT_PROFILE
  );
  const [sessionHistory, setSessionHistory] = useLocalStorage<SessionResult[]>(
    STORAGE_KEYS.HISTORY,
    []
  );

  // Use ref to avoid closure issues with profile
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Update profile with partial updates - use functional update to avoid needing profile in deps
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // Add session result and update profile - use refs to avoid dependency on profile
  const addSessionResult = useCallback((result: SessionResult) => {
    // Add to history
    setSessionHistory((prev) => [result, ...prev].slice(0, 100));

    // Use ref to get current profile values
    const currentProfile = profileRef.current;

    // Calculate streak
    const now = Date.now();
    const lastSession = currentProfile.lastSession;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysSinceLastSession = lastSession ? Math.floor((now - lastSession) / oneDayMs) : 0;

    const newStreak = daysSinceLastSession === 1 ? currentProfile.streak + 1 :
                      daysSinceLastSession === 0 ? currentProfile.streak : 1;

    // Update favorite mode
    const newTotalSessions = currentProfile.totalSessions + 1;
    const newFavoriteMode = currentProfile.favoriteMode ||
      (newTotalSessions === 1 ? result.mode : currentProfile.favoriteMode);

    // Update max completion
    const newMaxCompletion = Math.max(currentProfile.maxCompletion, result.percent);

    // Update profile
    setProfile((prev) => ({
      ...prev,
      totalSessions: newTotalSessions,
      totalTime: prev.totalTime + (result.mode === 'recharge' ? 600 : 720) * (result.percent / 100),
      favoriteMode: newFavoriteMode,
      totalCards: prev.totalCards + result.cards,
      maxCompletion: newMaxCompletion,
      streak: newStreak,
      lastSession: now,
    }));
  }, []);

  // Clear session history
  const clearHistory = useCallback(() => {
    setSessionHistory([]);
  }, []);

  // Check and unlock achievements - use ref to avoid dependency on profile
  const checkAndUnlockAchievements = useCallback(() => {
    const currentProfile = profileRef.current;
    const newlyUnlocked: Achievement[] = [];
    const achievementsToUnlock: string[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      // Skip if already unlocked
      if (currentProfile.achievements.includes(achievement.id)) return;

      // Check condition
      if (achievement.condition(currentProfile)) {
        newlyUnlocked.push(achievement);
        achievementsToUnlock.push(achievement.id);
      }
    });

    // Batch update all achievements at once
    if (achievementsToUnlock.length > 0) {
      setProfile((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...achievementsToUnlock],
      }));
    }

    return newlyUnlocked;
  }, []);

  // Get unlocked achievements with unlock timestamp
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => profile.achievements.includes(a.id));
  }, [profile.achievements]);

  // Reset all data
  const resetAllData = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setSessionHistory([]);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<SessionContextValue>(() => ({
    profile,
    updateProfile,
    sessionHistory,
    addSessionResult,
    clearHistory,
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    checkAndUnlockAchievements,
    resetAllData,
  }), [profile, updateProfile, sessionHistory, addSessionResult, clearHistory, unlockedAchievements, checkAndUnlockAchievements, resetAllData]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use session context
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
