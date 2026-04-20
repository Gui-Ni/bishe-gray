import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Monitor } from 'lucide-react';
import { CabinUI } from './components/cabin';
import { MobileUI } from './components/mobile';
import { AchievementModal } from './components/shared';
import { useSession } from './contexts';
import { CabinMode, MobileState, SessionResult, ViewType, Achievement, SoundType, ThemeType } from './types';

// Theme gradients
const THEMES: Record<ThemeType, string> = {
  default: 'bg-[#111]',
  ocean: 'bg-gradient-to-br from-[#0a1628] to-[#1a3a5c]',
  forest: 'bg-gradient-to-br from-[#0a1f0a] to-[#1a3a1a]',
  night: 'bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e]',
  aurora: 'bg-gradient-to-br from-[#1a0a2e] to-[#2e1a4a]',
};

// ==========================================
// Main App - Thin orchestrator with Session
// ==========================================

export default function App() {
  // Session context
  const { addSessionResult, checkAndUnlockAchievements } = useSession();

  // Refs for session functions (to avoid dependency issues with React Compiler)
  const addSessionResultRef = useRef(addSessionResult);
  const checkAndUnlockAchievementsRef = useRef(checkAndUnlockAchievements);

  // Achievement modal state
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  // View state
  const [view, setView] = useState<ViewType>('mobile');

  // Cabin state
  const [cabinMode, setCabinMode] = useState<CabinMode>('idle');
  const [targetMode, setTargetMode] = useState<CabinMode | null>(null);

  // Mobile state
  const [mobileState, setMobileState] = useState<MobileState>('home');

  // Config modal state
  const [showConfig, setShowConfig] = useState(false);
  const [configMode, setConfigMode] = useState<CabinMode>('recharge');
  const [sessionConfig, setSessionConfig] = useState<{
    duration: number;
    sound: SoundType;
    theme: ThemeType;
  }>({ duration: 10, sound: 'none', theme: 'default' });

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Session state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  // Refs to avoid dependency issues
  const targetModeRef = useRef(targetMode);
  const generatedCardsRef = useRef(generatedCards);
  const timeElapsedRef = useRef(timeElapsed);
  const sessionConfigRef = useRef(sessionConfig);

  // Keep refs in sync
  useEffect(() => {
    targetModeRef.current = targetMode;
  }, [targetMode]);

  useEffect(() => {
    generatedCardsRef.current = generatedCards;
  }, [generatedCards]);

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  useEffect(() => {
    sessionConfigRef.current = sessionConfig;
  }, [sessionConfig]);

  // Keep session function refs in sync
  useEffect(() => {
    addSessionResultRef.current = addSessionResult;
  }, [addSessionResult]);

  useEffect(() => {
    checkAndUnlockAchievementsRef.current = checkAndUnlockAchievements;
  }, [checkAndUnlockAchievements]);

  // Timer for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cabinMode === 'recharge' || cabinMode === 'inspiration') {
      interval = setInterval(() => setTimeElapsed((p) => p + 1), 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [cabinMode]);

  // Auto-end session when time is up
  useEffect(() => {
    if ((cabinMode === 'recharge' || cabinMode === 'inspiration') && sessionConfig.duration > 0) {
      const maxTime = sessionConfig.duration * 60;
      if (timeElapsed >= maxTime) {
        endSession();
      }
    }
  }, [timeElapsed, cabinMode, sessionConfig.duration]);

  // Enter cabin with config modal
  const enterCabin = useCallback((mode: CabinMode) => {
    setConfigMode(mode);
    setShowConfig(true);
  }, []);

  // Start session after config
  const handleConfigStart = useCallback((config: { duration: number; sound: SoundType; theme: ThemeType }) => {
    setSessionConfig(config);
    setShowConfig(false);
    setIsTransitioning(true);
    setGeneratedCards([]);
    setTargetMode(configMode);
    setTimeout(() => {
      setView('cabin');
      setCabinMode('pose-confirm'); // First show pose confirmation
      setMobileState('activeInCabin');
    }, 1200);
    setTimeout(() => setIsTransitioning(false), 2200);
  }, [configMode]);

  // End session and show results - defined as regular function using refs
  const endSession = () => {
    const currentTargetMode = targetModeRef.current;
    const currentCards = generatedCardsRef.current;
    const currentTimeElapsed = timeElapsedRef.current;
    const currentConfig = sessionConfigRef.current;
    const maxTime = currentConfig.duration * 60;
    const percent = Math.min(Math.round((currentTimeElapsed / maxTime) * 100), 100);

    const result: SessionResult = {
      mode: currentTargetMode || 'recharge',
      percent: percent === 0 ? 1 : percent,
      score: (7.0 + Math.random() * 2).toFixed(1),
      cards: currentCards.length,
      timestamp: Date.now(),
    };

    setSessionResult(result);
    setView('cabin');
    setCabinMode('ending');

    // Save session result to history and profile
    addSessionResultRef.current(result);

    // Check for new achievements
    const newAchievements = checkAndUnlockAchievementsRef.current();
    if (newAchievements.length > 0) {
      setAchievementQueue((prev) => [...prev, ...newAchievements]);
    }

    setTimeout(() => {
      setCabinMode('idle');
      setTargetMode(null);
      setMobileState('result');
      setView('mobile');
    }, 8000);
  };

  // Add inspiration card
  const addCard = useCallback((text: string) => {
    setGeneratedCards((prev) => [...prev, text]);
  }, []);

  // Handle achievement modal close
  const handleAchievementClose = useCallback(() => {
    setShowAchievement(null);
  }, []);

  // Process achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !showAchievement) {
      const [next, ...rest] = achievementQueue;
      setShowAchievement(next);
      setAchievementQueue(rest);
    }
  }, [achievementQueue, showAchievement]);

  return (
    <div className={`min-h-screen ${THEMES[sessionConfig.theme]} text-white selection:bg-[#4FACFE]/30 flex flex-col font-sans`}>
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 px-2 h-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-full safe-top">
        <button
          onClick={() => setView('cabin')}
          className={`px-5 py-2.5 rounded-full transition-all duration-500 flex items-center justify-center gap-2 ${
            view === 'cabin'
              ? 'bg-[#4FACFE] text-white shadow-[0_0_20px_rgba(79,172,254,0.3)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Monitor size={16} />
          <span className="text-xs font-semibold tracking-wider">舱内端</span>
        </button>
        <button
          onClick={() => setView('mobile')}
          className={`px-5 py-2.5 rounded-full transition-all duration-500 flex items-center justify-center gap-2 ${
            view === 'mobile'
              ? 'bg-[#4FACFE] text-white shadow-[0_0_20px_rgba(79,172,254,0.3)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Smartphone size={16} />
          <span className="text-xs font-semibold tracking-wider">手机端</span>
        </button>
      </nav>

      {/* Main content with view switching */}
      <AnimatePresence mode="wait">
        {view === 'cabin' ? (
          <CabinUI
            key="cabin"
            cabinMode={cabinMode}
            setCabinMode={setCabinMode}
            targetMode={targetMode}
            addCard={addCard}
            timeElapsed={timeElapsed}
            endSession={endSession}
            sessionConfig={sessionConfig}
          />
        ) : (
          <MobileUI
            key="mobile"
            mobileState={mobileState}
            setMobileState={setMobileState}
            enterCabin={enterCabin}
            cabinMode={cabinMode}
            targetMode={targetMode}
            sessionResult={sessionResult}
            endSession={endSession}
            generatedCards={generatedCards}
            configMode={configMode}
            showConfig={showConfig}
            onConfigStart={handleConfigStart}
            onCloseConfig={() => setShowConfig(false)}
          />
        )}
      </AnimatePresence>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111] pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 30, opacity: 0 }}
              transition={{ duration: 2, ease: 'circIn' }}
              className="w-32 h-32 bg-[#4FACFE] rounded-full blur-[40px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement unlock modal */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementModal
            key={showAchievement.id}
            achievement={showAchievement}
            onClose={handleAchievementClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
