import { useState, useCallback, useEffect } from 'react';
import { GameState, TeamId, SetHistory, GameConfig, Team, Player, RotationReport } from '../types';
import { DEFAULT_CONFIG, MIN_LEAD_TO_WIN, SETS_TO_WIN_MATCH } from '../constants';
import { usePlayerQueue } from './usePlayerQueue'; 

const STORAGE_KEY = 'volleyscore_pro_v20_preview_fix';

const INITIAL_STATE: GameState = {
  teamAName: 'Home',
  teamBName: 'Guest',
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  history: [],
  isMatchOver: false,
  matchWinner: null,
  servingTeam: null,
  swappedSides: false,
  config: DEFAULT_CONFIG,
  timeoutsA: 0,
  timeoutsB: 0,
  inSuddenDeath: false,
  matchDurationSeconds: 0,
  isTimerRunning: false,
  teamARoster: { id: 'A', name: 'Home', players: [] },
  teamBRoster: { id: 'B', name: 'Guest', players: [] },
  queue: [],
  rotationReport: null
};

export const useVolleyGame = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateNamesFromQueue = useCallback((nameA: string, nameB: string) => {
      setState(prev => {
          if (prev.teamAName !== nameA || prev.teamBName !== nameB) {
              return { ...prev, teamAName: nameA, teamBName: nameB };
          }
          return prev;
      });
  }, []);

  const queueManager = usePlayerQueue(updateNamesFromQueue);

  // Sync Queue State -> Game State (Mantendo o report se ele vier da rotação real)
  useEffect(() => {
      const { courtA, courtB, queue, lastReport } = queueManager.queueState;
      setState(prev => {
          // Se acabamos de receber um relatório REAL de rotação (após clicar em Rodar), atualizamos
          // Mas se o jogo acabou e ainda não rodamos, queremos MANTER o preview que calculamos no addPoint
          const reportToUse = lastReport || prev.rotationReport;

          if (prev.teamARoster === courtA && prev.teamBRoster === courtB && prev.queue === queue && prev.rotationReport === reportToUse) return prev;
          
          return {
              ...prev,
              teamARoster: courtA,
              teamBRoster: courtB,
              queue: queue,
              rotationReport: reportToUse, 
              teamAName: courtA.name,
              teamBName: courtB.name
          };
      });
  }, [queueManager.queueState]);

  useEffect(() => {
    const loadGame = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { try { setState(JSON.parse(saved)); } catch (e) { console.error(e); } }
      setIsLoaded(true);
    };
    loadGame();
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isLoaded]);

  useEffect(() => {
    let interval: any;
    if (state.isTimerRunning && !state.isMatchOver) {
      interval = setInterval(() => setState(prev => ({ ...prev, matchDurationSeconds: prev.matchDurationSeconds + 1 })), 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.isMatchOver]);

  const checkSetWinner = (currentScoreA: number, currentScoreB: number, config: GameConfig) => {
    const { pointsPerSet, tieBreakPoints, hasTieBreak, maxSets, deuceType } = config;
    const isTieBreak = hasTieBreak && state.currentSet === maxSets;
    const targetPoints = isTieBreak ? tieBreakPoints : pointsPerSet;
    if (deuceType === 'sudden_death_3pt') {
       if (currentScoreA >= targetPoints && currentScoreA >= currentScoreB + 2) return 'A';
       if (currentScoreB >= targetPoints && currentScoreB >= currentScoreA + 2) return 'B';
    }
    if (currentScoreA >= targetPoints && currentScoreA >= currentScoreB + MIN_LEAD_TO_WIN) return 'A';
    if (currentScoreB >= targetPoints && currentScoreB >= currentScoreA + MIN_LEAD_TO_WIN) return 'B';
    return null;
  };

  const addPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
    setState(prev => {
      const newScoreA = team === 'A' ? prev.scoreA + 1 : prev.scoreA;
      const newScoreB = team === 'B' ? prev.scoreB + 1 : prev.scoreB;
      const setWinner = checkSetWinner(newScoreA, newScoreB, prev.config);
      
      if (setWinner) {
          const newSetsA = setWinner === 'A' ? prev.setsA + 1 : prev.setsA;
          const newSetsB = setWinner === 'B' ? prev.setsB + 1 : prev.setsB;
          const historyEntry: SetHistory = { setNumber: prev.currentSet, scoreA: newScoreA, scoreB: newScoreB, winner: setWinner };
          const setsNeeded = SETS_TO_WIN_MATCH(prev.config.maxSets);
          const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);
          
          // --- AQUI ESTÁ A CORREÇÃO CRÍTICA ---
          // Se temos um vencedor da partida, calculamos o PREVIEW da rotação IMEDIATAMENTE
          let previewReport = null;
          if (matchWinner) {
              previewReport = queueManager.getRotationPreview(matchWinner);
          }

          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          
          return {
              ...prev, scoreA: matchWinner ? newScoreA : 0, scoreB: matchWinner ? newScoreB : 0, setsA: newSetsA, setsB: newSetsB,
              history: [...prev.history, historyEntry], currentSet: matchWinner ? prev.currentSet : prev.currentSet + 1, 
              matchWinner: matchWinner, 
              isMatchOver: !!matchWinner, 
              rotationReport: previewReport, // SALVA O PREVIEW NO ESTADO
              servingTeam: null, isTimerRunning: matchWinner ? false : true, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false
          };
      }
      const target = (prev.config.hasTieBreak && prev.currentSet === prev.config.maxSets) ? prev.config.tieBreakPoints : prev.config.pointsPerSet;
      return { ...prev, scoreA: newScoreA, scoreB: newScoreB, servingTeam: team, isTimerRunning: true, inSuddenDeath: (newScoreA >= target - 1 && newScoreB >= target - 1) };
    });
  }, [state.isMatchOver, queueManager]); // Adicionado queueManager nas dependências

  const subtractPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
    setState(prev => {
        if (team === 'A' && prev.scoreA === 0) return prev;
        if (team === 'B' && prev.scoreB === 0) return prev;
        return { ...prev, scoreA: team === 'A' ? prev.scoreA - 1 : prev.scoreA, scoreB: team === 'B' ? prev.scoreB - 1 : prev.scoreB };
    });
  }, [state.isMatchOver]);

  const resetMatch = useCallback(() => {
      setState(prev => ({ ...INITIAL_STATE, teamAName: prev.teamAName, teamBName: prev.teamBName, teamARoster: prev.teamARoster, teamBRoster: prev.teamBRoster, queue: prev.queue, config: prev.config }));
  }, []);

  const undo = useCallback(() => { console.log("Undo full state not implemented yet, use subtract"); }, []);
  const toggleSides = useCallback(() => setState(prev => ({ ...prev, swappedSides: !prev.swappedSides })), []);
  const toggleService = useCallback(() => setState(prev => ({ ...prev, servingTeam: prev.servingTeam === 'A' ? 'B' : (prev.servingTeam === 'B' ? null : 'A') })), []);
  const useTimeout = useCallback((team: TeamId) => setState(prev => {
      if (team === 'A' && prev.timeoutsA < 2) return { ...prev, timeoutsA: prev.timeoutsA + 1 };
      if (team === 'B' && prev.timeoutsB < 2) return { ...prev, timeoutsB: prev.timeoutsB + 1 };
      return prev;
  }), []);

  const applySettings = useCallback((newConfig: GameConfig, names: {nameA: string, nameB: string}) => {
      setState(prev => ({ ...prev, config: newConfig, teamAName: names.nameA, teamBName: names.nameB }));
      queueManager.updateTeamName(state.teamARoster.id, names.nameA);
      queueManager.updateTeamName(state.teamBRoster.id, names.nameB);
  }, [queueManager, state.teamARoster.id, state.teamBRoster.id]);

  const rotateTeams = useCallback(() => {
    if (!state.matchWinner) return;
    queueManager.rotateTeams(state.matchWinner);
    setState(prev => ({
        ...prev, scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [], isMatchOver: false, matchWinner: null, servingTeam: null, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, matchDurationSeconds: 0, isTimerRunning: false,
    }));
  }, [state.matchWinner, queueManager]);

  return {
    state, setState, isLoaded, addPoint, subtractPoint, undo, resetMatch, toggleSides, toggleService, useTimeout, applySettings, canUndo: true,
    generateTeams: queueManager.generateTeams,
    updateRosters: queueManager.updateRosters,
    rotateTeams,
    updateTeamName: queueManager.updateTeamName,
    movePlayer: queueManager.movePlayer,
    removePlayer: queueManager.removePlayer,
    togglePlayerFixed: queueManager.togglePlayerFixed 
  };
};