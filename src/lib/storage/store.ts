import { TrackId, TRACKS } from '../music/curriculum';
import { NotationMode, ScaleType, SoundTimbre } from '../music/scales';
import { CompetencyEvidence, LearningEvent, ReviewItem, createBlankEvidence } from '../earlab2/types';

export interface DegreeMastery {
  alpha: number;
  beta: number;
  attempts: number;
  correctFirst: number;
}

export interface TrackProgress {
  level: number; // 0-indexed (0 to 9, corresponding to Levels 1 to 10)
  qualifying: number; // 0 to 3
  qualifyingDays: string[]; // ['2026-09-13', '2026-09-14']
}

export interface SessionRecord {
  id: string;
  trackId: TrackId;
  trackName: string;
  levelNumber: number;
  levelName: string;
  date: string;
  isoDate: string;
  firstAttemptAcc: number;
  assistedAcc: number;
  totalChallenges: number;
  reveals: number;
  retries: number;
  durationSeconds: number;
  qualified: boolean;
}

export interface UserPreferences {
  notation: NotationMode;
  defaultTimbre: SoundTimbre;
  defaultKeyIndex: number;
  defaultScale: ScaleType;
  enableMicAssessment: boolean;
  autoAdvanceOnCorrect: boolean;
  soundVolume: number;
}

export interface AppState {
  schemaVersion: number;
  sessionsCount: number;
  challengesCount: number;
  firstAttemptCorrectCount: number;
  revealsCount: number;
  retriesCount: number;
  levelsAdvancedCount: number;
  todayMinutes: number;
  lastActiveDay: string;
  preferences: UserPreferences;
  tracks: Record<TrackId, TrackProgress>;
  degreeMastery: Record<number, DegreeMastery>;
  confusionMatrix: Record<number, Record<number, number>>; // confusion[target][mistaken] = count
  history: SessionRecord[];
  /** EarLab 2.0 local-first evidence. Existing A–D records remain untouched. */
  competencyEvidence: Record<string, CompetencyEvidence>;
  learningEvents: LearningEvent[];
  reviewQueue: ReviewItem[];
}

const STORAGE_KEY = 'earlab_mastery_v3';

/** Keeps installed WebViews compatible when native structuredClone is unavailable. */
export function cloneState<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export const DEFAULT_STATE: AppState = {
  schemaVersion: 5,
  sessionsCount: 0,
  challengesCount: 0,
  firstAttemptCorrectCount: 0,
  revealsCount: 0,
  retriesCount: 0,
  levelsAdvancedCount: 0,
  todayMinutes: 0,
  lastActiveDay: new Date().toISOString().slice(0, 10),
  preferences: {
    notation: 'degrees',
    defaultTimbre: 'piano',
    defaultKeyIndex: 0, // C
    defaultScale: 'major',
    enableMicAssessment: false,
    autoAdvanceOnCorrect: true,
    soundVolume: 0.8,
  },
  tracks: {
    A: { level: 0, qualifying: 0, qualifyingDays: [] },
    B: { level: 0, qualifying: 0, qualifyingDays: [] },
    C: { level: 0, qualifying: 0, qualifyingDays: [] },
    D: { level: 0, qualifying: 0, qualifyingDays: [] },
  },
  degreeMastery: {
    1: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    2: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    3: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    4: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    5: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    6: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
    7: { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 },
  },
  confusionMatrix: {
    1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {},
  },
  history: [],
  competencyEvidence: createBlankEvidence(),
  learningEvents: [],
  reviewQueue: [],
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneState(DEFAULT_STATE);

    const parsed = JSON.parse(raw);
    const state: AppState = { ...cloneState(DEFAULT_STATE), ...parsed };

    // Deep-merge preferences and tracks to handle schema evolution
    state.preferences = { ...DEFAULT_STATE.preferences, ...(parsed.preferences || {}) };
    state.tracks = { ...DEFAULT_STATE.tracks, ...(parsed.tracks || {}) };
    state.degreeMastery = { ...DEFAULT_STATE.degreeMastery, ...(parsed.degreeMastery || {}) };
    state.confusionMatrix = { ...DEFAULT_STATE.confusionMatrix, ...(parsed.confusionMatrix || {}) };
    state.competencyEvidence = { ...DEFAULT_STATE.competencyEvidence, ...(parsed.competencyEvidence || {}) };
    state.learningEvents = Array.isArray(parsed.learningEvents) ? parsed.learningEvents : [];
    state.reviewQueue = Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : [];

    // v4 promotes the recorded Studio Grand to the default for existing learners.
    if ((parsed.schemaVersion || 0) < 4 && state.preferences.defaultTimbre === 'ep') {
      state.preferences.defaultTimbre = 'piano';
    }
    state.schemaVersion = DEFAULT_STATE.schemaVersion;

    // Normalize daily minutes
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastActiveDay !== today) {
      state.lastActiveDay = today;
      state.todayMinutes = 0;
    }

    return state;
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist EarLab state:', err);
  }
}

export function exportStateAsJson(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `earlab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHistoryAsCsv(history: SessionRecord[]): void {
  if (history.length === 0) return;

  const headers = [
    'Date',
    'Track ID',
    'Track Name',
    'Level',
    'Level Name',
    'First-Attempt Accuracy (%)',
    'Assisted Accuracy (%)',
    'Challenges',
    'Reveals',
    'Retries',
    'Duration (s)',
    'Qualified',
  ];

  const rows = history.map((h) => [
    h.date,
    h.trackId,
    `"${h.trackName}"`,
    h.levelNumber,
    `"${h.levelName}"`,
    h.firstAttemptAcc,
    h.assistedAcc,
    h.totalChallenges,
    h.reveals,
    h.retries,
    h.durationSeconds,
    h.qualified ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `earlab-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
