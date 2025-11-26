export type TeamId = 'A' | 'B';

export interface SetHistory {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export type DeuceType = 'standard' | 'sudden_death_3pt';

export interface GameConfig {
  maxSets: number;       
  pointsPerSet: number;  
  tieBreakPoints: number;
  hasTieBreak: boolean;  
  deuceType: DeuceType;  
}

export interface Player {
  id: string;
  name: string;
  isFixed: boolean;
  fixedSide?: TeamId | null;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface RotationDetail {
  leavingTeamName: string;
  enteringTeamName: string;
  stolenPlayers: string[];
  fixedPlayers: string[];
  wentToQueue: string[];
  donorTeamName?: string;
  enteringPlayers: string[]; // Novo campo: Jogadores que vêm da fila
}

export interface GameState {
  teamAName: string; 
  teamBName: string;
  teamARoster: Team | null;
  teamBRoster: Team | null;
  queue: Team[];
  
  rotationReport: RotationDetail | null;

  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  history: SetHistory[];
  isMatchOver: boolean;
  matchWinner: TeamId | null;
  swappedSides: boolean;
  inSuddenDeath: boolean; 
  config: GameConfig;
  matchDurationSeconds: number;
  isTimerRunning: boolean;
  servingTeam: TeamId | null; 
  timeoutsA: number; 
  timeoutsB: number; 
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
}

export type Language = 'en' | 'pt';
export type ThemeMode = 'light' | 'dark';