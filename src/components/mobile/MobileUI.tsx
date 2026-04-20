import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Power, BarChart3, Settings } from 'lucide-react';
import SyncLogo from '../shared/SyncLogo';
import StatsPanel from './StatsPanel';
import SettingsPanel from './SettingsPanel';
import {
  CabinMode,
  MobileState,
  SessionResult,
} from '../../types';

// Props interface
interface MobileUIProps {
  mobileState: MobileState;
  setMobileState: (s: MobileState) => void;
  enterCabin: (m: CabinMode) => void;
  cabinMode: CabinMode;
  targetMode: CabinMode | null;
  sessionResult: SessionResult | null;
  endSession: () => void;
  generatedCards: string[];
}

/**
 * Mobile UI - Phone interface for mode selection and results
 * Features: Home screen, mode selection, active session, results, card gallery
 */
const MobileUI: React.FC<MobileUIProps> = React.memo(({
  mobileState,
  setMobileState,
  enterCabin,
  cabinMode,
  targetMode,
  sessionResult,
  endSession,
  generatedCards,
}) => {
  // Render stats panel
  if (mobileState === 'stats') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center w-full"
      >
        <div className="relative w-[400px] h-[720px] max-h-[90vh] rounded-[48px] border-[10px] border-white/15 bg-[#0a0a0a] shadow-2xl overflow-hidden">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-50" />
          <div className="h-full pt-10 pb-6 px-4 flex flex-col items-center overflow-hidden">
            <StatsPanel onClose={() => setMobileState('home')} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Render settings panel
  if (mobileState === 'settings') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center w-full"
      >
        <div className="relative w-[400px] h-[720px] max-h-[90vh] rounded-[48px] border-[10px] border-white/15 bg-[#0a0a0a] shadow-2xl overflow-hidden">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-50" />
          <div className="h-full pt-10 pb-6 px-4 flex flex-col items-center overflow-hidden">
            <SettingsPanel onClose={() => setMobileState('home')} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center w-full"
    >
      {/* Phone frame container */}
      <div className="relative w-[400px] h-[720px] max-h-[90vh] rounded-[48px] border-[10px] border-white/15 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        {/* Phone notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-50" />

        {/* Content area */}
        <div className="h-full pt-10 pb-6 px-6 flex flex-col items-center overflow-hidden">
      {/* Home Screen */}
      {mobileState === 'home' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex flex-col items-center justify-center flex-1 overflow-hidden"
        >
          {/* Fluid blob background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="fluid-blob fluid-blob-1" />
            <div className="fluid-blob fluid-blob-2" />
          </div>

          {/* Animated logo - large size, properly positioned */}
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4 mt-2"
          >
            <SyncLogo size="large" className="scale-50" />
          </motion.div>

          {/* Title - larger, moved up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center mb-4 mt-[-10px]"
          >
            <h1 className="text-5xl font-bold tracking-[0.2em] sync-text-gradient mb-2" style={{ paddingLeft: '0.2em' }}>
              心跃
            </h1>
            <h2 className="text-3xl font-bold tracking-[0.3em] sync-text-gradient opacity-90" style={{ paddingLeft: '0.3em' }}>
              SYNC
            </h2>
          </motion.div>

          {/* Enter button - larger, moved up */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => setMobileState('modeSelect')}
            className="px-10 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-light tracking-[0.3em] hover:bg-white/10 transition-all mb-4 text-sm"
            style={{ paddingLeft: 'calc(2.5rem + 0.3em)' }}
          >
            进入系统
          </motion.button>

          {/* Quick actions - larger, moved up */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-6"
          >
            <button
              onClick={() => setMobileState('stats')}
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
            >
              <BarChart3 size={16} />
              <span className="tracking-widest">统计</span>
            </button>
            <button
              onClick={() => setMobileState('settings')}
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
            >
              <Settings size={16} />
              <span className="tracking-widest">设置</span>
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Mode Selection */}
      {mobileState === 'modeSelect' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col items-center overflow-y-auto hide-scrollbar py-4"
        >
          {/* Logo - large */}
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <SyncLogo size="large" className="scale-50" />
          </motion.div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-light tracking-[0.3em] text-white/90 mb-2" style={{ paddingLeft: '0.3em' }}>
              选择同步模式
            </h2>
            <div className="h-px w-12 bg-[#4FACFE]/50 mx-auto mt-2" />
          </div>

          {/* Mode cards - smaller */}
          <div className="w-full space-y-4">
            {/* Recharge mode */}
            <motion.button
              onClick={() => enterCabin('recharge')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mode-card w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 flex flex-col items-start gap-2 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-[#4FACFE]/10 flex items-center justify-center mb-1">
                <Zap size={18} className="text-[#4FACFE]" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-medium tracking-[0.2em] text-white mb-1" style={{ paddingLeft: '0.2em' }}>
                  精神充能
                </h3>
                <p className="text-white/40 text-[10px] tracking-widest font-light">
                  10min · 深度意识修复
                </p>
              </div>
            </motion.button>

            {/* Inspiration mode */}
            <motion.button
              onClick={() => enterCabin('inspiration')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mode-card w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 flex flex-col items-start gap-2 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-[#4FACFE]/10 flex items-center justify-center mb-1">
                <Sparkles size={18} className="text-[#4FACFE]" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-medium tracking-[0.2em] text-white mb-1" style={{ paddingLeft: '0.2em' }}>
                  灵感触发
                </h3>
                <p className="text-white/40 text-[10px] tracking-widest font-light">
                  12min · 创意频率同步
                </p>
              </div>
            </motion.button>
          </div>

          {/* Back button */}
          <button
            onClick={() => setMobileState('home')}
            className="mt-6 text-white/30 text-xs tracking-widest hover:text-white/50 transition-colors"
          >
            ← 返回
          </button>
        </motion.div>
      )}

      {/* Active Session */}
      {mobileState === 'activeInCabin' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 w-full h-full pb-12"
        >
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-40 h-40 bg-[#4FACFE] rounded-full blur-[40px]"
            />
            <SyncLogo size="large" className="scale-50" isSyncing={true} />
          </div>

          <h2 className="text-lg font-light tracking-[0.2em] text-white mb-2 shadow-black drop-shadow-lg" style={{ paddingLeft: '0.2em' }}>
            {cabinMode === 'pose-confirm' ? '等待姿态确认...' : '交互舱同步中'}
          </h2>

          <p
            className="text-[#4FACFE] text-xs tracking-[0.4em] font-medium uppercase mb-8"
            style={{ paddingLeft: '0.4em' }}
          >
            {targetMode === 'recharge' ? '精神充能模式' : '灵感触发模式'}
          </p>

          <button
            onClick={endSession}
            className="btn-press mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all text-xs tracking-widest min-w-[120px]"
          >
            <Power size={14} />
            <span>提前结束</span>
          </button>
        </motion.div>
      )}

      {/* Result Screen */}
      {mobileState === 'result' && sessionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center flex-1 pt-6 overflow-hidden"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-4 w-full flex justify-center"
          >
            <SyncLogo size="large" className="scale-50" />
          </motion.div>

          <h2 className="text-base text-white/90 tracking-[0.3em] font-light mb-4" style={{ paddingLeft: '0.3em' }}>
            祝您旅程愉快
          </h2>

          {/* Results card - smaller */}
          <div className="w-full bg-[#1A1A1A] rounded-2xl p-4 flex flex-col items-center gap-4 border border-white/5 shadow-2xl mb-4">
            <div className="text-center w-full">
              <p className="text-white/40 text-[10px] tracking-[0.2em] mb-1 uppercase" style={{ paddingLeft: '0.2em' }}>
                本次 MoodScore
              </p>
              <h3
                className="text-4xl font-semibold text-[#4FACFE] tracking-widest drop-shadow-[0_0_15px_rgba(79,172,254,0.4)]"
                style={{ paddingLeft: '0.1em' }}
              >
                {sessionResult.score}
              </h3>
            </div>

            <div className="w-full h-px bg-white/5 my-1" />

            <div className="w-full flex justify-between px-2">
              <div className="text-center flex-1 border-r border-white/5">
                <p className="text-white/40 text-[10px] tracking-widest mb-1">
                  {sessionResult.mode === 'recharge' ? '精神充能' : '灵感触发'}
                </p>
                <p className="text-white/90 font-medium tracking-wider text-sm">
                  +{sessionResult.percent}%
                </p>
              </div>
              <div className="text-center flex-1">
                <p className="text-white/40 text-[10px] tracking-widest mb-1">灵感记录</p>
                <p className="text-white/90 font-medium tracking-wider text-sm">
                  +{sessionResult.cards}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons - smaller */}
          <div className="flex w-full gap-3 mt-auto pb-6">
            <button
              onClick={() => setMobileState('home')}
              className="flex-1 py-3 rounded-xl border border-white/10 bg-[#111] text-white/60 tracking-widest hover:text-white hover:border-[#4FACFE]/30 transition-all text-xs font-light"
            >
              返回主页
            </button>
            <button
              onClick={() => setMobileState('cardsView')}
              className="flex-1 py-3 rounded-xl bg-[#4FACFE]/10 border border-[#4FACFE]/30 text-[#4FACFE] tracking-widest hover:bg-[#4FACFE]/20 transition-all text-xs font-light"
            >
              查看卡片
            </button>
          </div>
        </motion.div>
      )}

      {/* Cards View */}
      {mobileState === 'cardsView' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col gap-4 pt-6 flex-1 pb-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base tracking-[0.2em] font-light" style={{ paddingLeft: '0.2em' }}>
              记录的灵感
            </h2>
            <button
              onClick={() => setMobileState('result')}
              className="text-[#4FACFE] text-xs tracking-widest hover:text-white transition-colors"
            >
              ← 返回结算
            </button>
          </div>

          {/* Cards list - smaller */}
          <div className="space-y-3 overflow-y-auto hide-scrollbar flex-1">
            {generatedCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-pop p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#4FACFE]/10 blur-xl -mr-8 -mt-8" />
                <Sparkles size={14} className="text-[#4FACFE] mb-2 opacity-60" />
                <p className="italic text-white/80 leading-relaxed font-light text-xs">"{c}"</p>
              </motion.div>
            ))}
            {generatedCards.length === 0 && (
              <div className="p-6 text-center border border-white/5 rounded-xl bg-white/5 gentle-swing">
                <p className="text-white/20 tracking-widest text-xs">本次体验未记录任何灵感</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
        </div>
      </div>
    </motion.div>
  );
});

export default MobileUI;
