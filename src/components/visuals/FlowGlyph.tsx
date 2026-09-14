import React from 'react';
import { Volume2, Mic, Hash, ArrowRight, Music, Headphones } from 'lucide-react';
import { TrackId } from '../../lib/music/curriculum';

interface FlowGlyphProps {
  trackId: TrackId;
  compact?: boolean;
}

/**
 * Self-descriptive cognitive pipeline glyph:
 * Visualizes the exact mental translation loop (Stimulus ➔ Inner Ear ➔ Action)
 * without needing sentences of explanation.
 */
export const FlowGlyph: React.FC<FlowGlyphProps> = ({ trackId, compact = false }) => {
  const getPipeline = () => {
    switch (trackId) {
      case 'A': // Degree Singing: See Number ➔ Audiate in Mind ➔ Vocalize
        return [
          { icon: <Hash size={compact ? 12 : 14} />, label: compact ? 'Note' : 'Degree' },
          { icon: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: compact ? '0.7rem' : '0.8rem' }}>🧠</span>, label: compact ? 'Audiate' : 'Audiate' },
          { icon: <Mic size={compact ? 12 : 14} />, label: 'Sing' },
        ];
      case 'B': // Degree Recognition: Hear Tone ➔ Decode in Mind ➔ Identify Number
        return [
          { icon: <Volume2 size={compact ? 12 : 14} />, label: compact ? 'Audio' : 'Sound' },
          { icon: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: compact ? '0.7rem' : '0.8rem' }}>🧠</span>, label: compact ? 'Decode' : 'Decode' },
          { icon: <Hash size={compact ? 12 : 14} />, label: compact ? 'ID' : 'Identify' },
        ];
      case 'C': // Melody Singing: See Phrase ➔ Audiate Contour ➔ Sing Melody
        return [
          { icon: <Music size={compact ? 12 : 14} />, label: compact ? 'Phrase' : 'Phrase' },
          { icon: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: compact ? '0.7rem' : '0.8rem' }}>🧠</span>, label: compact ? 'Hear' : 'Internalize' },
          { icon: <Mic size={compact ? 12 : 14} />, label: compact ? 'Sing' : 'Vocalize' },
        ];
      case 'D': // Melody Transcription: Hear Melody ➔ Decode Structure ➔ Reconstruct
        return [
          { icon: <Headphones size={compact ? 12 : 14} />, label: compact ? 'Tune' : 'Melody' },
          { icon: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: compact ? '0.7rem' : '0.8rem' }}>🧠</span>, label: compact ? 'Parse' : 'Analyze' },
          { icon: <Music size={compact ? 12 : 14} />, label: compact ? 'Write' : 'Dictate' },
        ];
    }
  };

  const steps = getPipeline();

  return (
    <div style={{
      display: compact ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: compact ? 'space-between' : 'flex-start',
      width: compact ? '100%' : 'auto',
      maxWidth: '100%',
      gap: compact ? '4px' : '8px',
      background: 'rgba(0, 0, 0, 0.03)',
      border: '1px solid var(--panel-border-medium)',
      borderRadius: '7px',
      padding: compact ? '3px 6px' : '5px 10px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {steps.map((s, idx) => (
        <React.Fragment key={idx}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '3px' : '4px',
            color: '#09090b',
            minWidth: 0,
            flexShrink: compact ? 1 : 0,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', color: '#09090b', flexShrink: 0 }}>{s.icon}</span>
            <span style={{
              fontSize: compact ? '0.67rem' : '0.75rem',
              fontWeight: 750,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: '#09090b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight size={compact ? 9 : 11} color="var(--text-dim)" style={{ flexShrink: 0 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
