import React from 'react';
import { Mic, Headphones, Music, PencilLine, Play } from 'lucide-react';
import { TrackId } from '../../lib/music/curriculum';

interface DailySequencerProps {
  onStartSession: (trackId: TrackId) => void;
  activeTrackId?: TrackId;
}

/**
 * Visual 4-stage daily practice sequencer.
 * Replaces paragraphs of schedule text with an interactive audio hardware-style step sequencer.
 */
export const DailySequencer: React.FC<DailySequencerProps> = ({
  onStartSession,
  activeTrackId = 'A',
}) => {
  const steps: { id: TrackId; title: string; subtitle: string; icon: React.ReactNode }[] = [
    { id: 'A', title: 'A · Vocalize', subtitle: 'Sing & Verify', icon: <Mic size={16} /> },
    { id: 'B', title: 'B · Identify', subtitle: 'Perceptual Decode', icon: <Headphones size={16} /> },
    { id: 'C', title: 'C · Audiate', subtitle: 'Mental Hearing', icon: <Music size={16} /> },
    { id: 'D', title: 'D · Reconstruct', subtitle: 'Melodic Dictation', icon: <PencilLine size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
      }}>
        {steps.map((s) => {
          const isCurrent = activeTrackId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => onStartSession(s.id)}
              style={{
                background: isCurrent ? '#09090b' : 'var(--panel-card-subtle)',
                color: isCurrent ? '#ffffff' : '#09090b',
                border: isCurrent ? '1.5px solid #09090b' : '1px solid var(--panel-border-medium)',
                borderRadius: '10px',
                padding: '12px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '74px',
                transition: 'all 0.14s ease',
                boxShadow: isCurrent ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
              }}
              className="daily-step-pad"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{s.icon}</span>
                <span style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  opacity: 0.8,
                }}>
                  10 MIN
                </span>
              </div>

              <div>
                <b style={{ display: 'block', fontSize: '0.88rem', letterSpacing: '-0.01em', marginTop: '4px' }}>
                  {s.title}
                </b>
                <span style={{
                  fontSize: '0.74rem',
                  color: isCurrent ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-dim)',
                  fontWeight: 600,
                }}>
                  {s.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
