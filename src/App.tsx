import React, { useState, useEffect } from 'react';
import { useVolleyGame } from './hooks/useVolleyGame';
import { ScoreCard } from './components/ScoreCard';
import { Controls } from './components/Controls';
import { HistoryBar } from './components/HistoryBar';
import { MatchOverModal } from './components/MatchOverModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamManagerModal } from './components/TeamManagerModal';
import { InstallInstructionsModal } from './components/InstallInstructionsModal';
import { WelcomeInstallModal } from './components/WelcomeInstallModal';
import { UpdateToast } from './components/UpdateToast'; 
import { usePWAInstall } from './hooks/usePWAInstall'; 
import { useServiceWorker } from './hooks/useServiceWorker'; 
import { useWakeLock } from './hooks/useWakeLock'; 
import { Language, ThemeMode } from './types'; 
import { SETS_TO_WIN_MATCH } from './constants';
import { Minimize, Download } from 'lucide-react'; 
import { AnimatePresence, motion } from 'framer-motion';

const checkFullscreen = () => !!(document.fullscreenElement);

const PWAInstallFloatingButton: React.FC<{ show: boolean; onClick: () => void; lang: Language; themeMode: ThemeMode; isIOS: boolean; needsUpdate: boolean; onUpdate: () => void; }> = ({ show, onClick, isIOS, needsUpdate, onUpdate }) => (
    <AnimatePresence>
        {needsUpdate && <UpdateToast needsUpdate={needsUpdate} onUpdate={onUpdate} lang="pt" themeMode="dark" />}
        {show && !needsUpdate && (
            <motion.button initial={{ scale: 0, x: 50 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0, x: 50 }} onClick={onClick} className={`fixed top-[40%] right-4 z-50 p-4 rounded-full text-white shadow-xl ${isIOS ? 'bg-indigo-600' : 'bg-green-600'}`} style={{ top: 'calc(40% + env(safe-area-inset-top))' }}><Download size={24} /></motion.button>
        )}
    </AnimatePresence>
);

export default function App() {
  const {
    state, isLoaded, addPoint, subtractPoint, undo, resetMatch, toggleSides, toggleService, useTimeout, applySettings, canUndo, generateTeams, updateRosters, rotateTeams, updateTeamName, movePlayer, removePlayer, togglePlayerFixed 
  } = useVolleyGame();

  const { deferredPrompt, isInstalled, installPWA, isIOS, isStandalone, showInstructions, dismissInstructions } = usePWAInstall(); 
  const { needsUpdate, updateApp } = useServiceWorker();
  useWakeLock(isLoaded && !state.isMatchOver);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [lang, setLang] = useState<Language>('pt'); 
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(checkFullscreen());
  const [isIosInstructionsOpen, setIsIosInstructionsOpen] = useState(false); 

  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    const handleFullscreenChange = () => setIsFullscreen(checkFullscreen());
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => { window.removeEventListener('resize', checkOrientation); document.removeEventListener('fullscreenchange', handleFullscreenChange); };
  }, []);

  const toggleFullscreen = () => { if (checkFullscreen()) document.exitFullscreen(); else document.documentElement.requestFullscreen(); };
  useEffect(() => { if (showInstructions) setIsIosInstructionsOpen(true); }, [showInstructions]);
  const handleCloseIosInstructions = () => { setIsIosInstructionsOpen(false); dismissInstructions(); };
  const onInstallClick = () => { if (isIOS) setIsIosInstructionsOpen(true); else if (deferredPrompt) installPWA(); };
  const showInstallButton = !isInstalled && (isIOS || !!deferredPrompt);

  if (!isLoaded) return <div className="flex justify-center items-center h-screen bg-slate-950 text-white">Carregando Placar...</div>;

  return (
    <div className={`relative min-h-screen ${themeMode === 'dark' ? 'dark' : 'light'} texture-noise`}>
      <div className={`flex flex-col h-screen transition-colors duration-300 relative translate-z-0 ${isLandscape ? 'md:flex-row' : 'flex-col'}`}>
        <ScoreCard teamId="A" teamName={state.teamAName} score={state.scoreA} opponentScore={state.scoreB} setsWon={state.setsA} maxSets={state.config.maxSets} setsToWinMatch={SETS_TO_WIN_MATCH(state.config.maxSets)} isWinner={state.matchWinner === 'A'} inSuddenDeath={state.inSuddenDeath} isServing={state.servingTeam === 'A'} timeoutsUsed={state.timeoutsA} onAdd={() => addPoint('A')} onSubtract={() => subtractPoint('A')} onToggleService={toggleService} onUseTimeout={() => useTimeout('A')} pointsToWinSet={state.config.pointsPerSet} lang={lang} isLandscape={isLandscape} isFullscreen={isFullscreen} themeMode={themeMode} className={`${state.swappedSides ? 'order-2' : 'order-1'}`} />
        <ScoreCard teamId="B" teamName={state.teamBName} score={state.scoreB} opponentScore={state.scoreA} setsWon={state.setsB} maxSets={state.config.maxSets} setsToWinMatch={SETS_TO_WIN_MATCH(state.config.maxSets)} isWinner={state.matchWinner === 'B'} inSuddenDeath={state.inSuddenDeath} isServing={state.servingTeam === 'B'} timeoutsUsed={state.timeoutsB} onAdd={() => addPoint('B')} onSubtract={() => subtractPoint('B')} onToggleService={toggleService} onUseTimeout={() => useTimeout('B')} pointsToWinSet={state.config.pointsPerSet} lang={lang} isLandscape={isLandscape} isFullscreen={isFullscreen} themeMode={themeMode} className={`${state.swappedSides ? 'order-1' : 'order-2'}`} />
      </div>

      <AnimatePresence>
        {!isFullscreen && ( 
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-0 right-0 z-[70] pt-[env(safe-area-inset-top)]" >
            <HistoryBar history={state.history} currentSet={state.currentSet} maxSets={state.config.maxSets} lang={lang} themeMode={themeMode} swapped={state.swappedSides} matchDurationSeconds={state.matchDurationSeconds} isTimerRunning={state.isTimerRunning} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isFullscreen && ( 
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-[99] pb-[env(safe-area-inset-bottom)]">
            <Controls onUndo={undo} canUndo={canUndo} onSwap={toggleSides} onReset={() => resetMatch()} onSettings={() => setIsSettingsOpen(true)} onOpenTeamManager={() => setIsTeamManagerOpen(true)} onFullscreen={toggleFullscreen} lang={lang} themeMode={themeMode} isMatchOver={state.isMatchOver} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <PWAInstallFloatingButton show={showInstallButton} onClick={onInstallClick} lang={lang} themeMode={themeMode} isIOS={isIOS} needsUpdate={needsUpdate} onUpdate={updateApp} />
      <AnimatePresence>{isFullscreen && <motion.button onClick={toggleFullscreen} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`fixed bottom-4 right-4 z-50 p-2 text-white rounded-full ${themeMode === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'}`} style={{ marginBottom: 'env(safe-area-inset-bottom)', marginRight: 'env(safe-area-inset-right)' }}><Minimize size={20} /></motion.button>}</AnimatePresence>

      <MatchOverModal 
        winner={state.matchWinner}
        onReset={() => resetMatch()}
        onRotate={rotateTeams} 
        onClose={() => updateTeamName('ignore', 'ignore')} 
        lang={lang}
        teamAName={state.teamAName}
        teamBName={state.teamBName}
        history={state.history}
        finalSetsA={state.setsA}
        finalSetsB={state.setsB}
        hasQueue={state.queue.length > 0}
        queue={state.queue}
        teamARoster={state.teamARoster}
        teamBRoster={state.teamBRoster}
        rotationReport={state.rotationReport}
      />

      <SettingsModal isOpen={isSettingsOpen} currentConfig={state.config} teamAName={state.teamAName} teamBName={state.teamBName} onClose={() => setIsSettingsOpen(false)} onSave={(newConfig, nameA, nameB) => { applySettings(newConfig, { nameA, nameB }); setIsSettingsOpen(false); }} lang={lang} setLang={setLang} themeMode={themeMode} setThemeMode={setThemeMode} />
      <TeamManagerModal isOpen={isTeamManagerOpen} onClose={() => setIsTeamManagerOpen(false)} lang={lang} onGenerate={generateTeams} onUpdateRosters={updateRosters} onUpdateTeamName={updateTeamName} onMovePlayer={movePlayer} onRemovePlayer={removePlayer} onTogglePlayerFixed={togglePlayerFixed} onUndo={undo} canUndo={canUndo} teamA={state.teamARoster} teamB={state.teamBRoster} queue={state.queue} />
      <WelcomeInstallModal deferredPrompt={deferredPrompt} isInstalled={isInstalled} isIOS={isIOS} isStandalone={isStandalone} onInstall={installPWA} onShowIosInstructions={() => setIsIosInstructionsOpen(true)} lang={lang} />
      <InstallInstructionsModal isOpen={isIosInstructionsOpen} onClose={handleCloseIosInstructions} lang={lang} />
    </div>
  );
}