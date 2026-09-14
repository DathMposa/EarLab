'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Activity, Play } from 'lucide-react';
import { DEGREE_FEELINGS, KEYS, formatDegreeLabel } from '../../lib/music/scales';
import { audioEngine } from '../../lib/audio/audioEngine';
import { AppState } from '../../lib/storage/store';
import { TonalGravityCompass } from '../visuals/TonalGravityCompass';

interface FeelingLabViewProps {
  state: AppState;
}

export const FeelingLabView: React.FC<FeelingLabViewProps> = ({ state }) => {
  const [selectedDegree, setSelectedDegree] = useState<number>(1);
  const [isDroneOn, setIsDroneOn] = useState<boolean>(false);
  const keyIndex = state.preferences.defaultKeyIndex;
  const scale = state.preferences.defaultScale;
  const notation = state.preferences.notation;

  const currentFeeling = DEGREE_FEELINGS[selectedDegree];

  useEffect(() => {
    return () => {
      audioEngine.stopDrone();
    };
  }, []);

  const handleToggleDrone = () => {
    const nextActive = audioEngine.toggleDrone(keyIndex, scale);
    setIsDroneOn(nextActive);
  };

  const handlePlayDegree = (deg: number) => {
    setSelectedDegree(deg);
    audioEngine.playDegree(deg, keyIndex, scale, 1.0, state.preferences.defaultTimbre);
  };

  const handlePlayCadence = () => {
    audioEngine.playTonalFrame(keyIndex, scale);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '12px',
      alignItems: 'start',
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Left Column: Tonal Gravity Vector Compass */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <section className="studio-card studio-card-compact">
          <div className="section-tag" style={{ marginBottom: '4px' }}>
            <Activity size={13} />
            Aural Gravitational Field
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px', color: '#09090b' }}>
            Tonal Physics & Vector Pulls
          </h2>

          {/* Interactive Vector Compass Diagram */}
          <TonalGravityCompass
            selectedDegree={selectedDegree}
            onSelectDegree={handlePlayDegree}
          />
        </section>
      </div>

      {/* Right Column: Audio Rack & Interactive Degree Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <section className="studio-card studio-card-compact" style={{
          background: '#ffffff',
          border: '1.5px solid var(--panel-border-bright)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '1.1rem', color: '#09090b' }}>Tonic Scaffold</b>
                <span style={{
                  background: isDroneOn ? '#09090b' : 'rgba(0, 0, 0, 0.05)',
                  color: isDroneOn ? '#ffffff' : 'var(--text-dim)',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {isDroneOn ? 'SOUNDING' : 'MUTED'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {KEYS[keyIndex]?.name} {scale === 'major' ? 'Major' : 'Natural Minor'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleToggleDrone}
                className={isDroneOn ? 'btn-secondary' : 'btn-primary'}
                style={{ padding: '8px 14px', fontSize: '0.88rem' }}
              >
                {isDroneOn ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {isDroneOn ? 'Stop Drone' : 'Start Drone'}
              </button>
              <button
                onClick={handlePlayCadence}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.88rem' }}
              >
                <Play size={15} fill="currentColor" />
                Cadence
              </button>
            </div>
          </div>

          {/* 7 Degree Strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            margin: '18px 0 16px',
          }}>
            {[1, 2, 3, 4, 5, 6, 7].map((deg) => {
              const isSelected = selectedDegree === deg;
              const labels = formatDegreeLabel(deg, notation, keyIndex, scale);

              return (
                <button
                  key={deg}
                  onClick={() => handlePlayDegree(deg)}
                  className={`degree-btn ${isSelected ? 'active' : ''}`}
                  style={{ width: '54px', height: '54px' }}
                >
                  <span>{labels.primary}</span>
                  {labels.secondary && <span className="sub-label">{labels.secondary}</span>}
                </button>
              );
            })}
          </div>

          {/* Clean Condensed Function Card */}
          <div style={{
            background: 'var(--panel-card-subtle)',
            border: '1px solid var(--panel-border-medium)',
            borderRadius: '10px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <b style={{ color: '#09090b', fontSize: '1.08rem' }}>
                Degree {selectedDegree} · {currentFeeling.title}
              </b>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                background: '#09090b',
                padding: '2px 8px',
                borderRadius: '5px',
                color: '#ffffff',
              }}>
                {currentFeeling.quality.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#09090b', fontWeight: 600 }}>
              {currentFeeling.resolution}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
