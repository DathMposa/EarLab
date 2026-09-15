'use client';

import React, { useEffect, useState } from 'react';
import { X, SlidersHorizontal, Compass, Mic, Download, Trash2, Music2 } from 'lucide-react';
import { audioEngine } from '../../lib/audio/audioEngine';
import { AppState, saveState, UserPreferences, cloneState } from '../../lib/storage/store';
import { KEYS, NotationMode, ScaleType, SoundTimbre } from '../../lib/music/scales';
import { PWAInstallButton } from '../PWAInstallButton';

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
  const [packStatus, setPackStatus] = useState(audioEngine.getStudioGrandStatus());
  const [loadedCount, setLoadedCount] = useState(audioEngine.getStudioGrandLoadedCount());
  const [storageBytes, setStorageBytes] = useState<number | null>(null);

  const refreshPackState = async () => {
    setPackStatus(audioEngine.getStudioGrandStatus());
    setLoadedCount(audioEngine.getStudioGrandLoadedCount());
    setStorageBytes(await audioEngine.getAudioStorageBytes());
  };

  useEffect(() => { void refreshPackState(); }, []);

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const next = cloneState(state);
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
              <option value="piano">Studio Grand Piano (sampled)</option>
              <option value="ep">Warm Electric Piano (synthesis fallback)</option>
              <option value="pure">Pure Reference Tone (Dry Calibrated)</option>
            </select>
          </div>

          <div style={{
            background: 'var(--panel-card-subtle)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--panel-border-medium)', display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
              <Music2 size={17} color="var(--good)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <b style={{ fontSize: '0.94rem', color: '#09090b' }}>Studio Grand Piano</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.45 }}>
                  {packStatus === 'ready' ? `${loadedCount} studio samples are ready for offline playback.` : packStatus === 'loading' ? 'Preparing studio piano… practice remains available while it loads.' : 'Download the sampled piano once for richer offline playback.'}
                  {storageBytes !== null ? ` Device audio cache: ${Math.max(1, Math.round(storageBytes / 1024 / 1024))} MB.` : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={async () => { setPackStatus('loading'); await audioEngine.prepareStudioGrand(prefs.defaultKeyIndex); await refreshPackState(); }} style={{ padding: '7px 11px', minHeight: '36px', fontSize: '.78rem' }}>
                <Download size={14} /> Prepare piano
              </button>
              <button className="btn-ghost" onClick={async () => { await audioEngine.clearStudioGrand(); await refreshPackState(); }} style={{ padding: '7px 11px', minHeight: '36px', fontSize: '.78rem' }}>
                <Trash2 size={14} /> Clear downloaded sounds
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--panel-card-subtle)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--panel-border-medium)' }}>
            <b style={{ fontSize: '0.94rem', color: '#09090b' }}>Rhythm, bass & ensemble sound packs</b>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
              These modules are timing-accurate and work offline with safe Web Audio voices today. A dedicated redistributable sample pack will appear here only after its source, license, and attribution have been verified.
            </p>
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

          {/* PWA Device Installation */}
          <div style={{
            background: 'var(--panel-card-subtle)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid var(--panel-border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div>
              <b style={{ fontSize: '0.94rem', color: '#09090b' }}>Progressive Web App (Offline Mode)</b>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.45 }}>
                Install EarLab as a dedicated workstation app on your computer, tablet, or mobile phone. Runs offline with zero network latency.
              </p>
            </div>
            <PWAInstallButton variant="modal" />
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

          <p style={{ fontSize: '.72rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
            Studio Grand Piano samples: Salamander Grand Piano v3 by Alexander Holm, licensed under CC BY 3.0. Deep Listening Studio tempo processing: SoundTouchJS AudioWorklet, licensed under MPL-2.0.
          </p>
        </div>
      </div>
    </div>
  );
};
