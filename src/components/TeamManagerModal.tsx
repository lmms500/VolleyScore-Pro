import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Team, Player } from '../types';
import { t } from '../constants';
import { 
    X, RotateCcw, Users, ClipboardList, Lock, Unlock, Trash2, RefreshCw, GripVertical, User
} from 'lucide-react';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onGenerate: (namesText: string, teamNameMap: Record<number, string>, fixedMap: Record<string, boolean>) => void;
  onUpdateRosters: (teamA: Team | null, teamB: Team | null, queue: Team[]) => void;
  onUpdateTeamName: (teamId: string, newName: string) => void;
  onMovePlayer: (playerId: string, sourceTeamId: string, targetTeamId: string) => void;
  onRemovePlayer: (playerId: string, sourceTeamId: string) => void;
  onTogglePlayerFixed?: (playerId: string) => void; 
  onUndo: () => void;
  canUndo: boolean;
  teamA: Team | null;
  teamB: Team | null;
  queue: Team[];
}

const PlayerItem: React.FC<{
    player: Player;
    locationId: string;
    onRemove: (pid: string, sid: string) => void;
    onToggleFixed?: (pid: string) => void;
    lang: Language;
}> = React.memo(({ player, locationId, onRemove, onToggleFixed, lang }) => {
    
    // Design do Item do Jogador
    const isFixed = player.isFixed;
    const fixedColor = 'text-amber-600 dark:text-amber-400';
    const fixedBg = 'bg-amber-100 dark:bg-amber-500/20';
    const fixedBorder = 'border-amber-200 dark:border-amber-500/40';

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => { 
        e.dataTransfer.setData("player/json", JSON.stringify({ playerId: player.id, sourceTeamId: locationId }));
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => { e.currentTarget.style.opacity = '1'; };

    return (
        <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} className="group relative touch-none">
            <div className={`
                flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200 border shadow-sm
                ${isFixed 
                    ? `${fixedBg} ${fixedBorder}` 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
            `}>
                <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>
                
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className={`text-sm font-bold truncate ${isFixed ? fixedColor : 'text-slate-900 dark:text-slate-100'}`}>
                        {player.name}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {onToggleFixed && (
                        <button onClick={(e) => { e.stopPropagation(); onToggleFixed(player.id); }} className={`p-1.5 rounded-md transition-colors ${isFixed ? `${fixedColor} bg-white/50 dark:bg-black/20` : 'text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'}`} title={isFixed ? "Fixo no time" : "Fixar"}>
                            {isFixed ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onRemove(player.id, locationId); }} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );
});

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({ isOpen, onClose, lang, onGenerate, onUpdateTeamName, onMovePlayer, onRemovePlayer, onTogglePlayerFixed, onUndo, canUndo, teamA, teamB, queue }) => {
  if (!isOpen) return null;
  const [namesText, setNamesText] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'generator'>('roster');
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); setDragOverId(null);
    try {
        const { playerId, sourceTeamId } = JSON.parse(e.dataTransfer.getData("player/json"));
        if (sourceTeamId === targetId) return;
        let count = 0;
        if (targetId === 'A') count = teamA?.players.length || 0;
        else if (targetId === 'B') count = teamB?.players.length || 0;
        else { const q = queue.find(x => x.id === targetId); if(q) count = q.players.length; }
        if (count >= 6) { if(navigator.vibrate) navigator.vibrate(200); return; }
        onMovePlayer(playerId, sourceTeamId, targetId);
    } catch (err) {}
  };

  const TeamColumn = ({ team, id, headerColorBg, headerColorText, placeholder, icon }: any) => {
    const isOver = dragOverId === id;
    const isQueue = id !== 'A' && id !== 'B';
    
    // Cores específicas para a Fila (Queue) para garantir contraste
    const queueHeaderBg = "bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700";
    const queueHeaderText = "text-slate-900 dark:text-white";

    const headerClass = isQueue ? queueHeaderBg : headerColorBg;
    const textClass = isQueue ? queueHeaderText : headerColorText;

    return (
        <div 
            onDrop={(e) => handleDrop(e, id)} 
            onDragOver={(e) => { e.preventDefault(); setDragOverId(id); }} 
            onDragLeave={() => setDragOverId(null)} 
            className={`
                flex-1 flex flex-col rounded-xl overflow-hidden border transition-all duration-200 min-h-[280px]
                ${isOver ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'}
            `}
        >
            <div className={`p-3 flex items-center justify-between ${headerClass}`}>
                <div className="flex items-center gap-2 flex-1">
                    {icon}
                    <input 
                        type="text" 
                        value={team?.name || ''} 
                        onChange={(e) => onUpdateTeamName(id, e.target.value)} 
                        placeholder={placeholder} 
                        className={`
                            w-full bg-transparent text-sm font-black uppercase tracking-wider 
                            focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1
                            ${textClass} placeholder-current/40
                        `}
                    />
                </div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${isQueue ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-black/20 text-white'}`}>
                    {team?.players.length || 0}/6
                </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                {team?.players.map((p: Player) => (
                    <PlayerItem key={p.id} player={p} locationId={id} onRemove={onRemovePlayer} onToggleFixed={onTogglePlayerFixed} lang={lang} />
                ))}
                {(team?.players.length || 0) === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-60">
                        <User size={24} className="mb-1" />
                        <span className="text-xs italic">{t(lang, 'emptyQueue')}</span>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md" onMouseDown={onClose}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/10" onMouseDown={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                        <Users size={22} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight hidden sm:block">{t(lang, 'teamManager')}</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={onUndo} disabled={!canUndo} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"><RotateCcw size={20} /></button>
                    <button onClick={onClose} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"><X size={20} /></button>
                </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <button onClick={() => setActiveTab('roster')} className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'roster' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t(lang, 'manageTeams')}</button>
                <button onClick={() => setActiveTab('generator')} className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'generator' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t(lang, 'editList')}</button>
            </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-slate-50 dark:bg-black/20">
          <AnimatePresence mode="wait">
            {activeTab === 'roster' && (
              <motion.div key="roster" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full flex flex-col md:flex-row gap-4">
                  
                  {/* QUADRAS (A e B) */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-[300px]">
                       <TeamColumn team={teamA} id="A" headerColorBg="bg-indigo-600" headerColorText="text-white" placeholder={t(lang, 'home' as any)} />
                       <TeamColumn team={teamB} id="B" headerColorBg="bg-rose-600" headerColorText="text-white" placeholder={t(lang, 'guest' as any)} />
                  </div>

                  {/* FILA (Queue) */}
                  <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                     <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                        <ClipboardList size={18} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{t(lang, 'queue')}</span>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50/50 dark:bg-black/20">
                        {queue.map(team => (
                            <div key={team.id}>
                                <TeamColumn team={team} id={team.id} placeholder="Nome do Time..." icon={null} />
                            </div>
                        ))}
                        {queue.length === 0 && <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-xs italic">{t(lang, 'emptyQueue')}</div>}
                     </div>
                  </div>
              </motion.div>
            )}

            {/* GERADOR */}
            {activeTab === 'generator' && (
              <motion.div key="generator" className="h-full flex flex-col">
                 <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col relative group shadow-sm">
                    <textarea value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder={t(lang, 'namesPlaceholder')} className="flex-1 w-full bg-transparent text-sm font-mono focus:outline-none resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                 </div>
                 <button onClick={() => { onGenerate(namesText, {}, {}); setActiveTab('roster'); }} className="mt-4 w-full py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><RefreshCw size={20} />{t(lang, 'generateTeams')}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};