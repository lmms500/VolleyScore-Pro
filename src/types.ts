export type TeamId = 'A' | 'B';

export interface SetHistory {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export type DeuceType = 'standard' | 'sudden_death_3pt';

export interface GameConfig {
  maxSets: number;       // 1, 3, 5
  pointsPerSet: number;  // 15, 21, 25
  tieBreakPoints: number;// 15 usually
  hasTieBreak: boolean;  // If true, last set uses tieBreakPoints. If false, uses pointsPerSet.
  deuceType: DeuceType;  // 'standard' (win by 2) or 'sudden_death_3pt' (reset 0-0, first to 3)
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
  swappedSides: boolean;
  inSuddenDeath: boolean; 
  config: GameConfig;
  // matchDurationSeconds REMOVIDO daqui para não causar re-renders globais
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