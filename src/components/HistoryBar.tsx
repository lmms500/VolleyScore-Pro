import React from 'react';
import { SetHistory, TeamId, Language } from '../types';
import { THEME, t, SETS_TO_WIN_MATCH } from '../constants';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryBarProps {
  history: SetHistory[];
  currentSet: number;
  swapped: boolean;
  lang: Language;
  maxSets: number;
  matchDurationSeconds: number;
  isTimerRunning: boolean;
}

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const HistoryBar: React.FC<HistoryBarProps> = ({ 
  history, 
  currentSet, 
  swapped, 
  lang, 
  maxSets,
  matchDurationSeconds,
  isTimerRunning
}) => {
  const leftTeamId: TeamId = swapped ? 'B' : 'A';
  const rightTeamId: TeamId = swapped ? 'A' : 'B';
  const setsToWin = SETS_TO_WIN_MATCH(maxSets);
  
  const isTieBreak = currentSet === maxSets && maxSets > 1;

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full z-40 px-3 pt-3 pb-1 relative bg-transparent shrink-0 flex justify-center"
    >
      <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-full py-1.5 px-4 flex items-center justify-between gap-3 max-w-full overflow-hidden">
        
        {/* Left: Sets Info / History Container */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          
          {history.length === 0 && currentSet === 1 ? (
              <div className="flex items-center gap-2 whitespace-nowrap">
                 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{t(lang, 'goal')}</span>
                 <div className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{setsToWin} {t(lang, 'sets')}</span>
                 </div>
              </div>
          ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mask-gradient-right pr-2">
                  {history.map((set, idx) => {
                      const leftWin = swapped ? set.winner === 'B' : set.winner === 'A';
                      const rightWin = swapped ? set.winner === 'A' : set.winner === 'B';
                      const leftScore = swapped ? set.scoreB : set.scoreA;
                      const rightScore = swapped ? set.scoreA : set.scoreB;

                      return (
                      <div key={idx} className="flex-shrink-0 flex flex-col items-center">
                          <div className={`flex items-center gap-0.5 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full border ${leftWin || rightWin ? 'bg-slate-100 dark:bg-white/10 border-transparent' : 'border-slate-200 dark:border-white/10'}`}>
                              <span className={leftWin ? THEME[leftTeamId].accent : 'text-slate-400'}>{leftScore}</span>
                              <span className="text-slate-300 dark:text-slate-600 mx-[1px]">-</span>
                              <span className={rightWin ? THEME[rightTeamId].accent : 'text-slate-400'}>{rightScore}</span>
                          </div>
                      </div>
                      );
                  })}
                   {/* Current Set Indicator */}
                   <div className="flex items-center gap-1 pl-1 flex-shrink-0 relative">
                      {isTieBreak && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-rose-500 whitespace-nowrap tracking-tight animate-pulse">{t(lang, 'tieBreak')}</span>
                      )}
                      <span className="text-[9px] text-slate-400 font-bold uppercase hidden sm:inline">{t(lang, 'set')}</span>
                      <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white/10 ${isTieBreak ? 'bg-rose-500 text-white' : 'bg-slate-900 dark:bg-slate-700 text-white'}`}>{currentSet}</span>
                   </div>
              </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-white/20 flex-shrink-0" />

        {/* Right: Timer */}
        <div className={`flex items-center gap-1.5 flex-shrink-0 ${isTimerRunning ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
           <Clock size={14} strokeWidth={3} className={`${isTimerRunning ? 'animate-pulse' : ''}`} />
           <span className="font-mono text-sm font-bold tracking-tight tabular-nums">
              {formatTime(matchDurationSeconds)}
           </span>
        </div>

      </div>
    </motion.div>
  );
};