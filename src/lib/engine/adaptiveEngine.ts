import { TrackId, TRACKS, LevelDefinition } from '../music/curriculum';
import { AppState, saveState, SessionRecord, cloneState } from '../storage/store';

export interface EvaluationResult {
  isCorrect: boolean;
  isFirstAttempt: boolean;
  targetSequence: number[];
  enteredSequence: number[];
  errorIndices: number[];
  confusionPairs: { target: number; chosen: number }[];
}

/**
 * Compares entered sequence with target sequence.
 */
export function evaluateAttempt(
  target: number[],
  entered: number[],
  isFirstAttempt: boolean
): EvaluationResult {
  const isCorrect = target.length === entered.length && target.every((d, i) => d === entered[i]);
  const errorIndices: number[] = [];
  const confusionPairs: { target: number; chosen: number }[] = [];

  target.forEach((t, i) => {
    const e = entered[i];
    if (e !== undefined && e !== t) {
      errorIndices.push(i);
      confusionPairs.push({ target: t, chosen: e });
    }
  });

  return {
    isCorrect,
    isFirstAttempt,
    targetSequence: target,
    enteredSequence: entered,
    errorIndices,
    confusionPairs,
  };
}

/**
 * Updates Bayesian Beta-Bernoulli mastery and confusion matrix.
 */
export function recordChallengeAttempt(
  state: AppState,
  targetSequence: number[],
  isFirstAttemptCorrect: boolean,
  isRetryCorrect: boolean,
  wasRevealed: boolean,
  confusionPairs: { target: number; chosen: number }[]
): AppState {
  const next = cloneState(state);
  next.challengesCount++;

  if (isFirstAttemptCorrect) {
    next.firstAttemptCorrectCount++;
  } else if (wasRevealed) {
    next.revealsCount++;
  } else if (isRetryCorrect) {
    next.retriesCount++;
  }

  // Update scale degree Beta-Bernoulli posteriors
  targetSequence.forEach((degree) => {
    if (!next.degreeMastery[degree]) {
      next.degreeMastery[degree] = { alpha: 1, beta: 1, attempts: 0, correctFirst: 0 };
    }

    const m = next.degreeMastery[degree];
    m.attempts++;

    if (isFirstAttemptCorrect) {
      m.alpha += 1.0;
      m.correctFirst++;
    } else if (isRetryCorrect) {
      m.alpha += 0.5;
      m.beta += 0.5;
    } else if (wasRevealed) {
      m.beta += 1.2; // Extra weight on reveal
    } else {
      m.beta += 1.0;
    }
  });

  // Record confusion pairs (e.g. 6 mistook for 4)
  confusionPairs.forEach(({ target, chosen }) => {
    if (!next.confusionMatrix[target]) {
      next.confusionMatrix[target] = {};
    }
    next.confusionMatrix[target][chosen] = (next.confusionMatrix[target][chosen] || 0) + 1;
  });

  saveState(next);
  return next;
}

/**
 * Calculates smoothed mastery probability for a degree (0.0 to 1.0).
 */
export function getDegreeMasteryPct(state: AppState, degree: number): number {
  const m = state.degreeMastery[degree];
  if (!m || m.attempts === 0) return 0;
  return Math.round((m.alpha / (m.alpha + m.beta)) * 100);
}

/**
 * Returns the scale degree with lowest mastery in the active pool.
 */
export function findWeakestDegree(state: AppState, allowedDegrees: number[]): number | undefined {
  if (allowedDegrees.length === 0) return undefined;

  let weakest = allowedDegrees[0];
  let lowestMastery = 999;

  allowedDegrees.forEach((deg) => {
    const mastery = getDegreeMasteryPct(state, deg);
    if (mastery < lowestMastery) {
      lowestMastery = mastery;
      weakest = deg;
    }
  });

  return weakest;
}

/**
 * Recommends the next track to practice based on lowest level and qualifying sessions.
 */
export function getRecommendedTrack(state: AppState): TrackId {
  const trackIds: TrackId[] = ['A', 'B', 'C', 'D'];
  let bestTrack = trackIds[0];
  let lowestScore = 999;

  trackIds.forEach((id) => {
    const progress = state.tracks[id];
    // Score = level * 10 + qualifying
    const score = progress.level * 10 + progress.qualifying;
    if (score < lowestScore) {
      lowestScore = score;
      bestTrack = id;
    }
  });

  return bestTrack;
}

export interface SessionCompletionOutcome {
  qualified: boolean;
  promoted: boolean;
  firstAttemptAcc: number;
  assistedAcc: number;
  newLevelNumber: number;
  message: string;
}

/**
 * Finalizes a session, applies the 3-session multi-day promotion gate, and records history.
 */
export function completeSession(
  state: AppState,
  trackId: TrackId,
  levelIndex: number, // 0-based
  firstAttemptSuccesses: number,
  totalChallenges: number,
  totalCorrectEventual: number,
  reveals: number,
  retries: number,
  durationSeconds: number
): { nextState: AppState; outcome: SessionCompletionOutcome } {
  const next = cloneState(state);
  const trackDef = TRACKS[trackId];
  const levelDef = trackDef.levels[levelIndex];

  const firstAttemptAcc = Math.round((firstAttemptSuccesses / Math.max(1, totalChallenges)) * 100);
  const assistedAcc = Math.round((totalCorrectEventual / Math.max(1, totalChallenges)) * 100);

  next.sessionsCount++;
  next.todayMinutes += Math.max(1, Math.round(durationSeconds / 60));

  const passThresholdPct = Math.round(levelDef.passThreshold * 100);
  const isQualified = firstAttemptAcc >= passThresholdPct;

  const today = new Date().toISOString().slice(0, 10);
  const trackProgress = next.tracks[trackId];

  let promoted = false;

  if (isQualified) {
    trackProgress.qualifying++;
    if (!trackProgress.qualifyingDays.includes(today)) {
      trackProgress.qualifyingDays.push(today);
    }

    // 3 qualifying sessions spanning at least 2 distinct calendar days
    const meetsSessionCount = trackProgress.qualifying >= 3;
    const meetsMultiDay = trackProgress.qualifyingDays.length >= 2;

    if (meetsSessionCount && trackProgress.level < trackDef.levels.length - 1) {
      trackProgress.level++;
      trackProgress.qualifying = 0;
      trackProgress.qualifyingDays = [];
      next.levelsAdvancedCount++;
      promoted = true;
    }
  } else {
    // Decay qualifying count gently on failed sessions
    trackProgress.qualifying = Math.max(0, trackProgress.qualifying - 1);
  }

  const record: SessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    trackId,
    trackName: trackDef.name,
    levelNumber: levelIndex + 1,
    levelName: levelDef.name,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    isoDate: new Date().toISOString(),
    firstAttemptAcc,
    assistedAcc,
    totalChallenges,
    reveals,
    retries,
    durationSeconds,
    qualified: isQualified,
  };

  next.history.unshift(record);
  if (next.history.length > 50) {
    next.history = next.history.slice(0, 50);
  }

  saveState(next);

  let message = '';
  if (promoted) {
    message = `Mastery confirmed! You have advanced to Level ${trackId}${trackProgress.level + 1}: ${trackDef.levels[trackProgress.level].name}!`;
  } else if (isQualified) {
    message = `Qualifying session recorded (${firstAttemptAcc}% ≥ ${passThresholdPct}%). Progress: ${trackProgress.qualifying}/3 qualifying sessions toward Level ${trackId}${trackProgress.level + 2}.`;
  } else {
    message = `Completed. First-attempt accuracy was ${firstAttemptAcc}% (target: ${passThresholdPct}%). Keep practicing to consolidate weak degrees!`;
  }

  return {
    nextState: next,
    outcome: {
      qualified: isQualified,
      promoted,
      firstAttemptAcc,
      assistedAcc,
      newLevelNumber: trackProgress.level + 1,
      message,
    },
  };
}
