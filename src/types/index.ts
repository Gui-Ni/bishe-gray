// ==========================================
// Core Types for 心跃 SYNC
// ==========================================

// Cabin modes for the interaction experience
export type CabinMode = 'idle' | 'pose-confirm' | 'recharge' | 'inspiration' | 'ending';

// Mobile app states
export type MobileState = 'home' | 'modeSelect' | 'activeInCabin' | 'result' | 'cardsView' | 'stats' | 'settings';

// Visual effect types
export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface EnergyBall {
  id: number;
  isConsumed: boolean;
  x: number;
  y: number;
  size: number;
}

export interface InspirationSpot {
  id: number;
  deg: number;
  size: number;
}

// Session result after completing a mode
export interface SessionResult {
  mode: CabinMode;
  percent: number;
  score: string;
  cards: number;
  timestamp: number;
}

// User profile for persistence
export interface UserProfile {
  totalSessions: number;
  totalTime: number;
  achievements: string[];
  achievementsUnlockedAt: Record<string, number>;
  streak: number;
  lastSession: number;
  totalCards: number;
  maxCompletion: number;
  inspirationCards: string[];
}

// Achievement definition
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile) => boolean;
  unlockedAt?: number;
}

// View type for navigation
export type ViewType = 'cabin' | 'mobile';

// SyncLogo component props
export interface SyncLogoProps {
  size?: 'large' | 'small';
  className?: string;
  isSyncing?: boolean;
}

// Background noise options
export interface BackgroundNoiseOptions {
  volume?: number;
  fadeDuration?: number;
  noiseType?: 'white' | 'pink' | 'brown';
}

// User settings
export interface Settings {
  noiseVolume: number;
  voiceFeedback: boolean;
  animationsEnabled: boolean;
  simplifiedMode: boolean;
  anonymousStats: boolean;
}

// Sound and theme types (shared with ConfigModal)
export type SoundType = 'none' | 'white' | 'rain' | 'forest' | 'ocean';
export type ThemeType = 'default' | 'ocean' | 'forest' | 'night' | 'aurora';
