'use client';

import React, { useRef } from 'react';
import { BarChart2, Download, Upload, Trash2, AlertCircle, Activity } from 'lucide-react';
import { AppState, exportStateAsJson, exportHistoryAsCsv, saveState, DEFAULT_STATE } from '../../lib/storage/store';
import { DiatonicMasteryMatrix } from '../visuals/DiatonicMasteryMatrix';
import { ConfusionCrossTalk } from '../visuals/ConfusionCrossTalk';

interface ProgressViewProps {
  state: AppState;
  onStateUpdate: (newState: AppState) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ state, onStateUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const firstAttemptPct = state.challengesCount > 0
    ? Math.round((state.firstAttemptCorrectCount / state.challengesCount) * 100)
    : 0;

  const confusionInsights: { target: number; chosen: number; count: number }[] = [];
  Object.entries(state.confusionMatrix).forEach(([targetStr, errors]) => {
    const target = Number(targetStr);
    Object.entries(errors).forEach(([chosenStr, count]) => {
      const chosen = Number(chosenStr);
      if (count >= 2) {
        confusionInsights.push({ target, chosen, count });
      }
    });
  });
  confusionInsights.sort((a, b) => b.count - a.count);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.schemaVersion === 'number') {
          saveState(parsed);
          onStateUpdate(parsed);
          alert('Data imported successfully.');
        } else {
          alert('Invalid backup schema.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Reset all EarLab progress data on this machine? This action is immediate and permanent.')) {
      const clean = structuredClone(DEFAULT_STATE);
      saveState(clean);
      onStateUpdate(clean);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Top Telemetry Header */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div className="section-tag" style={{ marginBottom: '4px' }}>
              <BarChart2 size={13} />
              Cognitive Telemetry
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#09090b', margin: 0 }}>
              Mastery & Retention Profile
            </h2>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--panel-card-subtle)',
            padding: '4px 10px',
            borderRadius: '99px',
            border: '1px solid var(--panel-border-medium)',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#09090b',
            fontFamily: 'var(--font-mono)'
          }}>
            <Activity size={12} color="var(--good)" />
            <span>BAYESIAN RETENTION ACTIVE</span>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <b style={{ display: 'block', fontSize: '1.35rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
              {state.sessionsCount}
            </b>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 650 }}>Sessions</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <b style={{ display: 'block', fontSize: '1.35rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
              {state.challengesCount}
            </b>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 650 }}>Probes</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <b style={{ display: 'block', fontSize: '1.35rem', fontWeight: 800, color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
              {firstAttemptPct}%
            </b>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 650 }}>1st Retrieval</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--panel-border-medium)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
            <b style={{ display: 'block', fontSize: '1.35rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
              {state.levelsAdvancedCount}
            </b>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 650 }}>Levels Mastered</span>
          </div>
        </div>
      </section>

      {/* Visual Diatonic Mastery Matrix (7-Pillar Visual Instrument) */}
      <section className="studio-card studio-card-compact">
        <DiatonicMasteryMatrix state={state} />
      </section>

      {/* Systematic Auditory Substitutions (Cross-Talk Vector Graph) */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <div>
            <div className="section-tag" style={{ marginBottom: '4px' }}>
              <AlertCircle size={13} />
              Auditory Cross-Talk Map
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
              Perceptual Substitutions
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            AUTOMATIC RE-ENFORCEMENT
          </span>
        </div>

        <ConfusionCrossTalk pairs={confusionInsights} defaultKeyIndex={state.preferences.defaultKeyIndex} />
      </section>

      {/* Recent Sessions History */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div className="section-tag">
            Recent Session Telemetry
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {state.history.length} LOGGED
          </span>
        </div>

        {state.history.length === 0 ? (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '0.84rem',
            padding: '16px',
            textAlign: 'center',
            background: 'var(--panel-card-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--panel-border-medium)'
          }}>
            No sessions logged yet. Complete your first training cycle to populate telemetry.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {state.history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ fontSize: '0.9rem', color: '#09090b' }}>{h.trackName}</b>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {h.trackId}{h.levelNumber}
                    </span>
                    {h.qualified && (
                      <span style={{ background: 'var(--good-bg)', color: 'var(--good)', fontSize: '0.66rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                        QUALIFIED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {h.date} &bull; {h.totalChallenges} challenges &bull; {h.reveals} reveals &bull; {h.durationSeconds}s
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <b style={{
                    fontSize: '1.15rem',
                    fontFamily: 'var(--font-mono)',
                    color: h.firstAttemptAcc >= 80 ? 'var(--good)' : '#09090b',
                    fontWeight: 800,
                  }}>
                    {h.firstAttemptAcc}%
                  </b>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontWeight: 650 }}>
                    1st Attempt
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data Ownership */}
      <section className="studio-card studio-card-compact">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
              Telemetry Portability & Export
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Self-contained offline storage &bull; JSON &amp; CSV
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportJson}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => exportStateAsJson(state)} style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '30px' }}>
              <Download size={13} />
              JSON
            </button>
            <button className="btn-secondary" onClick={() => exportHistoryAsCsv(state.history)} style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '30px' }}>
              <Download size={13} />
              CSV
            </button>
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '30px' }}>
              <Upload size={13} />
              Import
            </button>
            <button className="btn-danger" onClick={handleResetData} style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '30px' }}>
              <Trash2 size={13} />
              Reset
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
