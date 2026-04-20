import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { SoundType, ThemeType } from '../../types';

interface ConfigModalProps {
  mode: 'recharge' | 'inspiration';
  isOpen: boolean;
  onStart: (config: { duration: number; sound: SoundType; theme: ThemeType }) => void;
  onCancel: () => void;
}

const SOUNDS: { value: SoundType; label: string; icon: string }[] = [
  { value: 'none', label: '静音', icon: '🔇' },
  { value: 'white', label: '白噪音', icon: '📻' },
  { value: 'rain', label: '雨声', icon: '🌧️' },
  { value: 'forest', label: '森林', icon: '🌲' },
  { value: 'ocean', label: '海浪', icon: '🌊' },
];

// Theme gradients (must match App.tsx and CabinUI.tsx)
const THEMES: { value: ThemeType; label: string; colors: string }[] = [
  { value: 'default', label: '默认', colors: 'from-[#111] to-[#1a1a1a]' },
  { value: 'ocean', label: '海洋', colors: 'from-[#0a1628] to-[#1a3a5c]' },
  { value: 'forest', label: '森林', colors: 'from-[#0a1f0a] to-[#1a3a1a]' },
  { value: 'night', label: '夜空', colors: 'from-[#0a0a1a] to-[#1a1a2e]' },
  { value: 'aurora', label: '极光', colors: 'from-[#1a0a2e] to-[#2e1a4a]' },
];

export default function ConfigModal({ mode, isOpen, onStart, onCancel }: ConfigModalProps) {
  const [duration, setDuration] = useState(mode === 'recharge' ? 10 : 12);
  const [sound, setSound] = useState<SoundType>('none');
  const [theme, setTheme] = useState<ThemeType>('default');

  const durations = mode === 'recharge' ? [5, 10, 15] : [8, 12, 20];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-sm w-full bg-[#111] rounded-2xl p-5 border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-white/50 text-xs hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                返回
              </button>
              <h2 className="text-lg font-medium text-white">
                {mode === 'recharge' ? '⚡ 精神充能' : '💫 灵感触发'}
              </h2>
              <div className="w-12" />
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-xs text-white/40 mb-2 tracking-wider">专注时长</label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      duration === d
                        ? 'bg-[#4FACFE] text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {d}min
                  </button>
                ))}
              </div>
            </div>

            {/* Sound */}
            <div className="mb-5">
              <label className="block text-xs text-white/40 mb-2 tracking-wider">背景音效</label>
              <div className="grid grid-cols-5 gap-1.5">
                {SOUNDS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSound(s.value)}
                    className={`py-2 rounded-lg text-center transition-all ${
                      sound === s.value
                        ? 'bg-[#4FACFE]/30 border border-[#4FACFE]'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="text-base mb-0.5">{s.icon}</div>
                    <div className="text-[10px] text-white/60">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-xs text-white/40 mb-2 tracking-wider">背景主题</label>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex-1 h-10 rounded-xl transition-all ${
                      theme === t.value ? 'ring-2 ring-white ring-offset-1 ring-offset-[#111]' : ''
                    } bg-gradient-to-br ${t.colors}`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStart({ duration, sound, theme })}
              className="w-full py-3 rounded-xl bg-[#4FACFE] text-white font-medium hover:bg-[#4FACFE]/90 transition-colors"
            >
              开始专注
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
