import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameConfig, Language, ThemeMode } from '../types';
import { t, SETS_TO_WIN_MATCH } from '../constants';
import { 
    X, 
    Save, 
    Settings as SettingsIcon, 
    BookOpen, 
    Palette, 
    Check, 
    Zap,
    Moon,
    Sun,
    Trophy
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentConfig: GameConfig;
  teamAName: string;
  teamBName: string;
  onClose: () => void;
  onSave: (newConfig: GameConfig, teamAName: string, teamBName: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

// Componente de Input Numérico Adaptável
const NumberInput: React.FC<{ label: string, value: number, onChange: (v: number) => void, min: number, max: number, info?: string }> = 
    React.memo(({ label, value, onChange, min, max, info }) => {
    return (
      <div className="flex justify-between items-center p-4 bg-white shadow-sm dark:shadow-none dark:bg-white/5 rounded-xl ring-1 ring-black/5 dark:ring-white/5 transition-all">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
          {info && <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{info}</span>}
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-black/20 rounded-lg p-1 ring-1 ring-black/5 dark:ring-white/5">
            <button 
                onClick={() => value > min && onChange(value - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition shadow-sm dark:shadow-none"
            >-</button>
            <span className="w-8 text-center font-mono font-bold text-slate-800 dark:text-white">{value}</span>
            <button 
                onClick={() => value < max && onChange(value + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition shadow-sm dark:shadow-none"
            >+</button>
        </div>
      </div>
    );
  });
  
// Componente Toggle Adaptável
const ToggleButton: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = 
    React.memo(({ label, value, onChange }) => (
      <div 
        className="flex justify-between items-center p-4 bg-white shadow-sm dark:shadow-none dark:bg-white/5 rounded-xl ring-1 ring-black/5 dark:ring-white/5 cursor-pointer transition-all" 
        onClick={() => onChange(!value)}
      >
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <div className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700/50'}`}>
          <motion.div
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: value ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>
    ));

// Componente Radio Adaptável
const RadioButton: React.FC<{ label: string, value: string, currentValue: string, onChange: (v: string) => void, info: string, icon?: React.ReactNode }> = 
    React.memo(({ label, value, currentValue, onChange, info, icon }) => {
      const isSelected = value === currentValue;
      return (
        <div 
            onClick={() => onChange(value)}
            className={`
                relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group
                ${isSelected 
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                    : 'bg-white dark:bg-white/5 border-transparent ring-1 ring-black/5 dark:ring-transparent hover:bg-slate-50 dark:hover:bg-white/10'
                }
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {icon && <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>{icon}</div>}
                    <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{label}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-[90%]">{info}</p>
                    </div>
                </div>
                {isSelected && <div className="bg-indigo-500 rounded-full p-1"><Check size={12} className="text-white" /></div>}
            </div>
        </div>
      );
    });

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentConfig,
  teamAName: initialTeamAName,
  teamBName: initialTeamBName,
  onClose,
  onSave,
  lang,
  setLang,
  themeMode,
  setThemeMode,
}) => {
  if (!isOpen) return null;

  const [config, setConfig] = useState<GameConfig>(currentConfig);
  const [teamAName, setTeamAName] = useState(initialTeamAName);
  const [teamBName, setTeamBName] = useState(initialTeamBName);
  const [confirmReset, setConfirmReset] = useState(false);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(config) !== JSON.stringify(currentConfig) ||
      teamAName !== initialTeamAName ||
      teamBName !== initialTeamBName
    );
  }, [config, currentConfig, teamAName, initialTeamAName, teamBName, initialTeamBName]);

  const handleSave = useCallback(() => {
    onSave(config, teamAName, teamBName);
  }, [config, teamAName, teamBName, onSave]);

  const handleFactoryReset = useCallback(() => {
    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    } else {
      setConfirmReset(true);
    }
  }, [confirmReset]);

  const handleConfigChange = useCallback((key: keyof GameConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePreset = useCallback((preset: 'official' | 'monday') => {
    if (preset === 'official') {
      setConfig({
        pointsPerSet: 25,
        tieBreakPoints: 15,
        hasTieBreak: true,
        maxSets: 5,
        deuceType: 'standard',
      });
    } else if (preset === 'monday') {
      setConfig({
        pointsPerSet: 15,
        tieBreakPoints: 11,
        hasTieBreak: false,
        maxSets: 1,
        deuceType: 'sudden_death_3pt', 
      });
    }
  }, []);
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-md" onMouseDown={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        onMouseDown={(e) => e.stopPropagation()}
        // CONTAINER PRINCIPAL: Light (bg-slate-50) / Dark (bg-slate-950)
        className="w-full max-w-lg max-h-[90vh] bg-slate-50/95 dark:bg-slate-950/90 backdrop-blur-2xl rounded-3xl shadow-2xl dark:shadow-black/50 overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/10" 
      >
        
        {/* Header */}
        <div className="relative p-6 bg-white/60 dark:bg-white/5 border-b border-black/5 dark:border-white/5 shrink-0 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30 text-white">
                    <SettingsIcon size={20} />
                </div>
                {t(lang, 'settingsTitle')}
            </h3>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
            {/* 1. VISUAL & TEAMS */}
            <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Palette size={14} /> {t(lang, 'appearance')}
                </h4>
                
                {/* Theme & Lang Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 flex flex-col gap-2 shadow-sm dark:shadow-none">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t(lang, 'language')}</span>
                         <div className="flex bg-slate-100 dark:bg-black/30 rounded-lg p-1">
                            <button 
                                onClick={() => setLang('pt')} 
                                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${lang === 'pt' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                            >PT</button>
                            <button 
                                onClick={() => setLang('en')} 
                                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${lang === 'en' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                            >EN</button>
                         </div>
                    </div>
                     <div className="p-3 bg-white dark:bg-white/5 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 flex flex-col gap-2 shadow-sm dark:shadow-none">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t(lang, 'theme')}</span>
                        <div className="flex bg-slate-100 dark:bg-black/30 rounded-lg p-1">
                            <button 
                                onClick={() => setThemeMode('light')} 
                                className={`flex-1 flex justify-center py-1.5 rounded-md transition-all ${themeMode === 'light' ? 'bg-yellow-400 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                            ><Sun size={14} /></button>
                            <button 
                                onClick={() => setThemeMode('dark')} 
                                className={`flex-1 flex justify-center py-1.5 rounded-md transition-all ${themeMode === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                            ><Moon size={14} /></button>
                         </div>
                    </div>
                </div>

                {/* Team Names Inputs */}
                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_currentColor]"></div>
                        <input
                            type="text"
                            value={teamAName}
                            onChange={(e) => setTeamAName(e.target.value)}
                            placeholder={t(lang, 'home')}
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_currentColor]"></div>
                        <input
                            type="text"
                            value={teamBName}
                            onChange={(e) => setTeamBName(e.target.value)}
                            placeholder={t(lang, 'guest')}
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>
            </section>

            {/* 2. RULES */}
            <section className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <BookOpen size={14} /> {t(lang, 'officialRulesTitle')}
                </h4>

                 {/* Presets */}
                 <div className="grid grid-cols-2 gap-3 mb-2">
                    <button onClick={() => handlePreset('official')} className="px-3 py-2 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 transition-all">
                        {t(lang, 'officialStandard')}
                    </button>
                    <button onClick={() => handlePreset('monday')} className="px-3 py-2 bg-emerald-50 dark:bg-emerald-600/10 hover:bg-emerald-100 dark:hover:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition-all">
                        {t(lang, 'mondayVolley')}
                    </button>
                 </div>

                 <div className="space-y-2">
                    <NumberInput 
                        label={t(lang, 'setsLabel')}
                        value={config.maxSets} 
                        onChange={(v) => handleConfigChange('maxSets', v)} 
                        min={1} max={5} 
                        info={`${t(lang, 'winByTaking')} ${SETS_TO_WIN_MATCH(config.maxSets)}`}
                    />
                    <NumberInput 
                        label={t(lang, 'pointsPerSet')}
                        value={config.pointsPerSet} 
                        onChange={(v) => handleConfigChange('pointsPerSet', v)} 
                        min={5} max={50}
                    />
                     <ToggleButton
                        label={t(lang, 'tieBreakOption')}
                        value={config.hasTieBreak}
                        onChange={(v) => handleConfigChange('hasTieBreak', v)}
                    />
                    {config.hasTieBreak && (
                        <NumberInput 
                            label={t(lang, 'tieBreakPoints')}
                            value={config.tieBreakPoints} 
                            onChange={(v) => handleConfigChange('tieBreakPoints', v)} 
                            min={5} max={25}
                        />
                    )}
                 </div>
            </section>

            {/* 3. DEUCE RULES */}
            <section className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Trophy size={14} /> {t(lang, 'deuceRule')}
                </h4>
                <div className="grid gap-3">
                    <RadioButton
                        label={t(lang, 'deuceStd')}
                        value="standard"
                        currentValue={config.deuceType}
                        onChange={(v) => handleConfigChange('deuceType', v as any)}
                        info={t(lang, 'deuceInfoStd')}
                        icon={<span className="text-xs font-black">+2</span>}
                    />
                    <RadioButton
                        label={t(lang, 'deuce3pt')}
                        value="sudden_death_3pt"
                        currentValue={config.deuceType}
                        onChange={(v) => handleConfigChange('deuceType', v as any)}
                        info={t(lang, 'firstTo3')}
                        icon={<Zap size={14} />}
                    />
                </div>
            </section>

             {/* 4. DANGER ZONE */}
             <section className="pt-4 border-t border-black/5 dark:border-white/5">
                <button
                    onClick={handleFactoryReset}
                    className={`w-full py-3 rounded-xl border border-dashed transition-all font-bold text-sm flex items-center justify-center gap-2
                        ${confirmReset 
                            ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300' 
                            : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-rose-400 hover:text-rose-500'
                        }`}
                >
                    {confirmReset ? t(lang, 'factoryResetConfirm') : t(lang, 'factoryReset')}
                </button>
             </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 dark:bg-slate-900/50 border-t border-black/5 dark:border-white/5 shrink-0">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
              hasChanges 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-[0.98]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <Save size={18} />
            <span>{t(lang, 'saveAndReset')}</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};