import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Check, Info, Moon, Sun, Languages, Users, BookOpen, Zap, Trophy, LayoutTemplate, Loader2 } from 'lucide-react';
import { GameConfig, Language, ThemeMode } from '../types';
import { t } from '../constants';

interface OptionButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const OptionButton: React.FC<OptionButtonProps> = ({ 
  active, 
  onClick, 
  children 
}) => (
  <button
    onClick={onClick}
    className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95 ${
      active
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    {children}
  </button>
);

interface SettingsModalProps {
  currentConfig: GameConfig;
  teamAName: string;
  teamBName: string;
  isOpen: boolean;
  onClose: () => void;
  // NOVO: onSave unificado para passar Configuração e Nomes
  onSave: (config: GameConfig, nameA: string, nameB: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentConfig, 
  teamAName,
  teamBName,
  isOpen, 
  onClose, 
  onSave,
  lang,
  setLang,
  themeMode,
  setThemeMode
}) => {
  const [config, setConfig] = useState<GameConfig>(currentConfig);
  const [nameA, setNameA] = useState(teamAName);
  const [nameB, setNameB] = useState(teamBName);
  const [showRuleInfo, setShowRuleInfo] = useState(false);
  const [showOfficialRules, setShowOfficialRules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
      setNameA(teamAName);
      setNameB(teamBName);
      setIsSaving(false);
    }
  }, [isOpen, currentConfig, teamAName, teamBName]);

  if (!isOpen) return null;

  const handleSave = (e: React.MouseEvent) => {
    // Prevenção de eventos fantasmas e propagação
    e.preventDefault();
    e.stopPropagation();
    
    // Feedback visual imediato
    setIsSaving(true);
    
    // Feedback tátil
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);

    // CÓDIGO REVERTIDO PARA ASSÍNCRONO: Mantendo o bug da race condition do cliente, mas corrigindo a chamada
    setTimeout(() => {
        // CHAMADA UNIFICADA: Passa config, nome A e nome B
        onSave(config, nameA, nameB);
        
        // Finaliza o estado de loading e fecha
        setIsSaving(false);
        onClose();
    }, 150); 
  };

  const currentSetsToWin = Math.ceil(config.maxSets / 2);

  const applyPreset = (type: 'monday' | 'official') => {
    if (type === 'monday') {
      setConfig({
        ...config,
        maxSets: 1,
        pointsPerSet: 15,
        hasTieBreak: false,
        deuceType: 'sudden_death_3pt'
      });
    } else {
      setConfig({
        ...config,
        maxSets: 5,
        pointsPerSet: 25,
        hasTieBreak: true,
        tieBreakPoints: 15,
        deuceType: 'standard'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 h-[100dvh] w-screen touch-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex-none p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-300">
                <Settings size={20} />
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">{t(lang, 'settingsTitle')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 p-6 space-y-8 overflow-y-auto custom-scrollbar overscroll-contain touch-pan-y">
          
          {/* Presets */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <LayoutTemplate size={12} />
              {t(lang, 'presets')}
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => applyPreset('monday')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
                        config.maxSets === 1 && config.pointsPerSet === 15 && config.deuceType === 'sudden_death_3pt'
                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <Zap size={20} className={config.maxSets === 1 && config.pointsPerSet === 15 && config.deuceType === 'sudden_death_3pt' ? 'text-rose-500' : 'text-slate-400'} />
                    <span>{t(lang, 'mondayVolley')}</span>
                </button>

                <button
                    onClick={() => applyPreset('official')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
                        config.maxSets === 5 && config.pointsPerSet === 25 && config.deuceType === 'standard'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <Trophy size={20} className={config.maxSets === 5 && config.pointsPerSet === 25 && config.deuceType === 'standard' ? 'text-indigo-500' : 'text-slate-400'} />
                    <span>{t(lang, 'officialStandard')}</span>
                </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* Rules Info */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-white/5">
             <button 
               onClick={() => setShowOfficialRules(!showOfficialRules)}
               className="flex items-center justify-between w-full text-left"
             >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                    <BookOpen size={16} className="text-indigo-500" />
                    <span>{t(lang, 'officialRulesTitle')}</span>
                </div>
                <Info size={16} className={`text-slate-400 transition-transform ${showOfficialRules ? 'rotate-180' : ''}`} />
             </button>
             {showOfficialRules && (
                 <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                 >
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                        {t(lang, 'officialRulesText')}
                    </p>
                 </motion.div>
             )}
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* Team Names */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={12} />
              {t(lang, 'teamNames')}
            </label>
            <div className="grid gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500"></div>
                <input 
                  type="text" 
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  placeholder={t(lang, 'home')}
                  className="w-full pl-8 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500"></div>
                <input 
                  type="text" 
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  placeholder={t(lang, 'guest')}
                  className="w-full pl-8 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* Appearance */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              {t(lang, 'appearance')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 cursor-pointer"
              >
                <Languages size={16} />
                <span>{lang === 'en' ? 'English' : 'Português'}</span>
              </button>

              <button 
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 cursor-pointer"
              >
                {themeMode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{themeMode === 'light' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* Match Type */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              {t(lang, 'matchType')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((wins) => (
                <OptionButton
                  key={wins}
                  active={currentSetsToWin === wins}
                  onClick={() => setConfig({ ...config, maxSets: wins * 2 - 1 })}
                >
                  {wins}
                </OptionButton>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">
               {t(lang, 'winByTaking')} 
               <strong className="text-slate-700 dark:text-slate-300 mx-1">{currentSetsToWin}</strong> 
               {t(lang, 'setsFirst')}
            </p>
          </div>

          {/* Points */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              {t(lang, 'pointsPerSet')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 21, 25].map((pts) => (
                <OptionButton
                  key={pts}
                  active={config.pointsPerSet === pts}
                  onClick={() => setConfig({ ...config, pointsPerSet: pts })}
                >
                  {pts} pts
                </OptionButton>
              ))}
            </div>
          </div>
          
           {/* Tiebreak */}
           <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t(lang, 'tieBreakPoints')}
              </label>
            </div>
            
            <div className="mb-3 flex items-center gap-3">
                <button 
                  onClick={() => setConfig({ ...config, hasTieBreak: !config.hasTieBreak })}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
                    config.hasTieBreak ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    config.hasTieBreak ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(lang, 'tieBreakOption')}
                </span>
            </div>

            {config.hasTieBreak && (
                <div className="grid grid-cols-2 gap-3 mb-2">
                {[15, 25].map((pts) => (
                    <OptionButton
                    key={pts}
                    active={config.tieBreakPoints === pts}
                    onClick={() => setConfig({ ...config, tieBreakPoints: pts })}
                    >
                    {pts} pts
                    </OptionButton>
                ))}
                </div>
            )}
            
            {!config.hasTieBreak && (
                <p className="text-xs text-slate-500 italic mb-2">
                   {t(lang, 'tieBreakNote')}
                </p>
            )}
          </div>

          {/* Deuce Rule */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t(lang, 'deuceRule')}
              </label>
              <button 
                onClick={() => setShowRuleInfo(!showRuleInfo)}
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Info size={16} />
              </button>
            </div>

            {showRuleInfo && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 leading-relaxed"
               >
                 <strong className="text-slate-900 dark:text-white">{t(lang, 'deuceInfoTitle')}</strong><br/>
                 - {t(lang, 'deuceInfoStd')}<br/>
                 - {t(lang, 'deuceInfoReset')}
               </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setConfig({ ...config, deuceType: 'standard' })}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all border flex justify-between items-center cursor-pointer ${
                  config.deuceType === 'standard'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{t(lang, 'deuceStd')}</span>
                {config.deuceType === 'standard' && <Check size={16} />}
              </button>

              <button
                onClick={() => setConfig({ ...config, deuceType: 'sudden_death_3pt' })}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all border flex justify-between items-center cursor-pointer ${
                  config.deuceType === 'sudden_death_3pt'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{t(lang, 'deuceReset')}</span>
                {config.deuceType === 'sudden_death_3pt' && <Check size={16} />}
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex-none p-6 pb-8 md:pb-6 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-white/5 z-20">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] ${
                isSaving 
                ? 'bg-indigo-600 text-white cursor-wait opacity-80'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90'
            }`}
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            <span>{isSaving ? t(lang, 'saveAndReset') + '...' : t(lang, 'saveAndReset')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};