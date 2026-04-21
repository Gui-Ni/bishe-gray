import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, Trash2, Info } from 'lucide-react';
import { useSession } from '../../contexts';
import { useLocalStorage } from '../../hooks';
import { Settings } from '../../types';

interface SettingsPanelProps {
  onClose: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  noiseVolume: 50,
  voiceFeedback: true,
  anonymousStats: true,
};

/**
 * Settings panel for app configuration
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { resetAllData, clearHistory } = useSession();

  const [settings, setSettings] = useLocalStorage<Settings>('xinyue_settings', DEFAULT_SETTINGS);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
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
          设置
        </h2>
        <div className="w-12" />
      </div>

      {/* Sound settings */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Volume2 size={16} className="text-[#4FACFE]" />
          <span className="text-white/80 text-sm">声音设置</span>
        </div>

        {/* Noise volume */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/40 text-xs">背景音量</span>
            <span className="text-[#4FACFE] text-sm">{settings.noiseVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.noiseVolume}
            onChange={(e) => setSettings((s) => ({ ...s, noiseVolume: Number(e.target.value) }))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#4FACFE]"
          />
        </div>

        {/* Voice feedback */}
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-xs">语音反馈</span>
          <button
            onClick={() => setSettings((s) => ({ ...s, voiceFeedback: !s.voiceFeedback }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.voiceFeedback ? 'bg-[#4FACFE]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.voiceFeedback ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data settings */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 size={16} className="text-[#4FACFE]" />
          <span className="text-white/80 text-sm">数据管理</span>
        </div>

        <div className="space-y-3">
          {/* Clear history */}
          <button
            onClick={() => {
              if (confirm('确定要清除所有会话历史吗？此操作不可撤销。')) {
                clearHistory();
              }
            }}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            清除历史记录
          </button>

          {/* Reset all */}
          {showResetConfirm ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-xs mb-3 text-center">确定要重置所有数据吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 text-xs hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-lg bg-red-500/30 text-red-400 text-xs hover:bg-red-500/40 transition-colors"
                >
                  确认重置
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              重置所有数据
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Info size={16} className="text-[#4FACFE]" />
          <span className="text-white/80 text-sm">关于</span>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-xs mb-1">心跃 SYNC</p>
          <p className="text-[#4FACFE] text-lg font-light tracking-widest">AURA</p>
          <p className="text-white/20 text-[10px] mt-2">灵气多端系统 v1.0</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPanel;
