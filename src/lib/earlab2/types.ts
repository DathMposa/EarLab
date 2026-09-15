export type ModuleId = 'tonal' | 'melody' | 'rhythm' | 'harmony' | 'voices' | 'memory' | 'play';

export type CompetencyId =
  | 'tonalOrientation'
  | 'degreeRecognition'
  | 'degreeProduction'
  | 'melodicAudiation'
  | 'melodicMemory'
  | 'rhythm'
  | 'groove'
  | 'bassHarmony'
  | 'voiceTracking'
  | 'audiationMemory'
  | 'hearToPlay';

export type AssistanceKind = 'replay' | 'tonic' | 'slow' | 'segment' | 'hint' | 'partial' | 'reveal';

export interface ExerciseMetadata {
  id: string;
  module: ModuleId;
  subtype: string;
  title: string;
  competency: CompetencyId;
  difficulty: number;
  degrees?: number[];
  rhythm?: number[];
  chordFunction?: string;
  voices?: number;
  transfer?: boolean;
  prompt: string;
}

export interface LearningEvent {
  id: string;
  exerciseId: string;
  module: ModuleId;
  competency: CompetencyId;
  timestamp: string;
  correct: boolean;
  firstAttempt: boolean;
  assisted: boolean;
  responseLatencyMs: number;
  replayCount: number;
  assistance: AssistanceKind[];
  transfer: boolean;
  confusion?: string;
}

export interface ReviewItem {
  id: string;
  exercise: ExerciseMetadata;
  dueAt: string;
  intervalDays: number;
  reason: 'weakness' | 'confusion' | 'delayed-recall' | 'transfer';
  completedAt?: string;
}

export interface CompetencyEvidence {
  attempts: number;
  firstCorrect: number;
  assistedCorrect: number;
  averageLatencyMs: number;
}

export interface GuidedSessionPlan {
  id: string;
  minutes: 15 | 30 | 60;
  createdAt: string;
  blocks: { module: ModuleId; minutes: number; reason: string }[];
}

export interface AudioPackManifest {
  id: string;
  version: string;
  title: string;
  license: string;
  attribution: string;
  status: 'ready' | 'preparing' | 'fallback';
}

export function createBlankEvidence(): Record<CompetencyId, CompetencyEvidence> {
  const base: CompetencyEvidence = { attempts: 0, firstCorrect: 0, assistedCorrect: 0, averageLatencyMs: 0 };
  return {
    tonalOrientation: { ...base }, degreeRecognition: { ...base }, degreeProduction: { ...base }, melodicAudiation: { ...base }, melodicMemory: { ...base },
    rhythm: { ...base }, groove: { ...base }, bassHarmony: { ...base }, voiceTracking: { ...base }, audiationMemory: { ...base }, hearToPlay: { ...base },
  };
}

export const MODULES: { id: ModuleId; title: string; description: string; competency: CompetencyId }[] = [
  { id: 'tonal', title: 'Tonal Gravity', description: 'Tonic, tendency, and functional pitch.', competency: 'tonalOrientation' },
  { id: 'melody', title: 'Melody Language', description: 'Contour, motifs, memory, and reconstruction.', competency: 'melodicAudiation' },
  { id: 'rhythm', title: 'Rhythm & Groove', description: 'Pulse, subdivision, echo, and silent time.', competency: 'rhythm' },
  { id: 'harmony', title: 'Bass & Harmony', description: 'Bass first, then function, quality, and cadence.', competency: 'bassHarmony' },
  { id: 'voices', title: 'Polyphonic Hearing', description: 'Follow a chosen line inside layered music.', competency: 'voiceTracking' },
  { id: 'memory', title: 'Audiation & Memory', description: 'Hold, recall, and transform music internally.', competency: 'audiationMemory' },
  { id: 'play', title: 'Hear → Sing → Play', description: 'Commit mentally, then place it on the keyboard.', competency: 'hearToPlay' },
];
