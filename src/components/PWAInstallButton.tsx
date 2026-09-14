'use client';

import React from 'react';
import { Download, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWA } from '../lib/pwa/usePWA';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'modal' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'sidebar' }) => {
  const { isStandalone, isInstalled, installApp } = usePWA();

  if (isStandalone || isInstalled) {
    if (variant === 'modal') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--good-bg)',
          border: '1px solid var(--good-border)',
          borderRadius: '8px',
          color: 'var(--good)',
          fontSize: '0.82rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
        }}>
          <CheckCircle2 size={15} />
          <span>RUNNING AS INSTALLED PWA</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={installApp}
        className="btn-secondary"
        style={{
          width: '100%',
          padding: '8px 10px',
          fontSize: '0.82rem',
          fontWeight: 650,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: '#ffffff',
          borderColor: 'var(--panel-border-medium)',
          color: '#09090b',
        }}
        title="Install EarLab as a standalone Desktop or Mobile App"
      >
        <Download size={14} />
        <span>Install App</span>
      </button>
    );
  }

  if (variant === 'modal') {
    return (
      <button
        onClick={installApp}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Download size={16} />
        <span>Install EarLab on Device</span>
      </button>
    );
  }

  // Floating banner / banner variant
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--panel-border-bright)',
      borderRadius: '10px',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: 'var(--shadow-panel)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Smartphone size={18} color="#09090b" />
        <div>
          <b style={{ display: 'block', fontSize: '0.86rem', color: '#09090b' }}>Install EarLab</b>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Workstation offline app</span>
        </div>
      </div>

      <button
        onClick={installApp}
        className="btn-primary"
        style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '30px' }}
      >
        Install
      </button>
    </div>
  );
};
