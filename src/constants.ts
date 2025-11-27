import { GameConfig, Language } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  pointsPerSet: 25,
  tieBreakPoints: 15,
  hasTieBreak: true,
  maxSets: 5, 
  deuceType: 'standard',
};

export const MIN_LEAD_TO_WIN = 2;

export const SETS_TO_WIN_MATCH = (maxSets: number) => Math.ceil(maxSets / 2);

export const THEME = {
  A: {
    text: 'text-indigo-600 dark:text-indigo-400',
    scoreColor: 'text-slate-900 dark:text-white',
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-[#020617]',
    accent: 'text-indigo-500',
    accentBg: 'bg-indigo-500',
    shadow: 'shadow-indigo-500/20',
    border: 'border-indigo-200 dark:border-indigo-500/10',
    scoreGradient: 'bg-gradient-to-b from-indigo-500 to-indigo-700',
    nameKey: 'home'
  },
  B: {
    text: 'text-rose-600 dark:text-rose-400',
    scoreColor: 'text-slate-900 dark:text-white',
    bgGradient: 'bg-gradient-to-bl from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-[#020617]',
    accent: 'text-rose-500',
    accentBg: 'bg-rose-500',
    shadow: 'shadow-rose-500/20',
    border: 'border-rose-200 dark:border-rose-500/10',
    scoreGradient: 'bg-gradient-to-b from-rose-500 to-rose-700',
    nameKey: 'guest'
  }
};

export const TRANSLATIONS = {
  pt: {
    home: 'CASA',
    guest: 'VISITANTE',
    set: 'SET',
    winner: 'Vencedor', // Adicionado
    matchOver: 'Fim de Jogo', // Adicionado
    settings: 'Configurações',
    pointsPerSet: 'Pontos por Set',
    tieBreakPoints: 'Pontos Tie-Break',
    maxSets: 'Melhor de (Sets)',
    save: 'Salvar e Reiniciar',
    cancel: 'Cancelar',
    language: 'Idioma',
    theme: 'Tema',
    firstTo3: 'Quem fizer 3',
    appearance: 'Aparência',
    rotate: 'GIRAR',
    matchPoint: 'MATCH POINT',
    setPoint: 'SET POINT',
    timeout: 'TEMPO',
    point: 'Ponto',
    undo: 'Desfazer',
    config: 'Configurar',
    
    // Team Management & Modal
    rotateTeams: 'Rodar Times',
    rotateAndNext: 'Rodar e Próximo', // Adicionado
    cantRotate: 'Não é possível rodar sem fila.',
    nextMatch: 'Próxima Partida', // Adicionado
    leaving: 'Saindo',
    entering: 'Entrando',
    fixed: 'Fixos (Ficaram)',
    queue: 'Fila de Espera',
    completedWith: 'Roubados p/ Completar',
    generateTeams: 'Gerar Times',
    playerList: 'Lista de Jogadores',
    manageTeams: 'Gerenciar Times',
    teamManager: 'Gerenciador de Times',
    fullQueue: 'Todos foram para a fila.',
    namesList: 'Insira os nomes (um por linha):',
    namesPlaceholder: 'João Silva\nMaria Souza\n...',
    editList: 'Editar Lista',
    clear: 'Limpar',
    waiting: 'Aguardando',
    openSlots: 'vagas',
    players: 'Jogadores',
    emptyQueue: 'Fila vazia',
    
    // Settings Presets
    presets: 'Modos Rápidos',
    mondayVolley: 'Vôlei de Segunda (30pts, sem tie-break)',
    official: 'Oficial (25pts, Tie-break 15)',
    shortSet: 'Set Curto (21pts)',
  },
  en: {
    home: 'HOME',
    guest: 'GUEST',
    set: 'SET',
    winner: 'Winner', // Adicionado
    matchOver: 'Match Over', // Adicionado
    settings: 'Settings',
    pointsPerSet: 'Points per Set',
    tieBreakPoints: 'Tie-Break Points',
    maxSets: 'Best of (Sets)',
    save: 'Save & Reset',
    cancel: 'Cancel',
    language: 'Language',
    theme: 'Theme',
    firstTo3: 'First to 3',
    appearance: 'Appearance',
    rotate: 'ROTATE',
    matchPoint: 'MATCH POINT',
    setPoint: 'SET POINT',
    timeout: 'TIMEOUT',
    point: 'Point',
    undo: 'Undo',
    config: 'Configure',

    // Team Management & Modal
    rotateTeams: 'Rotate Teams',
    rotateAndNext: 'Rotate & Next', // Adicionado
    cantRotate: 'Cannot rotate without queue.',
    nextMatch: 'Next Match', // Adicionado
    leaving: 'Leaving',
    entering: 'Entering',
    fixed: 'Fixed (Stayed)',
    queue: 'Waiting Queue',
    completedWith: 'Stolen to Complete',
    generateTeams: 'Generate Teams',
    playerList: 'Player List',
    manageTeams: 'Manage Teams',
    teamManager: 'Team Manager',
    fullQueue: 'All went to queue.',
    namesList: 'Enter names (one per line):',
    namesPlaceholder: 'John Doe\nJane Smith\n...',
    editList: 'Edit List',
    clear: 'Clear',
    waiting: 'Waiting',
    openSlots: 'slots',
    players: 'Players',
    emptyQueue: 'Empty queue',

    // Settings Presets
    presets: 'Quick Modes',
    mondayVolley: 'Monday Volley (30pts, no tie-break)',
    official: 'Official (25pts, Tie-break 15)',
    shortSet: 'Short Set (21pts)',
  }
};

export const t = (lang: Language, key: keyof typeof TRANSLATIONS['pt']) => {
  return TRANSLATIONS[lang][key] || key;
};