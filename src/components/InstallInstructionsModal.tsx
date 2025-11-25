import React from 'react';
import { motion } from 'framer-motion';
import { Share, PlusSquare, X } from 'lucide-react';
import { Language } from '../types';
import { t } from '../constants';

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative"
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
        >
            <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {lang === 'pt' ? 'Instalar no iPhone' : 'Install on iPhone'}
        </h3>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm">
            <p>{lang === 'pt' ? 'Para instalar este app, siga os passos:' : 'To install this app, follow these steps:'}</p>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Share size={24} className="text-blue-500" />
                <span>1. {lang === 'pt' ? 'Toque no botão Compartilhar' : 'Tap the Share button'}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <PlusSquare size={24} className="text-slate-900 dark:text-white" />
                <span>2. {lang === 'pt' ? 'Selecione "Adicionar à Tela de Início"' : 'Select "Add to Home Screen"'}</span>
            </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-400">
            VolleyScore Pro
        </div>
      </motion.div>
    </div>
  );
};