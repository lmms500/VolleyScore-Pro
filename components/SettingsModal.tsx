
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Check, Info, Moon, Sun, Languages, Users, BookOpen } from 'lucide-react';
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
    className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
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
  onSave: (config: GameConfig) => void;
  onSaveNames: (nameA: string, nameB: string) => void;
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
  onSaveNames,
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

  // Sync internal state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
      setNameA(teamAName);
      setNameB(teamBName);
    }
  }, [isOpen, currentConfig, teamAName, teamBName]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onSaveNames(nameA, nameB);
    onClose();
  };

  // Helper to calculate sets to win based on maxSets
  // maxSets = 2*wins - 1  => wins = (maxSets + 1) / 2
  const currentSetsToWin = Math.ceil(config.maxSets / 2);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-300">
                <Settings size={20} />
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">{t(lang, 'settingsTitle')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Official Rules Section */}
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
              {lang === 'pt' ? 'Nomes dos Times' : 'Team Names'}
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

          {/* Global App Settings: Language & Theme */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              {t(lang, 'appearance')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Language Toggle */}
              <button 
                onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5"
              >
                <Languages size={16} />
                <span>{lang === 'en' ? 'English' : 'Português'}</span>
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5"
              >
                {themeMode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{themeMode === 'light' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* Sets Selection (Sets to Win) */}
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
               {lang === 'pt' ? 'Ganha quem vencer ' : 'Win by taking '} 
               <strong className="text-slate-700 dark:text-slate-300">{currentSetsToWin}</strong> 
               {lang === 'pt' ? ' sets primeiro.' : ' sets first.'}
            </p>
          </div>

          {/* Points Selection */}
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
          
           {/* Tiebreak Selection */}
           <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t(lang, 'tieBreakPoints')}
              </label>
            </div>
            
            {/* Enable/Disable TieBreak */}
            <div className="mb-3 flex items-center gap-3">
                <button 
                  onClick={() => setConfig({ ...config, hasTieBreak: !config.hasTieBreak })}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
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

          {/* Deuce Rule Selection */}
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
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all border flex justify-between items-center ${
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
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all border flex justify-between items-center ${
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

        <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/5 sticky bottom-0">
          <button
            onClick={handleSave}
            className="w-full py-4 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl active:scale-95 transition-transform hover:opacity-90"
          >
            <Check size={20} />
            <span>{t(lang, 'save')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
