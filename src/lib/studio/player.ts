/** Local playback controller with an AudioWorklet pitch-preserving path and native fallback. */
export class StudioPlayer {
  audio = typeof Audio !== 'undefined' ? new Audio() : null;
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private node: AudioWorkletNode | null = null;
  private loop?: { start: number; end: number };

  async load(blob: Blob): Promise<void> { if (!this.audio) return; this.audio.src = URL.createObjectURL(blob); this.audio.preload = 'auto'; this.audio.loop = false; }
  async enablePitchPreservation(): Promise<boolean> {
    if (!this.audio || this.node) return Boolean(this.node);
    try {
      const { SoundTouchNode } = await import('@soundtouchjs/audio-worklet');
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctor(); await this.ctx.resume();
      await SoundTouchNode.register(this.ctx, '/soundtouch-processor.js');
      this.source = this.ctx.createMediaElementSource(this.audio);
      const soundTouch = new SoundTouchNode({ context: this.ctx });
      this.source.connect(soundTouch); soundTouch.connect(this.ctx.destination);
      this.node = soundTouch; this.audio.preservesPitch = false;
      return true;
    } catch { if (this.audio) this.audio.preservesPitch = true; return false; }
  }
  setRate(rate: number): void { if (!this.audio) return; this.audio.playbackRate = rate; if (this.node) (this.node.parameters.get('playbackRate') ?? { value: 1 }).value = rate; }
  setLoop(start?: number, end?: number): void { this.loop = start !== undefined && end !== undefined ? { start, end } : undefined; }
  bindTimeUpdate(callback: (time: number) => void): () => void { const handler = () => { if (this.audio && this.loop && this.audio.currentTime >= this.loop.end) this.audio.currentTime = this.loop.start; callback(this.audio?.currentTime ?? 0); }; this.audio?.addEventListener('timeupdate', handler); return () => this.audio?.removeEventListener('timeupdate', handler); }
  seek(time: number): void { if (this.audio) this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration || time)); }
  play(): Promise<void> { return this.audio?.play() ?? Promise.resolve(); }
  pause(): void { this.audio?.pause(); }
  dispose(): void { this.pause(); if (this.audio?.src) URL.revokeObjectURL(this.audio.src); this.source?.disconnect(); this.node?.disconnect(); void this.ctx?.close(); }
}
