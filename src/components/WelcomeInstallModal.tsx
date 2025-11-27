import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, X, Check, Globe } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { t } from '../constants';

// Definindo o tipo para BeforeInstallPromptEvent
type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

interface WelcomeInstallModalProps {
  deferredPrompt: BeforeInstallPromptEvent | null; // CORRIGIDO: Tipagem explícita
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  onInstall: () => void;
  onShowIosInstructions: () => void;
  lang: Language;
}

export const WelcomeInstallModal: React.FC<WelcomeInstallModalProps> = ({
  deferredPrompt,
  isInstalled,
  isIOS,
  isStandalone,
  onInstall,
  onShowIosInstructions,
  lang,
}) => {
  // ... (Restante do código omitido para concisão, mas o arquivo está completo na base)
  
  const isOpen = !isInstalled && !isStandalone && (!!deferredPrompt || (isIOS && !localStorage.getItem('ios_pwa_instructed_modal_dismissed')));

  const handleDismiss = () => {
    if (isIOS) {
        localStorage.setItem('ios_pwa_instructed_modal_dismissed', 'true');
    }
  };

  if (!isOpen) return null;
  
  const isAndroid = !!deferredPrompt && !isIOS;
  const isIosSafari = isIOS && !isStandalone;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t(lang, 'installPWA')}
            </h2>
            <button 
                onClick={handleDismiss} 
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {isAndroid && t(lang, 'androidInstallIntro')}
            {isIosSafari && t(lang, 'iosInstallWelcome')}
          </p>

          {/* Botão de Ação */}
          <button
            onClick={isAndroid ? onInstall : onShowIosInstructions}
            className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 
              ${isAndroid ? 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'}
            `}
          >
            {isAndroid ? (
              <>
                <Download size={20} />
                {t(lang, 'installApp')}
              </>
            ) : (
              <>
                <Share size={20} />
                {t(lang, 'showInstructions')}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};