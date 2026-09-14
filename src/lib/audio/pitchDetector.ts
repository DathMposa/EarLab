import { KEYS, SCALE_INTERVALS, ScaleType } from '../music/scales';

export interface PitchDetectionResult {
  frequency: number;
  midiNote: number;
  noteName: string;
  centsDeviation: number; // -50 to +50 cents
  closestDegree: number; // 1 to 7
  clarity: number; // 0 to 1 confidence score
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private buffer: Float32Array = new Float32Array(2048);

  public async start(
    keyIndex: number,
    scale: ScaleType,
    onPitchDetected: (result: PitchDetectionResult | null) => void
  ): Promise<boolean> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.buffer = new Float32Array(this.analyser.fftSize);

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
      this.sourceNode.connect(this.analyser);

      this.isRunning = true;
      this.loop(keyIndex, scale, onPitchDetected);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Disconnect
      }
      this.sourceNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // Close
      }
      this.audioCtx = null;
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  private loop(
    keyIndex: number,
    scale: ScaleType,
    callback: (result: PitchDetectionResult | null) => void
  ): void {
    if (!this.isRunning || !this.analyser) return;

    this.analyser.getFloatTimeDomainData(this.buffer as unknown as Float32Array<ArrayBuffer>);
    const result = this.autoCorrelate(this.buffer, this.audioCtx?.sampleRate || 44100, keyIndex, scale);
    callback(result);

    this.animationFrameId = requestAnimationFrame(() =>
      this.loop(keyIndex, scale, callback)
    );
  }

  /**
   * Fast normalized autocorrelation pitch detection algorithm.
   */
  private autoCorrelate(
    buf: Float32Array,
    sampleRate: number,
    keyIndex: number,
    scale: ScaleType
  ): PitchDetectionResult | null {
    const SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    // If signal level is too low, treat as silence
    if (rms < 0.015) {
      return null;
    }

    // Trim signal
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buf.slice(r1, r2);
    const c = new Float32Array(trimmed.length);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    // Parabolic interpolation around peak
    if (T0 > 0 && T0 < trimmed.length - 1) {
      const y1 = c[T0 - 1];
      const y2 = c[T0];
      const y3 = c[T0 + 1];
      const a = (y1 + y3 - 2 * y2) / 2;
      const b = (y3 - y1) / 2;
      if (a) {
        T0 = T0 - b / (2 * a);
      }
    }

    const frequency = sampleRate / T0;
    const clarity = maxval / c[0];

    // Vocal fundamental filter (70 Hz to 950 Hz)
    if (frequency < 70 || frequency > 950 || clarity < 0.82) {
      return null;
    }

    // Convert frequency to MIDI note: midi = 69 + 12 * log2(freq / 440)
    const exactMidi = 69 + 12 * (Math.log(frequency / 440) / Math.log(2));
    const midiNote = Math.round(exactMidi);
    const centsDeviation = Math.round((exactMidi - midiNote) * 100);
    const noteName = NOTE_NAMES[midiNote % 12];

    // Determine closest scale degree in current key
    const rootMidi = KEYS[keyIndex].midiRoot;
    const semitonesFromRoot = ((midiNote - rootMidi) % 12 + 12) % 12;
    const intervals = SCALE_INTERVALS[scale];

    let closestDegree = 1;
    let minDistance = 999;

    intervals.forEach((interval, idx) => {
      const dist = Math.abs(interval - semitonesFromRoot);
      if (dist < minDistance) {
        minDistance = dist;
        closestDegree = idx + 1;
      }
    });

    return {
      frequency: Math.round(frequency * 10) / 10,
      midiNote,
      noteName,
      centsDeviation,
      closestDegree,
      clarity: Math.round(clarity * 100) / 100,
    };
  }
}
