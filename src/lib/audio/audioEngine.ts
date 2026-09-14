import { freqFromDegree, SoundTimbre, ScaleType } from '../music/scales';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private isDronePlaying = false;
  private scheduledSources: { stop: (when?: number) => void }[] = [];

  /**
   * Initializes or resumes the AudioContext on user interaction.
   * Handles autoplay policy restrictions across iOS Safari and Android Chrome.
   */
  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

      // Compressor to avoid clipping and glue sounds together
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  /**
   * Synthesizes a single musical note using the selected timbre.
   */
  public async playVoice(
    freq: number,
    startTime: number,
    duration: number,
    velocity: number = 0.9,
    timbre: SoundTimbre = 'ep'
  ): Promise<void> {
    const ctx = await this.ensureContext();
    const now = startTime;

    // Amplitude Envelope
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);

    // Timbre Lowpass Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    if (timbre === 'pure') {
      // Pure reference tone: fast attack, pure tone, calibrated
      filter.frequency.setValueAtTime(6000, now);
      filter.Q.setValueAtTime(0.7, now);

      noteGain.gain.exponentialRampToValueAtTime(0.22 * velocity, now + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.12 * velocity, now + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.06, now);

      osc1.connect(filter);
      osc2.connect(osc2Gain).connect(filter);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.08);
      osc2.stop(now + duration + 0.08);

      this.scheduledSources.push(osc1, osc2);
    } else if (timbre === 'piano') {
      // Acoustic piano emulation: dynamic filter decay, multi-harmonic richness, hammer transient
      filter.frequency.setValueAtTime(4600, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(1.2, now);

      noteGain.gain.exponentialRampToValueAtTime(0.28 * velocity, now + 0.008);
      noteGain.gain.exponentialRampToValueAtTime(0.1 * velocity, now + 0.22);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Harmonics 1, 2, 3, 4
      const harmonics: [number, number, OscillatorType][] = [
        [1.0, 0.58, 'triangle'],
        [2.0, 0.22, 'sine'],
        [3.0, 0.08, 'sine'],
        [4.0, 0.04, 'sine'],
      ];

      harmonics.forEach(([ratio, amp, type]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq * ratio, now);
        g.gain.setValueAtTime(amp, now);
        osc.connect(g).connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.08);
        this.scheduledSources.push(osc);
      });

      // Hammer strike noise transient
      const hammer = ctx.createOscillator();
      const hGain = ctx.createGain();
      hammer.type = 'sine';
      hammer.frequency.setValueAtTime(freq * 3.5, now);
      hGain.gain.setValueAtTime(0.05 * velocity, now);
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      hammer.connect(hGain).connect(filter);
      hammer.start(now);
      hammer.stop(now + 0.05);
      this.scheduledSources.push(hammer);
    } else {
      // Warm Electric Piano (Rhodes-like): lush triangle base, 2nd & 3rd harmonic bell tines
      filter.frequency.setValueAtTime(3400, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.8);
      filter.Q.setValueAtTime(0.9, now);

      noteGain.gain.exponentialRampToValueAtTime(0.25 * velocity, now + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.12 * velocity, now + 0.18);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const partials: [number, number, OscillatorType][] = [
        [1.0, 0.62, 'triangle'],
        [2.0, 0.16, 'sine'],
        [3.0, 0.05, 'sine'],
        [0.5, 0.06, 'sine'], // Subtle warm sub
      ];

      partials.forEach(([ratio, amp, type]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq * ratio, now);
        g.gain.setValueAtTime(amp, now);
        osc.connect(g).connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.08);
        this.scheduledSources.push(osc);
      });

      // Tine chime transient
      const tine = ctx.createOscillator();
      const tGain = ctx.createGain();
      tine.type = 'sine';
      tine.frequency.setValueAtTime(freq * 4.02, now); // Slight detune for acoustic shimmer
      tGain.gain.setValueAtTime(0.04 * velocity, now);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      tine.connect(tGain).connect(filter);
      tine.start(now);
      tine.stop(now + 0.08);
      this.scheduledSources.push(tine);
    }

    filter.connect(noteGain);
    if (this.masterGain) {
      noteGain.connect(this.masterGain);
    }
  }

  /**
   * Plays a single scale degree note.
   */
  public async playDegree(
    degree: number,
    keyIndex: number = 0,
    scale: ScaleType = 'major',
    duration: number = 0.8,
    timbre: SoundTimbre = 'ep',
    octaveOffset: number = 0
  ): Promise<void> {
    const ctx = await this.ensureContext();
    const freq = freqFromDegree(degree, keyIndex, scale, octaveOffset);
    await this.playVoice(freq, ctx.currentTime + 0.02, duration, 1.0, timbre);
  }

  /**
   * Schedules and plays a complete melodic phrase with sample-accurate Web Audio timing.
   */
  public async playMelody(
    sequence: number[],
    keyIndex: number = 0,
    scale: ScaleType = 'major',
    timbre: SoundTimbre = 'ep',
    slow: boolean = false
  ): Promise<void> {
    const ctx = await this.ensureContext();
    this.stopMelody();

    const beatDuration = slow ? 0.76 : 0.5;
    const noteDuration = beatDuration * 0.88;
    const startTime = ctx.currentTime + 0.04;

    sequence.forEach((deg, idx) => {
      const freq = freqFromDegree(deg, keyIndex, scale);
      const noteStart = startTime + idx * beatDuration;
      const velocity = idx === 0 ? 1.0 : idx === sequence.length - 1 ? 0.95 : 0.88;
      this.playVoice(freq, noteStart, noteDuration, velocity, timbre);
    });
  }

  /**
   * Plays a cadence or tonal frame to anchor the listener's ear to tonic.
   * Plays: 1 (low) -> 3 -> 5 -> 1 (octave).
   */
  public async playTonalFrame(
    keyIndex: number = 0,
    scale: ScaleType = 'major',
    timbre: SoundTimbre = 'pure'
  ): Promise<void> {
    const ctx = await this.ensureContext();
    this.stopMelody();

    const startTime = ctx.currentTime + 0.03;
    const notes = [
      { degree: 1, oct: 0, dur: 0.38 },
      { degree: 3, oct: 0, dur: 0.38 },
      { degree: 5, oct: 0, dur: 0.38 },
      { degree: 1, oct: 1, dur: 0.72 },
    ];

    notes.forEach((n, idx) => {
      const freq = freqFromDegree(n.degree, keyIndex, scale, n.oct);
      const start = startTime + idx * 0.42;
      this.playVoice(freq, start, n.dur, 0.92, timbre);
    });
  }

  /**
   * Starts a continuous, rich tonic drone scaffolding.
   * Layered root, octave, and subtle fifth with soft attack.
   */
  public async startDrone(keyIndex: number = 0, scale: ScaleType = 'major'): Promise<void> {
    const ctx = await this.ensureContext();
    this.stopDrone();

    const baseFreq = freqFromDegree(1, keyIndex, scale, -1); // 1 octave below middle root
    const now = ctx.currentTime;

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0001, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.14, now + 0.4);

    if (this.masterGain) {
      this.droneGain.connect(this.masterGain);
    }

    // Drone Layers: Sub-root, Root, Fifth, Octave
    const droneLayers: [number, number][] = [
      [1.0, 0.55], // Bass root
      [2.0, 0.28], // Middle root
      [3.0, 0.08], // Harmonic 5th
      [0.5, 0.06], // Deep sub
    ];

    this.droneOscs = droneLayers.map(([mult, amp]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);
      g.gain.setValueAtTime(amp, now);
      osc.connect(g).connect(this.droneGain!);
      osc.start();
      return osc;
    });

    this.isDronePlaying = true;
  }

  /**
   * Stops the active tonic drone with a smooth fade-out.
   */
  public stopDrone(): void {
    if (!this.isDronePlaying || !this.droneGain || !this.ctx) {
      this.isDronePlaying = false;
      return;
    }

    const now = this.ctx.currentTime;
    try {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      const oscs = [...this.droneOscs];
      setTimeout(() => {
        oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Ignore if already stopped
          }
        });
      }, 350);
    } catch {
      // Fail-safe
    }

    this.droneOscs = [];
    this.isDronePlaying = false;
  }

  public toggleDrone(keyIndex: number = 0, scale: ScaleType = 'major'): boolean {
    if (this.isDronePlaying) {
      this.stopDrone();
      return false;
    } else {
      this.startDrone(keyIndex, scale);
      return true;
    }
  }

  public isDroneActive(): boolean {
    return this.isDronePlaying;
  }

  /**
   * Stops any currently playing melodic sequence.
   */
  public stopMelody(): void {
    this.scheduledSources.forEach((s) => {
      try {
        s.stop();
      } catch {
        // Already stopped
      }
    });
    this.scheduledSources = [];
  }

  /**
   * Stops everything (drone + melody).
   */
  public stopAll(): void {
    this.stopDrone();
    this.stopMelody();
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
