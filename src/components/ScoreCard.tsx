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

const ScoreCardComponent: React.FC<ScoreCardProps> = ({
  teamId, teamName, score, opponentScore, setsWon, maxSets, setsToWinMatch,
  isWinner, inSuddenDeath, isServing, timeoutsUsed,
  onAdd, onSubtract, onToggleService, onUseTimeout,
  pointsToWinSet, lang, isLandscape, isFullscreen, className
}) => {
  const theme = THEME[teamId];
  const y = useMotionValue(0);
  
  const prevScore = useRef(score);
  // Mantemos a direção apenas para lógica interna, mas suavizaremos a animação visual
  const direction = score > prevScore.current ? 1 : -1;

  useEffect(() => { prevScore.current = score; }, [score]);
  
  const isDragging = useRef(false);
  const dragThreshold = isLandscape ? 60 : 100;
  const feedbackDistance = isLandscape ? 50 : 80;

  // Feedback visual do arrasto (ícones de + e -)
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

  // ANIMAÇÃO SUAVE: Apenas Scale e Opacity, sem movimento Y para não deslocar nada
  const scoreVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0, position: 'absolute' as const }
  };

  // Lógica de Tipografia (Mantida Grande)
  const getFontSize = () => {
    if (isFullscreen) {
      if (isLandscape) {
        return score >= 100 ? 'text-[35vh]' : 'text-[45vh]';
      } else {
        return 'text-[25vh]'; 
      }
    }
    return isLandscape 
      ? 'text-[10rem] lg:text-[13rem] xl:text-[15rem]'
      : 'text-[8rem] md:text-[12rem]';
  };

  // Header Posicionamento (Sets e Timeout)
  const headerTop = isFullscreen ? 'top-4' : 'top-4';

  return (
    <div className={`relative flex-1 h-full p-0 transition-all duration-500 overflow-hidden ${theme.bgGradient} ${className || ''}`}>
      
      {/* Background Effects */}
      <AnimatePresence>
        {isServing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-radial from-${teamId === 'A' ? 'indigo' : 'rose'}-500/40 to-transparent blur-3xl pointer-events-none`}
          />
        )}
      </AnimatePresence>
      
      {isWinner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/10 dark:bg-white/5 backdrop-blur-[1px] pointer-events-none z-0" />
      )}

      {/* Drag Feedback Icons (Camada Inferior) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div style={{ opacity: upOpacity, scale: upScale, y: -feedbackDistance }} className="absolute w-16 h-16 rounded-full bg-emerald-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Plus size={32} strokeWidth={3} />
          </motion.div>
          <motion.div style={{ opacity: downOpacity, scale: downScale, y: feedbackDistance }} className="absolute w-16 h-16 rounded-full bg-rose-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
             <Minus size={32} strokeWidth={3} />
          </motion.div>
      </div>

      {/* TOP HEADER (Sets & Service Controls - Camada Superior Fixa) */}
      <div className={`absolute w-full px-4 md:px-6 flex items-start justify-between z-40 pointer-events-auto transition-all ${headerTop} pt-[env(safe-area-inset-top)]`}>
        <div className="flex flex-col gap-1">
             {!isFullscreen && <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${theme.text}`}>Sets</span>}
             <div className="flex gap-1.5">
                {Array.from({ length: setsToWinMatch }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-500 ${isFullscreen ? 'w-3 h-3' : (isLandscape ? 'w-2 h-2' : 'w-3 h-3')} ${i < setsWon ? `${theme.accentBg} shadow-lg scale-110` : 'bg-slate-300 dark:bg-slate-800'}`} />
                ))}
            </div>
        </div>

        <div className="flex flex-col items-end gap-2 md:gap-3">
             <button onClick={(e) => { e.stopPropagation(); triggerHaptic(); onToggleService(); }} className={`transition-all duration-300 p-2 rounded-xl backdrop-blur-sm border ${isServing ? theme.text + ' bg-white/80 dark:bg-white/10 border-' + (teamId === 'A' ? 'indigo' : 'rose') + '-500/30 shadow-lg' : 'text-slate-400 border-transparent hover:bg-black/5'}`}>
                <Volleyball size={isFullscreen ? 24 : (isLandscape ? 16 : 20)} />
            </button>
            <div className="flex gap-1.5">
                {[0, 1].map((i) => (
                    <button key={i} disabled={timeoutsUsed > i} onClick={(e) => { e.stopPropagation(); triggerHaptic([10, 10]); onUseTimeout(); }} className={`w-1.5 h-6 rounded-full transition-all ${i < timeoutsUsed ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : `${theme.accentBg} opacity-100 hover:scale-110 shadow-sm`}`} />
                ))}
            </div>
        </div>
      </div>

      {/* ÁREA DE TOQUE (Cobre tudo, mas os elementos visuais são posicionados de forma absoluta) */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full z-10 outline-none touch-action-none cursor-pointer"
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.15}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={(e, { offset }) => {
            if (offset.y < -dragThreshold) { triggerHaptic(); onAdd(); } 
            else if (offset.y > dragThreshold) { triggerHaptic(); onSubtract(); }
            setTimeout(() => { isDragging.current = false; }, 100);
        }}
        onTap={() => { if (!isDragging.current) { triggerHaptic(); onAdd(); } }}
        whileTap={{ scale: 0.99 }} // Feedback de toque muito leve em toda a tela
      >
        
        {/* SLOT 1: NOME DO TIME (Fixo no Topo) */}
        {/* Usamos porcentagem fixa para garantir que nunca desça */}
        <div className="absolute top-[18%] md:top-[22%] left-0 right-0 flex justify-center z-30 pointer-events-none">
             <div 
                className={`
                    flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all duration-300
                    ${isServing ? 'bg-white/60 dark:bg-white/10 border-white/20 backdrop-blur-md shadow-lg shadow-black/5' : 'border-transparent'} 
                `}
            >
            {!isFullscreen && isServing && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`${theme.text}`}><Volleyball size={18} fill="currentColor" className="opacity-20" /></motion.div>}
            <span className={`font-bold tracking-wider uppercase ${theme.text} ${isFullscreen ? 'text-lg md:text-2xl' : 'text-sm md:text-lg'} truncate max-w-[250px] text-center`}>
                {displayName}
            </span>
            </div>
        </div>
        
        {/* SLOT 2: PLACAR (Fixo no Centro Absoluto) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none w-full">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={score}
                    variants={scoreVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`leading-none font-black tabular-nums tracking-tighter ${theme.scoreColor} drop-shadow-2xl ${getFontSize()}`}
                    style={{ 
                        textShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        lineHeight: '0.75' // Line-height bem baixo para centralizar visualmente o número
                    }}
                >
                    {score}
                </motion.span>
            </AnimatePresence>
        </div>

        {/* SLOT 3: BADGES (Fixo na Base) */}
        <div className="absolute bottom-[18%] md:bottom-[22%] left-0 right-0 flex justify-center z-30 pointer-events-none">
            <AnimatePresence>
                {inSuddenDeath && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-full shadow-lg"><Zap size={12} fill="currentColor" /><span className="text-[10px] font-bold tracking-wider uppercase">{t(lang, 'firstTo3')}</span></motion.div>}
                {isMatchPoint && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-lg animate-pulse border border-rose-400"><span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'matchPoint')}</span></motion.div>}
                {isSetPoint && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute px-4 py-1.5 bg-indigo-600 text-white rounded-full shadow-lg border border-indigo-400"><span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'setPoint')}</span></motion.div>}
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export const ScoreCard = React.memo(ScoreCardComponent);