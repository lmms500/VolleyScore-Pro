import React, { useState } from 'react';
import { RefreshCcw, ArrowLeftRight, RotateCcw, Check, X, Settings, Maximize, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

interface ControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onSwap: () => void;
  onSettings: () => void;
  onFullscreen: () => void;
  onInstall: () => void;
  canInstall: boolean;
  canUndo: boolean;
  lang: Language;
  isLandscape: boolean;
  visible: boolean;
}

// Componente interno (lógica dos botões)
const ControlsComponent: React.FC<ControlsProps> = ({ 
    onUndo, 
    onReset, 
    onSwap, 
    onSettings, 
    onFullscreen,
    onInstall,
    canInstall,
    canUndo, 
    lang, 
    isLandscape,
    visible
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  // Estilo base dos botões (Dock Style)
  const btnClass = "relative flex items-center justify-center w-12 h-12 rounded-2xl text-slate-500 dark:text-slate-400 transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white";
  const iconSize = 22;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full z-40 px-4 pb-6 pt-2 relative bg-transparent shrink-0 flex justify-center pointer-events-none"
    >
      <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10 rounded-[2rem] p-1.5 flex items-center gap-1 pointer-events-auto ring-1 ring-black/5">
      
         {/* Trocar Lados */}
        <button onClick={onSwap} className={btnClass} aria-label="Swap Sides">
            <ArrowLeftRight size={iconSize} />
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-1 rounded-full"></div>

        {/* Lógica de Reset (com confirmação) */}
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
              aria-label="Reset Match"
            >
              <RefreshCcw size={iconSize} />
            </motion.button>
          ) : (
            <motion.div
              key="confirm-box"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-0.5 overflow-hidden"
            >
              <button 
                onClick={() => { onReset(); setConfirmReset(false); }}
                className="w-11 h-11 flex items-center justify-center bg-rose-500 text-white rounded-xl shadow-sm"
              >
                <Check size={18} strokeWidth={3} />
              </button>
              <button 
                onClick={() => setConfirmReset(false)}
                className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Desfazer */}
        <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`${btnClass} ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`}
            aria-label="Undo"
        >
            <RotateCcw size={iconSize} />
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-1 rounded-full"></div>

        {/* Instalar App (Só aparece se disponível) */}
        {canInstall && (
             <button 
                onClick={onInstall} 
                className={`${btnClass} text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20`}
                aria-label="Install App"
            >
                <Download size={iconSize} />
            </button>
        )}

        {/* Configurações */}
        <button onClick={onSettings} className={btnClass} aria-label="Settings">
            <Settings size={iconSize} />
        </button>
        
        {/* Tela Cheia */}
        <button onClick={onFullscreen} className={btnClass} aria-label="Fullscreen">
            <Maximize size={iconSize} />
        </button>

      </div>
    </motion.div>
  );
};

// Exportar memoizado para evitar re-renders desnecessários
export const Controls = React.memo(ControlsComponent);