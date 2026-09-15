'use client';

import React, { useState } from 'react';
import { Compass, Play, CheckCircle2, ArrowRight, X, Volume2 } from 'lucide-react';
import { AppState, saveState, cloneState } from '../../lib/storage/store';
import { TrackId, TRACKS } from '../../lib/music/curriculum';
import { KEYS } from '../../lib/music/scales';
import { audioEngine } from '../../lib/audio/audioEngine';
import { FlowGlyph } from '../visuals/FlowGlyph';

interface DiagnosticViewProps {
  state: AppState;
  onStateUpdate: (newState: AppState) => void;
  onClose: () => void;
}

type Stage = 'setup' | 'probe' | 'results';

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({ state, onStateUpdate, onClose }) => {
  const [stage, setStage] = useState<Stage>('setup');
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(state.preferences.defaultKeyIndex);
  const [probeIndex, setProbeIndex] = useState<number>(0);
  const [probeStep, setProbeStep] = useState<number>(0);
  const [scores, setScores] = useState<Record<TrackId, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [recommendedLevels, setRecommendedLevels] = useState<Record<TrackId, number>>({ A: 0, B: 0, C: 0, D: 0 });

  const probeTracks: TrackId[] = ['B', 'A', 'D', 'C'];
  const currentTrackId = probeTracks[probeIndex];
  const currentTrack = TRACKS[currentTrackId];

  const handleTestAudio = () => {
    audioEngine.playTonalFrame(selectedKeyIndex, 'major');
  };

  const handleStartProbes = () => {
    setStage('probe');
    setProbeIndex(0);
    setProbeStep(0);
  };

  const handleProbeAnswer = (score: number) => {
    const updatedScores = { ...scores, [currentTrackId]: (scores[currentTrackId] || 0) + score };
    setScores(updatedScores);

    if (probeStep < 2) {
      setProbeStep(probeStep + 1);
    } else {
      if (probeIndex < probeTracks.length - 1) {
        setProbeIndex(probeIndex + 1);
        setProbeStep(0);
      } else {
        const calculated: Record<TrackId, number> = {
          A: Math.min(7, Math.max(0, Math.round((updatedScores.A / 3) * 6))),
          B: Math.min(7, Math.max(0, Math.round((updatedScores.B / 3) * 6))),
          C: Math.min(6, Math.max(0, Math.round((updatedScores.C / 3) * 5))),
          D: Math.min(6, Math.max(0, Math.round((updatedScores.D / 3) * 5))),
        };
        setRecommendedLevels(calculated);
        setStage('results');
      }
    }
  };

  const handleApplyPlacements = () => {
    const next = cloneState(state);
    next.preferences.defaultKeyIndex = selectedKeyIndex;
    (['A', 'B', 'C', 'D'] as TrackId[]).forEach((id) => {
      next.tracks[id].level = recommendedLevels[id];
      next.tracks[id].qualifying = 0;
      next.tracks[id].qualifyingDays = [];
    });
    saveState(next);
    onStateUpdate(next);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--panel-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={20} color="#09090b" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>Adaptive Baseline Diagnostic</h3>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px', minHeight: 'unset' }}>
            <X size={20} />
          </button>
        </div>

        {stage === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Probes your perceptual and audiation limits to calibrate starting levels across Tracks A, B, C, and D.
            </p>

            <div style={{ background: 'var(--panel-card-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border-medium)' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 750, color: '#09090b', display: 'block', marginBottom: '8px' }}>
                Comfortable Vocal Register:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedKeyIndex}
                  onChange={(e) => setSelectedKeyIndex(Number(e.target.value))}
                  style={{ flex: 1 }}
                >
                  {KEYS.map((k) => (
                    <option key={k.index} value={k.index}>
                      {k.name} ({k.display})
                    </option>
                  ))}
                </select>
                <button className="btn-secondary" onClick={handleTestAudio} style={{ flexShrink: 0 }}>
                  <Volume2 size={16} />
                  Test Cadence
                </button>
              </div>
            </div>

            <button className="btn-primary" onClick={handleStartProbes} style={{ padding: '13px', fontSize: '0.98rem' }}>
              Begin Diagnostic Probes
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {stage === 'probe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="section-tag">
                Probe {probeIndex + 1} of 4: {currentTrack.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Item {probeStep + 1} / 3
              </span>
            </div>

            <div style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '12px', padding: '22px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <FlowGlyph trackId={currentTrackId} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '16px 0' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    const testDegree = probeStep === 0 ? 5 : probeStep === 1 ? 3 : 6;
                    audioEngine.playDegree(testDegree, selectedKeyIndex, 'major', 0.9);
                  }}
                  style={{ padding: '10px 20px' }}
                >
                  <Play size={16} fill="currentColor" />
                  Sound Stimulus
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => audioEngine.playTonalFrame(selectedKeyIndex, 'major')}
                  style={{ padding: '10px 16px' }}
                >
                  Hear Tonic
                </button>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', marginTop: '10px' }}>
                Cognitive immediacy of recognition:
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleProbeAnswer(1)}
                  style={{ flex: 1, padding: '11px', color: '#09090b', borderColor: '#09090b', fontWeight: 700 }}
                >
                  Immediate
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleProbeAnswer(0.5)}
                  style={{ flex: 1, padding: '11px' }}
                >
                  Hesitant
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleProbeAnswer(0)}
                  style={{ flex: 1, padding: '11px', color: 'var(--text-dim)' }}
                >
                  Uncertain
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <CheckCircle2 size={40} color="var(--good)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#09090b' }}>Placements Calibrated</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Recommended starting levels based on boundary probes:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {(['A', 'B', 'C', 'D'] as TrackId[]).map((id) => (
                <div key={id} style={{ background: 'var(--panel-card-subtle)', border: '1px solid var(--panel-border-medium)', borderRadius: '10px', padding: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{TRACKS[id].name}</span>
                  <b style={{ display: 'block', fontSize: '1.3rem', color: '#09090b', fontFamily: 'var(--font-mono)', margin: '2px 0' }}>
                    {id}{recommendedLevels[id] + 1}
                  </b>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                    {TRACKS[id].levels[recommendedLevels[id]].name}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={handleApplyPlacements} style={{ padding: '14px', fontSize: '1rem' }}>
              Apply Placements & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
