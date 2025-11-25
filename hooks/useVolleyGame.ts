
import { useState, useCallback, useEffect } from 'react';
import { GameState, TeamId, SetHistory, GameConfig } from '../types';
import { 
  DEFAULT_CONFIG,
  MIN_LEAD_TO_WIN, 
  SETS_TO_WIN_MATCH
} from '../constants';

const STORAGE_KEY = 'volleyscore_pro_state_v1';

const INITIAL_STATE: GameState = {
  teamAName: '', // Empty defaults to constants
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
  matchDurationSeconds: 0,
  isTimerRunning: false,
  servingTeam: null,
  timeoutsA: 0,
  timeoutsB: 0,
};

export const useVolleyGame = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [historyStack, setHistoryStack] = useState<GameState[]>([INITIAL_STATE]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure config exists in saved state (backward compatibility)
        if (parsed && parsed.config) {
          setState(parsed);
          setHistoryStack([parsed]);
        }
      }
    } catch (e) {
      console.warn('Failed to load game state', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on Change (Debounced slightly by nature of React updates)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          matchDurationSeconds: prev.matchDurationSeconds + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  // Helper to save state for undo (Only for game logic changes, not timer ticks)
  const updateState = useCallback((newState: GameState) => {
    setHistoryStack(prev => {
      // Keep last 10 states for undo, to save memory
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
      newStack.pop(); // Remove current state
      const prevState = newStack[newStack.length - 1];
      
      // When undoing, we restore the state. 
      // If we undo to 0-0, the timer boolean in prevState will be false, stopping it effectively.
      setState(prevState);
      return newStack;
    });
  }, []);

  const resetMatch = useCallback((newConfig?: GameConfig) => {
    const configToUse = newConfig || state.config;
    // Preserve team names on reset
    const newState = { 
      ...INITIAL_STATE, 
      teamAName: state.teamAName,
      teamBName: state.teamBName,
      swappedSides: state.swappedSides,
      config: configToUse 
    };
    setHistoryStack([newState]);
    setState(newState);
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
          // Max 2 timeouts per set
          if (teamId === 'A' && prev.timeoutsA >= 2) return prev;
          if (teamId === 'B' && prev.timeoutsB >= 2) return prev;

          const newState = {
              ...prev,
              timeoutsA: teamId === 'A' ? prev.timeoutsA + 1 : prev.timeoutsA,
              timeoutsB: teamId === 'B' ? prev.timeoutsB + 1 : prev.timeoutsB
          };
          // Don't save to history for timeouts? Actually we probably should to undo accidental clicks
          setHistoryStack(hist => [...hist, newState]);
          return newState;
      });
  }, []);

  const setTeamNames = useCallback((nameA: string, nameB: string) => {
    setState(prev => ({ ...prev, teamAName: nameA, teamBName: nameB }));
  }, []);

  const applySettings = useCallback((newConfig: GameConfig) => {
    // Applying settings resets the match to avoid logic conflicts
    resetMatch(newConfig);
  }, [resetMatch]);

  const addPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;

    // Start Timer on first point if not running
    let newIsTimerRunning = state.isTimerRunning;
    if (!state.isTimerRunning && state.matchDurationSeconds === 0) {
        newIsTimerRunning = true;
    }

    // Auto Service Logic: If team scores and didn't have service, they get service.
    // If they had service, they keep it.
    // If service was null (start of game), they get it.
    let newServingTeam = state.servingTeam;
    if (state.servingTeam !== team) {
        newServingTeam = team;
    }

    // Calculate potential new scores
    const potentialScoreA = team === 'A' ? state.scoreA + 1 : state.scoreA;
    const potentialScoreB = team === 'B' ? state.scoreB + 1 : state.scoreB;
    
    // Determine the target points for the current set context
    const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
    const useTieBreak = isDecidingSet && state.config.hasTieBreak;
    const setPointTarget = useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;

    // --- LOGIC: Sudden Death (The "Reset to 0-0" Rule) ---
    if (state.config.deuceType === 'sudden_death_3pt') {
      
      // Case 1: Already in sudden death mode
      if (state.inSuddenDeath) {
        // First to 3 wins immediately
        const suddenDeathTarget = 3;
        if (potentialScoreA >= suddenDeathTarget) {
          handleSetWin('A', potentialScoreA, potentialScoreB, newIsTimerRunning);
          return;
        }
        if (potentialScoreB >= suddenDeathTarget) {
          handleSetWin('B', potentialScoreA, potentialScoreB, newIsTimerRunning);
          return;
        }
        // Just add point
        updateState({ 
            ...state, 
            scoreA: potentialScoreA, 
            scoreB: potentialScoreB, 
            isTimerRunning: newIsTimerRunning,
            servingTeam: newServingTeam
        });
        return;
      }

      // Case 2: Triggering the reset (Reaching Deuce at Target-1)
      if (potentialScoreA === setPointTarget - 1 && potentialScoreB === setPointTarget - 1) {
        updateState({
          ...state,
          scoreA: 0,
          scoreB: 0,
          inSuddenDeath: true, // Activate mode
          isTimerRunning: newIsTimerRunning,
          servingTeam: newServingTeam
        });
        return;
      }
    }

    // --- LOGIC: Standard (or pre-reset) ---
    // Check if someone won normally
    const winner = checkStandardWin(potentialScoreA, potentialScoreB, setPointTarget);

    if (winner) {
      handleSetWin(winner, potentialScoreA, potentialScoreB, newIsTimerRunning);
    } else {
      updateState({
        ...state,
        scoreA: potentialScoreA,
        scoreB: potentialScoreB,
        isTimerRunning: newIsTimerRunning,
        servingTeam: newServingTeam
      });
    }
  }, [state, updateState]);

  const checkStandardWin = (scoreA: number, scoreB: number, target: number): TeamId | null => {
    if (scoreA >= target && scoreA >= scoreB + MIN_LEAD_TO_WIN) return 'A';
    if (scoreB >= target && scoreB >= scoreA + MIN_LEAD_TO_WIN) return 'B';
    return null;
  };

  const handleSetWin = (setWinner: TeamId, finalScoreA: number, finalScoreB: number, timerWasRunning: boolean) => {
    const newSetsA = setWinner === 'A' ? state.setsA + 1 : state.setsA;
    const newSetsB = setWinner === 'B' ? state.setsB + 1 : state.setsB;
    
    const newHistory: SetHistory = {
      setNumber: state.currentSet,
      scoreA: finalScoreA,
      scoreB: finalScoreB,
      winner: setWinner
    };

    const setsNeeded = SETS_TO_WIN_MATCH(state.config.maxSets);
    const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);

    updateState({
      ...state,
      scoreA: matchWinner ? finalScoreA : 0, 
      scoreB: matchWinner ? finalScoreB : 0,
      setsA: newSetsA,
      setsB: newSetsB,
      history: [...state.history, newHistory],
      currentSet: matchWinner ? state.currentSet : state.currentSet + 1,
      isMatchOver: !!matchWinner,
      matchWinner: matchWinner,
      inSuddenDeath: false,
      isTimerRunning: matchWinner ? false : timerWasRunning, // Stop timer if match ends
      servingTeam: null, // Reset service for new set, let user pick or logic handle it
      timeoutsA: 0, // Reset timeouts
      timeoutsB: 0
    });
  };

  const subtractPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
    // Note: Subtracting a point does NOT revert service in this simple implementation
    // to avoid complex history state tracking for just service. 
    // User can manually toggle service if needed.
    if (team === 'A' && state.scoreA > 0) updateState({ ...state, scoreA: state.scoreA - 1 });
    if (team === 'B' && state.scoreB > 0) updateState({ ...state, scoreB: state.scoreB - 1 });
  }, [state, updateState]);

  return {
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
    canUndo: historyStack.length > 1
  };
};
