'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, ArrowLeft, RotateCcw, Eye, ArrowRight, Mic, Check, X, Sparkles, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRACKS, TrackId, LevelDefinition } from '../../lib/music/curriculum';
import { KEYS, formatDegreeLabel, ScaleType, SoundTimbre } from '../../lib/music/scales';
import { audioEngine } from '../../lib/audio/audioEngine';
import { generateMelody } from '../../lib/music/melodyGenerator';
import { AppState } from '../../lib/storage/store';
import { evaluateAttempt, recordChallengeAttempt, completeSession, findWeakestDegree, EvaluationResult, SessionCompletionOutcome } from '../../lib/engine/adaptiveEngine';
import { PitchDetector, PitchDetectionResult } from '../../lib/audio/pitchDetector';
import { FlowGlyph } from '../visuals/FlowGlyph';
import { TonalConstellation } from '../visuals/TonalConstellation';

interface ExerciseViewProps {
  state: AppState;
  trackId: TrackId;
  levelIndex: number;
  onStateUpdate: (newState: AppState) => void;
  onExit: () => void;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  state,
  trackId,
  levelIndex,
  onStateUpdate,
  onExit,
}) => {
  const track = TRACKS[trackId];
  const level: LevelDefinition = track.levels[levelIndex];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [enteredSequence, setEnteredSequence] = useState<number[]>([]);
  const [replayCount, setReplayCount] = useState<number>(0);
  const [isFirstAttempt, setIsFirstAttempt] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'idle' | 'good' | 'bad' | 'info' }>({ text: '', type: 'idle' });
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [firstAttemptSuccessCount, setFirstAttemptSuccessCount] = useState<number>(0);
  const [eventualCorrectCount, setEventualCorrectCount] = useState<number>(0);
  const [sessionRevealsCount, setSessionRevealsCount] = useState<number>(0);
  const [sessionRetriesCount, setSessionRetriesCount] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionOutcome, setSessionOutcome] = useState<SessionCompletionOutcome | null>(null);
  const [isDroneOn, setIsDroneOn] = useState<boolean>(false);

  const [pitchResult, setPitchResult] = useState<PitchDetectionResult | null>(null);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const pitchDetectorRef = useRef<PitchDetector | null>(null);

  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(state.preferences.defaultKeyIndex);
  const [currentScale, setCurrentScale] = useState<ScaleType>(level.scaleType);
  const [currentTimbre, setCurrentTimbre] = useState<SoundTimbre>(state.preferences.defaultTimbre);
  const notation = state.preferences.notation;

  const isSingingTrack = track.mode === 'singing' || track.mode === 'melody-singing';
  const isSingleNote = level.phraseLength === 1;

  const setupChallenge = (index: number) => {
    if (index >= level.targetChallenges) {
      handleFinishSession();
      return;
    }

    const weakest = findWeakestDegree(state, level.allowedDegrees);
    const melody = generateMelody({ level, targetDegreeWeakness: weakest });

    setTargetSequence(melody);
    setEnteredSequence([]);
    setReplayCount(0);
    setIsFirstAttempt(true);
    setIsLocked(false);
    setFeedback({ text: '', type: 'idle' });
    setEvalResult(null);
    setIsRevealed(false);

    if (track.mode === 'recognition' || track.mode === 'transcription') {
      setTimeout(() => {
        if (melody.length === 1) {
          audioEngine.playDegree(melody[0], currentKeyIndex, currentScale, 0.85, currentTimbre);
        } else {
          audioEngine.playMelody(melody, currentKeyIndex, currentScale, currentTimbre);
        }
      }, 200);
    } else {
      if (level.tonalSupport === 'always' || (level.tonalSupport === 'periodic' && index % 2 === 0)) {
        audioEngine.playTonalFrame(currentKeyIndex, currentScale);
      }
    }
  };

  useEffect(() => {
    setupChallenge(0);
    return () => {
      audioEngine.stopAll();
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 7 && level.allowedDegrees.includes(num)) {
        handleKeyPress(num);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (!isSingingTrack && enteredSequence.length === targetSequence.length) {
          handleCheckAnswer();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePlayTarget();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredSequence, targetSequence, isLocked, isSingingTrack]);

  const handlePlayTarget = (slow = false) => {
    setReplayCount((prev) => prev + 1);
    if (targetSequence.length === 1) {
      audioEngine.playDegree(targetSequence[0], currentKeyIndex, currentScale, slow ? 1.2 : 0.85, currentTimbre);
    } else {
      audioEngine.playMelody(targetSequence, currentKeyIndex, currentScale, currentTimbre, slow);
    }
  };

  const handlePlayTonic = () => {
    audioEngine.playTonalFrame(currentKeyIndex, currentScale);
  };

  const handleToggleDrone = () => {
    const active = audioEngine.toggleDrone(currentKeyIndex, currentScale);
    setIsDroneOn(active);
  };

  const handleKeyPress = (degree: number) => {
    if (isLocked) return;

    if (isSingleNote) {
      const newSeq = [degree];
      setEnteredSequence(newSeq);
      evaluateSingleAttempt(newSeq);
    } else {
      if (enteredSequence.length < targetSequence.length) {
        setEnteredSequence([...enteredSequence, degree]);
      }
    }
  };

  const handleBackspace = () => {
    if (isLocked) return;
    setEnteredSequence(enteredSequence.slice(0, -1));
  };

  const evaluateSingleAttempt = (entered: number[]) => {
    const evaluation = evaluateAttempt(targetSequence, entered, isFirstAttempt);
    setEvalResult(evaluation);
    setIsLocked(true);

    const updatedState = recordChallengeAttempt(
      state,
      targetSequence,
      evaluation.isCorrect && isFirstAttempt,
      evaluation.isCorrect && !isFirstAttempt,
      false,
      evaluation.confusionPairs
    );
    onStateUpdate(updatedState);

    if (evaluation.isCorrect) {
      if (isFirstAttempt) {
        setFirstAttemptSuccessCount((c) => c + 1);
      }
      setEventualCorrectCount((c) => c + 1);
      setFeedback({ text: '✓ Degree Identified Correctly', type: 'good' });

      if (state.preferences.autoAdvanceOnCorrect) {
        setTimeout(() => advanceNextChallenge(), 500);
      }
    } else {
      setFeedback({ text: 'Incorrect. Re-listen to compare tonal gravity before revealing.', type: 'bad' });
      setIsFirstAttempt(false);
    }
  };

  const handleCheckAnswer = () => {
    if (isLocked || enteredSequence.length !== targetSequence.length) return;

    const evaluation = evaluateAttempt(targetSequence, enteredSequence, isFirstAttempt);
    setEvalResult(evaluation);
    setIsLocked(true);

    const updatedState = recordChallengeAttempt(
      state,
      targetSequence,
      evaluation.isCorrect && isFirstAttempt,
      evaluation.isCorrect && !isFirstAttempt,
      false,
      evaluation.confusionPairs
    );
    onStateUpdate(updatedState);

    if (evaluation.isCorrect) {
      if (isFirstAttempt) {
        setFirstAttemptSuccessCount((c) => c + 1);
      }
      setEventualCorrectCount((c) => c + 1);
      setFeedback({ text: '✓ Phrase Reconstructed Correctly', type: 'good' });

      if (state.preferences.autoAdvanceOnCorrect) {
        setTimeout(() => advanceNextChallenge(), 550);
      }
    } else {
      setFeedback({ text: 'Sequence does not match. Re-audition contour before revealing.', type: 'bad' });
      setIsFirstAttempt(false);
    }
  };

  const handleSelfScore = (score: number) => {
    if (isLocked) return;
    setIsLocked(true);

    const isMatch = score === 1.0;
    const isClose = score === 0.5;

    const updatedState = recordChallengeAttempt(
      state,
      targetSequence,
      isMatch && isFirstAttempt && replayCount === 0,
      isMatch && (!isFirstAttempt || replayCount > 0),
      false,
      []
    );
    onStateUpdate(updatedState);

    if (isMatch) {
      if (isFirstAttempt && replayCount === 0) {
        setFirstAttemptSuccessCount((c) => c + 1);
      }
      setEventualCorrectCount((c) => c + 1);
      setFeedback({ text: '✓ Intonation verified', type: 'good' });
      setTimeout(() => advanceNextChallenge(), 500);
    } else {
      setFeedback({
        text: isClose
          ? 'Near intonation — audit against reference pitch before advancing.'
          : 'Missed — listen to the tonal pull again before moving on.',
        type: 'bad',
      });
      setIsFirstAttempt(false);
    }
  };

  const handleRetry = () => {
    setSessionRetriesCount((c) => c + 1);
    setIsLocked(false);
    setEnteredSequence([]);
    setFeedback({ text: 'Ready for retry. Audiate pitch first.', type: 'info' });
  };

  const handleReveal = () => {
    setSessionRevealsCount((c) => c + 1);
    setIsRevealed(true);

    const updatedState = recordChallengeAttempt(
      state,
      targetSequence,
      false,
      false,
      true,
      evalResult?.confusionPairs || []
    );
    onStateUpdate(updatedState);
    handlePlayTarget();
  };

  const advanceNextChallenge = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setupChallenge(nextIdx);
  };

  const handleFinishSession = () => {
    const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const { nextState, outcome } = completeSession(
      state,
      trackId,
      levelIndex,
      firstAttemptSuccessCount,
      level.targetChallenges,
      eventualCorrectCount,
      sessionRevealsCount,
      sessionRetriesCount,
      duration
    );
    onStateUpdate(nextState);
    setSessionOutcome(outcome);

    if (outcome.promoted) {
      try {
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Fallback
      }
    }
  };

  const handleToggleMic = async () => {
    if (isMicListening) {
      pitchDetectorRef.current?.stop();
      setIsMicListening(false);
      setPitchResult(null);
    } else {
      if (!pitchDetectorRef.current) {
        pitchDetectorRef.current = new PitchDetector();
      }
      const ok = await pitchDetectorRef.current.start(currentKeyIndex, currentScale, (res) => {
        setPitchResult(res);
      });
      setIsMicListening(ok);
      if (!ok) {
        alert('Could not initialize microphone input.');
      }
    }
  };

  if (sessionOutcome) {
    return (
      <div className="studio-card" style={{ textAlign: 'center', padding: '40px 28px', margin: 'auto', maxWidth: '540px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: sessionOutcome.promoted ? '#09090b' : '#f4f4f6',
          color: sessionOutcome.promoted ? '#ffffff' : '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
        }}>
          {sessionOutcome.promoted ? <Sparkles size={32} /> : <Check size={32} />}
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: '#09090b' }}>
          Session Complete
        </h2>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          {sessionOutcome.message}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'var(--panel-card-subtle)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--panel-border-medium)',
          marginBottom: '24px',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>First Attempt Acc</span>
            <b style={{ display: 'block', fontSize: '1.75rem', fontFamily: 'var(--font-mono)', color: '#09090b' }}>
              {sessionOutcome.firstAttemptAcc}%
            </b>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assisted Acc</span>
            <b style={{ display: 'block', fontSize: '1.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {sessionOutcome.assistedAcc}%
            </b>
          </div>
        </div>

        <button className="btn-primary" onClick={onExit} style={{ width: '100%', padding: '14px', fontSize: '1.02rem' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Console Top Header */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={onExit} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.88rem' }}>
            <ArrowLeft size={16} />
            Exit Console
          </button>

          <TonalConstellation allowedDegrees={level.allowedDegrees} size="sm" />

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.08rem', color: '#09090b' }}>
              {track.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {trackId}{levelIndex + 1} · {level.name} ({currentIndex + 1} / {level.targetChallenges})
            </div>
          </div>
        </div>

        {/* Challenge Dots Strip */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: level.targetChallenges }, (_, i) => {
            const isDone = i < currentIndex;
            const isNow = i === currentIndex;
            return (
              <span
                key={i}
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: isDone
                    ? '#09090b'
                    : isNow
                    ? 'var(--good)'
                    : 'rgba(0, 0, 0, 0.12)',
                  boxShadow: isNow ? '0 0 6px rgba(5, 150, 105, 0.4)' : 'none',
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Tonal Configuration Strip */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 750, display: 'block', marginBottom: '4px' }}>
              Tonal Root
            </label>
            <select
              value={currentKeyIndex}
              onChange={(e) => setCurrentKeyIndex(Number(e.target.value))}
              style={{ padding: '8px 10px', fontSize: '0.88rem' }}
            >
              {KEYS.map((k) => (
                <option key={k.index} value={k.index}>
                  {k.name} ({k.display})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 750, display: 'block', marginBottom: '4px' }}>
              Scale Context
            </label>
            <select
              value={currentScale}
              onChange={(e) => setCurrentScale(e.target.value as ScaleType)}
              style={{ padding: '8px 10px', fontSize: '0.88rem' }}
            >
              <option value="major">Major</option>
              <option value="minor">Natural Minor</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 750, display: 'block', marginBottom: '4px' }}>
              Timbre
            </label>
            <select
              value={currentTimbre}
              onChange={(e) => setCurrentTimbre(e.target.value as SoundTimbre)}
              style={{ padding: '8px 10px', fontSize: '0.88rem' }}
            >
              <option value="ep">Warm EP</option>
              <option value="piano">Studio Grand</option>
              <option value="pure">Reference Pure</option>
            </select>
          </div>
        </div>
      </section>

      {/* Center Interactive Studio Stage */}
      <section className="studio-card studio-card-compact" style={{ textAlign: 'center', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <FlowGlyph trackId={trackId} />
        </div>

        {/* Visual Target Prompt for Singing Tracks */}
        {isSingingTrack && (
          <div style={{ margin: '10px 0 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {targetSequence.map((deg, i) => {
                const labels = formatDegreeLabel(deg, notation, currentKeyIndex, currentScale);
                return (
                  <button
                    key={i}
                    onClick={() => audioEngine.playDegree(deg, currentKeyIndex, currentScale, 0.9, currentTimbre)}
                    className="degree-btn active"
                    style={{ width: '52px', height: '52px', fontSize: '1.25rem' }}
                    title="Tap to verify pitch"
                  >
                    <span>{labels.primary}</span>
                    {labels.secondary && <span className="sub-label">{labels.secondary}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Console Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
          <button className="btn-secondary" onClick={handlePlayTonic} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
            <Volume2 size={16} />
            Hear Tonic
          </button>

          {!isSingingTrack && (
            <>
              <button className="btn-primary" onClick={() => handlePlayTarget(false)} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                <Play size={16} fill="currentColor" />
                Play {isSingleNote ? 'Pitch' : 'Melody'}
              </button>
              <button className="btn-secondary" onClick={() => handlePlayTarget(true)} style={{ padding: '8px 12px', fontSize: '0.88rem' }}>
                {isSingleNote ? 'Replay' : '¾× Slower'}
              </button>
            </>
          )}

          {isSingingTrack && !isSingleNote && (
            <button className="btn-primary" onClick={() => handlePlayTarget(false)} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <Play size={16} fill="currentColor" />
              Play Reference Melody
            </button>
          )}

          <button
            onClick={handleToggleDrone}
            className={isDroneOn ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 12px', fontSize: '0.86rem' }}
            title="Continuous Tonic Drone"
          >
            {isDroneOn ? <VolumeX size={15} /> : <Volume2 size={15} />}
            Drone: {isDroneOn ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Optional Live Microphone Pitch Meter */}
        {isSingingTrack && (
          <div style={{ margin: '14px auto', maxWidth: '380px' }}>
            <button
              onClick={handleToggleMic}
              className="btn-secondary"
              style={{
                fontSize: '0.84rem',
                padding: '6px 14px',
                minHeight: 'unset',
                color: isMicListening ? '#09090b' : 'var(--text-muted)',
                fontWeight: 650,
              }}
            >
              <Mic size={15} />
              {isMicListening ? 'Live Pitch Meter: ACTIVE' : 'Enable Vocal Pitch Meter'}
            </button>

            {isMicListening && pitchResult && (
              <div style={{
                background: '#ffffff',
                border: '1.5px solid var(--panel-border-bright)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginTop: '10px',
                fontSize: '0.9rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Sung Note: <b style={{ fontFamily: 'var(--font-mono)', color: '#09090b' }}>{pitchResult.noteName} ({pitchResult.frequency} Hz)</b></span>
                  <span style={{
                    color: Math.abs(pitchResult.centsDeviation) <= 15 ? 'var(--good)' : 'var(--warn)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {pitchResult.centsDeviation > 0 ? `+${pitchResult.centsDeviation}` : pitchResult.centsDeviation} cents
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Answer Chips for Transcription */}
        {!isSingingTrack && !isSingleNote && (
          <div className="answer-chip-container">
            {Array.from({ length: targetSequence.length }, (_, i) => {
              const entered = enteredSequence[i];
              return (
                <div
                  key={i}
                  className={`answer-chip ${entered !== undefined ? '' : 'empty'}`}
                >
                  {entered !== undefined ? entered : '_'}
                </div>
              );
            })}
          </div>
        )}

        {/* Tactile Keypad */}
        {!isSingingTrack && (
          <div className="keypad-container">
            {[1, 2, 3, 4, 5, 6, 7].map((deg) => {
              const isAllowed = level.allowedDegrees.includes(deg);
              const labels = formatDegreeLabel(deg, notation, currentKeyIndex, currentScale);

              return (
                <button
                  key={deg}
                  disabled={!isAllowed || isLocked}
                  onClick={() => handleKeyPress(deg)}
                  className="keypad-btn"
                >
                  <span>{labels.primary}</span>
                  {labels.secondary && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', marginTop: '-2px' }}>{labels.secondary}</span>}
                </button>
              );
            })}

            {/* Backspace Button */}
            <button
              disabled={isLocked || enteredSequence.length === 0}
              onClick={handleBackspace}
              className="keypad-btn delete-btn"
              title="Delete note"
            >
              ⌫
            </button>
          </div>
        )}

        {/* Transcription Submit */}
        {!isSingingTrack && !isSingleNote && !isLocked && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
            <button
              className="btn-primary"
              onClick={handleCheckAnswer}
              disabled={enteredSequence.length !== targetSequence.length}
              style={{ minWidth: '160px', padding: '12px 24px' }}
            >
              Check Answer
            </button>
            <button
              className="btn-secondary"
              onClick={() => setEnteredSequence([])}
              disabled={enteredSequence.length === 0}
              style={{ padding: '12px 18px' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Singing Track Self-Rating */}
        {isSingingTrack && !isLocked && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <button
              className="btn-primary"
              onClick={() => handleSelfScore(1.0)}
              style={{ minWidth: '140px', padding: '12px 20px', fontSize: '0.98rem' }}
            >
              <Check size={18} />
              Matched
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleSelfScore(0.5)}
              style={{ minWidth: '130px', padding: '12px 18px', fontSize: '0.98rem' }}
            >
              Close / Unsure
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleSelfScore(0.0)}
              style={{ minWidth: '130px', padding: '12px 18px', fontSize: '0.98rem', color: 'var(--bad)' }}
            >
              <X size={18} />
              Missed
            </button>
          </div>
        )}

        {/* Feedback Banner */}
        {feedback.text && (
          <div
            style={{
              marginTop: '18px',
              padding: '12px 16px',
              borderRadius: '10px',
              fontWeight: 750,
              fontSize: '0.98rem',
              background: feedback.type === 'good' ? 'var(--good-bg)' : feedback.type === 'bad' ? 'var(--bad-bg)' : '#f4f4f6',
              border: feedback.type === 'good' ? '1px solid var(--good-border)' : feedback.type === 'bad' ? '1px solid var(--bad-border)' : '1px solid var(--panel-border-medium)',
              color: feedback.type === 'good' ? 'var(--good)' : feedback.type === 'bad' ? 'var(--bad)' : '#09090b',
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* Retrieval Error Flow */}
        {!isFirstAttempt && isLocked && !isRevealed && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={handleRetry} style={{ borderColor: '#09090b' }}>
              <RotateCcw size={16} />
              Retry Retrieval
            </button>
            <button className="btn-secondary" onClick={() => handlePlayTarget(false)}>
              <Play size={16} fill="currentColor" />
              Hear Again
            </button>
            <button className="btn-secondary" onClick={handleReveal}>
              <Eye size={16} />
              Reveal Answer
            </button>
            <button onClick={advanceNextChallenge} className="btn-ghost">
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Detailed Revealed Comparison */}
        {isRevealed && (
          <div style={{
            background: 'var(--panel-card-subtle)',
            border: '1.5px solid var(--panel-border-bright)',
            borderRadius: '12px',
            padding: '18px',
            marginTop: '16px',
            textAlign: 'left',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}>
            <b style={{ fontSize: '0.94rem', color: '#09090b', display: 'block', marginBottom: '8px' }}>
              Auditory Sequence Comparison
            </b>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <div>You entered: <b style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{enteredSequence.join('  ') || 'None'}</b></div>
              <div>Actual target: <b style={{ color: '#09090b', fontFamily: 'var(--font-mono)' }}>{targetSequence.join('  ')}</b></div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Tap any scale degree below to audit its pitch against tonic:
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {targetSequence.map((deg, i) => (
                <button
                  key={i}
                  onClick={() => audioEngine.playDegree(deg, currentKeyIndex, currentScale, 0.9, currentTimbre)}
                  className="degree-btn"
                  style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
                >
                  {deg}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button className="btn-primary" onClick={advanceNextChallenge} style={{ padding: '10px 18px', fontSize: '0.92rem' }}>
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
