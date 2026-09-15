import { CompetencyId, ExerciseMetadata, ModuleId } from './types';

export interface ModuleLevel {
  level: number;
  title: string;
  focus: string;
  exerciseTypes: string[];
}

const competency: Record<ModuleId, CompetencyId> = {
  tonal: 'tonalOrientation', melody: 'melodicAudiation', rhythm: 'rhythm', harmony: 'bassHarmony', voices: 'voiceTracking', memory: 'audiationMemory', play: 'hearToPlay',
};

export const MODULE_LEVELS: Record<ModuleId, ModuleLevel[]> = {
  tonal: [
    { level: 1, title: 'Tonal anchors', focus: 'Tonic, mediant, dominant', exerciseTypes: ['degree-production', 'degree-recognition'] },
    { level: 2, title: 'Tendency and contrast', focus: 'Resolution and confused degrees', exerciseTypes: ['resolution', 'confusion-contrast', 'tonic-retention'] },
    { level: 3, title: 'Tonal independence', focus: 'Recovery and transfer', exerciseTypes: ['tonic-recovery', 'audiation-delay'] },
  ],
  melody: [
    { level: 1, title: 'Melodic shape', focus: 'Contour and chunks', exerciseTypes: ['contour-first', 'chunked-transcription', 'melody-audiation'] },
    { level: 2, title: 'Melodic language', focus: 'Motif and cadence', exerciseTypes: ['motif-recognition', 'cadence-completion', 'melodic-prediction'] },
    { level: 3, title: 'Memory transfer', focus: 'One-listen and delayed recall', exerciseTypes: ['one-listen-recall', 'delayed-melody-recall'] },
  ],
  rhythm: [
    { level: 1, title: 'Pulse and meter', focus: 'Pulse, duple/triple, subdivision', exerciseTypes: ['pulse-lock', 'meter-recognition', 'subdivision'] },
    { level: 2, title: 'Recall and silence', focus: 'Echo, dictation, silent pulse', exerciseTypes: ['rhythm-echo', 'rhythm-dictation', 'silent-pulse'] },
    { level: 3, title: 'Groove transfer', focus: 'Syncopation, layers, pitch + rhythm', exerciseTypes: ['syncopation', 'groove-decomposition', 'rhythm-pitch'] },
  ],
  harmony: [
    { level: 1, title: 'Bass and function', focus: 'Bass movement before labels', exerciseTypes: ['bass-recognition', 'bass-singing', 'functional-progression'] },
    { level: 2, title: 'Chord colour', focus: 'Quality, inversion, members', exerciseTypes: ['chord-quality', 'inversion', 'chord-members'] },
    { level: 3, title: 'Harmonic motion', focus: 'Guide tones, cadences, prediction', exerciseTypes: ['guide-tones', 'harmonic-prediction', 'cadence-recognition'] },
  ],
  voices: [
    { level: 1, title: 'Outer voices', focus: 'Top and bass tracking', exerciseTypes: ['top-voice', 'bass-tracking'] },
    { level: 2, title: 'Layered hearing', focus: 'Inner voice and two-part dictation', exerciseTypes: ['inner-voice', 'two-part-dictation', 'voice-entry'] },
    { level: 3, title: 'Selective attention', focus: 'Spotlight and texture', exerciseTypes: ['attention-spotlight', 'texture-classification', 'vocal-harmony'] },
  ],
  memory: [
    { level: 1, title: 'Hold and replay', focus: 'Silent and immediate recall', exerciseTypes: ['silent-replay', 'immediate-recall', 'freeze-frame'] },
    { level: 2, title: 'Recall over time', focus: 'Delayed and next-day retrieval', exerciseTypes: ['delayed-recall', 'next-day-recall', 'one-listen-capture'] },
    { level: 3, title: 'Mental transformation', focus: 'Transpose and reshape internally', exerciseTypes: ['mental-transformation'] },
  ],
  play: [
    { level: 1, title: 'First placement', focus: 'Commit before touching the keyboard', exerciseTypes: ['first-note-placement', 'phrase-placement'] },
    { level: 2, title: 'Harmony placement', focus: 'Bass, chords, and progressions', exerciseTypes: ['bass-placement', 'chord-placement', 'progression-placement'] },
    { level: 3, title: 'Transfer', focus: 'Immediate transposition', exerciseTypes: ['immediate-transposition'] },
  ],
};

const seed: Record<ModuleId, number[][]> = {
  tonal: [[7, 1], [4, 3], [6, 5]], melody: [[1, 3, 5, 4, 2, 1], [5, 6, 5, 3, 2, 1]], rhythm: [[1, 0, 1, 1]],
  harmony: [[1, 4, 5, 1], [1, 6, 4, 5]], voices: [[3, 4, 5], [5, 4, 3]], memory: [[5, 6, 5, 3, 2, 1]], play: [[5], [3, 5, 1]],
};

export function exerciseFor(module: ModuleId, level: number, index = 0): ExerciseMetadata {
  const definition = MODULE_LEVELS[module][Math.min(level, MODULE_LEVELS[module].length - 1)];
  const subtype = definition.exerciseTypes[index % definition.exerciseTypes.length];
  const degrees = seed[module][index % seed[module].length];
  const title = subtype.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  return { id: `${module}_${subtype}_${Date.now()}_${index}`, module, subtype, title, competency: competency[module], difficulty: definition.level, degrees, rhythm: module === 'rhythm' ? degrees : undefined, chordFunction: module === 'harmony' ? (degrees.join('–')) : undefined, voices: module === 'voices' ? 3 : undefined, prompt: `${definition.focus}. ${subtype.includes('recall') ? 'Listen once, hold it, then retrieve it.' : 'Listen, audiate, then make one clear response.'}` };
}
