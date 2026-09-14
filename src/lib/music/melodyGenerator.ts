import { LevelDefinition } from './curriculum';

export interface MelodyOptions {
  level: LevelDefinition;
  targetDegreeWeakness?: number; // Optional degree to deliberately integrate as a weakness probe
}

// Curated authentic musical motifs categorized by phrase length
const CURATED_MOTIFS: Record<number, number[][]> = {
  2: [
    [1, 5], [5, 1], [1, 3], [3, 1], [3, 5], [5, 3], [2, 1], [7, 1], [4, 3], [6, 5],
  ],
  3: [
    [1, 3, 5], [5, 3, 1], [1, 2, 1], [1, 2, 3], [3, 2, 1], [3, 4, 5], [5, 4, 3], [1, 5, 1], [3, 1, 5], [1, 7, 1],
  ],
  4: [
    [1, 2, 3, 1], [1, 3, 2, 1], [1, 2, 3, 5], [5, 4, 3, 1], [1, 3, 5, 3], [3, 2, 1, 5], [1, 5, 6, 5], [5, 6, 5, 1],
    [1, 2, 3, 4], [4, 3, 2, 1], [2, 3, 4, 3], [3, 4, 3, 2], [1, 3, 2, 4], [3, 5, 4, 2], [1, 7, 1, 2], [7, 1, 2, 1],
  ],
  5: [
    [1, 2, 3, 2, 1], [1, 3, 5, 4, 3], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [3, 1, 2, 7, 1], [1, 3, 2, 4, 3],
    [5, 6, 5, 4, 3], [3, 4, 5, 6, 5], [1, 5, 4, 3, 1], [1, 3, 5, 6, 5],
  ],
  6: [
    [1, 2, 3, 4, 3, 1], [1, 3, 5, 6, 5, 1], [5, 4, 3, 2, 3, 1], [1, 3, 2, 4, 3, 1],
    [1, 5, 6, 5, 4, 3], [3, 2, 1, 2, 3, 1], [1, 2, 3, 5, 4, 3], [5, 6, 5, 3, 2, 1],
    [1, 3, 5, 4, 2, 1], [1, 7, 1, 2, 3, 1],
  ],
  8: [
    [1, 2, 3, 1, 3, 4, 5, 1], [1, 3, 5, 6, 5, 4, 3, 1], [5, 4, 3, 2, 1, 2, 3, 1],
    [1, 2, 3, 4, 5, 6, 7, 1], [1, 3, 2, 4, 3, 5, 2, 1], [5, 6, 5, 3, 4, 3, 2, 1],
    [1, 5, 4, 3, 2, 3, 2, 1], [3, 2, 1, 7, 1, 2, 3, 1], [1, 3, 5, 3, 2, 4, 3, 1],
  ],
};

function weightedPick<T>(items: T[], weights: number[]): T {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Procedural musical grammar engine for generating natural, singable melodies.
 */
export function generateMelody(options: MelodyOptions): number[] {
  const { level, targetDegreeWeakness } = options;
  const pool = level.allowedDegrees;
  const length = level.phraseLength;

  // Single degree challenge (Degree Singing or Degree Recognition)
  if (length === 1) {
    if (targetDegreeWeakness && pool.includes(targetDegreeWeakness) && Math.random() < 0.45) {
      return [targetDegreeWeakness];
    }
    return [pool[Math.floor(Math.random() * pool.length)]];
  }

  // 35% chance to use an authentic curated motif if exact length and degrees match
  const curated = CURATED_MOTIFS[length];
  if (curated && curated.length > 0 && Math.random() < 0.4) {
    const validMotifs = curated.filter((m) => m.every((d) => pool.includes(d)));
    if (validMotifs.length > 0) {
      const selected = validMotifs[Math.floor(Math.random() * validMotifs.length)];
      return [...selected];
    }
  }

  // Otherwise, use our constrained musical Markov grammar
  const melody: number[] = [];

  // Start note: heavily favor stable anchor tones (1, 3, or 5)
  const startCandidates = pool.filter((d) => [1, 3, 5].includes(d));
  const startPool = startCandidates.length > 0 ? startCandidates : pool;
  melody.push(startPool[Math.floor(Math.random() * startPool.length)]);

  while (melody.length < length) {
    const prev = melody[melody.length - 1];
    const prev2 = melody.length >= 2 ? melody[melody.length - 2] : null;

    const weights = pool.map((deg) => {
      const dist = Math.abs(deg - prev);

      // Distance constraints based on level maxInterval
      if (dist > level.maxInterval) return 0.05;

      let w = 1.0;
      if (dist === 1) w = 4.5; // Stepwise motion is king in singable music
      else if (dist === 0) w = 1.2; // Note repetition
      else if (dist === 2) w = 2.4; // Thirds
      else if (dist === 3 || dist === 4) w = 0.9; // Fourths/Fifths
      else w = 0.3; // Leaps

      // Avoid three repetitions of the exact same pitch in a row
      if (prev2 !== null && deg === prev && prev === prev2) {
        w *= 0.05;
      }

      // Favor chord tones (1, 3, 5)
      if ([1, 3, 5].includes(deg)) {
        w *= 1.25;
      }

      // If a weakness probe degree is targeted, boost its probability
      if (targetDegreeWeakness && deg === targetDegreeWeakness) {
        w *= 2.2;
      }

      return w;
    });

    melody.push(weightedPick(pool, weights));
  }

  // For phrases of length >= 4, ensure a musically satisfying cadence resolution at the end
  if (length >= 4 && Math.random() < 0.75) {
    const cadenceOptions = [
      [2, 1], // Supertonic to Tonic
      [7, 1], // Leading tone to Tonic
      [5, 1], // Dominant to Tonic
      [4, 3], // Subdominant to Mediant
      [6, 5], // Submediant to Dominant
    ];

    const validCadences = cadenceOptions.filter((cad) =>
      cad.every((deg) => pool.includes(deg))
    );

    if (validCadences.length > 0) {
      const chosenCadence = validCadences[Math.floor(Math.random() * validCadences.length)];
      melody[length - 2] = chosenCadence[0];
      melody[length - 1] = chosenCadence[1];
    }
  }

  return melody;
}
