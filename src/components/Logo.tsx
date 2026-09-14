import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer precision reference ring */}
        <circle cx="20" cy="20" r="18.5" stroke="rgba(9, 9, 11, 0.2)" strokeWidth="1.6" />
        
        {/* Subtle cardinal calibration ticks */}
        <line x1="20" y1="1.5" x2="20" y2="4.5" stroke="#09090B" strokeWidth="1.6" />
        <line x1="20" y1="35.5" x2="20" y2="38.5" stroke="#09090B" strokeWidth="1.6" />
        <line x1="1.5" y1="20" x2="4.5" y2="20" stroke="#09090B" strokeWidth="1.6" />
        <line x1="35.5" y1="20" x2="38.5" y2="20" stroke="#09090B" strokeWidth="1.6" />

        {/* Minimalist acoustic harmonic wave bars forming the letter 'E' and acoustic node */}
        <path
          d="M13 12H27"
          stroke="#09090B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M13 20H23"
          stroke="#3F3F46"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M13 28H27"
          stroke="#09090B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M13 12V28"
          stroke="#09090B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Focal reference node dot (tonic center) */}
        <circle cx="27" cy="20" r="2.4" fill="#09090B" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#09090B',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
          }}>
            EarLab
          </span>
          <span style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            fontWeight: 700,
            marginTop: '1px',
          }}>
            Aural Musicianship
          </span>
        </div>
      )}
    </div>
  );
};
