'use client';

import React from 'react';
import { getDegreeMasteryPct } from '../../lib/engine/adaptiveEngine';
import { DEGREE_FEELINGS } from '../../lib/music/scales';
import { audioEngine } from '../../lib/audio/audioEngine';
import { AppState } from '../../lib/storage/store';
import { Volume2 } from 'lucide-react';

interface DiatonicMasteryMatrixProps {
  state: AppState;
}

export const DiatonicMasteryMatrix: React.FC<DiatonicMasteryMatrixProps> = ({ state }) => {
  const degrees = [1, 2, 3, 4, 5, 6, 7];

  const handleAudition = (deg: number) => {
    audioEngine.playDegree(deg, state.preferences.defaultKeyIndex, 'major', 0.85, state.preferences.defaultTimbre);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid var(--panel-border-medium)',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
            7-Pillar Diatonic Retention
          </h4>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Tap any pillar to audit its pitch resonance in C Major
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--good)' }} />
            &ge;80%
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#09090b' }} />
            Training
          </span>
        </div>
      </div>

      {/* 7 Vertical Architectural Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px',
        alignItems: 'end',
        minHeight: '130px',
        padding: '6px 0 2px',
      }}>
        {degrees.map((deg) => {
          const pct = getDegreeMasteryPct(state, deg);
          const feel = DEGREE_FEELINGS[deg];
          const m = state.degreeMastery[deg] || { attempts: 0, correctFirst: 0 };
          const isMastered = pct >= 80;

          return (
            <div
              key={deg}
              onClick={() => handleAudition(deg)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              className="pillar-hover"
              title={`Degree ${deg}: ${pct}% (${m.attempts} attempts)`}
            >
              {/* Top Percentage Readout */}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: isMastered ? 'var(--good)' : '#09090b',
              }}>
                {pct}%
              </span>

              {/* Pillar Track Background */}
              <div style={{
                width: '100%',
                maxWidth: '38px',
                height: '76px',
                background: 'rgba(0, 0, 0, 0.04)',
                borderRadius: '6px',
                padding: '2px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative',
                border: '1px solid var(--panel-border)',
              }}>
                {/* Fill Meter */}
                <div style={{
                  width: '100%',
                  height: `${Math.max(8, pct)}%`,
                  background: isMastered ? 'var(--good)' : '#09090b',
                  borderRadius: '4px',
                  transition: 'height 0.4s ease',
                  boxShadow: isMastered ? '0 1px 4px rgba(5, 150, 105, 0.3)' : 'none',
                }} />

                {/* Speaker icon hint */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: 0.25,
                }}>
                  <Volume2 size={10} color="#09090b" />
                </div>
              </div>

              {/* Bottom Scale Degree Token */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: isMastered ? '#09090b' : '#f4f4f6',
                color: isMastered ? '#ffffff' : '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                border: '1px solid var(--panel-border-medium)',
              }}>
                {deg}
              </div>

              {/* Role Micro Tag */}
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>
                {deg === 1 ? 'Anchor' : deg === 5 ? 'Dominant' : deg === 7 ? 'Leading' : feel.quality}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
