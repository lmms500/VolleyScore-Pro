import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Adicionei Plus e Minus aqui na lista de imports
import { Download, X, Smartphone, ChevronRight, ChevronLeft, Hand, Trophy, Zap, Plus, Minus } from 'lucide-react';
import { Language } from '../types';

interface WelcomeInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  lang: Language;
}

export const WelcomeInstallModal: React.FC<WelcomeInstallModalProps> = ({ 
  isOpen, 
  onClose, 
  onInstall, 
  lang 
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  // Componente visual da Mãozinha animada (definido aqui dentro para acessar no content)
  const HandGestureIcon = () => (
    <div className="relative w-12 h-12 flex items-center justify-center">
        <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
            <Hand size={48} className="text-white drop-shadow-md" />
        </motion.div>
        {/* Setas indicativas */}
        <motion.div 
            className="absolute -right-6 top-0 text-white/80"
            animate={{ opacity: [0, 1, 0], y: -5 }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
        >
            <Plus size={20} strokeWidth={4} />
        </motion.div>
        <motion.div 
            className="absolute -right-6 bottom-0 text-white/80"
            animate={{ opacity: [0, 1, 0], y: 5 }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        >
            <Minus size={20} strokeWidth={4} />
        </motion.div>
    </div>
  );

  const content = {
    pt: [
      {
        title: 'Bem-vindo ao VolleyScore',
        desc: 'O placar profissional, simples e bonito para seus jogos de vôlei.',
        icon: <Trophy size={48} className="text-yellow-500" />,
        color: 'from-yellow-400 to-orange-500'
      },
      {
        title: 'Como Usar',
        desc: 'Toque ou deslize para CIMA para adicionar ponto. Deslize para BAIXO para remover.',
        icon: <HandGestureIcon />,
        color: 'from-indigo-500 to-blue-500'
      },
      {
        title: 'Instalar Aplicativo',
        desc: 'Instale agora para ter tela cheia, sem distrações e funcionamento 100% offline.',
        icon: <Download size={48} className="text-white" />,
        color: 'from-emerald-500 to-teal-500',
        isInstallStep: true
      }
    ],
    en: [
      {
        title: 'Welcome to VolleyScore',
        desc: 'The professional, simple, and beautiful scoreboard for your volleyball games.',
        icon: <Trophy size={48} className="text-yellow-500" />,
        color: 'from-yellow-400 to-orange-500'
      },
      {
        title: 'How to Use',
        desc: 'Tap or swipe UP to add a point. Swipe DOWN to remove a point.',
        icon: <HandGestureIcon />,
        color: 'from-indigo-500 to-blue-500'
      },
      {
        title: 'Install App',
        desc: 'Install now for full-screen experience, zero distractions, and offline mode.',
        icon: <Download size={48} className="text-white" />,
        color: 'from-emerald-500 to-teal-500',
        isInstallStep: true
      }
    ]
  };

  const steps = content[lang];
  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-0 shadow-2xl relative overflow-hidden flex flex-col"
      >
        {/* Botão Fechar */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/5 dark:bg-white/10 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        {/* Área Visual (Topo) */}
        <div className={`relative h-48 bg-gradient-to-br ${currentStep.color} flex items-center justify-center`}>
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full shadow-lg border border-white/20">
                {currentStep.icon}
            </div>
            {/* Indicadores de Passo */}
            <div className="absolute bottom-4 flex gap-2">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 text-center flex-1 flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {currentStep.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {currentStep.desc}
                </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3">
                {currentStep.isInstallStep ? (
                    <button
                        onClick={onInstall}
                        className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        <Download size={20} />
                        <span>{lang === 'pt' ? 'Instalar Agora' : 'Install Now'}</span>
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        <span>{lang === 'pt' ? 'Próximo' : 'Next'}</span>
                        <ChevronRight size={20} />
                    </button>
                )}
                
                {step === 0 ? (
                    <button onClick={onClose} className="text-xs text-slate-400 font-semibold py-2">
                        {lang === 'pt' ? 'Pular Tutorial' : 'Skip Tutorial'}
                    </button>
                ) : (
                    <button onClick={handlePrev} className="text-xs text-slate-400 font-semibold py-2 flex items-center justify-center gap-1">
                        <ChevronLeft size={14} />
                        <span>{lang === 'pt' ? 'Voltar' : 'Back'}</span>
                    </button>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};