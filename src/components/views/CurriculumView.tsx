'use client';

import React, { useState } from 'react';
import { CheckCircle2, Lock, Play, Layers } from 'lucide-react';
import { TRACKS, TrackId } from '../../lib/music/curriculum';
import { AppState } from '../../lib/storage/store';
import { FlowGlyph } from '../visuals/FlowGlyph';
import { TonalConstellation } from '../visuals/TonalConstellation';

interface CurriculumViewProps {
  state: AppState;
  onStartSession: (trackId: TrackId, levelIndex: number) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ state, onStartSession }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('A');
  const track = TRACKS[selectedTrack];
  const currentLevel = state.tracks[selectedTrack].level;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Syllabus Header */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div className="section-tag" style={{ marginBottom: '4px' }}>
              <Layers size={13} />
              Curriculum Architecture
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#09090b', margin: 0 }}>
              4-Track Cognitive Progression Matrix
            </h2>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--panel-card-subtle)',
            padding: '4px 10px',
            borderRadius: '99px',
            border: '1px solid var(--panel-border-medium)',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#09090b',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>40 LEVELS</span>
            <span style={{ color: 'var(--text-dim)' }}>&bull;</span>
            <span style={{ color: 'var(--good)' }}>{state.levelsAdvancedCount} COMPLETE</span>
          </div>
        </div>

        {/* Track Selector Studio Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '12px',
        }}>
          {(['A', 'B', 'C', 'D'] as TrackId[]).map((id) => {
            const isSelected = selectedTrack === id;
            const t = TRACKS[id];
            const lv = state.tracks[id].level;
            return (
              <button
                key={id}
                onClick={() => setSelectedTrack(id)}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #09090b' : '1px solid var(--panel-border-medium)',
                  background: isSelected ? '#09090b' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--text)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.12)' : 'none',
                  minHeight: '48px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {id}
                  </span>
                  <span style={{ fontSize: '0.74rem', opacity: isSelected ? 0.8 : 0.6, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Lv.{lv + 1}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', fontWeight: 700 }}>
                  {t.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Cognitive Flow Abstraction for the Selected Track */}
        <div style={{
          background: 'var(--panel-card-subtle)',
          borderRadius: '10px',
          padding: '10px 14px',
          border: '1px solid var(--panel-border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 750, fontFamily: 'var(--font-mono)' }}>
              Track {selectedTrack} Cognitive Axis
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
              {track.name}
            </h3>
          </div>

          <FlowGlyph trackId={selectedTrack} />
        </div>
      </section>

      {/* Selected Track Level Progression */}
      <section className="studio-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
              Curriculum Matrix &bull; 10 Levels
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mastery threshold: 80% accuracy across 2 distinct training sessions
            </span>
          </div>
          <span style={{
            background: '#09090b',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '0.76rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}>
            ACTIVE: LEVEL {selectedTrack}{currentLevel + 1}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {track.levels.map((lvl, idx) => {
            const isMastered = idx < currentLevel;
            const isCurrent = idx === currentLevel;
            const isLocked = idx > currentLevel;

            return (
              <div
                key={idx}
                style={{
                  background: isCurrent ? '#f4f4f6' : '#ffffff',
                  border: isCurrent ? '1.5px solid #09090b' : '1px solid var(--panel-border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: isCurrent ? 'var(--shadow-panel)' : 'none',
                }}
              >
                {/* Level Index Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isCurrent
                      ? '#09090b'
                      : isMastered
                      ? 'var(--good-bg)'
                      : 'rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCurrent ? '#ffffff' : isMastered ? 'var(--good)' : 'var(--text-dim)',
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                  }}>
                    {isMastered ? (
                      <CheckCircle2 size={16} />
                    ) : isLocked ? (
                      <Lock size={13} />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Level Details + Visual Constellation */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <b style={{ fontSize: '0.92rem', color: isLocked ? 'var(--text-muted)' : '#09090b', fontWeight: 800 }}>
                          {selectedTrack}{idx + 1} &bull; {lvl.name}
                        </b>
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            background: '#09090b',
                            color: '#ffffff',
                            borderRadius: '3px',
                            letterSpacing: '0.04em'
                          }}>
                            FOCUS
                          </span>
                        )}
                      </div>

                      {/* Visual Pitch Constellation Ribbon */}
                      <TonalConstellation allowedDegrees={lvl.allowedDegrees} size="sm" />
                    </div>

                    {/* Hardware Parameter Spec Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        background: 'var(--panel-card-subtle)',
                        border: '1px solid var(--panel-border-medium)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                      }}>
                        {lvl.phraseLength === 1 ? '1 NOTE PROBE' : `${lvl.phraseLength}-NOTE PHRASE`}
                      </span>

                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        background: 'var(--panel-card-subtle)',
                        border: '1px solid var(--panel-border-medium)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                      }}>
                        {lvl.maxInterval <= 2 ? 'STEPWISE' : lvl.maxInterval <= 4 ? 'THIRDS' : 'SKIPS'}
                      </span>

                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        background: 'var(--panel-card-subtle)',
                        border: '1px solid var(--panel-border-medium)',
                        borderRadius: '4px',
                        color: 'var(--text-dim)'
                      }}>
                        {lvl.tonalSupport === 'always' ? 'DRONE' : lvl.tonalSupport === 'periodic' ? 'CADENCE' : 'A CAPPELLA'}
                      </span>

                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        background: 'var(--panel-card-subtle)',
                        border: '1px solid var(--panel-border-medium)',
                        borderRadius: '4px',
                        color: 'var(--text-dim)'
                      }}>
                        {lvl.targetChallenges} ITEMS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <div style={{ flexShrink: 0 }}>
                  {!isLocked ? (
                    <button
                      onClick={() => onStartSession(selectedTrack, idx)}
                      className={isCurrent ? 'btn-primary' : 'btn-secondary'}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        minHeight: '32px',
                        fontWeight: 700,
                      }}
                    >
                      <Play size={13} fill="currentColor" />
                      {isCurrent ? 'Practice' : 'Review'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '0 8px' }}>
                      LOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
