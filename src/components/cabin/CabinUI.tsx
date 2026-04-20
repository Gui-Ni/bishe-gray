import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Check, Hand } from 'lucide-react';
import { useBackgroundNoise } from '../../hooks';
import SyncLogo from '../shared/SyncLogo';
import InspirationNotes from './InspirationNotes';
import {
  CabinMode,
  EnergyBall,
  Ripple,
  SoundType,
  ThemeType,
} from '../../types';

// Sound audio URLs
const SOUND_URLS: Record<SoundType, string> = {
  none: '',
  white: '',
  rain: 'https://assets.mixkit.co/active_storage/sfx/219/219-preview.mp3',
  forest: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3',
  ocean: 'https://assets.mixkit.co/active_storage/sfx/2411/2411-preview.mp3',
};

// Theme gradients (must match App.tsx and ConfigModal.tsx)
const THEMES: Record<ThemeType, string> = {
  default: '#0a0a1a',
  ocean: '#0a1628',
  forest: '#0a1f0a',
  night: '#0a0a1a',
  aurora: '#1a0a2e',
};

// Utility function outside component
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Inspiration quotes database
const INSPIRATION_DB = [
  '在静谧的深处，光总是会找到它的出口。',
  '每一次呼吸，都是与宇宙频率的重新校准。',
  '向内收束不是封闭，而是为了更有力量的绽放。',
  '打破原有的边界，让神经元以意想不到的方式连接。',
];

// Props interface
interface CabinUIProps {
  cabinMode: CabinMode;
  setCabinMode: (m: CabinMode) => void;
  targetMode: CabinMode | null;
  addCard: (t: string) => void;
  timeElapsed: number;
  endSession: () => void;
  sessionConfig: {
    duration: number;
    sound: SoundType;
    theme: ThemeType;
  };
}

/**
 * Cabin UI - The immersive interaction experience
 * Features: pose confirmation, energy ball recharge, inspiration triggering
 */
const CabinUI: React.FC<CabinUIProps> = React.memo(({
  cabinMode,
  setCabinMode,
  targetMode,
  addCard,
  timeElapsed,
  endSession,
  sessionConfig,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [pushProgress, setPushProgress] = useState(0);
  const [balls, setBalls] = useState<EnergyBall[]>([]);
  const [randomSpots, setRandomSpots] = useState<{ id: number; deg: number; size: number }[]>([]);
  const [, setRipples] = useState<Ripple[]>([]);
  const [recordFeedback, setRecordFeedback] = useState('');
  const rippleIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  // Audio playback for configured sound
  useEffect(() => {
    const isActive = cabinMode === 'recharge' || cabinMode === 'inspiration';
    const soundUrl = SOUND_URLS[sessionConfig.sound];

    if (!isActive || !soundUrl) {
      // Stop audio if not active or no sound selected
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Create and play audio
    audioRef.current = new Audio(soundUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch(console.error);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [cabinMode, sessionConfig.sound]);

  // Mount background noise generator (for white noise only)
  useBackgroundNoise(
    cabinMode === 'recharge' || cabinMode === 'inspiration',
    { noiseType: sessionConfig.sound === 'white' ? 'white' : 'brown' }
  );

  // Voice recognition logic - DISABLED for debugging
  // useEffect(() => {
  //   if (cabinMode === 'idle' || cabinMode === 'pose-confirm' || cabinMode === 'ending') return;
  //
  //   // @ts-ignore
  //   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //   if (!SpeechRecognition) {
  //     setRecordFeedback('浏览器不支持，请点击模拟');
  //     return;
  //   }
  //
  //   const recognition = new SpeechRecognition();
  //   recognition.continuous = true;
  //   recognition.lang = 'zh-CN';
  //   recognition.onstart = () => setIsListening(true);
  //   recognition.onresult = (event: any) => {
  //     const current = event.resultIndex;
  //     const transcript = event.results[current][0].transcript;
  //     if (transcript.includes('记录') || transcript.includes('灵感')) {
  //       handleVoiceSuccess();
  //     }
  //   };
  //   recognition.onerror = () => setIsListening(false);
  //   recognition.onend = () => {
  //     if (cabinMode === 'recharge' || cabinMode === 'inspiration') {
  //       recognition.start();
  //     }
  //   };
  //
  //   try {
  //     recognition.start();
  //   } catch (e) {
  //     // Already started
  //   }
  //
  //   return () => {
  //     recognition.stop();
  //     setIsListening(false);
  //   };
  // }, [cabinMode]);

  const handleVoiceSuccess = useCallback(() => {
    setRecordFeedback('已捕捉并存入卡片');
    addCard(INSPIRATION_DB[Math.floor(Math.random() * INSPIRATION_DB.length)]);
    setTimeout(() => setRecordFeedback(''), 3000);
  }, [addCard]);

  // Pose confirmation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cabinMode === 'pose-confirm') {
      if (isPressing) {
        interval = setInterval(() => {
          setConfirmProgress((p) => {
            if (p >= 100 && targetMode) {
              setCabinMode(targetMode);
              return 100;
            }
            return p + 2;
          });
        }, 30);
      } else {
        interval = setInterval(() => setConfirmProgress((p) => Math.max(p - 4, 0)), 30);
      }
    } else {
      setConfirmProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPressing, cabinMode, targetMode, setCabinMode]);

  const maxTime = sessionConfig.duration * 60;

  // Use ref to avoid dependency循环
  const endSessionRef = useRef(endSession);
  endSessionRef.current = endSession;

  useEffect(() => {
    // Guard: only allow endSession to fire once per session
    if (sessionEndedRef.current) return;

    if ((cabinMode === 'recharge' || cabinMode === 'inspiration') && timeElapsed >= maxTime) {
      sessionEndedRef.current = true;
      endSessionRef.current();
    }
  }, [timeElapsed, maxTime, cabinMode, sessionConfig]);

  // Guard flag to prevent double-firing of endSession
  const sessionEndedRef = useRef(false);

  // Reset guard when entering pose-confirm (new session starting)
  useEffect(() => {
    if (cabinMode === 'pose-confirm') {
      sessionEndedRef.current = false;
    }
  }, [cabinMode]);

  // Glow natural decay logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pushProgress > 0) {
      interval = setInterval(() => setPushProgress((p) => Math.max(p - 2, 0)), 40);
    }
    return () => clearInterval(interval);
  }, [pushProgress]);

  // Energy ball generation
  useEffect(() => {
    if (cabinMode === 'recharge') {
      const generateNewBalls = () =>
        [...Array(5)].map(() => ({
          id: Math.random(),
          isConsumed: false,
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 300 - 50,
          size: 0.6 + Math.random() * 0.6,
        }));

      if (balls.length === 0) {
        setBalls(generateNewBalls());
      } else if (balls.every((b) => b.isConsumed)) {
        setTimeout(() => setBalls(generateNewBalls()), 1000);
      }
    } else {
      // Only clear if there are balls to clear (avoid unnecessary state updates)
      if (balls.length > 0) {
        setBalls([]);
        setPushProgress(0);
      }
    }
  }, [cabinMode, balls]);

  // Inspiration spot generation - constrained within U-frame
  useEffect(() => {
    if (cabinMode === 'inspiration') {
      const generateSpots = () =>
        setRandomSpots([
          { id: Math.random(), deg: -35 + Math.random() * 25, size: 0.5 + Math.random() * 0.5 },
          { id: Math.random(), deg: 15 + Math.random() * 25, size: 0.5 + Math.random() * 0.5 },
        ]);
      generateSpots();

      const spotInterval = setInterval(() => {
        setRandomSpots((prev) => {
          if (prev.length > 3) return prev;
          return [
            ...prev,
            {
              id: Math.random(),
              deg: -45 + Math.random() * 90,
              size: 0.4 + Math.random() * 0.6,
            },
          ];
        });
      }, 4000);

      return () => clearInterval(spotInterval);
    }
  }, [cabinMode]);

  const handleSpotClick = useCallback((e: React.MouseEvent, id: number) => {
    if (cabinMode !== 'inspiration') return;
    const newRipple = { id: rippleIdRef.current++, x: e.clientX, y: e.clientY };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 2500);
    setRandomSpots((prev) => prev.filter((s) => s.id !== id));
    setTimeout(
      () =>
        setRandomSpots((prev) => [
          ...prev,
          { id: Math.random(), deg: -45 + Math.random() * 90, size: 0.6 + Math.random() * 0.8 },
        ]),
      500
    );
  }, [cabinMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden w-full"
      onMouseDown={() => {
        if (cabinMode === 'pose-confirm') setIsPressing(true);
      }}
      onMouseUp={() => setIsPressing(false)}
      onMouseLeave={() => setIsPressing(false)}
    >
      {/* Monitor container - U-shaped monitor frame */}
      <div
        className="absolute inset-x-8 top-16 bottom-24 rounded-3xl overflow-hidden"
        style={{ zIndex: 10, position: 'absolute' }}
      >
        {/* Background with curved bottom using CSS mask */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: THEMES[sessionConfig.theme],
            opacity: 0.95,
            borderRadius: '24px 24px 0 0',
            WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M 0 0 L 100 0 L 100 100 L 90 100 Q 50 75 10 100 L 0 100 Z' fill='black'/%3E%3C/svg%3E\")",
            maskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M 0 0 L 100 0 L 100 100 L 90 100 Q 50 75 10 100 L 0 100 Z' fill='black'/%3E%3C/svg%3E\")",
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
          }}
        />
        {/* Border overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '24px 24px 0 0',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15)',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[#4FACFE]/5 pointer-events-none" />

          {/* Ending overlay */}
          <AnimatePresence>
            {cabinMode === 'ending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-50 bg-white/90 backdrop-blur-2xl flex flex-col items-center justify-center rounded-xl"
              >
                <SyncLogo size="large" isSyncing={true} className="mb-8 scale-110 pointer-events-none" />
                <p className="text-[#333]/60 tracking-[0.4em] text-sm font-medium">
                  舱门将在 8s 后打开
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status overlays */}
          <AnimatePresence>
            {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none whitespace-nowrap"
              >
                <span className="text-white font-mono text-xl tracking-[0.2em] opacity-90">
                  进行中 ({formatTime(timeElapsed)})
                </span>
              </motion.div>
            )}
            {cabinMode === 'pose-confirm' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30 pointer-events-none whitespace-nowrap"
              >
                <span className="text-white/80 font-light text-lg tracking-[0.4em]">
                  请将双手放置于引导区确认姿态
                </span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4FACFE] transition-all duration-75" style={{ width: `${confirmProgress}%` }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <SyncLogo className="scale-[0.6]" isSyncing={pushProgress > 20 || cabinMode === 'inspiration'} />
          </div>

          {/* Idle waiting message */}
          <AnimatePresence>
            {cabinMode === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-[32%] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 whitespace-nowrap pointer-events-none"
              >
                <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
                  <span className="text-white/30 text-xs tracking-[0.5em] font-light">
                    等待手机端唤醒
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pose confirmation hands - inside monitor */}
          {cabinMode === 'pose-confirm' && (
            <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 flex items-center gap-48 z-40">
              <div className={`relative transition-all duration-300 ${isPressing ? 'scale-90 opacity-100' : 'scale-100 opacity-60'}`}>
                <Hand size={64} className="text-[#4FACFE] -rotate-12" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#4FACFE] blur-2xl rounded-full"
                />
              </div>
              <div className={`relative transition-all duration-300 ${isPressing ? 'scale-90 opacity-100' : 'scale-100 opacity-60'}`}>
                <Hand size={64} className="text-[#4FACFE] rotate-12" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#4FACFE] blur-2xl rounded-full"
                />
              </div>
            </div>
          )}

          {/* Recharge: drag energy balls - inside monitor */}
          {cabinMode === 'recharge' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              {balls.map(
                (ball) =>
                  !ball.isConsumed && (
                    <motion.div
                      key={ball.id}
                      drag
                      dragConstraints={{ left: -180, right: 180, top: -150, bottom: 150 }}
                      dragMomentum={false}
                      onDragEnd={(_, info) => {
                        // Get the center of the container (where the logo is)
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 2;
                        const dist = Math.sqrt(Math.pow(info.point.x - centerX, 2) + Math.pow(info.point.y - centerY, 2));
                        if (dist < 100) {
                          setBalls((prev) => prev.map((b) => (b.id === ball.id ? { ...b, isConsumed: true } : b)));
                          setPushProgress(100);
                        }
                      }}
                      initial={{ scale: 0, opacity: 0, x: ball.x, y: ball.y }}
                      animate={{ scale: ball.isConsumed ? 0 : ball.size, opacity: ball.isConsumed ? 0 : 1 }}
                      transition={{ duration: ball.isConsumed ? 0.3 : 0.8, ease: ball.isConsumed ? 'backIn' : 'easeOut' }}
                      className="w-12 h-12 rounded-full bg-[#4FACFE]/30 backdrop-blur-md border border-[#4FACFE]/50 cursor-grab active:cursor-grabbing pointer-events-auto shadow-[0_0_20px_rgba(79,172,254,0.3)] flex items-center justify-center"
                      style={{ position: 'absolute' }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5 + (ball.id % 2) * 0.2, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-[#4FACFE]/60 blur-[6px]"
                      />
                    </motion.div>
                  )
              )}
              <div
                className="absolute w-32 h-32 rounded-full bg-[#4FACFE] blur-[30px] transition-all duration-75 pointer-events-none"
                style={{ opacity: (pushProgress / 100) * 0.8, transform: `scale(${0.5 + (pushProgress / 100) * 0.8})` }}
              />
            </div>
          )}

          {/* Inspiration: click spots - inside monitor, constrained */}
          {cabinMode === 'inspiration' && (
            <AnimatePresence>
              {randomSpots.map((spot) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: spot.size }}
                  exit={{ opacity: 0, scale: spot.size * 3, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute w-full h-full flex items-start justify-center pointer-events-none z-40"
                  style={{ rotate: `${spot.deg}deg` }}
                >
                  <div
                    className="w-12 h-12 -mt-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    onMouseDown={(e) => handleSpotClick(e, spot.id)}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.5 + spot.size, repeat: Infinity }}
                      className="absolute w-3 h-3 bg-white rounded-full blur-[2px]"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Voice control button - inside monitor, avoid U-cutout */}
          {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleVoiceSuccess(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-[12%] left-[2%] flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-all z-40 hover:bg-white/10"
            >
              {recordFeedback ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-[#4FACFE]">
                  <Check size={14} />
                  <span className="text-xs tracking-widest">{recordFeedback}</span>
                </motion.div>
              ) : (
                <>
                  <Mic size={14} className="text-white/50" />
                  <span className="text-xs text-white/50 tracking-widest">说出"灵感记录"</span>
                </>
              )}
            </button>
          )}

          {/* Fullscreen button - inside monitor, avoid U-cutout */}
          {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="absolute bottom-[12%] right-[5%] w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-all z-40 hover:bg-white/10 flex items-center justify-center"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              <span className="text-white/50 text-sm">{isFullscreen ? '⊠' : '⛶'}</span>
            </button>
          )}

          {/* Inspiration notes floating button - inside monitor, avoid overlap */}
          {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
            <InspirationNotes onSave={addCard} />
          )}
        </div>
    </motion.div>
  );
});

export default CabinUI;
