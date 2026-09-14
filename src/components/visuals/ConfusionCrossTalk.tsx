'use client';

import React from 'react';
import { Volume2, ArrowRightLeft, Sparkles } from 'lucide-react';
import { DEGREE_FEELINGS } from '../../lib/music/scales';
import { audioEngine } from '../../lib/audio/audioEngine';

interface ConfusionPair {
  target: number;
  chosen: number;
  count: number;
}

interface ConfusionCrossTalkProps {
  pairs: ConfusionPair[];
  defaultKeyIndex: number;
}

export const ConfusionCrossTalk: React.FC<ConfusionCrossTalkProps> = ({ pairs, defaultKeyIndex }) => {
  if (pairs.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        background: 'var(--panel-card-subtle)',
        borderRadius: '12px',
        border: '1px solid var(--panel-border-medium)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}>
        <Sparkles size={20} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--good)' }} />
        No systematic auditory cross-talk detected. Your functional boundaries between scale degrees are distinct.
      </div>
    );
  }

  const handlePlayPair = (target: number, chosen: number) => {
    // Play target first, brief pause, then chosen
    audioEngine.playDegree(target, defaultKeyIndex, 'major', 0.6);
    setTimeout(() => {
      audioEngine.playDegree(chosen, defaultKeyIndex, 'major', 0.8);
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {pairs.slice(0, 4).map((c, i) => {
        const feelTarget = DEGREE_FEELINGS[c.target];
        const feelChosen = DEGREE_FEELINGS[c.chosen];

        return (
          <div
            key={i}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--panel-border-medium)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Visual Cross-talk Vector Graphic */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
              {/* Target Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#09090b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                }}>
                  {c.target}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
                    Target {c.target}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {feelTarget.name.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Cross-Talk Arrow with Pulse Count */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  background: 'var(--panel-card-subtle)',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  border: '1px solid var(--panel-border-medium)',
                }}>
                  {c.count}&times; cross-talk
                </span>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}>
                  <ArrowRightLeft size={16} />
                </div>
              </div>

              {/* Confused Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f4f4f6',
                  color: '#09090b',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  border: '1px solid var(--panel-border-medium)',
                }}>
                  {c.chosen}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
                    Mistaken {c.chosen}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {feelChosen.name.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contrast Play Button */}
            <button
              onClick={() => handlePlayPair(c.target, c.chosen)}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.84rem',
                minHeight: '38px',
                fontWeight: 700,
                flexShrink: 0,
              }}
              title={`Play Target ${c.target} followed immediately by Mistaken ${c.chosen}`}
            >
              <Volume2 size={15} />
              Audit Contrast ({c.target} &rarr; {c.chosen})
            </button>
          </div>
        );
      })}
    </div>
  );
};
