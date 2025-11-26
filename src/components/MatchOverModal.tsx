import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamId, Language, SetHistory, RotationDetail } from '../types';
import { THEME, t } from '../constants';
import { Trophy, Check, Copy, RefreshCw, ArrowRight, UserPlus, Users, Shield } from 'lucide-react';

interface MatchOverModalProps {
  winner: TeamId | null;
  onReset: () => void;
  onRotate: () => void;
  lang: Language;
  teamAName: string;
  teamBName: string;
  history: SetHistory[];
  finalSetsA: number;
  finalSetsB: number;
  hasQueue: boolean;
  rotationReport: RotationDetail | null;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ 
  winner, 
  onReset, 
  onRotate,
  lang,
  teamAName,
  teamBName,
  history,
  finalSetsA,
  finalSetsB,
  hasQueue,
  rotationReport
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!winner) return null;

  const theme = THEME[winner];
  const winnerName = winner === 'A' 
    ? (teamAName || t(lang, 'home' as any))
    : (teamBName || t(lang, 'guest' as any));
  
  const loserName = winner === 'A'
    ? (teamBName || t(lang, 'guest' as any))
    : (teamAName || t(lang, 'home' as any));

  const handleCopy = () => {
    const winnerSets = winner === 'A' ? finalSetsA : finalSetsB;
    const loserSets = winner === 'A' ? finalSetsB : finalSetsA;
    let scores = history.map(h => `${h.scoreA}-${h.scoreB}`).join(', ');
    const text = `🏐 VolleyScore Pro\n\n🏆 ${winnerName} ${winnerSets} x ${loserSets} ${loserName}\n(${scores})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0f172a] border border-white/20 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header com Winner */}
        <div className="relative p-6 text-center shrink-0">
            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 ${theme.accentBg} opacity-20 blur-[80px] rounded-full`}></div>
            
            <div className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-xl border border-white/10 shrink-0">
                <Trophy size={32} className={theme.accent} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-slate-900 dark:text-white text-2xl font-black mb-1 tracking-tight">{t(lang, 'matchOver')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base">
                <span className={`font-bold ${theme.accent} text-lg`}>{winnerName}</span> {t(lang, 'wins')}
            </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-2">
            {/* Rotation Visual Report */}
            {rotationReport && (
                <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        <span>{t(lang, 'rotationReport')}</span>
                        <RefreshCw size={12} />
                    </div>

                    {/* Card de Transição */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="text-center">
                            <span className="block text-[10px] text-rose-500 font-bold mb-1 uppercase">{t(lang, 'leaving')}</span>
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate max-w-[80px] mx-auto">
                                {rotationReport.leavingTeamName}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                            <ArrowRight size={16} />
                        </div>

                        <div className="text-center">
                            <span className="block text-[10px] text-emerald-500 font-bold mb-1 uppercase">{t(lang, 'entering')}</span>
                            <div className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[80px] mx-auto">
                                {rotationReport.enteringTeamName}
                            </div>
                        </div>
                    </div>

                    {/* Lista de Fixos */}
                    {rotationReport.fixedPlayers.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase">{t(lang, 'fixed')}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {rotationReport.fixedPlayers.map((player, idx) => (
                                    <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md shadow-sm">
                                        {player}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Jogadores Roubados (Cannibalism) */}
                    {rotationReport.stolenPlayers.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                                <UserPlus size={14} />
                                <span className="text-[10px] font-bold uppercase">
                                    {t(lang, 'completedWith')} 
                                    {rotationReport.donorTeamName && (
                                        <span className="text-amber-500 ml-1">({rotationReport.donorTeamName})</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {rotationReport.stolenPlayers.map((player, idx) => (
                                    <motion.span 
                                        key={idx}
                                        initial={{ scale: 0, x: -20 }}
                                        animate={{ scale: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md shadow-sm flex items-center gap-1"
                                    >
                                        {player}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Jogadores da Fila (ENTRANDO) - Correção Visual */}
                    {rotationReport.enteringPlayers.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                <Users size={14} />
                                <span className="text-[10px] font-bold uppercase">{t(lang, 'queue')}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {rotationReport.enteringPlayers.map((player, idx) => (
                                    <span key={idx} className="text-[10px] font-medium px-2 py-1 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-white/5">
                                        {player}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 space-y-3 relative z-10 mt-auto bg-white dark:bg-[#0f172a]">
          {hasQueue ? (
             <button
                onClick={onRotate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
                <RefreshCw size={20} />
                <span>{t(lang, 'rotateAndNext')}</span>
            </button>
          ) : (
            <p className="text-xs text-slate-400 italic mb-2 text-center">{t(lang, 'cantRotate')}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
             <button
                onClick={handleCopy}
                className="w-full py-3 px-2 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-sm"
            >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                <span>{copied ? t(lang, 'copied') : t(lang, 'copy')}</span>
            </button>
            <button
                onClick={onReset}
                className="w-full py-3 px-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl active:scale-95 transition-transform shadow-lg shadow-black/10 text-sm"
            >
                {t(lang, 'startNew')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};