
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
  teamAName: string; // Custom name for Team A
  teamBName: string; // Custom name for Team B
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  history: SetHistory[];
  isMatchOver: boolean;
  matchWinner: TeamId | null;
  swappedSides: boolean;
  inSuddenDeath: boolean; // True if scores were reset and we are playing to 3
  config: GameConfig;
  matchDurationSeconds: number; // Total seconds elapsed
  isTimerRunning: boolean;
  servingTeam: TeamId | null; // Tracks who has the ball
  timeoutsA: number; // Timeouts used by A in current set (max 2)
  timeoutsB: number; // Timeouts used by B in current set (max 2)
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
}

export type Language = 'en' | 'pt';
export type ThemeMode = 'light' | 'dark';
