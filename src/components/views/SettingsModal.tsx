'use client';

import React from 'react';
import { X, SlidersHorizontal, Compass, Mic } from 'lucide-react';
import { AppState, saveState, UserPreferences } from '../../lib/storage/store';
import { KEYS, NotationMode, ScaleType, SoundTimbre } from '../../lib/music/scales';

interface SettingsModalProps {
  state: AppState;
  onStateUpdate: (newState: AppState) => void;
  onClose: () => void;
  onOpenDiagnostic: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onStateUpdate,
  onClose,
  onOpenDiagnostic,
}) => {
  const prefs = state.preferences;

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const next = structuredClone(state);
    next.preferences[key] = value;
    saveState(next);
    onStateUpdate(next);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--panel-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={20} color="#09090b" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#09090b' }}>Studio Preferences & Audio</h3>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px', minHeight: 'unset' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Functional Notation System */}
          <div>
            <label style={{ fontSize: '0.86rem', fontWeight: 750, color: '#09090b', display: 'block', marginBottom: '8px' }}>
              Functional Notation System
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'degrees', label: '1 – 7', desc: 'Scale Degrees' },
                { id: 'solfege', label: 'Do Re Mi', desc: 'Movable-Do' },
                { id: 'notes', label: 'C D E', desc: 'Note Names' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updatePref('notation', m.id as NotationMode)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: prefs.notation === m.id ? '2px solid #09090b' : '1px solid var(--panel-border-medium)',
                    background: prefs.notation === m.id ? '#09090b' : '#ffffff',
                    color: prefs.notation === m.id ? '#ffffff' : '#09090b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: prefs.notation === m.id ? '0 2px 8px rgba(0, 0, 0, 0.14)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <b style={{ fontSize: '0.98rem', fontFamily: 'var(--font-mono)' }}>{m.label}</b>
                  <span style={{ fontSize: '0.72rem', color: prefs.notation === m.id ? '#a1a1aa' : 'var(--text-dim)', marginTop: '2px' }}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key & Scale */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 750, color: '#09090b', display: 'block', marginBottom: '6px' }}>
                Default Tonal Key
              </label>
              <select
                value={prefs.defaultKeyIndex}
                onChange={(e) => updatePref('defaultKeyIndex', Number(e.target.value))}
              >
                {KEYS.map((k) => (
                  <option key={k.index} value={k.index}>
                    {k.name} ({k.display})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 750, color: '#09090b', display: 'block', marginBottom: '6px' }}>
                Default Scale
              </label>
              <select
                value={prefs.defaultScale}
                onChange={(e) => updatePref('defaultScale', e.target.value as ScaleType)}
              >
                <option value="major">Major (Ionian)</option>
                <option value="minor">Natural Minor (Aeolian)</option>
              </select>
            </div>
          </div>

          {/* Instrument Timbre */}
          <div>
            <label style={{ fontSize: '0.86rem', fontWeight: 750, color: '#09090b', display: 'block', marginBottom: '6px' }}>
              Instrument Timbre
            </label>
            <select
              value={prefs.defaultTimbre}
              onChange={(e) => updatePref('defaultTimbre', e.target.value as SoundTimbre)}
            >
              <option value="ep">Warm Electric Piano (Rhodes FM)</option>
              <option value="piano">Soft Grand Piano (Multi-harmonic)</option>
              <option value="pure">Pure Reference Tone (Dry Calibrated)</option>
            </select>
          </div>

          {/* Vocal Pitch Meter */}
          <div style={{
            background: 'var(--panel-card-subtle)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid var(--panel-border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 750, fontSize: '0.94rem', color: '#09090b' }}>
                <Mic size={16} color="#09090b" />
                Vocal Pitch Meter (Autocorrelation)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.45 }}>
                Real-time cents intonation feedback for Track A. Computes 100% on-device.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.enableMicAssessment}
              onChange={(e) => updatePref('enableMicAssessment', e.target.checked)}
              style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#09090b' }}
            />
          </div>

          {/* Auto-advance */}
          <div style={{
            background: 'var(--panel-card-subtle)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid var(--panel-border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}>
            <div>
              <b style={{ fontSize: '0.94rem', color: '#09090b' }}>Auto-Advance on Correct</b>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Advance automatically on independent correct response.
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.autoAdvanceOnCorrect}
              onChange={(e) => updatePref('autoAdvanceOnCorrect', e.target.checked)}
              style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#09090b' }}
            />
          </div>

          {/* Diagnostic Button */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--panel-border)' }}>
            <button
              onClick={() => {
                onClose();
                onOpenDiagnostic();
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
            >
              <Compass size={18} />
              Take Baseline Diagnostic Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
