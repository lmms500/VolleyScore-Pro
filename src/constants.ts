import { GameConfig, Language } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  pointsPerSet: 25,
  tieBreakPoints: 15,
  hasTieBreak: true,
  maxSets: 5, // Best of 5 (First to 3)
  deuceType: 'standard',
};

export const MIN_LEAD_TO_WIN = 2;

// Calculated based on config, but kept here for reference or utility
export const SETS_TO_WIN_MATCH = (maxSets: number) => Math.ceil(maxSets / 2);

export const THEME = {
  A: {
    // Text color for labels/names
    text: 'text-indigo-600 dark:text-indigo-400',
    // Score number color (High contrast)
    scoreColor: 'text-slate-900 dark:text-white',
    // Background gradient for the card
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-[#020617]',
    // Accent color for indicators
    accent: 'text-indigo-500',
    accentBg: 'bg-indigo-500',
    // Glow/Shadow effects
    shadow: 'shadow-indigo-500/20',
    border: 'border-indigo-200 dark:border-indigo-500/10',
    name: 'Home',
    nameKey: 'home'
  },
  B: {
    text: 'text-rose-600 dark:text-rose-400',
    scoreColor: 'text-slate-900 dark:text-white',
    bgGradient: 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-[#020617]',
    accent: 'text-rose-500',
    accentBg: 'bg-rose-500',
    shadow: 'shadow-rose-500/20',
    border: 'border-rose-200 dark:border-rose-500/10',
    name: 'Guest',
    nameKey: 'guest'
  }
};

export const TRANSLATIONS = {
  en: {
    home: 'Home',
    guest: 'Guest',
    goal: 'GOAL',
    sets: 'SETS',
    set: 'SET',
    tieBreak: 'TIE BREAK',
    matchOver: 'Match Over',
    wins: 'wins!',
    startNew: 'Start New Match',
    swap: 'SWAP',
    config: 'CONFIG',
    reset: 'RESET',
    undo: 'UNDO',
    sure: 'Sure?',
    settingsTitle: 'Match Settings',
    matchType: 'Sets to Win Match',
    setsLabel: 'Sets',
    pointsPerSet: 'Points per Set',
    tieBreakPoints: 'Tiebreak Points',
    tieBreakOption: 'Enable Tiebreak (Last Set)',
    tieBreakNote: 'If disabled, last set uses standard points.',
    deuceRule: 'Deuce Rule',
    deuceStd: 'Standard (+2 Advantage)',
    deuceReset: 'Reset @ Deuce (First to 3)',
    deuceInfoTitle: 'Deuce Rule Info:',
    deuceInfoStd: 'Standard: Game continues until 2 point lead (e.g., 26-24).',
    deuceInfoReset: 'Reset: If score ties at set point (e.g., 24-24), scores reset to 0-0. First team to 3 wins.',
    officialRulesTitle: 'Official Volleyball Rules',
    officialRulesText: 'To win a set, a team must reach 25 points with at least a 2-point lead. If the score is 24-24, play continues until a 2-point lead is achieved. The deciding 5th set (Tie-break) is played to 15 points, also requiring a 2-point lead. The match is won by the first team to win 3 sets.',
    save: 'Save & New Match',
    language: 'Language',
    theme: 'Theme',
    firstTo3: 'First to 3',
    appearance: 'Appearance',
    rotate: 'ROTATE',
    matchPoint: 'MATCH POINT',
    setPoint: 'SET POINT',
    timeout: 'TIMEOUT',
    point: 'Point' // Adicionado
  },
  pt: {
    home: 'Casa',
    guest: 'Visitante',
    goal: 'META',
    sets: 'SETS',
    set: 'SET',
    tieBreak: 'TIE BREAK',
    matchOver: 'Fim de Jogo',
    wins: 'venceu!',
    startNew: 'Nova Partida',
    swap: 'LADOS',
    config: 'AJUSTES',
    reset: 'ZERAR',
    undo: 'VOLTAR',
    sure: 'Certeza?',
    settingsTitle: 'Configurações',
    matchType: 'Sets para Vencer',
    setsLabel: 'Sets',
    pointsPerSet: 'Pontos por Set',
    tieBreakPoints: 'Pontos do Tiebreak',
    tieBreakOption: 'Habilitar Tiebreak (Último Set)',
    tieBreakNote: 'Se desativado, o último set segue a pontuação normal.',
    deuceRule: 'Regra de Desempate',
    deuceStd: 'Padrão (Vantagem de 2)',
    deuceReset: 'Zera no Empate (Vai a 3)',
    deuceInfoTitle: 'Info sobre Desempate:',
    deuceInfoStd: 'Padrão: Jogo segue até abrir 2 pontos de vantagem (ex: 26-24).',
    deuceInfoReset: 'Reset: Se empatar no set point (ex: 24-24), o placar zera (0-0). Ganha quem fizer 3 pontos primeiro.',
    officialRulesTitle: 'Regras Oficiais (Resumo)',
    officialRulesText: 'Para vencer um set, a equipe deve alcançar 25 pontos com minímo de 2 pontos de vantagem (ex: 26-24). O Tie-break (5º set) vai a 15 pontos, também com vantagem de 2. Vence a partida quem ganhar o número de sets estipulado (geralmente 3). Sistema "Rally Point": Ponto direto em toda jogada.',
    save: 'Salvar e Reiniciar',
    language: 'Idioma',
    theme: 'Tema',
    firstTo3: 'Quem fizer 3',
    appearance: 'Aparência',
    rotate: 'GIRAR',
    matchPoint: 'MATCH POINT',
    setPoint: 'SET POINT',
    timeout: 'TEMPO',
    point: 'Ponto' // Adicionado
  }
};

export const t = (lang: Language, key: keyof typeof TRANSLATIONS['en']) => {
  return TRANSLATIONS[lang][key] || key;
};