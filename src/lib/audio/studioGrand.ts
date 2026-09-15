export type StudioGrandStatus = 'idle' | 'loading' | 'ready' | 'fallback';

const ROOT = '/audio/studio-grand';
const MIDI_NOTES = [60, 63, 66, 69, 72, 75, 78, 81, 84];
const NOTE_NAMES = ['C4', 'D#4', 'F#4', 'A4', 'C5', 'D#5', 'F#5', 'A5', 'C6'];

/** A compact, two-dynamic sampled grand piano for EarLab's training register. */
export class StudioGrand {
  private buffers = new Map<string, AudioBuffer>();
  private pending = new Map<string, Promise<AudioBuffer | null>>();
  private status: StudioGrandStatus = 'idle';

  public getStatus(): StudioGrandStatus { return this.status; }
  public loadedCount(): number { return this.buffers.size; }

  public async prepare(ctx: BaseAudioContext, targetMidi = 60): Promise<void> {
    const closest = this.closestMidi(targetMidi);
    const nearby = MIDI_NOTES.filter((m) => Math.abs(m - closest) <= 3);
    this.status = 'loading';
    await Promise.all(nearby.flatMap((m) => [this.load(ctx, m, 4), this.load(ctx, m, 12)]));
    this.status = this.buffers.size > 0 ? 'ready' : 'fallback';
  }

  /** Returns immediately with an already-decoded buffer; begins an async preload on a cache miss. */
  public take(ctx: BaseAudioContext, targetMidi: number, velocity: number): { buffer: AudioBuffer; sourceMidi: number } | null {
    const sourceMidi = this.closestMidi(targetMidi);
    const dynamic = velocity >= 0.94 ? 12 : 4;
    const key = this.key(sourceMidi, dynamic);
    const cached = this.buffers.get(key);
    if (cached) return { buffer: cached, sourceMidi };
    void this.prepare(ctx, targetMidi);
    return null;
  }

  public async clear(): Promise<void> {
    this.buffers.clear();
    this.pending.clear();
    this.status = 'idle';
    if ('caches' in window) {
      const cache = await caches.open('earlab-audio-v1');
      await Promise.all((await cache.keys()).map((request) => cache.delete(request)));
    }
  }

  public async storageBytes(): Promise<number | null> {
    if (!navigator.storage?.estimate) return null;
    const estimate = await navigator.storage.estimate();
    return estimate.usage ?? null;
  }

  private closestMidi(target: number): number {
    return MIDI_NOTES.reduce((best, midi) => Math.abs(midi - target) < Math.abs(best - target) ? midi : best, MIDI_NOTES[0]);
  }

  private key(midi: number, dynamic: number): string { return `${midi}-${dynamic}`; }

  private async load(ctx: BaseAudioContext, midi: number, dynamic: number): Promise<AudioBuffer | null> {
    const key = this.key(midi, dynamic);
    if (this.buffers.has(key)) return this.buffers.get(key)!;
    if (this.pending.has(key)) return this.pending.get(key)!;
    const promise = (async () => {
      try {
        const noteName = NOTE_NAMES[MIDI_NOTES.indexOf(midi)];
        // `#` in sharp-note filenames is a URL fragment delimiter, so encode the
        // filename segment before fetching (F#4 becomes F%234).
        const fileName = encodeURIComponent(`${noteName}v${dynamic}.opus`);
        const url = `${ROOT}/${fileName}`;
        let response: Response | undefined;
        if ('caches' in window) {
          const cache = await caches.open('earlab-audio-v1');
          response = await cache.match(url);
          if (!response) {
            response = await fetch(url);
            if (response.ok) await cache.put(url, response.clone());
          }
        } else {
          response = await fetch(url);
        }
        if (!response?.ok) throw new Error('Audio sample unavailable');
        const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
        this.buffers.set(key, buffer);
        this.status = 'ready';
        return buffer;
      } catch {
        if (this.buffers.size === 0) this.status = 'fallback';
        return null;
      } finally {
        this.pending.delete(key);
      }
    })();
    this.pending.set(key, promise);
    return promise;
  }
}
