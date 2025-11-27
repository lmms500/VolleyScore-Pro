import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { TeamId, Language, ThemeMode } from '../types'; 
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
  isFullscreen: boolean;
  className?: string;
  themeMode: ThemeMode; 
}

const ScoreCardComponent: React.FC<ScoreCardProps> = ({
  teamId,
  teamName,
  score,
  opponentScore,
  setsWon,
  maxSets,
  setsToWinMatch,
  isWinner,
  inSuddenDeath,
  isServing,
  timeoutsUsed,
  onAdd,
  onSubtract,
  onToggleService,
  onUseTimeout,
  pointsToWinSet,
  lang,
  isLandscape,
  isFullscreen,
  className,
  themeMode
}) => {
  const theme = THEME[teamId];
  const y = useMotionValue(0);
  
  const prevScore = useRef(score);
  const direction = score > prevScore.current ? 1 : -1;

  useEffect(() => {
    prevScore.current = score;
  }, [score]);
  
  const isDragging = useRef(false);
  // Distância de arraste para ativar a ação
  const dragThreshold = isLandscape ? 50 : 80;

  // Transformações para feedback visual (ícones + e -)
  const upOpacity = useTransform(y, [-20, -dragThreshold], [0, 1]);
  const upScale = useTransform(y, [-20, -dragThreshold], [0.8, 1.1]);
  const downOpacity = useTransform(y, [20, dragThreshold], [0, 1]);
  const downScale = useTransform(y, [20, dragThreshold], [0.8, 1.1]);

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const displayName = teamName && teamName.trim() !== '' 
    ? teamName 
    : t(lang, theme.nameKey as any);

  const isMatchPoint = setsWon === setsToWinMatch - 1 && score >= pointsToWinSet - 1 && score > opponentScore;
  const isSetPoint = !isMatchPoint && score >= pointsToWinSet - 1 && score > opponentScore;

  const scoreVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? 50 : -50, opacity: 0, scale: 0.8, filter: 'blur(10px)' }),
    center: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ y: dir > 0 ? -50 : 50, opacity: 0, scale: 1.1, filter: 'blur(10px)', position: 'absolute' as const })
  };

  // Safe Area Padding: Garante que o conteúdo não fique escondido atrás das barras fixas
  // quando não estiver em tela cheia.
  const containerPadding = !isFullscreen 
    ? 'pt-20 pb-28 px-4' // Mais espaço topo/base para HistoryBar e Controls
    : 'p-4';             // Padding padrão em Fullscreen

  // Tamanho da fonte dinâmico para evitar estouro
  // Usa "clamp" ou unidades viewport seguras
  const scoreFontSize = isLandscape
    ? 'text-[35vh]' 
    : 'text-[22vh]'; 

  return (
    // ROOT: Fundo e Borda Lateral
    <div className={`relative w-full h-full overflow-hidden transition-all duration-700 texture-noise border-x border-white/5 ${theme.bgGradient} ${className}`}>
      
      {/* BACKGROUND EFFECTS (Overlay Absoluto) */}
      <AnimatePresence>
        {isServing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none mix-blend-overlay z-0"
          />
        )}
      </AnimatePresence>
      
      {isWinner && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none z-0" 
        />
      )}

      {/* === SANDWICH STRUCTURE === */}
      {/* Flex Column ocupa 100% da altura */}
      <div className={`w-full h-full flex flex-col justify-between relative z-10 ${containerPadding}`}>
      
        {/* --- 1. TOPO (HEADER BLOCK) --- */}
        {/* Controles e Identificação do Time */}
        <div className="w-full shrink-0 flex flex-col gap-1 z-20">
            
            {/* Linha Superior: Controles (Timeouts/Serviço) */}
            <div className="w-full flex items-start justify-end h-8 mb-2">
                <div className="flex flex-col items-end gap-2">
                    {/* Botão de Serviço */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); triggerHaptic(); onToggleService(); }}
                        className={`
                            transition-all duration-300 p-2 rounded-full backdrop-blur-sm ring-1 ring-white/10 shadow-lg
                            ${isServing 
                                ? 'bg-white text-slate-900 scale-110' 
                                : 'bg-black/20 text-slate-200/50 hover:bg-white/10'
                            }
                        `}
                    >
                        <Volleyball size={16} />
                    </button>

                    {/* Timeouts */}
                    <div className="flex gap-1">
                        {[0, 1].map((i) => (
                            <button
                                key={i}
                                disabled={timeoutsUsed > i}
                                onClick={(e) => { e.stopPropagation(); triggerHaptic([10, 10]); onUseTimeout(); }}
                                className={`w-1.5 h-5 rounded-full transition-all ${
                                    i < timeoutsUsed 
                                    ? 'bg-black/40 cursor-not-allowed opacity-50'
                                    : `${theme.accentBg} hover:scale-110 shadow-sm ring-1 ring-white/20`
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bloco de Identidade: Sets e Nome (Centralizado) */}
            <div className="flex flex-col items-center justify-center -mt-6 pointer-events-none">
                {/* Sets Won Dots */}
                <div className="flex items-center gap-2 mb-1.5 p-1.5 px-3 bg-black/20 backdrop-blur-md rounded-full ring-1 ring-white/10">
                     {Array.from({ length: setsToWinMatch }).map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-500 ${
                            isLandscape ? 'w-2 h-2' : 'w-2.5 h-2.5'
                            } ${
                            i < setsWon 
                                ? `${theme.accentBg} shadow-[0_0_8px_currentColor] scale-110` 
                                : 'bg-white/10'
                            }`}
                        />
                     ))}
                </div>

                {/* Nome do Time */}
                <div className={`px-5 py-1.5 rounded-full transition-all duration-300 ${isServing ? 'bg-white/15 backdrop-blur-md ring-1 ring-white/20' : 'bg-black/10 backdrop-blur-sm'}`}>
                    <span className={`font-black tracking-widest uppercase ${theme.text} ${isLandscape ? 'text-xs' : 'text-sm'} truncate max-w-[200px] text-center block shadow-sm`}>
                        {displayName}
                    </span>
                </div>
            </div>
        </div>


        {/* --- 2. MEIO (PLACAR) --- */}
        {/* Ocupa todo o espaço restante (flex-1) */}
        <motion.div
          className="flex-1 w-full flex items-center justify-center relative min-h-0 z-10"
          style={{ y }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.15}
          onDragStart={() => { isDragging.current = true; }}
          onDragEnd={(e, { offset }) => {
              if (offset.y < -dragThreshold) {
                  triggerHaptic();
                  onAdd();
              } else if (offset.y > dragThreshold) {
                  triggerHaptic();
                  onSubtract();
              }
              setTimeout(() => { isDragging.current = false; }, 100);
          }}
          onTap={() => {
              if (!isDragging.current) {
                  triggerHaptic();
                  onAdd();
              }
          }}
          whileTap={{ scale: 0.98 }}
        >
            {/* Feedback Visual (Atrás do número) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 overflow-hidden">
                <motion.div 
                    style={{ opacity: upOpacity, scale: upScale, y: -50 }}
                    className="absolute top-10 w-20 h-20 rounded-full bg-emerald-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-sm"
                >
                    <Plus size={32} strokeWidth={4} />
                </motion.div>
                <motion.div 
                    style={{ opacity: downOpacity, scale: downScale, y: 50 }}
                    className="absolute bottom-10 w-20 h-20 rounded-full bg-rose-500/90 text-white shadow-2xl flex items-center justify-center backdrop-blur-sm"
                >
                    <Minus size={32} strokeWidth={4} />
                </motion.div>
            </div>

            {/* Número do Placar */}
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={score}
                    custom={direction}
                    variants={scoreVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`
                        font-black tabular-nums leading-none tracking-tighter select-none 
                        ${scoreFontSize}
                        ${theme.scoreGradient} bg-clip-text text-transparent
                        drop-shadow-2xl filter
                    `}
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                    {score}
                </motion.span>
            </AnimatePresence>
        </motion.div>


        {/* --- 3. BASE (BADGES) --- */}
        {/* Altura fixa ou shrink-0 para garantir visibilidade */}
        <div className="shrink-0 h-10 flex items-center justify-center gap-2 z-20">
            <AnimatePresence>
                {inSuddenDeath && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full shadow-lg shadow-amber-500/30 ring-2 ring-white/20"
                    >
                        <Zap size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">{t(lang, 'firstTo3')}</span>
                    </motion.div>
                )}
                {isMatchPoint && (
                        <motion.div 
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        className="px-4 py-1.5 bg-rose-600 text-white rounded-full shadow-lg shadow-rose-600/30 ring-2 ring-white/20 animate-pulse"
                    >
                        <span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'matchPoint')}</span>
                    </motion.div>
                )}
                {isSetPoint && (
                        <motion.div 
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 ring-2 ring-white/20 animate-pulse"
                    >
                        <span className="text-[11px] font-black tracking-widest uppercase">{t(lang, 'setPoint')}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export const ScoreCard = React.memo(ScoreCardComponent);