import React, { useState } from 'react';
import { ArrowLeftRight, RotateCcw, Check, X, Settings, Maximize, Users, Eraser, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, ThemeMode } from '../types';
import { t } from '../constants';

interface ControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onSwap: () => void;
  onSettings: () => void;
  onFullscreen: () => void;
  onOpenTeamManager: () => void;
  canUndo: boolean;
  lang: Language;
  themeMode: ThemeMode;
  isMatchOver: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
    onUndo, 
    onReset, 
    onSwap, 
    onSettings, 
    onFullscreen,
    onOpenTeamManager,
    canUndo, 
    lang,
}) => {

  const [confirmReset, setConfirmReset] = useState(false);

  // Botões limpos e com z-index correto
  const btnClass = `
    relative z-20 flex items-center justify-center 
    w-10 h-10 rounded-xl 
    bg-white/5 dark:bg-black/20 
    ring-1 ring-transparent hover:ring-white/10 
    
    text-slate-300 dark:text-slate-300 
    transition-all duration-200 active:scale-90 
    hover:bg-white/10 dark:hover:bg-white/10 
    hover:text-white dark:hover:text-white 
    hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/5
  `;

  const iconSize = 20;

  const handleReload = () => window.location.reload();

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full px-4 pb-8 pt-4 relative bg-transparent shrink-0 flex justify-center"
    >
      <div
        className="
          bg-black/20 dark:bg-slate-900/40 
          backdrop-blur-2xl 
          shadow-2xl shadow-black/40 
          rounded-2xl p-2 flex items-center gap-1 
          pointer-events-auto max-w-full overflow-x-auto no-scrollbar
          ring-1 ring-white/10 dark:ring-white/5 
          z-10
        "
      >

        {/* TEAM MANAGER */}
        <button
          onClick={onOpenTeamManager}
          className={btnClass}
          aria-label={t(lang, 'manageTeams')}
        >
          <Users size={iconSize} strokeWidth={2} />
        </button>

        {/* SWAP */}
        <button
          onClick={onSwap}
          className={btnClass}
          aria-label={t(lang, 'swap')}
        >
          <ArrowLeftRight size={iconSize} strokeWidth={2} />
        </button>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-500/50 dark:bg-white/10 mx-2 rounded-full" />

        {/* RESET */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!confirmReset ? (
              <motion.button
                key="reset-btn"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => setConfirmReset(true)}
                className={btnClass}
                aria-label={t(lang, 'reset')}
              >
                <Eraser size={iconSize} strokeWidth={2} />
              </motion.button>
            ) : (
              <motion.div
                key="confirm-box"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="
                  relative z-[9999] flex items-center gap-1 
                  bg-white/10 dark:bg-slate-800/50 
                  rounded-xl p-1 overflow-hidden 
                  ring-1 ring-white/50 dark:ring-black/20
                "
              >
                <button
                  onClick={() => {
                    onReset();
                    setConfirmReset(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 transition-colors"
                >
                  <Check size={16} strokeWidth={3} />
                </button>

                <button
                  onClick={() => setConfirmReset(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-200 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* UNDO */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={t(lang, 'undo')}
          className={`${btnClass} ${
            !canUndo ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <RotateCcw size={iconSize} strokeWidth={2} />
        </button>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-500/50 dark:bg-white/10 mx-2 rounded-full" />

        {/* SETTINGS */}
        <button onClick={onSettings} className={btnClass} aria-label={t(lang, 'config')}>
          <Settings size={iconSize} strokeWidth={2} />
        </button>

        {/* FULLSCREEN */}
        <button onClick={onFullscreen} className={btnClass} aria-label="Fullscreen">
          <Maximize size={iconSize} strokeWidth={2} />
        </button>

        {/* RELOAD */}
        <button onClick={handleReload} className={btnClass} aria-label={t(lang, 'reload')}>
          <RotateCw size={iconSize} strokeWidth={2} />
        </button>

      </div>
    </motion.div>
  );
};
