'use client';

import React from 'react';
import { Play, Compass, ArrowRight, Mic, Headphones, Music2, PencilLine, Clock3, Target, Eye, BarChart3 } from 'lucide-react';
import { AppState } from '../../lib/storage/store';
import { TRACKS, TrackId } from '../../lib/music/curriculum';
import { getRecommendedTrack, getDegreeMasteryPct } from '../../lib/engine/adaptiveEngine';
import { competencyScore, createGuidedSession, getDueReviews } from '../../lib/earlab2/learningEngine';
import { MODULES } from '../../lib/earlab2/types';

interface HomeViewProps { state: AppState; onStartSession: (trackId: TrackId, levelIndex?: number) => void; onOpenDiagnostic: () => void; }

const trackIcon = (id: TrackId) => ({ A: <Mic size={21} />, B: <Headphones size={21} />, C: <Music2 size={21} />, D: <PencilLine size={21} /> }[id]);
const trackVerb: Record<TrackId, string> = { A: 'Vocalize', B: 'Identify', C: 'Audiate', D: 'Reconstruct' };
const trackHint: Record<TrackId, string> = { A: 'Sing & verify', B: 'Perceptual decode', C: 'Mental hearing', D: 'Melodic dictation' };

export const HomeView: React.FC<HomeViewProps> = ({ state, onStartSession, onOpenDiagnostic }) => {
  const recommendedTrackId = getRecommendedTrack(state);
  const track = TRACKS[recommendedTrackId];
  const levelIndex = state.tracks[recommendedTrackId].level;
  const level = track.levels[levelIndex];
  const firstAttempt = state.challengesCount ? Math.round(state.firstAttemptCorrectCount / state.challengesCount * 100) : 0;
  const reveal = state.challengesCount ? Math.round(state.revealsCount / state.challengesCount * 100) : 0;
  const retention = Math.round([1,2,3,4,5,6,7].reduce((sum, degree) => sum + getDegreeMasteryPct(state, degree), 0) / 7);
  const minutes = Math.round(state.todayMinutes);
  const dailyPct = Math.min(100, Math.round(minutes / 40 * 100));
  const dueReviews = getDueReviews(state);
  const profile = MODULES.slice(0, 4).map((module) => ({ ...module, score: competencyScore(state, module.competency) }));
  const plan = createGuidedSession(state, 60);

  return <div className="earlab-page">
    <section style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16 }}>
      <div><h1 className="earlab-title">Good morning</h1><p className="earlab-subtitle">Small steps. A more musical you.</p></div>
      <div className="daily-ring" style={{ '--value': dailyPct } as React.CSSProperties} aria-label={`${minutes} of 40 minutes practiced`}><strong>{minutes}<small style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>/40</small></strong></div>
    </section>

    <section className="studio-card soft-wave" style={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div className="section-tag"><Target size={15} color="var(--good)" /> Next practice</div>
        <span style={{ background: '#eef1fb', borderRadius: 12, padding: '5px 10px', font: '500 .78rem var(--font-mono)' }}>{recommendedTrackId}{levelIndex + 1} · Level</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--good)', fontWeight: 800, marginBottom: 8 }}>{trackIcon(recommendedTrackId)} {track.name}</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 7vw, 2.6rem)', letterSpacing: '-.05em', lineHeight: 1.05 }}>{level.name}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '1.05rem' }}>{trackVerb[recommendedTrackId]} your way through today’s focused practice.</p>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => onStartSession(recommendedTrackId, levelIndex)}><Play size={17} fill="currentColor" /> Continue · 10 min</button>
        <button className="btn-secondary" onClick={onOpenDiagnostic}><Compass size={17} /> Placement check</button>
      </div>
    </section>

    <section className="studio-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}><div className="section-tag">Today plan</div><span style={{ color: 'var(--text-dim)', font: '.76rem var(--font-mono)' }}>4 × 10 MIN</span></div>
      <div style={{ display: 'grid', gap: 9 }}>
        {(['A','B','C','D'] as TrackId[]).map((id, i) => { const active = id === recommendedTrackId; return <button key={id} onClick={() => onStartSession(id)} style={{ minHeight: 68, justifyContent: 'flex-start', textAlign: 'left', background: active ? 'linear-gradient(90deg,#eef3ff,#fff)' : '#fff', borderColor: active ? 'rgba(91,126,220,.32)' : 'var(--panel-border)' }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center', color: active ? '#fff' : 'var(--text-secondary)', background: active ? '#2b3b69' : '#f0f3f9', flex: '0 0 auto', fontWeight: 800 }}>{String.fromCharCode(65 + i)}</span>
          <span style={{ flex: 1 }}><strong style={{ display: 'block' }}>{trackVerb[id]}</strong><span style={{ color: 'var(--text-muted)', fontSize: '.84rem', fontWeight: 500 }}>{trackHint[id]}</span></span>
          <span style={{ color: 'var(--text-dim)', fontSize: '.8rem', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Clock3 size={15} />10 min</span>
        </button>; })}
      </div>
    </section>

    <section className="studio-card guided-session-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><div><div className="section-tag">360° daily training</div><h2 style={{ marginTop: 6 }}>A balanced 60-minute route</h2></div><span className="review-count">{dueReviews.length} due reviews</span></div>
      <p className="earlab-subtitle" style={{ fontSize: '.92rem', marginTop: 6 }}>Weak areas receive extra time while every skill stays in rotation.</p>
      <div className="guided-blocks">{plan.blocks.map((block) => <div key={block.module}><strong>{MODULES.find((module) => module.id === block.module)?.title}</strong><span>{block.minutes} min · {block.reason}</span></div>)}</div>
    </section>

    <section className="studio-card ear-profile-card">
      <div className="section-tag">Ear Profile</div><h2 style={{ marginTop: 7 }}>Evidence, not one universal score</h2>
      <div className="profile-grid">{profile.map((item) => <div key={item.id}><span>{item.title}</span><strong>{item.score === null ? 'Building baseline' : `${item.score}%`}</strong></div>)}</div>
    </section>

    <section className="studio-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 13 }}><div className="section-tag">Today insights</div><span style={{ color: 'var(--text-dim)', font: '.76rem var(--font-mono)' }}>{state.sessionsCount} SESSIONS</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
        {[['First attempt', `${firstAttempt}%`, <Target key="t" />], ['Reveal', `${reveal}%`, <Eye key="e" />], ['Retention', `${retention}%`, <BarChart3 key="b" />], ['Today', `${minutes}m`, <Clock3 key="c" />]].map(([label, value, icon]) => <div key={label as string} style={{ border: '1px solid var(--panel-border)', borderRadius: 15, padding: '12px 8px', background: 'var(--panel-card-subtle)' }}><span style={{ color: 'var(--good)' }}>{icon as React.ReactNode}</span><strong style={{ display: 'block', fontSize: '1.4rem', marginTop: 8 }}>{value as string}</strong><span style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>{label as string}</span></div>)}
      </div>
    </section>
  </div>;
};
