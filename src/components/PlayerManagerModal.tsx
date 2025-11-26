import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Save, X, Trash2, Shuffle, Shield, Edit3 } from 'lucide-react';
import { Language, Team } from '../types';
import { t } from '../constants';

interface PlayerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, teamNameMap: Record<number, string>, fixedMap: Record<string, 'A' | 'B' | null>) => void;
  onClear: () => void;
  currentList: Team[]; // Recebe [courtA, courtB, ...queue]
  lang: Language;
}

interface PlayerInput {
    name: string;
    fixed: 'A' | 'B' | null;
}

export const PlayerManagerModal: React.FC<PlayerManagerModalProps> = ({
  isOpen, onClose, onSave, onClear, currentList, lang
}) => {
  const [step, setStep] = useState<'input' | 'config'>('input');
  const [text, setText] = useState('');
  const [parsedPlayers, setParsedPlayers] = useState<PlayerInput[]>([]);
  const [teamNames, setTeamNames] = useState<Record<number, string>>({});

  // Preencher se já existir
  useEffect(() => {
    if (isOpen && currentList.length > 0 && !text) {
        let allNames: string[] = [];
        currentList.forEach((team, idx) => {
            if (team.id !== 'empty') {
                setTeamNames(prev => ({...prev, [idx]: team.name}));
                team.players.forEach((p) => allNames.push(p.name));
            }
        });
        if (allNames.length > 0) setText(allNames.join('\n'));
    }
  }, [isOpen, currentList]);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!text.trim()) return;
    const names = text.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);
    
    // Recupera configs antigas
    const currentFlat = currentList.flatMap(t => t.players);

    const tempPlayers = names.map(name => {
        const old = currentFlat.find(p => p.name === name);
        return { name, fixed: old ? old.isFixed : null };
    });
    
    setParsedPlayers(tempPlayers);
    setStep('config');
  };

  const toggleFixed = (index: number, type: 'A' | 'B') => {
      setParsedPlayers(prev => {
          const newP = [...prev];
          if (newP[index].fixed === type) {
              newP[index].fixed = null;
          } else {
              newP[index].fixed = type;
          }
          return newP;
      });
  };

  const handleFinalSave = () => {
      const fixedMap: Record<string, 'A' | 'B' | null> = {};
      parsedPlayers.forEach(p => fixedMap[p.name] = p.fixed);
      onSave(text, teamNames, fixedMap);
      setStep('input');
      onClose();
  };

  const previewTeams = () => {
      const teams = [];
      const playerCount = parsedPlayers.length;
      const numTeams = Math.ceil(playerCount / 6);
      
      let pIndex = 0;
      for (let i = 0; i < numTeams; i++) {
          const sliceSize = (i === numTeams - 1) ? (playerCount - pIndex) : 6;
          const teamSlice = parsedPlayers.slice(pIndex, pIndex + sliceSize);
          const teamWithGlobalIndex = teamSlice.map((p, localIdx) => ({
              ...p,
              globalIndex: pIndex + localIdx
          }));
          
          let defaultName = `Time ${String.fromCharCode(65 + i)}`;
          if (i === 0) defaultName = "Time A";
          if (i === 1) defaultName = "Time B";

          teams.push({
              index: i,
              defaultName, 
              players: teamWithGlobalIndex
          });
          pIndex += sliceSize;
      }
      return teams;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users size={20} /></div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold">{step === 'input' ? t(lang, 'playerList') : t(lang, 'manageTeams')}</h2>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {step === 'input' ? (
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="1. Nome..."
                    className="w-full h-60 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white resize-none text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            ) : (
                <div className="space-y-6">
                    {previewTeams().map((team) => (
                        <div key={team.index} className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                            <div className="p-3 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center gap-2">
                                <Edit3 size={14} className="text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder={team.defaultName}
                                    value={teamNames[team.index] || ''}
                                    onChange={(e) => setTeamNames(prev => ({...prev, [team.index]: e.target.value}))}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white w-full"
                                />
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-500">{team.players.length}/6</span>
                            </div>
                            <div className="p-2 space-y-1">
                                {team.players.map((p) => (
                                    <div key={p.globalIndex} className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-colors">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{p.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleFixed(p.globalIndex, 'A')} className={`w-7 h-7 rounded-lg font-black text-[10px] flex items-center justify-center transition-all ${p.fixed === 'A' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>A</button>
                                            <button onClick={() => toggleFixed(p.globalIndex, 'B')} className={`w-7 h-7 rounded-lg font-black text-[10px] flex items-center justify-center transition-all ${p.fixed === 'B' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>B</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 flex gap-3">
            {step === 'input' ? (
                <>
                    <button onClick={onClear} className="px-4 py-3.5 bg-white dark:bg-white/10 text-rose-500 rounded-xl"><Trash2 size={20} /></button>
                    <button onClick={handleProcess} className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"><span className="text-sm">{t(lang, 'generateTeams')}</span><Shuffle size={20} /></button>
                </>
            ) : (
                <>
                    <button onClick={() => setStep('input')} className="px-6 py-3.5 text-slate-500 font-bold rounded-xl">Voltar</button>
                    <button onClick={handleFinalSave} className="flex-1 py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"><Save size={20} /><span>Salvar</span></button>
                </>
            )}
        </div>
      </motion.div>
    </div>
  );
};