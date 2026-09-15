import { AppState, cloneState, saveState } from '../storage/store';
import { CompetencyEvidence, CompetencyId, ExerciseMetadata, GuidedSessionPlan, LearningEvent, ModuleId, ReviewItem, createBlankEvidence } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function blankEvidence(): Record<CompetencyId, CompetencyEvidence> {
  return createBlankEvidence();
}

export function recordLearningEvent(state: AppState, event: LearningEvent, exercise: ExerciseMetadata): AppState {
  const next = cloneState(state);
  const evidence = next.competencyEvidence[event.competency] ?? { attempts: 0, firstCorrect: 0, assistedCorrect: 0, averageLatencyMs: 0 };
  const priorAttempts = evidence.attempts;
  evidence.attempts++;
  if (event.correct && event.firstAttempt) evidence.firstCorrect++;
  if (event.correct && event.assisted) evidence.assistedCorrect++;
  evidence.averageLatencyMs = Math.round(((evidence.averageLatencyMs * priorAttempts) + event.responseLatencyMs) / evidence.attempts);
  next.competencyEvidence[event.competency] = evidence;
  next.learningEvents.unshift(event);
  next.learningEvents = next.learningEvents.slice(0, 400);

  // Visible, deliberately conservative review heuristic: incorrect items come back tomorrow;
  // successful first attempts return after three days, then a week.
  const intervalDays = event.correct && event.firstAttempt ? 3 : 1;
  const review: ReviewItem = {
    id: `review_${event.id}`,
    exercise,
    dueAt: new Date(Date.now() + intervalDays * DAY).toISOString(),
    intervalDays,
    reason: event.correct ? (event.transfer ? 'transfer' : 'delayed-recall') : event.confusion ? 'confusion' : 'weakness',
  };
  next.reviewQueue = [review, ...next.reviewQueue.filter((item) => item.exercise.id !== exercise.id && !item.completedAt)].slice(0, 100);
  saveState(next);
  return next;
}

export function getDueReviews(state: AppState): ReviewItem[] {
  const now = Date.now();
  return state.reviewQueue.filter((item) => !item.completedAt && Date.parse(item.dueAt) <= now);
}

export function competencyScore(state: AppState, competency: CompetencyId): number | null {
  const evidence = state.competencyEvidence[competency];
  if (!evidence || evidence.attempts < 3) return null;
  return Math.round((evidence.firstCorrect / evidence.attempts) * 100);
}

/** Level selection advances only with enough independent evidence, keeping difficulty changes legible. */
export function recommendedModuleLevel(state: AppState, competency: CompetencyId): number {
  const evidence = state.competencyEvidence[competency];
  if (!evidence || evidence.attempts < 8) return 0;
  const independent = evidence.firstCorrect / Math.max(1, evidence.attempts);
  if (evidence.attempts >= 24 && independent >= .84) return 2;
  if (evidence.attempts >= 12 && independent >= .72) return 1;
  return 0;
}

export function completeReview(state: AppState, reviewId: string): AppState {
  const next = cloneState(state);
  next.reviewQueue = next.reviewQueue.map((item) => item.id === reviewId ? { ...item, completedAt: new Date().toISOString() } : item);
  saveState(next);
  return next;
}

export function createGuidedSession(state: AppState, minutes: 15 | 30 | 60): GuidedSessionPlan {
  const modules: { id: ModuleId; competency: CompetencyId }[] = [
    { id: 'tonal', competency: 'tonalOrientation' }, { id: 'melody', competency: 'melodicAudiation' }, { id: 'rhythm', competency: 'rhythm' },
    { id: 'harmony', competency: 'bassHarmony' }, { id: 'voices', competency: 'voiceTracking' }, { id: 'memory', competency: 'audiationMemory' }, { id: 'play', competency: 'hearToPlay' },
  ];
  const base = minutes === 15 ? 2 : minutes === 30 ? 4 : 7;
  const blocks = modules.map(({ id, competency }) => {
    const score = competencyScore(state, competency);
    const boost = score === null || score < 70 ? 2 : score < 82 ? 1 : 0;
    return { module: id, minutes: base + boost, reason: score === null ? 'Build a baseline' : boost ? 'Priority weakness' : 'Maintain transfer' };
  });
  let over = blocks.reduce((sum, block) => sum + block.minutes, 0) - minutes;
  for (let i = blocks.length - 1; over > 0 && i >= 0; i--) {
    const reduction = Math.min(over, Math.max(0, blocks[i].minutes - 1));
    blocks[i].minutes -= reduction;
    over -= reduction;
  }
  return { id: `plan_${Date.now()}`, minutes, createdAt: new Date().toISOString(), blocks };
}
