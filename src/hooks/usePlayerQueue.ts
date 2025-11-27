import { useState, useEffect, useCallback } from 'react';
import { Player, Team, RotationReport, TeamId } from '../types';

const STORAGE_KEY = 'volleyscore_queue_v19_preview_fix';

export interface PlayerQueueState {
  courtA: Team;            
  courtB: Team;            
  queue: Team[];           
  nextGameIndex: number;   
  lastReport: RotationReport | null; 
}

const EMPTY_TEAM = (name: string): Team => ({ id: 'empty', name, players: [] });

export const usePlayerQueue = (
  setTeamNames: (nameA: string, nameB: string) => void
) => {
  const [queueState, setQueueState] = useState<PlayerQueueState>({
    courtA: EMPTY_TEAM('Time A'),
    courtB: EMPTY_TEAM('Time B'),
    queue: [],
    nextGameIndex: 1,
    lastReport: null
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setQueueState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queueState));
  }, [queueState]);

  const syncScoreboardNames = (teamA: Team, teamB: Team) => {
    setTeamNames(teamA.name, teamB.name);
  };

  const togglePlayerFixed = useCallback((playerId: string) => {
    setQueueState(prev => {
        const toggleInTeam = (team: Team): Team => ({
            ...team,
            players: team.players.map(p => 
                p.id === playerId ? { ...p, isFixed: !p.isFixed } : p
            )
        });
        return {
            ...prev,
            courtA: toggleInTeam(prev.courtA),
            courtB: toggleInTeam(prev.courtB),
            queue: prev.queue.map(toggleInTeam)
        };
    });
  }, []);

  const generateTeams = useCallback((
      namesText: string, 
      teamNameMap: Record<number, string> = {}, 
      fixedMap: Record<string, boolean> = {}
    ) => {
    const names = namesText.split('\n').map(n => n.trim()).filter(n => n);
    const newQueue: Team[] = [];
    const allPlayers: Player[] = names.map((name, i) => ({
        id: `p-${Date.now()}-${i}`, name, isFixed: !!fixedMap[name]
    }));

    let currentTeam: Player[] = [];
    allPlayers.forEach(p => {
        currentTeam.push(p);
        if (currentTeam.length === 6) {
            newQueue.push({ id: `t-${Date.now()}-${newQueue.length}`, name: teamNameMap[newQueue.length] || `Time ${newQueue.length + 1}`, players: currentTeam });
            currentTeam = [];
        }
    });

    if (currentTeam.length > 0) {
        newQueue.push({ id: `t-${Date.now()}-${newQueue.length}`, name: teamNameMap[newQueue.length] || `Time ${newQueue.length + 1}`, players: currentTeam });
    }

    const teamA = newQueue.shift() || EMPTY_TEAM('Time A');
    const teamB = newQueue.shift() || EMPTY_TEAM('Time B');

    setQueueState(prev => ({ ...prev, courtA: teamA, courtB: teamB, queue: newQueue, nextGameIndex: newQueue.length + 3, lastReport: null }));
    syncScoreboardNames(teamA, teamB);
  }, []);

  // --- O CORAÇÃO DA LÓGICA (Separado para poder simular) ---
  const calculateRotationLogic = (currentState: PlayerQueueState, winnerSide: TeamId) => {
      if (!currentState.queue || currentState.queue.length === 0) return null;

      const winnerTeam = winnerSide === 'A' ? currentState.courtA : currentState.courtB;
      const loserTeam = winnerSide === 'A' ? currentState.courtB : currentState.courtA;
      
      // 1. Simula Perdedor indo pro final da fila
      // IMPORTANTE: Clonamos tudo para não afetar o estado original durante a simulação
      let tempQueue = currentState.queue.map(t => ({ ...t, players: [...t.players] }));
      const loserTeamClone = { ...loserTeam, players: [...loserTeam.players] };
      tempQueue.push(loserTeamClone);

      // 2. O Próximo time sai da frente da fila
      let enteringTeam = tempQueue[0];
      let remainingQueue = tempQueue.slice(1);

      // 3. Lógica de Roubo (Cannibalism)
      const borrowedPlayerNames: string[] = [];
      let donorName = '';

      // Enquanto o time que entra não tiver 6 jogadores e houver times na fila para roubar
      while (enteringTeam.players.length < 6 && remainingQueue.length > 0) {
          const needed = 6 - enteringTeam.players.length;
          
          // Sempre rouba do PRÓXIMO da fila (índice 0 da remainingQueue)
          const donorTeamIndex = 0;
          const donorTeam = remainingQueue[donorTeamIndex];
          
          // Filtra quem pode ser roubado (Não Fixos)
          const availableToSteal = donorTeam.players.filter(p => !p.isFixed);
          const fixedOnDonor = donorTeam.players.filter(p => p.isFixed);

          const toSteal = availableToSteal.slice(0, needed);
          const leftOnDonor = availableToSteal.slice(needed);

          if (toSteal.length > 0) {
              enteringTeam.players = [...enteringTeam.players, ...toSteal];
              toSteal.forEach(p => borrowedPlayerNames.push(p.name));
              if (!donorName) donorName = donorTeam.name;

              // Atualiza o time doador na fila simulada
              remainingQueue[donorTeamIndex] = {
                  ...donorTeam,
                  players: [...fixedOnDonor, ...leftOnDonor]
              };
          } else {
              break; // Se só tem fixos, para de roubar deste time
          }
      }

      // 4. Monta o resultado
      let newCourtA, newCourtB;
      if (winnerSide === 'A') {
          newCourtA = winnerTeam;
          newCourtB = enteringTeam;
      } else {
          newCourtB = winnerTeam;
          newCourtA = enteringTeam;
      }

      const report: RotationReport = {
          winnerSide,
          winnerTeamName: winnerTeam.name,
          loserTeamName: loserTeam.name,
          enteringTeamName: enteringTeam.name,
          goingToQueue: loserTeam.players.map(p => p.name),
          enteringPlayers: enteringTeam.players.map(p => p.name),
          wasCompleted: borrowedPlayerNames.length > 0,
          borrowedPlayers: borrowedPlayerNames,
          donorTeamName: donorName
      };

      return {
          newCourtA,
          newCourtB,
          newQueue: remainingQueue,
          report
      };
  };

  // --- NOVA FUNÇÃO: SIMULA O FUTURO PARA O MODAL ---
  const getRotationPreview = useCallback((winnerSide: TeamId): RotationReport | null => {
      const result = calculateRotationLogic(queueState, winnerSide);
      return result ? result.report : null;
  }, [queueState]); // Depende do estado atual para calcular

  // --- FUNÇÃO REAL: APLICA A ROTAÇÃO ---
  const rotateTeams = useCallback((winnerSide: TeamId) => {
    setQueueState(prev => {
      const result = calculateRotationLogic(prev, winnerSide);
      if (!result) return prev; // Se não tem fila, não faz nada

      syncScoreboardNames(result.newCourtA, result.newCourtB);

      return {
          courtA: result.newCourtA,
          courtB: result.newCourtB,
          queue: result.newQueue,
          nextGameIndex: prev.nextGameIndex + 1,
          lastReport: result.report
      };
    });
  }, [syncScoreboardNames]);

  const resetQueue = useCallback(() => {
    setQueueState({ courtA: EMPTY_TEAM('Time A'), courtB: EMPTY_TEAM('Time B'), queue: [], nextGameIndex: 1, lastReport: null });
  }, []);

  const updateRosters = useCallback((teamA: Team | null, teamB: Team | null, queue: Team[]) => {
      setQueueState(prev => {
          const newState = { ...prev, courtA: teamA || prev.courtA, courtB: teamB || prev.courtB, queue: queue };
          if (teamA && teamB) syncScoreboardNames(teamA, teamB);
          return newState;
      });
  }, []);
  
  const updateTeamName = useCallback((teamId: string, newName: string) => {
    setQueueState(prev => {
        const update = (t: Team) => t.id === teamId ? { ...t, name: newName } : t;
        const newA = update(prev.courtA);
        const newB = update(prev.courtB);
        if (newA !== prev.courtA || newB !== prev.courtB) syncScoreboardNames(newA, newB);
        return { ...prev, courtA: newA, courtB: newB, queue: prev.queue.map(update) };
    });
  }, []);

  const movePlayer = useCallback((playerId: string, sourceTeamId: string, targetTeamId: string) => {
    setQueueState(prev => {
        let playerToMove: Player | undefined;
        const removeFromTeam = (team: Team): Team => {
            const p = team.players.find(pl => pl.id === playerId);
            if (p) playerToMove = p;
            return { ...team, players: team.players.filter(pl => pl.id !== playerId) };
        };
        const newCourtA = sourceTeamId === prev.courtA.id || sourceTeamId === 'A' ? removeFromTeam(prev.courtA) : prev.courtA;
        const newCourtB = sourceTeamId === prev.courtB.id || sourceTeamId === 'B' ? removeFromTeam(prev.courtB) : prev.courtB;
        const newQueue = prev.queue.map(t => sourceTeamId === t.id ? removeFromTeam(t) : t);
        if (!playerToMove) return prev; 
        const addToTeam = (team: Team): Team => ({ ...team, players: [...team.players, playerToMove!] });
        const finalCourtA = targetTeamId === newCourtA.id || targetTeamId === 'A' ? addToTeam(newCourtA) : newCourtA;
        const finalCourtB = targetTeamId === newCourtB.id || targetTeamId === 'B' ? addToTeam(newCourtB) : newCourtB;
        const finalQueue = newQueue.map(t => targetTeamId === t.id ? addToTeam(t) : t);
        return { ...prev, courtA: finalCourtA, courtB: finalCourtB, queue: finalQueue };
    });
  }, []);

  const removePlayer = useCallback((playerId: string, sourceTeamId: string) => {
      setQueueState(prev => {
        const removeFromTeam = (team: Team): Team => ({ ...team, players: team.players.filter(pl => pl.id !== playerId) });
        return { ...prev, courtA: removeFromTeam(prev.courtA), courtB: removeFromTeam(prev.courtB), queue: prev.queue.map(removeFromTeam) };
      });
  }, []);

  return {
    queueState,
    generateTeams,
    rotateTeams,
    resetQueue,
    updateRosters,
    updateTeamName,
    movePlayer,
    removePlayer,
    togglePlayerFixed,
    getRotationPreview // EXPORTADO
  };
};