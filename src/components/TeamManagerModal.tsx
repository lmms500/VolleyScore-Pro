import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Unlock, Shuffle, Trash2, Edit3, Hand, RotateCcw } from 'lucide-react';
import { Team, Language } from '../types';
import { t } from '../constants';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onGenerate: (names: string) => void;
  onUpdateRosters: (teamA: Team | null, teamB: Team | null, queue: Team[]) => void;
  onUpdateTeamName?: (teamId: string, newName: string) => void;
  onMovePlayer: (playerId: string, sourceTeamId: string, targetTeamId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  teamA: Team | null;
  teamB: Team | null;
  queue: Team[];
}

interface TeamCardProps {
    team: Team | null;
    label: string;
    onToggleLock: (teamId: string, playerId: string) => void;
    onUpdateTeamName?: (teamId: string, newName: string) => void;
    lang: Language;
    onMovePlayer: (playerId: string, sourceTeamId: string, targetTeamId: string) => void;
    onRemovePlayer: (playerId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ 
    team, label, onToggleLock, onUpdateTeamName, lang, onMovePlayer, onRemovePlayer
}) => {
    const isDragging = useRef(false);

    if (!team) return null;

    return (
        <div 
            data-team-id={team.id}
            className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all relative"
        >
            <div className="flex justify-between items-center mb-2 group">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</span>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        value={team.name}
                        onChange={(e) => onUpdateTeamName && onUpdateTeamName(team.id, e.target.value)}
                        className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-right w-32 hover:border-slate-300 dark:hover:border-white/10 transition-colors placeholder:text-slate-400"
                        placeholder="Nome do Time"
                    />
                    <Edit3 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
                {team.players.map(p => (
                    <motion.div 
                        key={p.id} 
                        layout 
                        drag 
                        dragSnapToOrigin 
                        dragElastic={0} 
                        dragMomentum={false} 
                        whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing', opacity: 0.9 }}
                        className="relative group touch-none z-10"
                        
                        onDragStart={() => { isDragging.current = true; }}
                        onDragEnd={(event, info) => {
                            const { point } = info;
                            const elements = document.elementsFromPoint(point.x, point.y);
                            const target = elements.find(el => el.hasAttribute('data-team-id'));
                            
                            if (target) {
                                const targetId = target.getAttribute('data-team-id');
                                if (targetId && targetId !== team.id) {
                                    onMovePlayer(p.id, team.id, targetId);
                                }
                            }
                            
                            setTimeout(() => { isDragging.current = false; }, 150);
                        }}
                    >
                        <div
                            onClick={() => {
                                if (!isDragging.current) {
                                    onToggleLock(team.id, p.id);
                                }
                            }}
                            className={`
                                pl-2 pr-1 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all select-none cursor-grab active:cursor-grabbing
                                ${p.isFixed 
                                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20' 
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                }
                            `}
                        >
                            <span className="p-0.5 -ml-1">
                                {p.isFixed ? <Lock size={10} /> : <Unlock size={10} className="opacity-30" />}
                            </span>

                            <span className="mr-1">{p.name}</span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDragging.current) onRemovePlayer(p.id);
                                }}
                                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-black/20 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={10} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {team.players.length < 6 && (
                    <span className="text-xs italic text-slate-400 px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-md border border-dashed border-slate-300 dark:border-white/10">
                        {6 - team.players.length} {t(lang, 'openSlots')}
                    </span>
                )}
            </div>
        </div>
    );
};

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onGenerate,
  onUpdateRosters,
  onUpdateTeamName,
  onMovePlayer,
  onRemovePlayer,
  onUndo,
  canUndo,
  teamA,
  teamB,
  queue
}) => {
  const [namesInput, setNamesInput] = useState('');
  const [view, setView] = useState<'input' | 'manage'>((teamA || teamB) ? 'manage' : 'input');

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (namesInput.trim().length > 0) {
        onGenerate(namesInput);
        setView('manage');
    }
  };

  const handleClear = () => {
      onUpdateRosters(null, null, []);
      setNamesInput('');
      setView('input');
  };

  const toggleLock = (teamId: string, playerId: string) => {
      const updatePlayerInTeam = (t: Team) => {
          if (t.id !== teamId) return t;
          return {
              ...t,
              players: t.players.map(p => p.id === playerId ? { ...p, isFixed: !p.isFixed } : p)
          };
      };

      const newTeamA = teamA ? updatePlayerInTeam(teamA) : null;
      const newTeamB = teamB ? updatePlayerInTeam(teamB) : null;
      const newQueue = queue.map(updatePlayerInTeam);

      onUpdateRosters(newTeamA, newTeamB, newQueue);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[85vh]"
      >
         <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
                <Users size={20} />
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">{t(lang, 'teamManager')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {view === 'input' ? (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t(lang, 'namesList')}
                    </p>
                    <textarea 
                        className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm font-mono placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                        placeholder={t(lang, 'namesPlaceholder')}
                        value={namesInput}
                        onChange={(e) => setNamesInput(e.target.value)}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={namesInput.trim().length === 0}
                        className="w-full py-4 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:bg-indigo-700"
                    >
                        <Shuffle size={18} />
                        {t(lang, 'generateTeams')}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <button 
                            onClick={() => setView('input')}
                            className="text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors"
                        >
                            ← {t(lang, 'editList')}
                        </button>
                        
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                <Hand size={10} /> {lang === 'pt' ? 'Arraste para mover' : 'Drag to move'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                <Lock size={10} /> {lang === 'pt' ? 'Clique para fixar' : 'Click to lock'}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Botão de Desfazer */}
                            <button 
                                onClick={onUndo}
                                disabled={!canUndo}
                                className={`text-xs font-bold flex items-center gap-1 transition-colors bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg ${!canUndo ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'}`}
                            >
                                <RotateCcw size={12} />
                                {t(lang, 'undo')}
                            </button>

                            <button 
                                onClick={handleClear}
                                className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg"
                            >
                                <Trash2 size={12} />
                                {t(lang, 'clear')}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <TeamCard 
                            team={teamA} 
                            label={t(lang, 'home')} 
                            onToggleLock={toggleLock} 
                            onUpdateTeamName={onUpdateTeamName}
                            lang={lang}
                            onMovePlayer={onMovePlayer}
                            onRemovePlayer={onRemovePlayer}
                        />
                        <TeamCard 
                            team={teamB} 
                            label={t(lang, 'guest')} 
                            onToggleLock={toggleLock} 
                            onUpdateTeamName={onUpdateTeamName}
                            lang={lang}
                            onMovePlayer={onMovePlayer}
                            onRemovePlayer={onRemovePlayer}
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2 tracking-wider">
                            <Users size={12} />
                            {t(lang, 'queue')}
                        </h3>
                        {queue.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                                {t(lang, 'emptyQueue')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {queue.map((t_q, idx) => (
                                    <TeamCard 
                                        key={t_q.id} 
                                        team={t_q} 
                                        label={`${idx + 1}. ${t(lang, 'waiting')}`} 
                                        onToggleLock={toggleLock} 
                                        onUpdateTeamName={onUpdateTeamName}
                                        lang={lang}
                                        onMovePlayer={onMovePlayer}
                                        onRemovePlayer={onRemovePlayer}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
             <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl active:scale-95 transition-transform hover:opacity-90 shadow-lg"
            >
                {t(lang, 'save')}
            </button>
        </div>

      </motion.div>
    </div>
  );
};