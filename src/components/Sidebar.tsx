'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Map,
  Activity,
  BarChart2,
  Settings,
  Volume2,
  VolumeX,
  SlidersHorizontal,
} from 'lucide-react';
import { Logo } from './Logo';
import { ActiveTab } from './Navigation';
import { AppState } from '../lib/storage/store';
import { KEYS } from '../lib/music/scales';
import { audioEngine } from '../lib/audio/audioEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  state: AppState;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  state,
  onOpenSettings,
}) => {
  const [isDroneActive, setIsDroneActive] = useState<boolean>(audioEngine.isDroneActive());
  const currentKey = KEYS[state.preferences.defaultKeyIndex]?.name || 'C';
  const scale = state.preferences.defaultScale === 'major' ? 'Major' : 'Minor';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Practice & Today', icon: <Calendar size={20} /> },
    { id: 'curriculum', label: 'Curriculum (A–D)', icon: <Map size={20} /> },
    { id: 'feeling', label: 'Tonal Feeling Lab', icon: <Activity size={20} /> },
    { id: 'progress', label: 'Mastery & Analytics', icon: <BarChart2 size={20} /> },
    { id: 'settings', label: 'Preferences & Audio', icon: <Settings size={20} /> },
  ];

  const handleToggleDrone = () => {
    const next = audioEngine.toggleDrone(state.preferences.defaultKeyIndex, state.preferences.defaultScale);
    setIsDroneActive(next);
  };

  return (
    <aside className="desktop-sidebar">
      <div>
        {/* Logo & Brand Header */}
        <div style={{ padding: '8px 10px 20px', borderBottom: '1px solid var(--panel-border)' }}>
          <Logo size={32} showText={true} />
        </div>

        {/* Vertical Navigation Links */}
        <nav className="desktop-nav-list">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`desktop-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                {item.icon}
                <span style={{ flex: 1, fontSize: '0.96rem' }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.74rem',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Studio Workstation Quick Rack (Bottom) */}
      <div style={{
        background: 'var(--panel-card-subtle)',
        border: '1px solid var(--panel-border-medium)',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            Studio Reference
          </span>
          <button
            onClick={onOpenSettings}
            className="btn-ghost"
            style={{ padding: '4px', minHeight: 'unset', color: 'var(--text-muted)' }}
            title="Adjust Key & Timbre"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* Key & Scale pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem',
          color: 'var(--text)',
          background: '#ffffff',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--panel-border)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 550 }}>Tonal Root</span>
          <b style={{ fontFamily: 'var(--font-mono)', color: '#09090b', fontWeight: 800 }}>{currentKey} {scale}</b>
        </div>

        {/* Quick Drone Switch */}
        <button
          onClick={handleToggleDrone}
          style={{
            width: '100%',
            padding: '9px 12px',
            fontSize: '0.86rem',
            background: isDroneActive ? '#09090b' : '#ffffff',
            borderColor: isDroneActive ? '#09090b' : 'var(--panel-border-medium)',
            color: isDroneActive ? '#ffffff' : 'var(--text)',
            display: 'flex',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 650 }}>
            {isDroneActive ? <Volume2 size={16} color="#ffffff" /> : <VolumeX size={16} color="var(--text-muted)" />}
            Tonic Drone
          </span>
          <span style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: isDroneActive ? '#ffffff' : 'var(--text-dim)',
          }}>
            {isDroneActive ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Session Stats Counter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          paddingTop: '6px',
          borderTop: '1px solid var(--panel-border)',
        }}>
          <span>Total Logged</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#09090b', fontWeight: 800 }}>
            {state.sessionsCount} sessions
          </span>
        </div>

        {/* PWA Device Install Action */}
        <PWAInstallButton variant="sidebar" />
      </div>
    </aside>
  );
};
