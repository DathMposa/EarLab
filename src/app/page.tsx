'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Navigation, ActiveTab } from '../components/Navigation';
import { HomeView } from '../components/views/HomeView';
import { CurriculumView } from '../components/views/CurriculumView';
import { FeelingLabView } from '../components/views/FeelingLabView';
import { ProgressView } from '../components/views/ProgressView';
import { ExerciseView } from '../components/views/ExerciseView';
import { SettingsModal } from '../components/views/SettingsModal';
import { DiagnosticView } from '../components/views/DiagnosticView';
import { AppState, DEFAULT_STATE, loadState } from '../lib/storage/store';
import { TrackId } from '../lib/music/curriculum';

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);

  // Active training session state
  const [activeSession, setActiveSession] = useState<{
    trackId: TrackId;
    levelIndex: number;
  } | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsLoaded(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const actionParam = params.get('action');

      if (viewParam === 'feeling') {
        setActiveTab('feeling');
      } else if (actionParam === 'continue') {
        const recTrack = loaded.tracks.A.level <= loaded.tracks.B.level ? 'A' : 'B';
        setActiveSession({
          trackId: recTrack,
          levelIndex: loaded.tracks[recTrack].level,
        });
      }
    }
  }, []);

  const handleStartSession = (trackId: TrackId, levelIndex?: number) => {
    const lvl = levelIndex !== undefined ? levelIndex : state.tracks[trackId].level;
    setActiveSession({ trackId, levelIndex: lvl });
  };

  const handleExitSession = () => {
    setActiveSession(null);
  };

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
      }}>
        INITIALIZING STUDIO CORE...
      </div>
    );
  }

  return (
    <div className="desktop-app-shell">
      {/* Fixed Desktop Sidebar (Hidden on mobile) */}
      {!activeSession && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={state}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Main Studio Workspace */}
      <main className="desktop-workspace">
        {/* If an active exercise session is running, render the focused console */}
        {activeSession ? (
          <ExerciseView
            state={state}
            trackId={activeSession.trackId}
            levelIndex={activeSession.levelIndex}
            onStateUpdate={setState}
            onExit={handleExitSession}
          />
        ) : (
          <>
            {/* Header (Acts as Mobile Header or Desktop Title Bar) */}
            <Header
              state={state}
              onOpenSettings={() => setShowSettings(true)}
            />

            <div style={{ flex: 1 }}>
              {activeTab === 'home' && (
                <HomeView
                  state={state}
                  onStartSession={handleStartSession}
                  onOpenDiagnostic={() => setShowDiagnostic(true)}
                />
              )}

              {activeTab === 'curriculum' && (
                <CurriculumView
                  state={state}
                  onStartSession={handleStartSession}
                />
              )}

              {activeTab === 'feeling' && (
                <FeelingLabView state={state} />
              )}

              {activeTab === 'progress' && (
                <ProgressView
                  state={state}
                  onStateUpdate={setState}
                />
              )}

              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="studio-card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Studio Preferences</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Configure functional notation systems, key calibration, and instrument synthesis timbres.
                    </p>
                    <button className="btn-primary" onClick={() => setShowSettings(true)}>
                      Open Studio Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation (Hidden on desktop via CSS) */}
            <Navigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
      </main>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <SettingsModal
          state={state}
          onStateUpdate={setState}
          onClose={() => setShowSettings(false)}
          onOpenDiagnostic={() => {
            setShowSettings(false);
            setShowDiagnostic(true);
          }}
        />
      )}

      {/* Baseline Diagnostic Modal Overlay */}
      {showDiagnostic && (
        <DiagnosticView
          state={state}
          onStateUpdate={setState}
          onClose={() => setShowDiagnostic(false)}
        />
      )}
    </div>
  );
}
