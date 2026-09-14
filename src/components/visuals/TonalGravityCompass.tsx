import React from 'react';
import { DEGREE_FEELINGS } from '../../lib/music/scales';

interface TonalGravityCompassProps {
  selectedDegree: number;
  onSelectDegree: (degree: number) => void;
}

/**
 * Interactive Tonal Gravity Compass:
 * Visualizes diatonic tonal tendencies (7➔1, 4➔3, 2➔1, 5➔1) as an architectural vector diagram.
 * Replaces descriptive paragraphs with instant visual physics.
 */
export const TonalGravityCompass: React.FC<TonalGravityCompassProps> = ({
  selectedDegree,
  onSelectDegree,
}) => {
  // Layout nodes on a balanced acoustic arch:
  // 1 (Home, base center), 2 (lower left), 3 (mid left), 4 (top left tension)
  // 5 (strong anchor right), 6 (mid right), 7 (top right urgent pull into 1)
  const nodes = [
    { degree: 1, x: 200, y: 155, label: '1 · Tonic (Home)', role: 'Anchor' },
    { degree: 2, x: 120, y: 135, label: '2 · Motion', role: 'Steps to 1/3' },
    { degree: 3, x: 70, y: 95, label: '3 · Identity', role: 'Consonant' },
    { degree: 4, x: 90, y: 40, label: '4 · Tension', role: 'Pulls down to 3' },
    { degree: 5, x: 330, y: 110, label: '5 · Dominant', role: 'Pillar to 1' },
    { degree: 6, x: 320, y: 55, label: '6 · Color', role: 'Resolves to 5' },
    { degree: 7, x: 235, y: 35, label: '7 · Leading', role: 'Snaps to 1' },
  ];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '440px',
      margin: '0 auto',
      background: 'var(--panel-card-subtle)',
      border: '1px solid var(--panel-border-medium)',
      borderRadius: '14px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
          Tonal Gravity Map
        </span>
        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#09090b', fontWeight: 700 }}>
          {DEGREE_FEELINGS[selectedDegree]?.title}
        </span>
      </div>

      <svg viewBox="0 0 400 190" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#09090B" />
          </marker>
          <marker id="arrow-dim" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(0,0,0,0.25)" />
          </marker>
        </defs>

        {/* Gravitational pull lines */}
        {/* 7 ➔ 1: Urgent leading tone upward snap */}
        <path
          d="M 230 46 C 220 75, 210 115, 204 140"
          fill="none"
          stroke={selectedDegree === 7 ? '#09090B' : 'rgba(0,0,0,0.2)'}
          strokeWidth={selectedDegree === 7 ? 2.6 : 1.4}
          strokeDasharray={selectedDegree === 7 ? 'none' : '4 3'}
          markerEnd={selectedDegree === 7 ? 'url(#arrow)' : 'url(#arrow-dim)'}
        />

        {/* 4 ➔ 3: Downward gravitational step */}
        <path
          d="M 86 52 C 78 65, 74 76, 72 84"
          fill="none"
          stroke={selectedDegree === 4 ? '#09090B' : 'rgba(0,0,0,0.2)'}
          strokeWidth={selectedDegree === 4 ? 2.6 : 1.4}
          strokeDasharray={selectedDegree === 4 ? 'none' : '4 3'}
          markerEnd={selectedDegree === 4 ? 'url(#arrow)' : 'url(#arrow-dim)'}
        />

        {/* 2 ➔ 1: Step to home */}
        <path
          d="M 132 138 Q 165 152 188 155"
          fill="none"
          stroke={selectedDegree === 2 ? '#09090B' : 'rgba(0,0,0,0.18)'}
          strokeWidth={selectedDegree === 2 ? 2.4 : 1.2}
          markerEnd={selectedDegree === 2 ? 'url(#arrow)' : 'url(#arrow-dim)'}
        />

        {/* 5 ➔ 1: Pillar dominant beam */}
        <path
          d="M 315 116 C 280 135, 240 148, 215 153"
          fill="none"
          stroke={selectedDegree === 5 ? '#09090B' : 'rgba(0,0,0,0.18)'}
          strokeWidth={selectedDegree === 5 ? 2.4 : 1.2}
          markerEnd={selectedDegree === 5 ? 'url(#arrow)' : 'url(#arrow-dim)'}
        />

        {/* 6 ➔ 5: Descending step */}
        <path
          d="M 322 68 C 324 80, 326 92, 328 100"
          fill="none"
          stroke={selectedDegree === 6 ? '#09090B' : 'rgba(0,0,0,0.18)'}
          strokeWidth={selectedDegree === 6 ? 2.4 : 1.2}
          markerEnd={selectedDegree === 6 ? 'url(#arrow)' : 'url(#arrow-dim)'}
        />

        {/* Degree Nodes */}
        {nodes.map((n) => {
          const isSelected = selectedDegree === n.degree;
          return (
            <g
              key={n.degree}
              onClick={() => onSelectDegree(n.degree)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={n.degree === 1 ? 16 : 13}
                fill={isSelected ? '#09090B' : '#FFFFFF'}
                stroke={isSelected ? '#09090B' : 'rgba(0,0,0,0.22)'}
                strokeWidth={isSelected ? 3 : 1.5}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
              />
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                fill={isSelected ? '#FFFFFF' : '#09090B'}
                fontSize={n.degree === 1 ? '13' : '11'}
                fontWeight="800"
                fontFamily="JetBrains Mono, monospace"
              >
                {n.degree}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        paddingTop: '6px',
        borderTop: '1px solid var(--panel-border)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>Gravitational Focus: <b>{selectedDegree}</b></span>
        <span>{DEGREE_FEELINGS[selectedDegree]?.quality}</span>
      </div>
    </div>
  );
};
