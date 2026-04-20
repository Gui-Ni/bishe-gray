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
  white: 'https://assets.mixkit.co/active_storage/sfx/2747/2747-preview.mp3',
  rain: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3',
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
  const [ballPositions, setBallPositions] = useState<Record<number, { x: number; y: number }>>({});
  const [draggingBall, setDraggingBall] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; ballX: number; ballY: number } | null>(null);
  const [randomSpots, setRandomSpots] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; angle: number; speed: number; size: number }[]>([]);
  const [, setRipples] = useState<Ripple[]>([]);
  const [recordFeedback, setRecordFeedback] = useState('');
  const rippleIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Ref to track current drag position for synchronous access in mouseup
  const currentDragPosRef = useRef<{ x: number; y: number } | null>(null);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Prevent touch scrolling when in fullscreen mode
    const handleTouchMove = (e: TouchEvent) => {
      if (document.fullscreenElement) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('touchmove', handleTouchMove);
    };
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

  // Custom touch handlers for energy ball dragging
  const handleBallTouchStart = useCallback((e: React.TouchEvent, ballId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    const pos = ballPositions[ballId];
    const ball = balls.find((b) => b.id === ballId);
    const ballX = pos?.x ?? ball?.x ?? 0;
    const ballY = pos?.y ?? ball?.y ?? 0;
    setDraggingBall(ballId);
    setDragStart({ x: touch.clientX, y: touch.clientY, ballX, ballY });
    currentDragPosRef.current = { x: ballX, y: ballY };
    // Initialize ball position if not already tracked
    if (!pos && ball) {
      setBallPositions((prev) => ({ ...prev, [ballId]: { x: ball.x, y: ball.y } }));
    }
  }, [ballPositions, balls]);

  const handleContainerTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingBall || !dragStart) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    const newX = dragStart.ballX + deltaX;
    const newY = dragStart.ballY + deltaY;

    // Larger constraints for more freedom of movement (±800px like old dragConstraints)
    const maxDrag = 800;
    const constrainedX = Math.max(-maxDrag, Math.min(maxDrag, newX));
    const constrainedY = Math.max(-maxDrag, Math.min(maxDrag, newY));

    currentDragPosRef.current = { x: constrainedX, y: constrainedY };
    setBallPositions((prev) => ({
      ...prev,
      [draggingBall]: { x: constrainedX, y: constrainedY },
    }));
  }, [draggingBall, dragStart]);

  const handleContainerTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!draggingBall) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = currentDragPosRef.current;
    if (pos) {
      // Ball position is relative to container center via CSS transform
      const dist = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
      if (dist < 200) {
        setBalls((prev) => prev.map((b) => (b.id === draggingBall ? { ...b, isConsumed: true } : b)));
        setPushProgress(100);
      }
    }
    currentDragPosRef.current = null;
    setDraggingBall(null);
    setDragStart(null);
  }, [draggingBall]);

  // Mouse event handlers for desktop testing
  const handleBallMouseDown = useCallback((e: React.MouseEvent, ballId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = ballPositions[ballId];
    const ball = balls.find((b) => b.id === ballId);
    const ballX = pos?.x ?? ball?.x ?? 0;
    const ballY = pos?.y ?? ball?.y ?? 0;
    setDraggingBall(ballId);
    setDragStart({ x: e.clientX, y: e.clientY, ballX, ballY });
    currentDragPosRef.current = { x: ballX, y: ballY };
    // Initialize ball position if not already tracked
    if (!pos && ball) {
      setBallPositions((prev) => ({ ...prev, [ballId]: { x: ball.x, y: ball.y } }));
    }
  }, [ballPositions, balls]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingBall || !dragStart) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const newX = dragStart.ballX + deltaX;
    const newY = dragStart.ballY + deltaY;

    // Larger constraints for more freedom of movement (±800px)
    const maxDrag = 800;
    const constrainedX = Math.max(-maxDrag, Math.min(maxDrag, newX));
    const constrainedY = Math.max(-maxDrag, Math.min(maxDrag, newY));

    setBallPositions((prev) => ({
      ...prev,
      [draggingBall]: { x: constrainedX, y: constrainedY },
    }));
  }, [draggingBall, dragStart]);

  const handleContainerMouseUp = useCallback((e: React.MouseEvent) => {
    if (!draggingBall) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = ballPositions[draggingBall];
    if (pos) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
      if (dist < 100) {
        setBalls((prev) => prev.map((b) => (b.id === draggingBall ? { ...b, isConsumed: true } : b)));
        setPushProgress(100);
      }
    }
    setDraggingBall(null);
    setDragStart(null);
  }, [draggingBall, ballPositions]);

  // Global mouse handlers for dragging -统一处理 collection 逻辑
  useEffect(() => {
    if (!draggingBall) return;

    const handleGlobalMouseUp = () => {
      // Use ref for synchronous access to current position
      const pos = currentDragPosRef.current;
      if (pos) {
        // Ball position is relative to container center via CSS transform
        const dist = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
        if (dist < 200) {
          setBalls((prev) => prev.map((b) => (b.id === draggingBall ? { ...b, isConsumed: true } : b)));
          setPushProgress(100);
        }
      }
      currentDragPosRef.current = null;
      setDraggingBall(null);
      setDragStart(null);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingBall || !dragStart) return;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const newX = dragStart.ballX + deltaX;
      const newY = dragStart.ballY + deltaY;

      const maxDrag = 800;
      const constrainedX = Math.max(-maxDrag, Math.min(maxDrag, newX));
      const constrainedY = Math.max(-maxDrag, Math.min(maxDrag, newY));

      // Update ref synchronously for use in mouseup
      currentDragPosRef.current = { x: constrainedX, y: constrainedY };
      setBallPositions((prev) => ({
        ...prev,
        [draggingBall]: { x: constrainedX, y: constrainedY },
      }));
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [draggingBall, dragStart, ballPositions]);

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
      const generateNewBalls = () => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const maxX = ((w - 64) / 2 - 60) * 0.8; // 80% of half frame width
        const frameHeight = h - 104;
        const topMargin = frameHeight * 0.1;
        const minY = -(h - 64) / 2 + 40 + topMargin; // 10% margin from top
        const maxY = -(frameHeight * 0.08); // keep away from center
        return [...Array(5)].map(() => ({
          id: Math.random(),
          isConsumed: false,
          x: (Math.random() - 0.5) * maxX * 2,
          y: minY + Math.random() * (maxY - minY),
          size: 0.6 + Math.random() * 0.6,
        }));
      };

      if (balls.length === 0) {
        setBalls(generateNewBalls());
      } else if (balls.every((b) => b.isConsumed)) {
        setTimeout(() => setBalls(generateNewBalls()), 1000);
      }
    } else {
      // Only clear if there are balls to clear (avoid unnecessary state updates)
      if (balls.length > 0) {
        setBalls([]);
        setBallPositions({});
        setPushProgress(0);
      }
    }
  }, [cabinMode, balls]);

  // Sync ball positions when balls are generated
  useEffect(() => {
    if (balls.length > 0) {
      const newPositions: Record<number, { x: number; y: number }> = {};
      balls.forEach((b) => {
        if (!ballPositions[b.id]) {
          newPositions[b.id] = { x: b.x, y: b.y };
        }
      });
      if (Object.keys(newPositions).length > 0) {
        setBallPositions((prev) => ({ ...prev, ...newPositions }));
      }
    }
  }, [balls.length]);

  // Inspiration spot generation - constrained within U-frame
  useEffect(() => {
    if (cabinMode === 'inspiration') {
      const generateSpots = () => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const maxX = ((w - 64) / 2 - 60) * 0.8;
        const frameHeight = h - 104;
        const topMargin = frameHeight * 0.1;
        const minY = -(h - 64) / 2 + 40 + topMargin;
        const maxY = -(frameHeight * 0.15); // 15% bottom margin, keep away from center
        setRandomSpots([
          { id: Math.random(), x: (Math.random() - 0.5) * maxX * 2, y: minY + Math.random() * (maxY - minY), size: 0.8 + Math.random() * 0.6 },
          { id: Math.random(), x: (Math.random() - 0.5) * maxX * 2, y: minY + Math.random() * (maxY - minY), size: 0.8 + Math.random() * 0.6 },
        ]);
      };
      generateSpots();

      const spotInterval = setInterval(() => {
        setRandomSpots((prev) => {
          if (prev.length > 3) return prev;
          const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const h = typeof window !== 'undefined' ? window.innerHeight : 800;
          const maxX = ((w - 64) / 2 - 60) * 0.8;
          const frameHeight = h - 104;
          const topMargin = frameHeight * 0.1;
          const minY = -(h - 64) / 2 + 40 + topMargin;
          const maxY = -(frameHeight * 0.15); // 15% bottom margin
          return [
            ...prev,
            {
              id: Math.random(),
              x: (Math.random() - 0.5) * maxX * 2,
              y: minY + Math.random() * (maxY - minY),
              size: 0.6 + Math.random() * 0.6,
            },
          ];
        });
      }, 4000);

      return () => clearInterval(spotInterval);
    } else {
      setRandomSpots([]);
      setBurstParticles([]);
    }
  }, [cabinMode]);

  const handleSpotClick = useCallback((e: React.MouseEvent | React.TouchEvent, id: number) => {
    if (cabinMode !== 'inspiration') return;

    // Get coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newRipple = { id: rippleIdRef.current++, x: clientX, y: clientY };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 2500);

    // Find the clicked spot position
    const spot = randomSpots.find((s) => s.id === id);
    if (spot) {
      // Generate burst particles from spot center
      const particleCount = 8;
      const newParticles = [...Array(particleCount)].map((_, i) => ({
        id: Math.random(),
        x: spot.x,
        y: spot.y,
        angle: (360 / particleCount) * i + Math.random() * 20 - 10,
        speed: 80 + Math.random() * 60,
        size: 0.6 + Math.random() * 0.4,
      }));
      setBurstParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setBurstParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 800);
    }

    setRandomSpots((prev) => prev.filter((s) => s.id !== id));
    setTimeout(
      () => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const maxX = ((w - 64) / 2 - 60) * 0.8;
        const frameHeight = h - 104;
        const topMargin = frameHeight * 0.1;
        const minY = -(h - 64) / 2 + 40 + topMargin;
        const maxY = -(frameHeight * 0.15); // 15% bottom margin
        setRandomSpots((prev) => [
          ...prev,
          { id: Math.random(), x: (Math.random() - 0.5) * maxX * 2, y: minY + Math.random() * (maxY - minY), size: 0.8 + Math.random() * 0.6 },
        ]);
      },
      500
    );
  }, [cabinMode, randomSpots]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden w-full select-none no-tap-highlight no-select"
      style={{ touchAction: 'none' }}
      onMouseDown={() => {
        if (cabinMode === 'pose-confirm') setIsPressing(true);
      }}
      onMouseUp={() => setIsPressing(false)}
      onMouseLeave={() => setIsPressing(false)}
      onTouchStart={(e) => {
        e.preventDefault();
        if (cabinMode === 'pose-confirm') setIsPressing(true);
      }}
      onTouchEnd={() => setIsPressing(false)}
      onTouchCancel={() => setIsPressing(false)}
    >
      {/* Monitor container - U-shaped monitor frame */}
      <div
        className="absolute inset-x-8 top-24 bottom-24 rounded-3xl overflow-hidden"
        style={{ zIndex: 10, position: 'absolute', touchAction: 'none' }}
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
                <SyncLogo size="large" isSyncing={true} className="mb-8 scale-75 pointer-events-none" />
                <p className="text-center text-[#333]/60 tracking-[0.4em] text-sm font-medium">
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
            <div
              className="absolute inset-0 flex items-center justify-center z-40"
            >
              {balls.map(
                (ball) =>
                  !ball.isConsumed && (
                    <div
                      key={ball.id}
                      className="w-12 h-12 rounded-full bg-[#4FACFE]/30 backdrop-blur-md border border-[#4FACFE]/50 cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(79,172,254,0.3)] flex items-center justify-center touch-none"
                      style={{
                        position: 'absolute',
                        transform: `translate(${(ballPositions[ball.id]?.x ?? ball.x)}px, ${(ballPositions[ball.id]?.y ?? ball.y)}px)`,
                      }}
                      onMouseDown={(e) => handleBallMouseDown(e, ball.id)}
                      onTouchStart={(e) => handleBallTouchStart(e, ball.id)}
                      onMouseMove={(e) => handleContainerMouseMove(e)}
                      onTouchMove={(e) => handleContainerTouchMove(e)}
                      onTouchEnd={(e) => handleContainerTouchEnd(e)}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5 + (ball.id % 2) * 0.2, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-[#4FACFE]/60 blur-[6px]"
                      />
                    </div>
                  )
              )}
              <div
                className="absolute w-32 h-32 rounded-full bg-[#4FACFE] blur-[30px] transition-all duration-75 pointer-events-none"
                style={{ opacity: (pushProgress / 100) * 0.8, transform: `scale(${0.5 + (pushProgress / 100) * 0.8})` }}
              />
            </div>
          )}

          {/* Inspiration: click spots - emission style */}
          {cabinMode === 'inspiration' && (
            <AnimatePresence>
              {randomSpots.map((spot) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: spot.size,
                    x: spot.x,
                    y: spot.y,
                  }}
                  exit={{ opacity: 0, scale: spot.size * 3, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute flex items-center justify-center pointer-events-none z-40"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '48px',
                    height: '48px',
                    marginLeft: '-24px',
                    marginTop: '-24px',
                  }}
                >
                  {/* Trail effect */}
                  <motion.div
                    initial={{ opacity: 0.6, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-8 h-8 rounded-full bg-white/20 blur-[8px]"
                  />
                  <div
                    className="w-full h-full rounded-full border border-white/40 bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:bg-white/30"
                    onMouseDown={(e) => handleSpotClick(e, spot.id)}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleSpotClick(e, spot.id);
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute w-4 h-4 bg-white rounded-full blur-[3px]"
                    />
                  </div>
                </motion.div>
              ))}

              {/* Burst particles */}
              {burstParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{
                    opacity: 1,
                    x: particle.x,
                    y: particle.y,
                    scale: particle.size,
                  }}
                  animate={{
                    opacity: 0,
                    x: particle.x + Math.cos((particle.angle * Math.PI) / 180) * particle.speed,
                    y: particle.y + Math.sin((particle.angle * Math.PI) / 180) * particle.speed,
                    scale: 0,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute w-3 h-3 rounded-full bg-white/80 pointer-events-none z-50"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-6px',
                    marginTop: '-6px',
                  }}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Voice control button - inside monitor, avoid U-cutout */}
          {(cabinMode === 'recharge' || cabinMode === 'inspiration') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleVoiceSuccess(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleVoiceSuccess(); }}
              className="absolute bottom-[12%] left-[5%] flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl transition-all z-40 hover:bg-white/10"
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
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); toggleFullscreen(); }}
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
