export type TeamId = 'A' | 'B';

export interface Player {
  id: string;
  name: string;
  isFixed: boolean; // Se true, nunca será roubado da fila
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface SetHistory {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export interface GameConfig {
  pointsPerSet: number;
  tieBreakPoints: number;
  hasTieBreak: boolean;
  maxSets: number;
  deuceType: 'standard' | 'sudden_death_3pt';
}

// Relatório detalhado da operação "Roubo de Fila"
export interface RotationReport {
    winnerSide: TeamId;
    winnerTeamName: string;
    loserTeamName: string;
    enteringTeamName: string;
    
    // Quem saiu da quadra
    goingToQueue: string[]; // Jogadores do perdedor que foram pra fila
    
    // Quem entrou na quadra
    enteringPlayers: string[]; // Elenco final do time que entrou
    
    // Detalhes do "Crime" (Canibalismo de Fila)
    wasCompleted: boolean; // Se precisou roubar
    borrowedPlayers: string[]; // Nomes de quem foi roubado
    donorTeamName?: string; // De qual time roubou
}

export interface GameState {
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  history: SetHistory[];
  isMatchOver: boolean;
  matchWinner: TeamId | null;
  servingTeam: TeamId | null;
  swappedSides: boolean;
  config: GameConfig;
  timeoutsA: number;
  timeoutsB: number;
  inSuddenDeath: boolean;
  matchDurationSeconds: number;
  isTimerRunning: boolean;
  
  teamARoster: Team;
  teamBRoster: Team;
  queue: Team[];
  rotationReport: RotationReport | null;
}

export type ThemeMode = 'light' | 'dark';
export type Language = 'pt' | 'en';