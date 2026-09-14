'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Logo } from './Logo';
import { AppState } from '../lib/storage/store';
import { KEYS } from '../lib/music/scales';

interface HeaderProps {
  state: AppState;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onOpenSettings }) => {
  const currentKey = KEYS[state.preferences.defaultKeyIndex]?.name || 'C';
  const scale = state.preferences.defaultScale === 'major' ? 'Maj' : 'Min';

  return (
    <header className="workspace-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Logo size={32} showText={true} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--panel-border-medium)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.86rem',
          fontWeight: 700,
          color: '#09090b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#09090b' }} />
          <span>{currentKey} {scale}</span>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid var(--panel-border-medium)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.86rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}>
          {state.sessionsCount} sess
        </div>

        <button
          onClick={onOpenSettings}
          className="btn-secondary"
          style={{ padding: '8px 10px', minHeight: 'unset', borderRadius: '8px' }}
          title="Preferences & Audio Setup"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </header>
  );
};
