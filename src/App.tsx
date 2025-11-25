import React, { useState, useEffect, useRef } from 'react';
import { useVolleyGame } from './hooks/useVolleyGame';
import { useWakeLock } from './hooks/useWakeLock';
import { useSound } from './hooks/useSound';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOrientation } from './hooks/useOrientation'; // NOVO HOOK
import { ScoreCard } from './components/ScoreCard';
import { Controls } from './components/Controls';
import { HistoryBar } from './components/HistoryBar';
import { MatchOverModal } from './components/MatchOverModal';
import { SettingsModal } from './components/SettingsModal';
import { InstallInstructionsModal } from './components/InstallInstructionsModal';
import { TeamId, Language, ThemeMode } from './types';
import { SETS_TO_WIN_MATCH, t } from './constants';
import { Minimize, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const {
    state, isLoaded, addPoint, subtractPoint, undo, resetMatch,
    toggleSides, toggleService, useTimeout, applySettings, setTeamNames, canUndo
  } = useVolleyGame();

  useWakeLock();
  
  // Orientação Automática
  const isLandscape = useOrientation();

  // PWA & Install
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const handleInstallClick = () => isIOS ? setShowIOSInstructions(true) : install();
  
  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState<Language>('pt'); 
  const { speak, playBeep } = useSound(lang, soundEnabled);
  
  // Audio Refs
  const prevScoreA = useRef(0);
  const prevScoreB = useRef(0);
  const prevSet = useRef(1);

  useEffect(() => {
    if (isLoaded) {
      prevScoreA.current = state.scoreA;
      prevScoreB.current = state.scoreB;
      prevSet.current = state.currentSet;
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (state.scoreA > prevScoreA.current || state.scoreB > prevScoreB.current) {
      playBeep(600, 50);
      const scoringTeam = state.scoreA > prevScoreA.current ? 'A' : 'B';
      const nameKey = scoringTeam === 'A' ? 'home' : 'guest';
      const defaultName = t(lang, nameKey);
      const teamName = (scoringTeam === 'A' ? state.teamAName : state.teamBName) || defaultName;
      setTimeout(() => { speak(`${t(lang, 'point')} ${teamName}`); }, 100);
    }
    if (state.currentSet > prevSet.current) {
        const lastSet = state.history[state.history.length - 1];
        if (lastSet) {
            const winnerName = lastSet.winner === 'A' ? (state.teamAName || t(lang, 'home')) : (state.teamBName || t(lang, 'guest'));
            setTimeout(() => { speak(`${t(lang, 'set')} ${winnerName}`); }, 500);
        }
    }
    prevScoreA.current = state.scoreA;
    prevScoreB.current = state.scoreB;
    prevSet.current = state.currentSet;
  }, [state.scoreA, state.scoreB, state.currentSet, isLoaded, lang, playBeep, speak, state.teamAName, state.teamBName, state.history]);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [themeMode]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => setIsFullscreen(true));
    }
    setIsFullscreen(true);
  };

  const exitFullscreenMode = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    setIsFullscreen(false);
  };

  if (!isLoaded) return null;

  const leftTeamId: TeamId = state.swappedSides ? 'B' : 'A';
  const rightTeamId: TeamId = state.swappedSides ? 'A' : 'B';
  const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
  const useTieBreak = isDecidingSet && state.config.hasTieBreak;
  const targetPoints = state.inSuddenDeath ? 3 : (useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-slate-50 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* Botão de Som - Só mostra se NÃO estiver em fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-3 right-3 z-[60] mt-[env(safe-area-inset-top)]">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/10 shadow-sm hover:bg-white/20 active:scale-95 transition-all"
            >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
        </div>
      )}

      {/* History Bar - REMOVIDO do DOM se fullscreen */}
      {!isFullscreen && (
        <HistoryBar 
          history={state.history} 
          currentSet={state.currentSet}
          swapped={state.swappedSides}
          lang={lang}
          maxSets={state.config.maxSets}
          matchDurationSeconds={state.matchDurationSeconds}
          isTimerRunning={state.isTimerRunning}
          visible={true}
        />
      )}

      {/* Main Area */}
      <main className={`flex-1 flex md:flex-row relative overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'} ${isFullscreen ? 'p-0' : ''}`}>
        <ScoreCard
          teamId={leftTeamId}
          teamName={leftTeamId === 'A' ? state.teamAName : state.teamBName}
          score={leftTeamId === 'A' ? state.scoreA : state.scoreB}
          opponentScore={leftTeamId === 'A' ? state.scoreB : state.scoreA}
          setsWon={leftTeamId === 'A' ? state.setsA : state.setsB}
          maxSets={state.config.maxSets}
          setsToWinMatch={SETS_TO_WIN_MATCH(state.config.maxSets)}
          onAdd={() => addPoint(leftTeamId)}
          onSubtract={() => subtractPoint(leftTeamId)}
          onToggleService={toggleService}
          onUseTimeout={() => useTimeout(leftTeamId)}
          isWinner={state.matchWinner === leftTeamId}
          inSuddenDeath={state.inSuddenDeath}
          isServing={state.servingTeam === leftTeamId}
          timeoutsUsed={leftTeamId === 'A' ? state.timeoutsA : state.timeoutsB}
          pointsToWinSet={targetPoints}
          lang={lang}
          isLandscape={isLandscape}
          isFullscreen={isFullscreen} // NOVA PROP
        />

        <div className={`z-10 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/10 to-transparent ${isLandscape ? 'w-px h-full bg-gradient-to-b' : 'h-px w-full bg-gradient-to-r md:w-px md:h-full md:bg-gradient-to-b'}`} />

        <ScoreCard
          teamId={rightTeamId}
          teamName={rightTeamId === 'A' ? state.teamAName : state.teamBName}
          score={rightTeamId === 'A' ? state.scoreA : state.scoreB}
          opponentScore={rightTeamId === 'A' ? state.scoreB : state.scoreA} 
          setsWon={rightTeamId === 'A' ? state.setsA : state.setsB}
          maxSets={state.config.maxSets}
          setsToWinMatch={SETS_TO_WIN_MATCH(state.config.maxSets)}
          onAdd={() => addPoint(rightTeamId)}
          onSubtract={() => subtractPoint(rightTeamId)}
          onToggleService={toggleService}
          onUseTimeout={() => useTimeout(rightTeamId)}
          isWinner={state.matchWinner === rightTeamId}
          inSuddenDeath={state.inSuddenDeath}
          isServing={state.servingTeam === rightTeamId}
          timeoutsUsed={rightTeamId === 'A' ? state.timeoutsA : state.timeoutsB}
          pointsToWinSet={targetPoints}
          lang={lang}
          isLandscape={isLandscape}
          isFullscreen={isFullscreen} // NOVA PROP
        />
      </main>

      {/* Controls - REMOVIDO do DOM se fullscreen */}
      {!isFullscreen && (
        <Controls 
          onUndo={undo}
          onReset={() => resetMatch()}
          onSwap={toggleSides}
          onSettings={() => setIsSettingsOpen(true)}
          // onToggleLayout removido pois é automático agora
          onFullscreen={toggleFullscreenMode}
          onInstall={handleInstallClick}
          canInstall={isInstallable}
          canUndo={canUndo}
          lang={lang}
          isLandscape={isLandscape}
          visible={true}
        />
      )}

      {/* Botão de Sair Fullscreen - Única coisa visível além do placar */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={exitFullscreenMode}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-black/20 dark:bg-white/5 backdrop-blur-md text-white/50 hover:text-white rounded-full flex items-center justify-center border border-white/10 shadow-lg mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)]"
          >
            <Minimize size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      <MatchOverModal 
        winner={state.matchWinner}
        onReset={() => resetMatch()}
        lang={lang}
        teamAName={state.teamAName}
        teamBName={state.teamBName}
        history={state.history}
        finalSetsA={state.setsA}
        finalSetsB={state.setsB}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        currentConfig={state.config}
        teamAName={state.teamAName}
        teamBName={state.teamBName}
        onClose={() => setIsSettingsOpen(false)}
        onSave={applySettings}
        onSaveNames={setTeamNames}
        lang={lang}
        setLang={setLang}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      <AnimatePresence>
        {showIOSInstructions && (
            <InstallInstructionsModal 
                isOpen={showIOSInstructions} 
                onClose={() => setShowIOSInstructions(false)} 
                lang={lang}
            />
        )}
      </AnimatePresence>
    </div>
  );
}