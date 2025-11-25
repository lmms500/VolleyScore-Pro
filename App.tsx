import React, { useState, useEffect, useRef } from 'react';
import { useVolleyGame } from './hooks/useVolleyGame';
import { useWakeLock } from './hooks/useWakeLock';
import { useSound } from './hooks/useSound';
import { ScoreCard } from './components/ScoreCard';
import { Controls } from './components/Controls';
import { HistoryBar } from './components/HistoryBar';
import { MatchOverModal } from './components/MatchOverModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamId, Language, ThemeMode } from './types';
import { SETS_TO_WIN_MATCH, t } from './constants';
import { Minimize, Volume2, VolumeX } from 'lucide-react';
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
    canUndo
  } = useVolleyGame();

  // --- NOVAS IMPLEMENTAÇÕES ---
  
  // 1. Wake Lock (Tela sempre ligada)
  useWakeLock(); 
  
  // 2. Sistema de Som
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState<Language>('pt'); 
  const { speak, playBeep } = useSound(lang, soundEnabled);
  
  // Refs para detectar mudanças de estado e disparar áudio
  const prevScoreA = useRef(0);
  const prevScoreB = useRef(0);
  const prevSet = useRef(1);

  // Sincronizar refs quando o jogo carrega
  useEffect(() => {
    if (isLoaded) {
      prevScoreA.current = state.scoreA;
      prevScoreB.current = state.scoreB;
      prevSet.current = state.currentSet;
    }
  }, [isLoaded]);

  // Efeito principal de áudio e narração
  useEffect(() => {
    if (!isLoaded) return;

    // Detectar Ponto (apenas incremento)
    if (state.scoreA > prevScoreA.current || state.scoreB > prevScoreB.current) {
      playBeep(600, 50); // Beep curto e sutil
      
      const scoringTeam = state.scoreA > prevScoreA.current ? 'A' : 'B';
      // Prioriza nome personalizado, senão usa padrão (Casa/Visitante)
      const nameKey = scoringTeam === 'A' ? 'home' : 'guest';
      const defaultName = t(lang, nameKey);
      const teamName = (scoringTeam === 'A' ? state.teamAName : state.teamBName) || defaultName;
      
      // Narração: "Ponto [Nome do Time]"
      // Pequeno delay para não sobrepor o beep
      setTimeout(() => {
          speak(`${t(lang, 'point')} ${teamName}`);
      }, 100);
    }

    // Detectar Fim de Set
    if (state.currentSet > prevSet.current) {
        // Pega o vencedor do último set no histórico
        const lastSet = state.history[state.history.length - 1];
        if (lastSet) {
            const winnerName = lastSet.winner === 'A' ? (state.teamAName || t(lang, 'home')) : (state.teamBName || t(lang, 'guest'));
            setTimeout(() => {
                speak(`${t(lang, 'set')} ${winnerName}`);
            }, 500);
        }
    }

    // Atualizar refs para próxima renderização
    prevScoreA.current = state.scoreA;
    prevScoreB.current = state.scoreB;
    prevSet.current = state.currentSet;

  }, [state.scoreA, state.scoreB, state.currentSet, isLoaded, lang, playBeep, speak, state.teamAName, state.teamBName, state.history]);
  
  // ---------------------------

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  // Handle native fullscreen events
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
        // Fallback para iOS/Safari ou erro: apenas ajusta o estado da UI
        setIsFullscreen(true);
      });
    } else {
        // Já está full, talvez queira sair?
    }
    // Força atualização da UI
    setIsFullscreen(true);
  };

  const exitFullscreenMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  if (!isLoaded) return null;

  const leftTeamId: TeamId = state.swappedSides ? 'B' : 'A';
  const rightTeamId: TeamId = state.swappedSides ? 'A' : 'B';

  const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
  const useTieBreak = isDecidingSet && state.config.hasTieBreak;
  const targetPoints = state.inSuddenDeath ? 3 : (useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden">
      
      {/* Botão de Som (Flutuante no topo direito) */}
      <div className="absolute top-3 right-3 z-[60]">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/10 shadow-sm hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Toggle Sound"
          >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
      </div>

      {/* 1. Top Bar */}
      <HistoryBar 
        history={state.history} 
        currentSet={state.currentSet}
        swapped={state.swappedSides}
        lang={lang}
        maxSets={state.config.maxSets}
        matchDurationSeconds={state.matchDurationSeconds}
        isTimerRunning={state.isTimerRunning}
        visible={!isFullscreen}
      />

      {/* 2. Main Score Area */}
      <main className={`flex-1 flex md:flex-row relative overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'} ${isFullscreen ? 'p-0' : ''}`}>
        
        {/* Left/Top Team */}
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
        />

        {/* Divider */}
        <div className={`z-10 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/10 to-transparent ${isLandscape ? 'w-px h-full bg-gradient-to-b' : 'h-px w-full bg-gradient-to-r md:w-px md:h-full md:bg-gradient-to-b'}`} />

        {/* Right/Bottom Team */}
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
        />

      </main>

      {/* 3. Bottom Controls */}
      <Controls 
        onUndo={undo}
        onReset={() => resetMatch()}
        onSwap={toggleSides}
        onSettings={() => setIsSettingsOpen(true)}
        onToggleLayout={() => setIsLandscape(!isLandscape)}
        onFullscreen={toggleFullscreenMode}
        canUndo={canUndo}
        lang={lang}
        isLandscape={isLandscape}
        visible={!isFullscreen}
      />

      {/* Exit Fullscreen Button */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={exitFullscreenMode}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-black/40 dark:bg-white/10 backdrop-blur-md text-white dark:text-slate-200 rounded-full flex items-center justify-center border border-white/20 shadow-lg"
          >
            <Minimize size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Modals */}
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

    </div>
  );
}