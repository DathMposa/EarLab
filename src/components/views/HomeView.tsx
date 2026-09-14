'use client';

import React from 'react';
import { Play, Compass, ArrowRight, Award, Zap, Mic, Headphones, Music2, PencilLine } from 'lucide-react';
import { AppState } from '../../lib/storage/store';
import { TRACKS, TrackId } from '../../lib/music/curriculum';
import { getRecommendedTrack, getDegreeMasteryPct } from '../../lib/engine/adaptiveEngine';
import { FlowGlyph } from '../visuals/FlowGlyph';
import { TonalConstellation } from '../visuals/TonalConstellation';
import { DailySequencer } from '../visuals/DailySequencer';

interface HomeViewProps {
  state: AppState;
  onStartSession: (trackId: TrackId, levelIndex?: number) => void;
  onOpenDiagnostic: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ state, onStartSession, onOpenDiagnostic }) => {
  const recommendedTrackId = getRecommendedTrack(state);
  const recTrack = TRACKS[recommendedTrackId];
  const recLevelIndex = state.tracks[recommendedTrackId].level;
  const recLevel = recTrack.levels[recLevelIndex];

  // Calculate genuine learning metrics
  const firstAttemptPct = state.challengesCount > 0
    ? Math.round((state.firstAttemptCorrectCount / state.challengesCount) * 100)
    : 0;

  const revealPct = state.challengesCount > 0
    ? Math.round((state.revealsCount / state.challengesCount) * 100)
    : 0;

  const degreePcts = [1, 2, 3, 4, 5, 6, 7].map((d) => getDegreeMasteryPct(state, d));
  const avgTonalMastery = Math.round(degreePcts.reduce((a, b) => a + b, 0) / 7);

  const getTrackIcon = (id: TrackId) => {
    switch (id) {
      case 'A': return <Mic size={16} color="#09090b" />;
      case 'B': return <Headphones size={16} color="#09090b" />;
      case 'C': return <Music2 size={16} color="#09090b" />;
      case 'D': return <PencilLine size={16} color="#09090b" />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      maxWidth: '1240px',
      width: '100%',
      margin: '0 auto',
    }}>
      {/* Top Studio Grid: Next Practice Hero (Left) + Daily Sequencer & Telemetry (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '14px',
        alignItems: 'stretch',
      }}>
        {/* Next Practice Block */}
        <section className="studio-card" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f7f7f9 100%)',
          border: '1.5px solid var(--panel-border-bright)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="section-tag">
                <Zap size={13} color="#09090b" />
                Next Due Practice
              </div>
              <span style={{
                background: '#09090b',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '5px',
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}>
                {recommendedTrackId}{recLevelIndex + 1} · {recLevel.name}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#09090b', marginBottom: '8px' }}>
              {recTrack.name}
            </h2>

            {/* Cognitive Pipeline & Tonal Constellation Strip */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '14px',
            }}>
              <FlowGlyph trackId={recommendedTrackId} />
              <div style={{
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid var(--panel-border-medium)',
                borderRadius: '7px',
                padding: '4px 8px',
              }}>
                <TonalConstellation
                  allowedDegrees={recLevel.allowedDegrees}
                  phraseLength={recLevel.phraseLength}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onStartSession(recommendedTrackId, recLevelIndex)}
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <Play size={15} fill="currentColor" />
              Start Session · 10 min
            </button>

            <button
              className="btn-secondary"
              onClick={onOpenDiagnostic}
              style={{ padding: '8px 14px', fontSize: '0.86rem' }}
            >
              <Compass size={15} />
              Placement Check
            </button>
          </div>
        </section>

        {/* Right Stack: Daily Practice Sequencer + Compact Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Daily Sequencer */}
          <section className="studio-card studio-card-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div className="section-tag">
                Daily Practice Sequence
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontWeight: 700 }}>
                4 &times; 10 MIN
              </span>
            </div>

            <DailySequencer
              onStartSession={(id) => onStartSession(id)}
              activeTrackId={recommendedTrackId}
            />
          </section>

          {/* Cognitive Learning Telemetry */}
          <section className="studio-card studio-card-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div className="section-tag">
                Cognitive Telemetry
              </div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                {state.sessionsCount} SESSIONS
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}>
              <div style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '8px 6px', textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {firstAttemptPct}%
                </b>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>1st Attempt</span>
              </div>

              <div style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '8px 6px', textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {revealPct}%
                </b>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reveal</span>
              </div>

              <div style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '8px 6px', textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {avgTonalMastery}%
                </b>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Retention</span>
              </div>

              <div style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '8px 6px', textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(state.todayMinutes)}m
                </b>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Section: Four Core Tracks Grid */}
      <section className="studio-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div className="section-tag">
            <Award size={14} />
            Four Core Independent Tracks
          </div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontWeight: 700 }}>
            VOCAL &bull; AUDITORY &bull; AUDIATION &bull; TRANSCRIPTION
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}>
          {(['A', 'B', 'C', 'D'] as TrackId[]).map((trackId) => {
            const track = TRACKS[trackId];
            const currentLevel = state.tracks[trackId].level;
            const qualifying = state.tracks[trackId].qualifying;
            const activeLevelDef = track.levels[currentLevel];

            return (
              <div
                key={trackId}
                style={{
                  background: 'var(--panel-card-subtle)',
                  border: '1px solid var(--panel-border-medium)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid var(--panel-border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {getTrackIcon(trackId)}
                      </div>
                      <b style={{ fontSize: '0.9rem', color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.name}
                      </b>
                    </div>

                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      fontFamily: 'var(--font-mono)',
                      background: '#09090b',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {trackId}{currentLevel + 1}
                    </span>
                  </div>

                  {/* Self-descriptive Flow Glyph - 100% responsive and overflow-proof */}
                  <div style={{ margin: '6px 0', width: '100%' }}>
                    <FlowGlyph trackId={trackId} compact />
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Level {currentLevel + 1}: {activeLevelDef.name}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                    <span>Mastery</span>
                    <b style={{ color: qualifying >= 3 ? 'var(--good)' : 'var(--text)' }}>{qualifying}/3 sessions</b>
                  </div>

                  <div style={{
                    height: '4px',
                    borderRadius: '99px',
                    background: 'rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(qualifying / 3) * 100}%`,
                      background: qualifying >= 3 ? 'var(--good)' : '#09090b',
                      borderRadius: '99px',
                    }} />
                  </div>

                  <button
                    onClick={() => onStartSession(trackId, currentLevel)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '6px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 650,
                      minHeight: '32px',
                    }}
                  >
                    Practice {trackId}{currentLevel + 1}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
