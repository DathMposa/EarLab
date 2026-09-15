'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Drum, Ear, Headphones, Layers3, Music, Play, Piano, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { audioEngine } from '../../lib/audio/audioEngine';
import { AppState } from '../../lib/storage/store';
import { recordLearningEvent, recommendedModuleLevel } from '../../lib/earlab2/learningEngine';
import { ExerciseMetadata, MODULES, ModuleId } from '../../lib/earlab2/types';
import { exerciseFor, MODULE_LEVELS } from '../../lib/earlab2/curriculum';

interface Props { state: AppState; onStateUpdate: (state: AppState) => void; onStartLegacy: (trackId: 'A' | 'B' | 'C' | 'D') => void; }

const ICONS: Record<ModuleId, React.ReactNode> = {
  tonal: <Ear />, melody: <Music />, rhythm: <Drum />, harmony: <Layers3 />, voices: <Headphones />, memory: <Brain />, play: <Piano />,
};

function makeExercise(module: ModuleId): ExerciseMetadata {
  const id = `${module}_${Date.now()}`;
  if (module === 'rhythm') return { id, module, subtype: 'rhythm-echo', title: 'Rhythm Echo', competency: 'rhythm', difficulty: 1, rhythm: [1, 0, 1, 1], prompt: 'Hear four beats, then tap the accented pattern.' };
  if (module === 'harmony') return { id, module, subtype: 'bass-function', title: 'Bass Before Harmony', competency: 'bassHarmony', difficulty: 1, degrees: [1, 4, 5, 1], chordFunction: 'I–IV–V–I', prompt: 'Listen to the progression. Which bass movement did you hear?' };
  if (module === 'voices') return { id, module, subtype: 'top-voice', title: 'Top Voice Tracking', competency: 'voiceTracking', difficulty: 1, degrees: [3, 4, 5], voices: 3, prompt: 'Follow the highest line in this three-voice cadence.' };
  if (module === 'memory') return { id, module, subtype: 'silent-replay', title: 'Silent Replay', competency: 'audiationMemory', difficulty: 1, degrees: [5, 6, 5, 3, 2, 1], prompt: 'Listen once. Hold the phrase silently before answering.' };
  if (module === 'play') return { id, module, subtype: 'first-note', title: 'No-Fishing Placement', competency: 'hearToPlay', difficulty: 1, degrees: [5], prompt: 'Hear the target, audiate it, then unlock the piano for one first attempt.' };
  if (module === 'melody') return { id, module, subtype: 'contour-first', title: 'Contour First', competency: 'melodicAudiation', difficulty: 1, degrees: [1, 3, 5, 4, 2, 1], prompt: 'Listen for the overall contour before reconstructing the phrase.' };
  return { id, module, subtype: 'resolution', title: 'Resolution Tendency', competency: 'tonalOrientation', difficulty: 1, degrees: [7, 1], prompt: 'Hear the tendency tone. Which resolution feels like home?' };
}

export const MusicianshipView: React.FC<Props> = ({ state, onStateUpdate, onStartLegacy }) => {
  const [selected, setSelected] = useState<ModuleId>('tonal');
  const [level, setLevel] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exercise, setExercise] = useState<ExerciseMetadata>(() => exerciseFor('tonal', 0));
  const [stage, setStage] = useState<'ready' | 'listen' | 'audiate' | 'respond' | 'feedback'>('ready');
  const [answer, setAnswer] = useState<number[]>([]);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [replays, setReplays] = useState(0);
  const [help, setHelp] = useState<string[]>([]);
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const started = useRef(0);

  useEffect(() => { const nextLevel = recommendedModuleLevel(state, MODULES.find((item) => item.id === selected)!.competency); setLevel(nextLevel); setExerciseIndex(0); setExercise(exerciseFor(selected, nextLevel)); setStage('ready'); setAnswer([]); setTapTimes([]); setReplays(0); setHelp([]); setFirstAttempt(true); setWasCorrect(null); }, [selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (stage !== 'respond') return;
      const degree = Number(event.key);
      if (degree >= 1 && degree <= 7) { event.preventDefault(); note(degree); }
      if (selected === 'rhythm' && (event.key === ' ' || event.key === 'Enter')) { event.preventDefault(); tap(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, selected, answer]);

  const degreeTarget = exercise.degrees ?? [];
  const answerOptions = useMemo(() => selected === 'harmony' ? [1, 4, 5, 1] : [1, 2, 3, 4, 5, 6, 7], [selected]);

  const listen = async (slow = false) => {
    setStage('listen'); started.current = performance.now();
    if (selected === 'rhythm') await audioEngine.playMetronome(4, slow ? 58 : 84);
    else if (selected === 'harmony') { await audioEngine.playChord([1, 3, 5]); setTimeout(() => audioEngine.playChord([4, 6, 1]), 650); setTimeout(() => audioEngine.playChord([5, 7, 2]), 1300); setTimeout(() => audioEngine.playChord([1, 3, 5]), 1950); }
    else if (selected === 'voices') { await audioEngine.playChord([1, 3, 5]); setTimeout(() => audioEngine.playChord([2, 4, 6]), 750); setTimeout(() => audioEngine.playChord([3, 5, 7]), 1500); }
    else await audioEngine.playMelody(degreeTarget, 0, 'major', state.preferences.defaultTimbre, slow);
    window.setTimeout(() => setStage(selected === 'memory' || selected === 'play' ? 'audiate' : 'respond'), selected === 'harmony' ? 2750 : Math.max(800, degreeTarget.length * (slow ? 760 : 500) + 180));
  };

  const audiate = () => { setStage('respond'); started.current = performance.now(); };
  const note = (degree: number) => {
    if (stage !== 'respond') return;
    audioEngine.playDegree(degree, 0, 'major', .45, state.preferences.defaultTimbre);
    setAnswer((value) => selected === 'play' || selected === 'tonal' ? [degree] : [...value, degree].slice(0, degreeTarget.length));
  };
  const tap = () => { if (stage === 'respond') setTapTimes((values) => [...values, performance.now()]); };
  const verify = () => {
    const expected = selected === 'rhythm' ? 3 : degreeTarget.length;
    const correct = selected === 'rhythm' ? tapTimes.length === expected : answer.length === expected && answer.every((value, index) => value === degreeTarget[index]);
    const event = { id: `event_${Date.now()}`, exerciseId: exercise.id, module: exercise.module, competency: exercise.competency, timestamp: new Date().toISOString(), correct, firstAttempt, assisted: !firstAttempt || replays > 0 || help.length > 0, responseLatencyMs: Math.round(performance.now() - started.current), replayCount: replays, assistance: help.map((value) => value as 'replay' | 'tonic' | 'slow' | 'hint'), transfer: false };
    onStateUpdate(recordLearningEvent(state, event, exercise));
    setWasCorrect(correct);
    setStage('feedback');
  };
  const assist = async (kind: 'tonic' | 'slow' | 'hint') => {
    setFirstAttempt(false); setHelp((items) => [...items, kind]);
    if (kind === 'tonic') await audioEngine.playTonalFrame();
    if (kind === 'slow') { setReplays((count) => count + 1); await listen(true); }
  };
  const newExercise = () => { const nextIndex = exerciseIndex + 1; setExerciseIndex(nextIndex); setExercise(exerciseFor(selected, level, nextIndex)); setStage('ready'); setAnswer([]); setTapTimes([]); setReplays(0); setHelp([]); setFirstAttempt(true); setWasCorrect(null); };

  return <div className="earlab-page musicianship-page">
    <section className="page-heading"><div><div className="section-tag">360° TRAINING</div><h1 className="earlab-title">Train your whole ear</h1><p className="earlab-subtitle">One clear musical action at a time.</p></div></section>
    <section className="module-grid" aria-label="Training modules">
      {MODULES.map((module) => <button key={module.id} className={`module-card ${selected === module.id ? 'selected' : ''}`} onClick={() => setSelected(module.id)} aria-pressed={selected === module.id}><span>{ICONS[module.id]}</span><strong>{module.title}</strong><small>{module.description}</small></button>)}
    </section>
    <div className="level-switcher" aria-label="Module progression">
      {MODULE_LEVELS[selected].map((item, index) => <button key={item.level} className={level === index ? 'active' : ''} onClick={() => { setLevel(index); setExerciseIndex(0); setExercise(exerciseFor(selected, index)); setStage('ready'); }}><span>Level {item.level}</span><strong>{item.title}</strong></button>)}
    </div>
    {(selected === 'tonal' || selected === 'melody') && <section className="legacy-shortcut"><Sparkles size={18}/><span>Build a complete progression through the established EarLab tracks.</span><button onClick={() => onStartLegacy(selected === 'tonal' ? 'B' : 'D')}>Open curriculum session</button></section>}
    <section className="studio-card exercise-stage">
      <div className="exercise-kicker"><span>{MODULES.find((item) => item.id === selected)?.title}</span><span>{exercise.subtype.replace('-', ' ')}</span></div>
      <h2>{exercise.title}</h2><p>{exercise.prompt}</p>
      {stage === 'ready' && <button className="btn-primary primary-exercise" onClick={() => listen()}><Play size={19} fill="currentColor"/> Begin listening</button>}
      {stage === 'listen' && <div className="exercise-status"><Volume2/> Listening — hold the sound, do not answer yet.</div>}
      {stage === 'audiate' && <div className="audiate-panel"><Brain size={28}/><strong>Hear it internally.</strong><span>When the sound is clear in your mind, continue.</span><button className="btn-primary" onClick={audiate}>I have it</button></div>}
      {stage === 'respond' && <>
        {selected === 'rhythm' ? <button className="tap-pad" onClick={tap}><Drum size={28}/><strong>Tap the pulse</strong><small>{tapTimes.length} of 3 accents</small></button> : <div className="degree-pad">{answerOptions.map((degree) => <button key={degree} onClick={() => note(degree)} className={answer.includes(degree) ? 'chosen' : ''}>{degree}</button>)}</div>}
        <div className="answer-row"><button className="btn-secondary" onClick={() => assist('tonic')}>Hear tonic</button><button className="btn-secondary" onClick={() => assist('slow')}>Slower</button><button className="btn-secondary" onClick={() => { setFirstAttempt(false); setHelp((items) => [...items, 'hint']); }}>Hint</button><button className="btn-primary" disabled={selected === 'rhythm' ? tapTimes.length < 3 : answer.length < degreeTarget.length} onClick={verify}>Check answer</button></div>
      </>}
      {stage === 'feedback' && <div className="feedback-panel"><Sparkles/><h3>{wasCorrect ? 'Strong retrieval.' : 'A targeted review is scheduled.'}</h3><p>{wasCorrect ? 'Your first attempt, support use, and response time shape the next review.' : 'Use the support ladder, then retrieve a related musical example tomorrow.'}</p><button className="btn-primary" onClick={newExercise}><RotateCcw size={17}/> Next challenge</button></div>}
    </section>
  </div>;
};
