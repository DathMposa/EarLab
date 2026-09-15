'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Navigation, ActiveTab } from '../components/Navigation';
import { HomeView } from '../components/views/HomeView';
import { CurriculumView } from '../components/views/CurriculumView';
import { FeelingLabView } from '../components/views/FeelingLabView';
import { ProgressView } from '../components/views/ProgressView';
import { ExerciseView } from '../components/views/ExerciseView';
import { SettingsModal } from '../components/views/SettingsModal';
import { DiagnosticView } from '../components/views/DiagnosticView';
import { MusicianshipView } from '../components/views/MusicianshipView';
import { DeepListeningView } from '../components/views/DeepListeningView';
import { AppState, DEFAULT_STATE, loadState } from '../lib/storage/store';
import { TrackId } from '../lib/music/curriculum';

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);
  const [studioFocus, setStudioFocus] = useState<boolean>(false);

  // Active training session state
  const [activeSession, setActiveSession] = useState<{
    trackId: TrackId;
    levelIndex: number;
  } | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);

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

  return (
    <div className="desktop-app-shell">
      {/* Mobile-first workspace; the same composition expands gracefully on desktop. */}
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
            {!studioFocus && <Header
              state={state}
              onOpenSettings={() => setShowSettings(true)}
            />}

            <div style={{ flex: 1 }}>
              {!studioFocus && activeTab === 'home' && (
                <HomeView
                  state={state}
                  onStartSession={handleStartSession}
                  onOpenDiagnostic={() => setShowDiagnostic(true)}
                />
              )}

              {!studioFocus && activeTab === 'curriculum' && (
                <CurriculumView
                  state={state}
                  onStartSession={handleStartSession}
                />
              )}

              {!studioFocus && activeTab === 'feeling' && (
                <MusicianshipView state={state} onStateUpdate={setState} onStartLegacy={handleStartSession} />
              )}

              {!studioFocus && activeTab === 'progress' && (
                <ProgressView
                  state={state}
                  onStateUpdate={setState}
                />
              )}

              <DeepListeningView
                state={state}
                onStateUpdate={setState}
                onOpenSettings={() => setShowSettings(true)}
                isActive={activeTab === 'settings'}
                onStudioFocusChange={(focused) => {
                  setStudioFocus(focused);
                  if (focused) setActiveTab('settings');
                }}
              />
            </div>

            {/* Mobile Bottom Navigation (Hidden on desktop via CSS) */}
            {!studioFocus && <Navigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />}
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
