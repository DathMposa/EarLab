export type ScaleType = 'major' | 'minor';
export type NotationMode = 'degrees' | 'solfege' | 'notes';
export type SoundTimbre = 'ep' | 'piano' | 'pure';

export interface KeyDefinition {
  index: number;
  name: string;
  display: string;
  midiRoot: number; // Middle C is 60
}

export const KEYS: KeyDefinition[] = [
  { index: 0, name: 'C', display: 'C', midiRoot: 60 },
  { index: 1, name: 'C#', display: 'C♯ / D♭', midiRoot: 61 },
  { index: 2, name: 'D', display: 'D', midiRoot: 62 },
  { index: 3, name: 'Eb', display: 'E♭', midiRoot: 63 },
  { index: 4, name: 'E', display: 'E', midiRoot: 64 },
  { index: 5, name: 'F', display: 'F', midiRoot: 65 },
  { index: 6, name: 'F#', display: 'F♯', midiRoot: 66 },
  { index: 7, name: 'G', display: 'G', midiRoot: 67 },
  { index: 8, name: 'Ab', display: 'A♭', midiRoot: 68 },
  { index: 9, name: 'A', display: 'A', midiRoot: 69 },
  { index: 10, name: 'Bb', display: 'B♭', midiRoot: 70 },
  { index: 11, name: 'B', display: 'B', midiRoot: 71 },
];

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export const SOLFEGE: Record<ScaleType, string[]> = {
  major: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'],
  minor: ['Do', 'Re', 'Me', 'Fa', 'Sol', 'Le', 'Te'],
};

export interface DegreeFeeling {
  degree: number;
  name: string;
  quality: 'Stable' | 'Active' | 'Tension' | 'Anchor';
  title: string;
  summary: string;
  resolution: string;
  color: string;
}

export const DEGREE_FEELINGS: Record<number, DegreeFeeling> = {
  1: {
    degree: 1,
    name: 'Tonic (1)',
    quality: 'Stable',
    title: 'Home · Ultimate Rest',
    summary: 'The primary center of gravity. Maximum stability, stillness, and finality. All other degrees are heard and interpreted in relation to this home tone.',
    resolution: 'Already resolved. Acts as the gravitational pull for the entire tonal system.',
    color: '#6366f1',
  },
  2: {
    degree: 2,
    name: 'Supertonic (2)',
    quality: 'Active',
    title: 'Forward Motion · Stepping Stone',
    summary: 'Open, buoyant, and active. It hovers just above tonic with a light, optimistic expectation of movement.',
    resolution: 'Naturally resolves smoothly down to 1 (Home) or steps upward to 3 (Color).',
    color: '#38bdf8',
  },
  3: {
    degree: 3,
    name: 'Mediant (3)',
    quality: 'Stable',
    title: 'Identity · Warmth & Color',
    summary: 'Defines the foundational emotional color of the scale (bright major vs poignant minor). Consonant and reassuring, yet distinct from tonic finality.',
    resolution: 'Can serve as a temporary resting point; gentle pull toward 1 or 2.',
    color: '#10b981',
  },
  4: {
    degree: 4,
    name: 'Subdominant (4)',
    quality: 'Tension',
    title: 'Suspension · Breath & Lift',
    summary: 'Feels elevated, floating, or suspended away from the ground. Possesses an unmistakable downwards gravitational pull.',
    resolution: 'Has a strong, immediate pull to step down a half-step into 3.',
    color: '#f59e0b',
  },
  5: {
    degree: 5,
    name: 'Dominant (5)',
    quality: 'Anchor',
    title: 'The Pillar · Bright Support',
    summary: 'A powerful, noble acoustic anchor. Stable and bright, yet energetic and outward-pointing. It demands eventual confirmation back home to 1.',
    resolution: 'Vigorously leaps down a fourth (or ascends a fifth) back to 1.',
    color: '#8b5cf6',
  },
  6: {
    degree: 6,
    name: 'Submediant (6)',
    quality: 'Active',
    title: 'Pastel Warmth · Expressive Openness',
    summary: 'Warm, melancholic or nostalgic. In major, it softens the bright triad. It can float peacefully or lead downward.',
    resolution: 'Smoothly sighs downward into 5, or pushes upward through 7 into 1.',
    color: '#ec4899',
  },
  7: {
    degree: 7,
    name: 'Leading Tone (7)',
    quality: 'Tension',
    title: 'Urgent Leading Tone · Peak Pull',
    summary: 'The most intense, directional tension tone in diatonic music. Just a half-step below tonic, it creates acute magnet-like expectation.',
    resolution: 'Urgent, near-irresistible magnetic drive to snap upward into 1.',
    color: '#f43f5e',
  },
};

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

/**
 * Calculates MIDI note number for a given scale degree.
 */
export function midiForDegree(degree: number, keyIndex: number = 0, scale: ScaleType = 'major', octaveOffset: number = 0): number {
  const root = KEYS[keyIndex].midiRoot + (octaveOffset * 12);
  const intervals = SCALE_INTERVALS[scale];
  const semitoneOffset = intervals[(degree - 1) % 7];
  const extraOctaves = Math.floor((degree - 1) / 7);
  return root + semitoneOffset + (extraOctaves * 12);
}

/**
 * Converts MIDI note to frequency in Hz. A4 = 440 Hz (MIDI 69).
 */
export function freqFromMidi(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Direct frequency calculation for degree.
 */
export function freqFromDegree(degree: number, keyIndex: number = 0, scale: ScaleType = 'major', octaveOffset: number = 0): number {
  return freqFromMidi(midiForDegree(degree, keyIndex, scale, octaveOffset));
}

/**
 * Formats a degree label according to the chosen notation mode.
 */
export function formatDegreeLabel(degree: number, notation: NotationMode, keyIndex: number = 0, scale: ScaleType = 'major'): { primary: string; secondary?: string } {
  const degStr = String(degree);
  const solf = SOLFEGE[scale][(degree - 1) % 7];
  const midi = midiForDegree(degree, keyIndex, scale);
  const noteName = NOTE_NAMES[midi % 12];

  if (notation === 'solfege') {
    return { primary: solf, secondary: `Degree ${degStr}` };
  }
  if (notation === 'notes') {
    return { primary: noteName, secondary: `Degree ${degStr}` };
  }
  return { primary: degStr, secondary: solf };
}
