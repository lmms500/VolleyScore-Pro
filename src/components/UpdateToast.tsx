import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, CheckCircle } from 'lucide-react';
import { t } from '../constants';
import { Language, ThemeMode } from '../types';

interface UpdateToastProps {
  needsUpdate: boolean;
  onUpdate: () => void;
  lang: Language;
  themeMode: ThemeMode; // Adicionado para aceitar a prop
}

/**
 * Componente Toast para notificar o usuário sobre uma nova versão do PWA.
 */
export const UpdateToast: React.FC<UpdateToastProps> = ({ needsUpdate, onUpdate, lang, themeMode }) => {
  if (typeof window === 'undefined') return null;
  
  return (
    <AnimatePresence>
      {needsUpdate && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] p-3 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 shadow-2xl max-w-xs w-full"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white">
              <RefreshCcw size={20} className="text-indigo-400 animate-spin-slow" />
              <span className="text-sm font-semibold">{t(lang, 'updateAvailable')}</span>
            </div>
            <button
              onClick={onUpdate}
              className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors active:scale-95 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              {t(lang, 'reloadApp')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};