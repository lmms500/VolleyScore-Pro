import { useState, useCallback, useEffect } from 'react';
import { GameState, TeamId, SetHistory, GameConfig } from '../types';
import { 
  DEFAULT_CONFIG,
  MIN_LEAD_TO_WIN, 
  SETS_TO_WIN_MATCH
} from '../constants';

const STORAGE_KEY = 'volleyscore_pro_state_v1';
const TIMER_KEY = 'volleyscore_pro_timer_v1';

const INITIAL_STATE: GameState = {
  teamAName: '', 
  teamBName: '',
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  history: [],
  isMatchOver: false,
  matchWinner: null,
  swappedSides: false,
  inSuddenDeath: false,
  config: DEFAULT_CONFIG,
  isTimerRunning: false,
  servingTeam: null,
  timeoutsA: 0,
  timeoutsB: 0,
};

export const useVolleyGame = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [historyStack, setHistoryStack] = useState<GameState[]>([INITIAL_STATE]);
  const [matchDurationSeconds, setMatchDurationSeconds] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      const savedTime = localStorage.getItem(TIMER_KEY);
      
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Migração simples para versões antigas que tinham matchDurationSeconds no state
        if ('matchDurationSeconds' in parsed) delete parsed.matchDurationSeconds;
        
        setState(parsed);
        setHistoryStack([parsed]);
      }
      
      if (savedTime) {
        setMatchDurationSeconds(parseInt(savedTime, 10) || 0);
      }
    } catch (e) {
      console.warn('Failed to load game state', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Save Timer separately (less frequent/on change)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(TIMER_KEY, matchDurationSeconds.toString());
    }
  }, [matchDurationSeconds, isLoaded]);

  // Timer Logic - Isolada!
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        setMatchDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const updateState = useCallback((newState: GameState) => {
    setHistoryStack(prev => {
      const newStack = [...prev, newState];
      if (newStack.length > 10) newStack.shift();
      return newStack;
    });
    setState(newState);
  }, []);

  const undo = useCallback(() => {
    setHistoryStack(prev => {
      if (prev.length <= 1) return prev;
      const newStack = [...prev];
      newStack.pop(); 
      const prevState = newStack[newStack.length - 1];
      setState(prevState);
      return newStack;
    });
  }, []);

  const resetMatch = useCallback((newConfig?: GameConfig) => {
    const configToUse = newConfig || state.config;
    const newState = { 
      ...INITIAL_STATE, 
      teamAName: state.teamAName,
      teamBName: state.teamBName,
      swappedSides: state.swappedSides,
      config: configToUse 
    };
    setHistoryStack([newState]);
    setState(newState);
    setMatchDurationSeconds(0); // Reset timer too
  }, [state.config, state.swappedSides, state.teamAName, state.teamBName]);

  const toggleSides = useCallback(() => {
    setState(prev => ({ ...prev, swappedSides: !prev.swappedSides }));
  }, []);

  const toggleService = useCallback(() => {
    setState(prev => ({
        ...prev,
        servingTeam: prev.servingTeam === 'A' ? 'B' : 'A'
    }));
  }, []);

  const useTimeout = useCallback((teamId: TeamId) => {
      setState(prev => {
          if (teamId === 'A' && prev.timeoutsA >= 2) return prev;
          if (teamId === 'B' && prev.timeoutsB >= 2) return prev;
          const newState = {
              ...prev,
              timeoutsA: teamId === 'A' ? prev.timeoutsA + 1 : prev.timeoutsA,
              timeoutsB: teamId === 'B' ? prev.timeoutsB + 1 : prev.timeoutsB
          };
          setHistoryStack(hist => [...hist, newState]);
          return newState;
      });
  }, []);

  const setTeamNames = useCallback((nameA: string, nameB: string) => {
    setState(prev => ({ ...prev, teamAName: nameA, teamBName: nameB }));
  }, []);

  const applySettings = useCallback((newConfig: GameConfig) => {
    resetMatch(newConfig);
  }, [resetMatch]);

  const addPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;

    let newIsTimerRunning = state.isTimerRunning;
    // Check timer status using the separate state variable logic
    if (!state.isTimerRunning && matchDurationSeconds === 0) {
        newIsTimerRunning = true;
    }

    let newServingTeam = state.servingTeam;
    if (state.servingTeam !== team) {
        newServingTeam = team;
    }

    const potentialScoreA = team === 'A' ? state.scoreA + 1 : state.scoreA;
    const potentialScoreB = team === 'B' ? state.scoreB + 1 : state.scoreB;
    
    const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
    const useTieBreak = isDecidingSet && state.config.hasTieBreak;
    const setPointTarget = useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;

    // Sudden Death Logic
    if (state.config.deuceType === 'sudden_death_3pt') {
      if (state.inSuddenDeath) {
        const suddenDeathTarget = 3;
        if (potentialScoreA >= suddenDeathTarget) {
          handleSetWin('A', potentialScoreA, potentialScoreB, newIsTimerRunning);
          return;
        }
        if (potentialScoreB >= suddenDeathTarget) {
          handleSetWin('B', potentialScoreA, potentialScoreB, newIsTimerRunning);
          return;
        }
        updateState({ 
            ...state, 
            scoreA: potentialScoreA, scoreB: potentialScoreB, 
            isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam
        });
        return;
      }
      if (potentialScoreA === setPointTarget - 1 && potentialScoreB === setPointTarget - 1) {
        updateState({
          ...state, scoreA: 0, scoreB: 0, inSuddenDeath: true,
          isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam
        });
        return;
      }
    }

    // Standard Logic
    const winner = checkStandardWin(potentialScoreA, potentialScoreB, setPointTarget);

    if (winner) {
      handleSetWin(winner, potentialScoreA, potentialScoreB, newIsTimerRunning);
    } else {
      updateState({
        ...state, scoreA: potentialScoreA, scoreB: potentialScoreB,
        isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam
      });
    }
  }, [state, matchDurationSeconds, updateState]); // Dependencies updated

  const checkStandardWin = (scoreA: number, scoreB: number, target: number): TeamId | null => {
    if (scoreA >= target && scoreA >= scoreB + MIN_LEAD_TO_WIN) return 'A';
    if (scoreB >= target && scoreB >= scoreA + MIN_LEAD_TO_WIN) return 'B';
    return null;
  };

  const handleSetWin = (setWinner: TeamId, finalScoreA: number, finalScoreB: number, timerWasRunning: boolean) => {
    const newSetsA = setWinner === 'A' ? state.setsA + 1 : state.setsA;
    const newSetsB = setWinner === 'B' ? state.setsB + 1 : state.setsB;
    
    const newHistory: SetHistory = {
      setNumber: state.currentSet, scoreA: finalScoreA, scoreB: finalScoreB, winner: setWinner
    };

    const setsNeeded = SETS_TO_WIN_MATCH(state.config.maxSets);
    const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);

    updateState({
      ...state,
      scoreA: matchWinner ? finalScoreA : 0, 
      scoreB: matchWinner ? finalScoreB : 0,
      setsA: newSetsA, setsB: newSetsB,
      history: [...state.history, newHistory],
      currentSet: matchWinner ? state.currentSet : state.currentSet + 1,
      isMatchOver: !!matchWinner,
      matchWinner: matchWinner,
      inSuddenDeath: false,
      isTimerRunning: matchWinner ? false : timerWasRunning,
      servingTeam: null,
      timeoutsA: 0, timeoutsB: 0
    });
  };

  const subtractPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
    if (team === 'A' && state.scoreA > 0) updateState({ ...state, scoreA: state.scoreA - 1 });
    if (team === 'B' && state.scoreB > 0) updateState({ ...state, scoreB: state.scoreB - 1 });
  }, [state, updateState]);

  return {
    state,
    matchDurationSeconds, // EXPORTED SEPARATELY
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
    canUndo: historyStack.length > 1
  };
};