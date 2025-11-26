import React, { useState, useEffect } from 'react';
import { useVolleyGame } from './hooks/useVolleyGame';
import { ScoreCard } from './components/ScoreCard';
import { Controls } from './components/Controls';
import { HistoryBar } from './components/HistoryBar';
import { MatchOverModal } from './components/MatchOverModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamManagerModal } from './components/TeamManagerModal';
import { TeamId, Language, ThemeMode } from './types';
import { SETS_TO_WIN_MATCH } from './constants';
import { Minimize } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const {
    state,
    isLoaded,
    addPoint,
    subtractPoint,
    undo,
    resetMatch,
    toggleSides,
    toggleService,
    useTimeout,
    applySettings,
    setTeamNames,
    canUndo,
    generateTeams,
    updateRosters,
    rotateTeams,
    updateTeamName,
    movePlayer,
    removePlayer
  } = useVolleyGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [lang, setLang] = useState<Language>('pt'); 
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detecção Robusta de Orientação e Resize
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        setIsFullscreen(true);
      });
    } else {
      setIsFullscreen(true);
    }
  };

  const exitFullscreenMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  // @ts-ignore
  const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV;

  const leftTeamId: TeamId = state.swappedSides ? 'B' : 'A';
  const rightTeamId: TeamId = state.swappedSides ? 'A' : 'B';

  const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
  const useTieBreak = isDecidingSet && state.config.hasTieBreak;
  const targetPoints = state.inSuddenDeath ? 3 : (useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet);

  if (!isLoaded) return null;

  return (
    <div className="relative h-full w-full bg-slate-50 dark:bg-[#020617] transition-colors duration-300 overflow-hidden">
      
      {/* LAYER 0: Main Game Area (Background & Score) */}
      <main className={`absolute inset-0 z-0 flex md:flex-row overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'}`}>
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
          isFullscreen={isFullscreen} 
        />

        {/* Divisor Visual */}
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
          isFullscreen={isFullscreen}
        />
      </main>

      {/* LAYER 1: Floating Bars (Top & Bottom) */}
      <AnimatePresence>
        {!isFullscreen && (
          <>
            {/* Top Bar Container - Adicionado pt-[safe-area] para respeitar notch */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none pt-[env(safe-area-inset-top)]">
              <div className="pointer-events-auto">
                <HistoryBar 
                  history={state.history} 
                  currentSet={state.currentSet}
                  swapped={state.swappedSides}
                  lang={lang}
                  maxSets={state.config.maxSets}
                  matchDurationSeconds={state.matchDurationSeconds}
                  isTimerRunning={state.isTimerRunning}
                />
              </div>
            </div>

            {/* Bottom Controls Container - Adicionado pb-[safe-area] para respeitar home indicator */}
            <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
               <div className="pointer-events-auto">
                <Controls 
                  onUndo={undo}
                  onReset={() => resetMatch()}
                  onSwap={toggleSides}
                  onSettings={() => setIsSettingsOpen(true)}
                  onFullscreen={toggleFullscreenMode}
                  onOpenTeamManager={() => setIsTeamManagerOpen(true)}
                  canUndo={canUndo}
                  lang={lang}
                />
               </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* LAYER 2: Modals & Overlays */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={exitFullscreenMode}
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all"
            style={{ marginBottom: 'env(safe-area-inset-bottom)', marginRight: 'env(safe-area-inset-right)' }}
          >
            <Minimize size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <MatchOverModal 
        winner={state.matchWinner}
        onReset={() => resetMatch()}
        onRotate={rotateTeams} 
        lang={lang}
        teamAName={state.teamAName}
        teamBName={state.teamBName}
        history={state.history}
        finalSetsA={state.setsA}
        finalSetsB={state.setsB}
        hasQueue={state.queue.length > 0}
        rotationReport={state.rotationReport}
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

      <TeamManagerModal
        isOpen={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        lang={lang}
        onGenerate={generateTeams}
        onUpdateRosters={updateRosters}
        onUpdateTeamName={updateTeamName}
        onMovePlayer={movePlayer} 
        onRemovePlayer={removePlayer}
        onUndo={undo}
        canUndo={canUndo}
        teamA={state.teamARoster}
        teamB={state.teamBRoster}
        queue={state.queue}
      />
    </div>
  );
}