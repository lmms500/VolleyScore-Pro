import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, X, RotateCcw, Users, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { Language, TeamId, SetHistory, Team, RotationReport } from '../types';
import { t } from '../constants';

interface MatchOverModalProps {
  winner: TeamId | null;
  onReset: () => void;
  onRotate: () => void;
  onClose: () => void;
  lang: Language;
  teamAName: string;
  teamBName: string;
  history: SetHistory[];
  finalSetsA: number;
  finalSetsB: number;
  hasQueue: boolean;
  queue: Team[]; 
  teamARoster: Team;
  teamBRoster: Team;
  rotationReport: RotationReport | null; 
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({
  winner,
  onReset,
  onRotate,
  onClose,
  lang,
  teamAName,
  teamBName,
  history,
  finalSetsA,
  finalSetsB,
  hasQueue,
  queue,
  rotationReport
}) => {
  if (!winner) return null;

  const winnerName = winner === 'A' ? teamAName : teamBName;
  const winnerColor = winner === 'A' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400';
  const winnerBg = winner === 'A' ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-rose-100 dark:bg-rose-500/20';
  
  const nextTeam = queue.length > 0 ? queue[0] : null;
  const loserName = winner === 'A' ? teamBName : teamAName;
  
  const hasPreview = !!rotationReport;
  const exitingTeamName = hasPreview ? rotationReport!.loserTeamName : loserName;
  const enteringTeamName = hasPreview ? rotationReport!.enteringTeamName : (nextTeam?.name || 'Próximo Time');
  const enteringPlayers = hasPreview ? rotationReport!.enteringPlayers : (nextTeam?.players.map(p => p.name) || []);
  
  const wasCompleted = hasPreview ? rotationReport!.wasCompleted : false;
  const donorName = hasPreview ? rotationReport!.donorTeamName : '';
  const borrowedPlayers = hasPreview ? rotationReport!.borrowedPlayers : [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10"
      >
        {/* HEADER: VENCEDOR */}
        <div className={`p-8 flex flex-col items-center justify-center text-center space-y-4 ${winnerBg}`}>
            <div className={`p-4 rounded-full bg-white dark:bg-slate-800 shadow-xl ${winnerColor}`}>
                <Trophy size={48} strokeWidth={2} />
            </div>
            <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 text-slate-600 dark:text-slate-300 mb-1">
                    {t(lang, 'matchOver')}
                </h2>
                <h1 className={`text-4xl font-black uppercase tracking-tight leading-none ${winnerColor} drop-shadow-sm`}>
                    {winnerName}
                </h1>
                <p className="text-xs font-bold opacity-60 mt-2 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full inline-block">
                    {t(lang, 'winner')}
                </p>
            </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
            
            {/* Placar Final */}
            <div className="flex items-center justify-center gap-8 text-4xl font-black text-slate-800 dark:text-white">
                <span className={winner === 'A' ? 'text-indigo-600 dark:text-indigo-400 scale-110 drop-shadow' : 'opacity-40 grayscale'}>{finalSetsA}</span>
                <span className="text-sm font-bold opacity-30 tracking-widest mt-2">SETS</span>
                <span className={winner === 'B' ? 'text-rose-600 dark:text-rose-400 scale-110 drop-shadow' : 'opacity-40 grayscale'}>{finalSetsB}</span>
            </div>

            <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />

            {/* ROTAÇÃO */}
            {hasQueue ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            <RefreshCw size={12} />
                            <span>Próxima Partida</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-stretch">
                        
                        {/* Quem Sai */}
                        <div className="flex flex-col justify-center p-3 rounded-xl bg-rose-100/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">SAI</span>
                            <span className="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight truncate">
                                {exitingTeamName}
                            </span>
                        </div>

                        <div className="flex items-center justify-center">
                             <ArrowRight size={20} className="text-slate-400 dark:text-slate-600" />
                        </div>

                        {/* Quem Entra */}
                        <div className="flex flex-col justify-center p-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">ENTRA</span>
                            <span className="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight truncate">
                                {enteringTeamName}
                            </span>
                            
                            {/* Lista de Jogadores Pequena */}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {enteringPlayers.slice(0, 6).map((name, i) => (
                                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-black/40 text-slate-700 dark:text-slate-300 font-bold border border-black/5 dark:border-white/5">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Alerta de Roubo */}
                    {wasCompleted && (
                        <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                             <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase mb-1.5">
                                <UserPlus size={12} />
                                <span>Completado ({donorName}):</span>
                             </div>
                             <div className="flex flex-wrap gap-1.5">
                                {borrowedPlayers.map((name, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-bold">
                                        {name}
                                    </span>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 text-xs italic">
                    Sem fila de espera.
                </div>
            )}

            {/* BOTÕES */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={onRotate}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2
                        ${hasQueue 
                            ? 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500' 
                            : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                        }
                    `}
                >
                    <RefreshCw size={20} />
                    {hasQueue ? t(lang, 'rotateAndNext') : t(lang, 'nextMatch')}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onReset} className="py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-xs uppercase transition-colors">
                        Reiniciar Tudo
                    </button>
                    <button onClick={onClose} className="py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-xs uppercase transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};