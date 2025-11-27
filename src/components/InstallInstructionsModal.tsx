import React from 'react';
import { motion } from 'framer-motion';
import { Share, Home, Check, X } from 'lucide-react';
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
    <div 
      className="
        fixed inset-0 z-[100] 
        flex items-end sm:items-center justify-center 
        bg-black/70 backdrop-blur-md 
        p-4
      "
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          w-full max-w-sm 
          bg-white/30 dark:bg-white/10 
          backdrop-blur-2xl 
          border border-white/40 dark:border-white/5 
          shadow-2xl shadow-black/40 
          rounded-3xl 
          overflow-hidden 
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="p-6 pb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white drop-shadow-sm">
              {t(lang, 'installApp')}
            </h2>

            <button
              onClick={onClose}
              className="
                p-2 rounded-full
                text-slate-500 hover:text-slate-900 
                dark:text-slate-400 dark:hover:text-white
                hover:bg-white/50 dark:hover:bg-white/10
                transition-colors
              "
            >
              <X size={22} />
            </button>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
            {t(lang, 'iosInstallIntro')}
          </p>
        </div>

        {/* STEPS */}
        <div className="px-6 pb-4 space-y-4">
          {[
            {
              icon: <Share size={20} />,
              bg: "bg-indigo-100 dark:bg-indigo-500/20",
              color: "text-indigo-600 dark:text-indigo-400",
              text: t(lang, 'installIosStep1')
            },
            {
              icon: <Home size={20} />,
              bg: "bg-rose-100 dark:bg-rose-500/20",
              color: "text-rose-600 dark:text-rose-400",
              text: t(lang, 'installIosStep2')
            },
            {
              icon: <Check size={20} />,
              bg: "bg-emerald-100 dark:bg-emerald-500/20",
              color: "text-emerald-600 dark:text-emerald-400",
              text: t(lang, 'tapConfirm')
            }
          ].map((step, i) => (
            <div
              key={i}
              className="
                flex items-center gap-4
                p-3 rounded-xl
                bg-white/60 dark:bg-white/5 
                border border-white/40 dark:border-white/5
                backdrop-blur-xl
                shadow-sm
              "
            >
              <div className={`p-2 rounded-full ${step.bg} ${step.color}`}>
                {step.icon}
              </div>

              <p className="font-semibold text-slate-900 dark:text-slate-200 text-[15px] leading-snug">
                {i + 1}. {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="
              w-full py-3 
              rounded-xl font-bold 
              bg-slate-900/10 dark:bg-white/10
              text-slate-800 dark:text-white 
              backdrop-blur-md
              border border-white/40 dark:border-white/10
              active:scale-95 
              transition-all
              hover:bg-slate-900/20 dark:hover:bg-white/20
            "
          >
            {t(lang, 'gotIt')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
