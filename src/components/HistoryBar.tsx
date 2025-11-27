import React from 'react';
import { motion } from 'framer-motion';
import { Language, ThemeMode, SetHistory } from '../types';
import { t } from '../constants';
import { Clock } from 'lucide-react';

interface HistoryBarProps {
  history: SetHistory[];
  currentSet: number;
  maxSets: number;
  lang: Language;
  themeMode: ThemeMode;
  swapped: boolean;
  matchDurationSeconds: number;
  isTimerRunning: boolean;
}

const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export const HistoryBar: React.FC<HistoryBarProps> = ({
  history,
  currentSet,
  maxSets,
  lang,
  swapped,
  matchDurationSeconds,
  isTimerRunning,
}) => {
  const setsToWinMatch = Math.ceil(maxSets / 2);
  const currentSetText = `${t(lang, 'set')} ${currentSet}/${maxSets}`;

  const setResults = history.map((set) => ({
    setNumber: set.setNumber,
    displayA: swapped ? set.scoreB : set.scoreA,
    displayB: swapped ? set.scoreA : set.scoreB,
    winnerDisplay: swapped
      ? set.winner === 'A'
        ? 'B'
        : 'A'
      : set.winner,
  }));

  return (
    <div className="w-full flex justify-center px-4 pt-4 relative bg-transparent z-10">
      {/* FUNDO COM BLUR — agora com Z-INDEX correto */}
      <div
        className="
          bg-black/20 dark:bg-slate-900/40
          backdrop-blur-2xl
          shadow-xl shadow-black/40
          rounded-2xl p-2 flex items-center gap-3
          w-full max-w-2xl
          ring-1 ring-white/10 dark:ring-white/5
          z-10
        "
      >
        {/* TIMER + SET ATUAL */}
        <div className="relative z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/20 ring-1 ring-white/10 shadow-md">
          <div
            className={`flex items-center gap-1.5 ${
              isTimerRunning ? 'text-green-400' : 'text-slate-400'
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-black tabular-nums">
              {formatDuration(matchDurationSeconds)}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-500/50"></div>
          <span className="text-sm font-semibold text-white dark:text-slate-200">
            {currentSetText}
          </span>
        </div>

        {/* HISTÓRICO DE SETS */}
        <div className="flex-1 flex justify-end items-center gap-1.5 overflow-x-auto no-scrollbar relative z-20">
          {setResults.map((set, index) => (
            <div
              key={index}
              className={`relative z-20 flex flex-col items-center justify-center p-1 rounded-lg text-xs font-bold w-12 transition-colors shadow-md ${
                set.winnerDisplay === 'A'
                  ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-rose-600/20 text-rose-300 ring-1 ring-rose-500/30'
              }`}
              title={`Set ${set.setNumber}: ${set.displayA}-${set.displayB}`}
            >
              <span className="text-[10px] opacity-80">{set.setNumber}</span>
              <span className="text-xs">
                {set.displayA}-{set.displayB}
              </span>
            </div>
          ))}

          {history.length < maxSets && (
            <div className="w-px h-6 bg-slate-500/50 mx-1"></div>
          )}

          {/* INDICADORES DE SETS VENCIDOS */}
          {Array.from({ length: setsToWinMatch }).map((_, i) => (
            <div
              key={`sets-won-a-${i}`}
              className={`rounded-full w-2.5 h-2.5 transition-all ${
                history.filter((s) => s.winner === 'A').length > i
                  ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30 scale-110'
                  : 'bg-white/10'
              }`}
            />
          ))}

          <div className="w-1.5 h-1.5"></div>

          {Array.from({ length: setsToWinMatch }).map((_, i) => (
            <div
              key={`sets-won-b-${i}`}
              className={`rounded-full w-2.5 h-2.5 transition-all ${
                history.filter((s) => s.winner === 'B').length > i
                  ? 'bg-rose-500 shadow-lg shadow-rose-500/30 scale-110'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
