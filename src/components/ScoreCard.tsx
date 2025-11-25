import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { TeamId, Language } from '../types';
import { THEME, t } from '../constants';
import { Zap, Plus, Minus, Volleyball } from 'lucide-react';

interface ScoreCardProps {
  teamId: TeamId;
  teamName?: string;
  score: number;
  opponentScore: number;
  setsWon: number;
  maxSets: number;
  setsToWinMatch: number;
  isWinner?: boolean;
  inSuddenDeath?: boolean;
  isServing: boolean;
  timeoutsUsed: number;
  onAdd: () => void;
  onSubtract: () => void;
  onToggleService: () => void;
  onUseTimeout: () => void;
  pointsToWinSet: number;
  lang: Language;
  isLandscape: boolean;
  isFullscreen?: boolean;
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  teamId, teamName, score, opponentScore, setsWon, maxSets, setsToWinMatch,
  isWinner, inSuddenDeath, isServing, timeoutsUsed,
  onAdd, onSubtract, onToggleService, onUseTimeout,
  pointsToWinSet, lang, isLandscape, isFullscreen, className
}) => {
  const theme = THEME[teamId];
  const y = useMotionValue(0);
  
  const prevScore = useRef(score);
  const direction = score > prevScore.current ? 1 : -1;

  useEffect(() => { prevScore.current = score; }, [score]);
  
  const isDragging = useRef(false);
  const dragThreshold = isLandscape ? 50 : 80;
  const feedbackDistance = isLandscape ? 50 : 80;

  const upOpacity = useTransform(y, [-20, -dragThreshold], [0, 1]);
  const upScale = useTransform(y, [-20, -dragThreshold], [0.8, 1.2]);
  const downOpacity = useTransform(y, [20, dragThreshold], [0, 1]);
  const downScale = useTransform(y, [20, dragThreshold], [0.8, 1.2]);

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const displayName = teamName && teamName.trim() !== '' ? teamName : t(lang, theme.nameKey as any);

  const isMatchPoint = setsWon === setsToWinMatch - 1 && score >= pointsToWinSet - 1 && score > opponentScore;
  const isSetPoint = !isMatchPoint && score >= pointsToWinSet - 1 && score > opponentScore;

  const scoreVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? 80 : -80, opacity: 0, scale: 0.9 }),
    center: { y: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? -80 : 80, opacity: 0, scale: 1.1, position: 'absolute' as const })
  };

  const getFontSize = () => {
    if (isFullscreen) return isLandscape ? 'text-[15rem] md:text-[20rem]' : 'text-[12rem] md:text-[16rem]';
    return isLandscape ? 'text-[6rem]' : 'text-[10rem] md:text-[14rem]';
  };

  return (
    <div className={`relative flex-1 h-full flex flex-col items-center justify-center p-2 transition-all duration-500 overflow-hidden ${theme.bgGradient} ${className || ''}`}>
      
      <AnimatePresence>
        {isServing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-radial from-${teamId === 'A' ? 'indigo' : 'rose'}-500/40 to-transparent blur-3xl`}
          />
        )}
      </AnimatePresence>
      
      {isWinner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/10 dark:bg-white/5 backdrop-blur-[1px] pointer-events-none z-0" />
      )}

      {/* Visual Feedback Icons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div style={{ opacity: upOpacity, scale: upScale, y: -feedbackDistance }} className="absolute w-16 h-16 rounded-full bg-emerald-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Plus size={32} strokeWidth={3} />
          </motion.div>
          <motion.div style={{ opacity: downOpacity, scale: downScale, y: feedbackDistance }} className="absolute w-16 h-16 rounded-full bg-rose-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
             <Minus size={32} strokeWidth={3} />
          </motion.div>
      </div>

      {/* TOP HEADER (Sets, Service) */}
      <div className={`absolute w-full px-4 md:px-6 flex items-start justify-between z-20 ${isFullscreen ? 'top-6' : 'top-2 md:top-4'}`}>
        <div className="flex flex-col gap-1">
             <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${theme.text}`}>Sets</span>
             <div className="flex gap-1.5">
                {Array.from({ length: setsToWinMatch }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-500 ${isLandscape ? 'w-2 h-2' : 'w-3 h-3'} ${i < setsWon ? `${theme.accentBg} shadow-lg scale-110` : 'bg-slate-300 dark:bg-slate-800'}`} />
                ))}
            </div>
        </div>
        <div className="flex flex-col items-end gap-2 md:gap-3">
             <button onClick={(e) => { e.stopPropagation(); triggerHaptic(); onToggleService(); }} className={`transition-all duration-300 p-2 rounded-xl backdrop-blur-sm border ${isServing ? theme.text + ' bg-white/80 dark:bg-white/10 border-' + (teamId === 'A' ? 'indigo' : 'rose') + '-500/30 shadow-lg' : 'text-slate-400 border-transparent hover:bg-black/5'}`}>
                <Volleyball size={isLandscape ? 16 : 20} />
            </button>
            <div className="flex gap-1.5">
                {[0, 1].map((i) => (
                    <button key={i} disabled={timeoutsUsed > i} onClick={(e) => { e.stopPropagation(); triggerHaptic([10, 10]); onUseTimeout(); }} className={`w-1.5 h-6 rounded-full transition-all ${i < timeoutsUsed ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : `${theme.accentBg} opacity-100 hover:scale-110 shadow-sm`}`} />
                ))}
            </div>
        </div>
      </div>

      {/* INTERACTION AREA */}
      <motion.div
        style={{ y }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center outline-none touch-action-none cursor-pointer pt-6 md:pt-0"
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.15}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={(e, { offset }) => {
            if (offset.y < -dragThreshold) { triggerHaptic(); onAdd(); } 
            else if (offset.y > dragThreshold) { triggerHaptic(); onSubtract(); }
            setTimeout(() => { isDragging.current = false; }, 100);
        }}
        onTap={() => { if (!isDragging.current) { triggerHaptic(); onAdd(); } }}
        whileTap={{ scale: 0.98 }}
      >
        {/* NOME DO TIME - Ajustado para descer (top-[15%]) */}
        <div 
            className={`
                flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all duration-300 z-30
                ${isServing ? 'bg-white/60 dark:bg-white/10 border-white/20 backdrop-blur-md shadow-lg shadow-black/5' : 'border-transparent'} 
                ${isLandscape 
                    ? 'absolute top-[15%] left-1/2 -translate-x-1/2' // Desce para 15% da altura
                    : 'mb-4 relative'
                }
            `}
        >
           {isServing && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`${theme.text}`}><Volleyball size={18} fill="currentColor" className="opacity-20" /></motion.div>}
           <span className={`font-bold tracking-wider uppercase ${theme.text} ${isFullscreen ? 'text-xl md:text-2xl' : (isLandscape ? 'text-sm' : 'text-lg md:text-xl')} truncate max-w-[250px] text-center`}>
             {displayName}
           </span>
        </div>
        
        {/* SCORE NUMBER - Ajustado para descer também (mt-[10%]) */}
        <div className={`relative w-full flex items-center justify-center ${isLandscape ? 'h-auto mt-[10%]' : 'h-48 md:h-64'}`}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={score}
                    custom={direction}
                    variants={scoreVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`leading-none font-black tabular-nums tracking-tighter ${theme.scoreColor} drop-shadow-2xl ${getFontSize()}`}
                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                >
                    {score}
                </motion.span>
            </AnimatePresence>
        </div>

        {/* BADGES */}
        <div className={`h-8 flex items-center justify-center gap-2 ${isLandscape ? 'mt-2' : 'mt-4'}`}>
            <AnimatePresence>
                {inSuddenDeath && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-full shadow-lg"><Zap size={12} fill="currentColor" /><span className="text-[10px] font-bold tracking-wider uppercase">{t(lang, 'firstTo3')}</span></motion.div>}
                {isMatchPoint && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-lg animate-pulse border border-rose-400"><span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'matchPoint')}</span></motion.div>}
                {isSetPoint && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="px-4 py-1.5 bg-indigo-600 text-white rounded-full shadow-lg border border-indigo-400"><span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'setPoint')}</span></motion.div>}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};