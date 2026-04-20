import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InspirationNotesProps {
  onSave: (note: string) => void;
}

export default function InspirationNotes({ onSave }: InspirationNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim());
      setNote('');
      setIsOpen(false);
    }
  };

  return (
    <div className="absolute bottom-[12%] left-[35%] z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 w-72 bg-[#111] rounded-xl p-4 border border-white/10"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录你的灵感..."
              className="w-full h-24 bg-white/5 rounded-lg p-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#4FACFE]/50"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg bg-[#4FACFE] text-white text-sm font-medium hover:bg-[#4FACFE]/90 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#4FACFE]/20 border border-[#4FACFE]/30 hover:bg-[#4FACFE]/30 shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform"
        title="灵感笔记"
      >
        📝
      </button>
    </div>
  );
}
