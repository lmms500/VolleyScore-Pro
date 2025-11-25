
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamId, Language, SetHistory } from '../types';
import { THEME, t } from '../constants';
import { Trophy, Share2, Check, Copy } from 'lucide-react';

interface MatchOverModalProps {
  winner: TeamId | null;
  onReset: () => void;
  lang: Language;
  teamAName: string;
  teamBName: string;
  history: SetHistory[];
  finalSetsA: number;
  finalSetsB: number;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ 
  winner, 
  onReset, 
  lang,
  teamAName,
  teamBName,
  history,
  finalSetsA,
  finalSetsB
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
        className="bg-white dark:bg-[#0f172a] border border-white/20 rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 ${theme.accentBg} opacity-20 blur-[80px] rounded-full`}></div>

        <div className={`relative mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-xl border border-white/10`}>
          <Trophy size={48} className={theme.accent} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-slate-900 dark:text-white text-3xl font-black mb-2 tracking-tight">{t(lang, 'matchOver')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          <span className={`font-bold ${theme.accent} text-xl block mb-1`}>{winnerName}</span> 
          {t(lang, 'wins')}
        </p>

        <div className="space-y-3 relative z-10">
          <button
            onClick={handleCopy}
            className="w-full py-4 px-4 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
          >
            {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
            <span>{copied ? 'Copied!' : (lang === 'pt' ? 'Copiar Resumo' : 'Copy Result')}</span>
          </button>

          <button
            onClick={onReset}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl active:scale-95 transition-transform shadow-xl shadow-black/10"
          >
            {t(lang, 'startNew')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};