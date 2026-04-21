import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, Copy, X, Check } from 'lucide-react';

interface InspirationLibraryProps {
  cards: string[];
  onRemove: (index: number) => void;
  onClose: () => void;
}

const InspirationLibrary: React.FC<InspirationLibraryProps> = ({
  cards,
  onRemove,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md max-h-[80vh] bg-[#111] rounded-3xl border border-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#4FACFE]" />
            <h2 className="text-lg text-white tracking-wider">灵感库</h2>
            <span className="text-xs text-white/40">{cards.length} 张卡片</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 text-sm">暂无灵感卡片</p>
              <p className="text-white/20 text-xs mt-1">在灵感触发模式中记录你的想法</p>
            </div>
          ) : (
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={`${card}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#4FACFE]/30 transition-colors"
                >
                  <p className="text-white/80 text-sm leading-relaxed pr-16">{card}</p>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(card, index)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                      title="复制"
                    >
                      {copiedIndex === index ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={() => onRemove(index)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Date */}
                  <div className="absolute bottom-2 right-3 text-[10px] text-white/20">
                    #{cards.length - index}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InspirationLibrary;
