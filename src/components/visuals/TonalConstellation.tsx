import React from 'react';

interface TonalConstellationProps {
  allowedDegrees: number[];
  phraseLength?: number;
  size?: 'sm' | 'md';
}

/**
 * Visual schematic showing which scale degrees and phrase lengths are in play.
 * Replaces verbose text explanations with an immediate musical schematic.
 */
export const TonalConstellation: React.FC<TonalConstellationProps> = ({
  allowedDegrees,
  phraseLength,
  size = 'md',
}) => {
  const isSmall = size === 'sm';
  const tokenSize = isSmall ? '20px' : '24px';
  const fontSize = isSmall ? '0.72rem' : '0.78rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? '10px' : '16px', flexWrap: 'wrap' }}>
      {/* 7-Degree Pitch Constellation Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? '4px' : '6px' }}>
        <span style={{
          fontSize: isSmall ? '0.68rem' : '0.72rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 750,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginRight: '2px',
        }}>
          Tones:
        </span>
        {[1, 2, 3, 4, 5, 6, 7].map((deg) => {
          const isActive = allowedDegrees.includes(deg);
          return (
            <div
              key={deg}
              style={{
                width: tokenSize,
                height: tokenSize,
                borderRadius: isSmall ? '4px' : '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontSize,
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                background: isActive ? '#09090b' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-dim)',
                border: isActive ? '1px solid #09090b' : '1px dashed var(--panel-border-medium)',
                boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none',
              }}
              title={isActive ? `Degree ${deg} (Active)` : `Degree ${deg} (Inactive)`}
            >
              {deg}
            </div>
          );
        })}
      </div>

      {/* Optional Phrase Length Rhythmic Meter */}
      {phraseLength !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: isSmall ? '0.68rem' : '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 750,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginRight: '2px',
          }}>
            Span:
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--panel-border-medium)',
            borderRadius: '6px',
            padding: isSmall ? '2px 6px' : '4px 8px',
          }}>
            <span style={{
              fontSize: isSmall ? '0.76rem' : '0.84rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: '#09090b',
            }}>
              {phraseLength} {phraseLength === 1 ? 'Tone' : 'Tones'}
            </span>
            <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
              {Array.from({ length: Math.min(6, phraseLength) }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: isSmall ? '4px' : '6px',
                    height: isSmall ? '4px' : '6px',
                    borderRadius: '50%',
                    background: '#09090b',
                  }}
                />
              ))}
              {phraseLength > 6 && (
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>+</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
