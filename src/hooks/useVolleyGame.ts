import { useState, useCallback, useEffect } from 'react';
import { GameState, TeamId, SetHistory, GameConfig, Team, Player, RotationDetail } from '../types';
import { 
  DEFAULT_CONFIG,
  MIN_LEAD_TO_WIN, 
  SETS_TO_WIN_MATCH
} from '../constants';

const STORAGE_KEY = 'volleyscore_pro_state_v12_fix_lock_rotation'; 

const INITIAL_STATE: GameState = {
  teamAName: '', 
  teamBName: '',
  teamARoster: null,
  teamBRoster: null,
  queue: [],
  rotationReport: null,
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

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Timer
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

  // Rotation Report Logic (Apenas Visual agora)
  useEffect(() => {
    if (state.isMatchOver && !state.rotationReport && state.matchWinner && state.queue.length > 0) {
        const winnerId = state.matchWinner;
        const loserRoster = winnerId === 'A' ? state.teamBRoster : state.teamARoster;
        const nextTeam = state.queue[0];
        
        if (!loserRoster || !nextTeam) return;

        const loserSideId = winnerId === 'A' ? 'B' : 'A';
        const fixedStaying = loserRoster.players.filter(p => p.fixedSide === loserSideId);
        const leavingPlayersFromCourt = loserRoster.players.filter(p => p.fixedSide !== loserSideId);

        const currentCount = fixedStaying.length + nextTeam.players.length;
        const neededPlayers = 6 - currentCount;
        
        let stolenNames: string[] = [];
        let queueNames: string[] = leavingPlayersFromCourt.map(p => p.name);
        let donorName = loserRoster.name;

        if (neededPlayers > 0) {
            if (state.queue.length >= 2) {
                const donorTeam = state.queue[1];
                donorName = donorTeam.name;
                // AQUI TAMBÉM FILTRAMOS PARA O RELATÓRIO FICAR COERENTE
                const availableToSteal = donorTeam.players.filter(p => !p.isFixed);
                const stealCount = Math.min(neededPlayers, availableToSteal.length);

                if (stealCount > 0) {
                    const stolen = availableToSteal.slice(availableToSteal.length - stealCount);
                    stolenNames = stolen.map(p => p.name);
                }
            } else {
                const availableToSteal = leavingPlayersFromCourt.filter(p => !p.isFixed);
                const stealCount = Math.min(neededPlayers, availableToSteal.length);
                if (stealCount > 0) {
                    const stolen = availableToSteal.slice(availableToSteal.length - stealCount);
                    // Removendo os roubados da lista de quem vai pra fila (visual)
                    const stolenIds = new Set(stolen.map(p => p.id));
                    const remainingLeaving = leavingPlayersFromCourt.filter(p => !stolenIds.has(p.id));
                    
                    stolenNames = stolen.map(p => p.name);
                    queueNames = remainingLeaving.map(p => p.name);
                }
            }
        }

        const report: RotationDetail = {
            leavingTeamName: loserRoster.name,
            enteringTeamName: nextTeam.name,
            fixedPlayers: fixedStaying.map(p => p.name),
            stolenPlayers: stolenNames,
            wentToQueue: queueNames,
            donorTeamName: donorName,
            enteringPlayers: nextTeam.players.map(p => p.name)
        };
        
        setState(prev => ({ ...prev, rotationReport: report }));
    }
  }, [state.isMatchOver, state.rotationReport, state.matchWinner, state.queue, state.teamARoster, state.teamBRoster]);

  // --- CENTRALIZED UPDATE STATE ---
  const updateState = useCallback((newState: GameState) => {
    setHistoryStack(prev => {
      const newStack = [...prev, newState];
      if (newStack.length > 50) newStack.shift();
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
      teamARoster: state.teamARoster,
      teamBRoster: state.teamBRoster,
      queue: state.queue,
      swappedSides: state.swappedSides,
      config: configToUse 
    };
    setHistoryStack([newState]);
    setState(newState);
  }, [state.config, state.swappedSides, state.teamAName, state.teamBName, state.teamARoster, state.teamBRoster, state.queue]);

  const generateTeams = useCallback((
      namesText: string, 
      teamNameMap: Record<number, string> = {}, 
      fixedMap: Record<string, 'A' | 'B' | null> = {}
  ) => {
    const names = namesText.split(/[\n,]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const players: Player[] = names.map((name, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      name,
      isFixed: !!fixedMap[name],
      fixedSide: fixedMap[name] || null
    }));

    const fixedA = players.filter(p => p.fixedSide === 'A');
    const fixedB = players.filter(p => p.fixedSide === 'B');
    const rotating = players.filter(p => !p.isFixed);

    const slotsA = 6 - fixedA.length;
    const fillA = rotating.slice(0, slotsA);
    const teamAPlayers = [...fixedA, ...fillA];
    const remainingAfterA = rotating.slice(slotsA);

    const slotsB = 6 - fixedB.length;
    const fillB = remainingAfterA.slice(0, slotsB);
    const teamBPlayers = [...fixedB, ...fillB];
    const remainingQueue = remainingAfterA.slice(slotsB);

    const queueTeams: Team[] = [];
    const PLAYERS_PER_TEAM = 6;

    for (let i = 0; i < remainingQueue.length; i += PLAYERS_PER_TEAM) {
      const chunk = remainingQueue.slice(i, i + PLAYERS_PER_TEAM);
      const queueIndex = queueTeams.length; 
      const teamLetter = String.fromCharCode(67 + queueIndex);
      const defaultName = `Time ${teamLetter}`;
      const customName = teamNameMap[queueIndex + 2]; 

      queueTeams.push({
        id: `team-q-${queueIndex}`,
        name: customName || defaultName,
        players: chunk
      });
    }

    const teamA: Team = {
        id: 'team-a',
        name: teamNameMap[0] || 'Time A',
        players: teamAPlayers
    };

    const teamB: Team = {
        id: 'team-b',
        name: teamNameMap[1] || 'Time B',
        players: teamBPlayers
    };

    updateState({
      ...state,
      teamARoster: teamA,
      teamBRoster: teamB,
      teamAName: teamA.name,
      teamBName: teamB.name,
      queue: queueTeams,
      rotationReport: null
    });
  }, [state, updateState]);

  const updateRosters = useCallback((teamA: Team | null, teamB: Team | null, queue: Team[]) => {
      updateState({
          ...state,
          teamARoster: teamA,
          teamBRoster: teamB,
          queue
      });
  }, [state, updateState]);

  const movePlayer = useCallback((playerId: string, sourceTeamId: string, targetTeamId: string) => {
    if (sourceTeamId === targetTeamId) return;

    let newTeamA = state.teamARoster ? { ...state.teamARoster, players: [...state.teamARoster.players] } : null;
    let newTeamB = state.teamBRoster ? { ...state.teamBRoster, players: [...state.teamBRoster.players] } : null;
    let newQueue = state.queue.map(t => ({ ...t, players: [...t.players] }));

    let playerToMove: Player | undefined;

    const removeFromTeam = (team: Team | null) => {
        if (!team) return false;
        const idx = team.players.findIndex(p => p.id === playerId);
        if (idx > -1) {
            playerToMove = team.players[idx];
            team.players.splice(idx, 1);
            return true;
        }
        return false;
    };

    if (newTeamA && newTeamA.id === sourceTeamId) removeFromTeam(newTeamA);
    else if (newTeamB && newTeamB.id === sourceTeamId) removeFromTeam(newTeamB);
    else {
        const qTeam = newQueue.find(t => t.id === sourceTeamId);
        if (qTeam) removeFromTeam(qTeam);
    }

    if (!playerToMove) return;

    if (newTeamA && newTeamA.id === targetTeamId) newTeamA.players.push(playerToMove);
    else if (newTeamB && newTeamB.id === targetTeamId) newTeamB.players.push(playerToMove);
    else {
        const qTeam = newQueue.find(t => t.id === targetTeamId);
        if (qTeam) qTeam.players.push(playerToMove);
    }

    const newState = {
        ...state,
        teamARoster: newTeamA,
        teamBRoster: newTeamB,
        queue: newQueue
    };

    updateState(newState);
  }, [state, updateState]);

  const removePlayer = useCallback((playerId: string) => {
      let newTeamA = state.teamARoster ? { ...state.teamARoster, players: [...state.teamARoster.players] } : null;
      let newTeamB = state.teamBRoster ? { ...state.teamBRoster, players: [...state.teamBRoster.players] } : null;
      let newQueue = state.queue.map(t => ({ ...t, players: [...t.players] }));

      const removeFromTeam = (team: Team | null) => {
          if (!team) return false;
          const idx = team.players.findIndex(p => p.id === playerId);
          if (idx > -1) {
              team.players.splice(idx, 1);
              return true;
          }
          return false;
      };

      let found = false;
      if (newTeamA) found = removeFromTeam(newTeamA);
      if (!found && newTeamB) found = removeFromTeam(newTeamB);
      if (!found) {
          for (const qTeam of newQueue) {
              if (removeFromTeam(qTeam)) {
                  found = true;
                  break;
              }
          }
      }

      if (!found) return;

      const newState = {
          ...state,
          teamARoster: newTeamA,
          teamBRoster: newTeamB,
          queue: newQueue
      };
      updateState(newState);
  }, [state, updateState]);

  const updateTeamName = useCallback((teamId: string, newName: string) => {
      const teamARoster = state.teamARoster && state.teamARoster.id === teamId ? { ...state.teamARoster, name: newName } : state.teamARoster;
      const teamBRoster = state.teamBRoster && state.teamBRoster.id === teamId ? { ...state.teamBRoster, name: newName } : state.teamBRoster;
      const queue = state.queue.map(q => q.id === teamId ? { ...q, name: newName } : q);

      const teamAName = teamARoster ? teamARoster.name : state.teamAName;
      const teamBName = teamBRoster ? teamBRoster.name : state.teamBName;

      const newState = { ...state, teamARoster, teamBRoster, queue, teamAName, teamBName };
      updateState(newState);
  }, [state, updateState]);

  // --- ROTATE TEAMS (FRESH CALCULATION) ---
  const rotateTeams = useCallback(() => {
    if (!state.matchWinner || state.queue.length === 0) return;

    const winnerId = state.matchWinner;
    const winnerRoster = winnerId === 'A' ? state.teamARoster : state.teamBRoster;
    const loserRoster = winnerId === 'A' ? state.teamBRoster : state.teamARoster;

    if (!winnerRoster || !loserRoster) return; 

    // Time que vai entrar (Queue[0])
    const nextTeam = { ...state.queue[0], players: [...state.queue[0].players] };
    
    // Lista de espera restante
    let remainingQueue = state.queue.slice(1).map(t => ({ ...t, players: [...t.players] }));

    const newLoserRoster = { ...loserRoster, players: [...loserRoster.players] };
    
    const loserSideId = winnerId === 'A' ? 'B' : 'A';
    
    // 1. Quem fica na quadra (lado perdedor) pq tem cadeado
    const fixedStaying = newLoserRoster.players.filter(p => p.fixedSide === loserSideId);
    
    // 2. Quem sai da quadra (candidatos a ir pra fila ou serem roubados)
    const leavingPlayersFromCourt = newLoserRoster.players.filter(p => p.fixedSide !== loserSideId);

    const currentCount = fixedStaying.length + nextTeam.players.length;
    const neededPlayers = 6 - currentCount;
    
    let stolenPlayers: Player[] = [];
    let goingToQueue: Player[] = [...leavingPlayersFromCourt];

    if (neededPlayers > 0) {
        if (remainingQueue.length > 0) {
            // Rouba do Doador (Queue[1])
            const donorTeam = remainingQueue[0];
            
            // CORREÇÃO: Só rouba quem NÃO está com cadeado
            const availableToSteal = donorTeam.players.filter(p => !p.isFixed);
            const stealCount = Math.min(neededPlayers, availableToSteal.length);

            if (stealCount > 0) {
                // Pega os últimos da lista de disponíveis
                const playersToSteal = availableToSteal.slice(availableToSteal.length - stealCount);
                stolenPlayers = playersToSteal;

                // Remove do doador (usando ID para garantir)
                const stolenIds = new Set(playersToSteal.map(p => p.id));
                donorTeam.players = donorTeam.players.filter(p => !stolenIds.has(p.id));
            }

            newLoserRoster.players = goingToQueue;
            const donor = remainingQueue[0];
            const others = remainingQueue.slice(1);
            remainingQueue = [donor, newLoserRoster, ...others];

        } else {
            // Rouba do Perdedor (leavingPlayersFromCourt)
            // CORREÇÃO: Só rouba quem NÃO está com cadeado
            const availableToSteal = leavingPlayersFromCourt.filter(p => !p.isFixed);
            const stealCount = Math.min(neededPlayers, availableToSteal.length);
            
            if (stealCount > 0) {
                const playersToSteal = availableToSteal.slice(availableToSteal.length - stealCount);
                stolenPlayers = playersToSteal;
                
                // Remove de quem vai pra fila
                const stolenIds = new Set(playersToSteal.map(p => p.id));
                goingToQueue = goingToQueue.filter(p => !stolenIds.has(p.id));
            }
            newLoserRoster.players = goingToQueue;
            remainingQueue = [newLoserRoster];
        }
    } else {
        newLoserRoster.players = goingToQueue;
        remainingQueue.push(newLoserRoster);
    }

    const newTeamOnCourtPlayers = [...fixedStaying, ...nextTeam.players, ...stolenPlayers];
    nextTeam.players = newTeamOnCourtPlayers;

    const newState: GameState = {
        ...INITIAL_STATE,
        config: state.config,
        teamARoster: winnerId === 'A' ? winnerRoster : nextTeam,
        teamBRoster: winnerId === 'B' ? winnerRoster : nextTeam,
        teamAName: winnerId === 'A' ? winnerRoster.name : nextTeam.name,
        teamBName: winnerId === 'B' ? winnerRoster.name : nextTeam.name,
        queue: remainingQueue,
        rotationReport: null
    };

    updateState(newState);
  }, [state, INITIAL_STATE, updateState]);

  const toggleSides = useCallback(() => {
    const newState = { ...state, swappedSides: !state.swappedSides };
    setState(newState); 
  }, [state]);

  const toggleService = useCallback(() => {
    const nextServing: TeamId = state.servingTeam === 'A' ? 'B' : 'A';
    const newState = {
        ...state,
        servingTeam: nextServing
    };
    updateState(newState);
  }, [state, updateState]);

  const useTimeout = useCallback((teamId: TeamId) => {
      if (teamId === 'A' && state.timeoutsA >= 2) return;
      if (teamId === 'B' && state.timeoutsB >= 2) return;
      const newState = {
          ...state,
          timeoutsA: teamId === 'A' ? state.timeoutsA + 1 : state.timeoutsA,
          timeoutsB: teamId === 'B' ? state.timeoutsB + 1 : state.timeoutsB
      };
      updateState(newState);
  }, [state, updateState]);

  const setTeamNames = useCallback((nameA: string, nameB: string) => {
    const newState = {
      ...state,
      teamAName: nameA,
      teamBName: nameB,
      teamARoster: state.teamARoster ? { ...state.teamARoster, name: nameA } : state.teamARoster,
      teamBRoster: state.teamBRoster ? { ...state.teamBRoster, name: nameB } : state.teamBRoster
    };
    updateState(newState);
  }, [state, updateState]);

  const applySettings = useCallback((newConfig: GameConfig) => {
    resetMatch(newConfig);
  }, [resetMatch]);

  const addPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
    let newIsTimerRunning = state.isTimerRunning;
    if (!state.isTimerRunning && state.matchDurationSeconds === 0) newIsTimerRunning = true;
    let newServingTeam = state.servingTeam;
    if (state.servingTeam !== team) newServingTeam = team;

    const potentialScoreA = team === 'A' ? state.scoreA + 1 : state.scoreA;
    const potentialScoreB = team === 'B' ? state.scoreB + 1 : state.scoreB;
    
    const isDecidingSet = state.config.maxSets > 1 && state.currentSet === state.config.maxSets;
    const useTieBreak = isDecidingSet && state.config.hasTieBreak;
    const setPointTarget = useTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;

    if (state.config.deuceType === 'sudden_death_3pt') {
      if (state.inSuddenDeath) {
        const suddenDeathTarget = 3;
        if (potentialScoreA >= suddenDeathTarget) { handleSetWin('A', potentialScoreA, potentialScoreB, newIsTimerRunning); return; }
        if (potentialScoreB >= suddenDeathTarget) { handleSetWin('B', potentialScoreA, potentialScoreB, newIsTimerRunning); return; }
        updateState({ ...state, scoreA: potentialScoreA, scoreB: potentialScoreB, isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam });
        return;
      }
      if (potentialScoreA === setPointTarget - 1 && potentialScoreB === setPointTarget - 1) {
        updateState({ ...state, scoreA: 0, scoreB: 0, inSuddenDeath: true, isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam });
        return;
      }
    }
    const winner = checkStandardWin(potentialScoreA, potentialScoreB, setPointTarget);
    if (winner) { handleSetWin(winner, potentialScoreA, potentialScoreB, newIsTimerRunning); } 
    else { updateState({ ...state, scoreA: potentialScoreA, scoreB: potentialScoreB, isTimerRunning: newIsTimerRunning, servingTeam: newServingTeam }); }
  }, [state, updateState]);

  const checkStandardWin = (scoreA: number, scoreB: number, target: number): TeamId | null => {
    if (scoreA >= target && scoreA >= scoreB + MIN_LEAD_TO_WIN) return 'A';
    if (scoreB >= target && scoreB >= scoreA + MIN_LEAD_TO_WIN) return 'B';
    return null;
  };

  const handleSetWin = (setWinner: TeamId, finalScoreA: number, finalScoreB: number, timerWasRunning: boolean) => {
    const newSetsA = setWinner === 'A' ? state.setsA + 1 : state.setsA;
    const newSetsB = setWinner === 'B' ? state.setsB + 1 : state.setsB;
    const newHistory: SetHistory = { setNumber: state.currentSet, scoreA: finalScoreA, scoreB: finalScoreB, winner: setWinner };
    const setsNeeded = SETS_TO_WIN_MATCH(state.config.maxSets);
    const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);
    updateState({ ...state, scoreA: matchWinner ? finalScoreA : 0, scoreB: matchWinner ? finalScoreB : 0, setsA: newSetsA, setsB: newSetsB, history: [...state.history, newHistory], currentSet: matchWinner ? state.currentSet : state.currentSet + 1, isMatchOver: !!matchWinner, matchWinner: matchWinner, inSuddenDeath: false, isTimerRunning: matchWinner ? false : timerWasRunning, servingTeam: null, timeoutsA: 0, timeoutsB: 0 });
  };

  const subtractPoint = useCallback((team: TeamId) => {
    if (state.isMatchOver) return;
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
    canUndo: historyStack.length > 1,
    generateTeams,
    updateRosters,
    rotateTeams,
    updateTeamName,
    movePlayer,
    removePlayer
  };
};