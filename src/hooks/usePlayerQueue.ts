import { useState, useEffect, useCallback } from 'react';
import { Player, Team, RotationReport } from '../types';

const STORAGE_KEY = 'volleyscore_queue_v11_reborn';

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

  // 1. IMPORTAR E GERAR TIMES
  const importPlayers = useCallback((
      rawText: string, 
      teamNameMap: Record<number, string>, 
      fixedMap: Record<string, 'A' | 'B' | null>
  ) => {
    const names = rawText.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);

    if (names.length < 2) {
        alert("Adicione mais jogadores.");
        return;
    }

    // Cria objetos de jogadores
    const allPlayers: Player[] = names.map(name => ({
        id: name,
        name: name,
        isFixed: fixedMap[name] || null
    }));

    // Distribuição Inicial
    const fixedA = allPlayers.filter(p => p.isFixed === 'A');
    const fixedB = allPlayers.filter(p => p.isFixed === 'B');
    let available = allPlayers.filter(p => !p.isFixed);

    // Preenche Time A
    const slotsA = 6 - fixedA.length;
    const fillA = available.slice(0, slotsA);
    available = available.slice(slotsA);
    const teamA: Team = {
        id: 'team-a',
        name: teamNameMap[0] || 'Time A',
        players: [...fixedA, ...fillA]
    };

    // Preenche Time B
    const slotsB = 6 - fixedB.length;
    const fillB = available.slice(0, slotsB);
    available = available.slice(slotsB);
    const teamB: Team = {
        id: 'team-b',
        name: teamNameMap[1] || 'Time B',
        players: [...fixedB, ...fillB]
    };

    // Cria Fila (C, D, E...)
    // Importante: Criar times mesmo incompletos se houver gente sobrando
    const queueTeams: Team[] = [];
    if (available.length > 0) {
        // Ex: 14 sobrando -> 3 times (6, 6, 2)
        const queueCount = Math.ceil(available.length / 6);
        
        for (let i = 0; i < queueCount; i++) {
            const slice = available.splice(0, 6);
            queueTeams.push({
                id: `team-q-${i}`,
                name: teamNameMap[i + 2] || `Time ${String.fromCharCode(67 + i)}`, // C, D...
                players: slice
            });
        }
    }

    const newState = {
        courtA: teamA,
        courtB: teamB,
        queue: queueTeams,
        nextGameIndex: 1,
        lastReport: null
    };

    setQueueState(newState);
    syncScoreboardNames(teamA, teamB);

  }, [setTeamNames]);

  // 2. ROTAÇÃO "CANIBAL"
  const rotateQueue = useCallback((winnerSide: 'A' | 'B') => {
    setQueueState(prev => {
      if (prev.queue.length === 0) return prev; // Ninguém na fila, nada acontece

      const winnerTeam = winnerSide === 'A' ? prev.courtA : prev.courtB;
      const loserTeam = winnerSide === 'A' ? prev.courtB : prev.courtA;
      
      // Pega o primeiro da fila (Time C)
      const nextTeamUp = { ...prev.queue[0] }; 
      const remainingQueue = prev.queue.slice(1); // D, E...

      const loserSideId = winnerSide === 'A' ? 'B' : 'A';

      // 1. QUEM FICA NA QUADRA (FIXOS DO LADO PERDEDOR)
      const fixedStaying = loserTeam.players.filter(p => p.isFixed === loserSideId);
      
      // 2. QUEM VAI SAIR (NÃO-FIXOS DO PERDEDOR)
      const leavingPlayers = loserTeam.players.filter(p => p.isFixed !== loserSideId);

      // 3. QUEM VEM DA FILA
      const playersFromQueue = nextTeamUp.players;

      // 4. PRECISA COMPLETAR? (Canibalismo)
      // O novo time será: [Fixos que ficaram] + [Galera da Fila] + [Roubados]
      const currentCount = fixedStaying.length + playersFromQueue.length;
      const needed = 6 - currentCount;

      let recycledPlayers: Player[] = []; // Roubados
      let playersGoingToQueue: Player[] = []; // Sobraram e vão pra fila

      if (needed > 0) {
          // FALTOU GENTE NO TIME DA FILA!
          // Rouba os ÚLTIMOS da lista de quem ia sair
          const availableToSteal = leavingPlayers.length;
          const stealCount = Math.min(needed, availableToSteal);
          
          if (stealCount > 0) {
              recycledPlayers = leavingPlayers.slice(availableToSteal - stealCount);
              playersGoingToQueue = leavingPlayers.slice(0, availableToSteal - stealCount);
          }
      } else {
          // Ninguém foi roubado, todo mundo vai pra fila
          playersGoingToQueue = leavingPlayers;
      }

      // 5. MONTAR O NOVO TIME TITULAR
      const newTeamOnCourtPlayers = [...fixedStaying, ...playersFromQueue, ...recycledPlayers];
      
      const newTeamOnCourt: Team = {
          id: nextTeamUp.id, // Mantém ID original (ex: time-c)
          name: nextTeamUp.name, // Mantém nome (ex: Time C)
          players: newTeamOnCourtPlayers
      };

      // 6. MONTAR O TIME QUE VAI PRA FILA (Ex: Time B, possivelmente desfalcado)
      const loserToQueue: Team = {
          id: loserTeam.id,
          name: loserTeam.name,
          players: playersGoingToQueue
      };

      // ATUALIZAR A FILA
      // A fila agora é: [Resto da fila (D...)] + [Perdedor (B)]
      const newQueue = [...remainingQueue];
      
      // Só adiciona o time perdedor na fila se sobrou alguém ou se queremos manter a rotação de nomes
      // Para o sistema funcionar como 4 times rotativos (A,B,C,D), o time tem que ir pro final mesmo se ficar com 0 pessoas temporariamente?
      // Sim, senão o nome "Time B" some. 
      newQueue.push(loserToQueue);

      // 7. ATUALIZAR QUADRA
      let newCourtA, newCourtB;
      if (winnerSide === 'A') {
          newCourtA = winnerTeam;
          newCourtB = newTeamOnCourt;
      } else {
          newCourtB = winnerTeam;
          newCourtA = newTeamOnCourt;
      }

      // Relatório
      const report: RotationReport = {
          winnerSide,
          winnerTeamName: winnerTeam.name,
          loserTeamName: loserTeam.name,
          enteringTeamName: nextTeamUp.name,
          action: recycledPlayers.length > 0 ? 'cannibalized' : 'swap',
          
          fixedStaying: fixedStaying.map(p => p.name),
          comingFromQueue: playersFromQueue.map(p => p.name),
          recycledFromLoser: recycledPlayers.map(p => p.name),
          goingToQueue: playersGoingToQueue.map(p => p.name)
      };

      syncScoreboardNames(newCourtA, newCourtB);

      return {
          courtA: newCourtA,
          courtB: newCourtB,
          queue: newQueue,
          nextGameIndex: prev.nextGameIndex + 1,
          lastReport: report
      };
    });
  }, [setTeamNames]);

  const resetQueue = useCallback(() => {
    setQueueState({
        courtA: EMPTY_TEAM('Time A'),
        courtB: EMPTY_TEAM('Time B'),
        queue: [],
        nextGameIndex: 1,
        lastReport: null
    });
  }, []);

  const hasQueue = queueState.queue.length > 0;

  return {
    queueState,
    importPlayers,
    rotateQueue,
    resetQueue,
    hasQueue
  };
};