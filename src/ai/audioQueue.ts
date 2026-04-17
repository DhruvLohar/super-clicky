export class AudioQueue {
  private context: AudioContext;
  private nextPlayTime = 0;
  private scheduledNodes: AudioBufferSourceNode[] = [];
  private aborted = false;

  constructor() {
    this.context = new AudioContext();
  }

  async enqueue(buffer: ArrayBuffer): Promise<void> {
    if (this.aborted) return;

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    const decoded = await this.context.decodeAudioData(buffer);
    if (this.aborted) return;

    const source = this.context.createBufferSource();
    source.buffer = decoded;
    source.connect(this.context.destination);

    const startAt = Math.max(this.nextPlayTime, this.context.currentTime + 0.05);
    source.start(startAt);
    this.nextPlayTime = startAt + decoded.duration;

    this.scheduledNodes.push(source);
    source.onended = () => {
      const idx = this.scheduledNodes.indexOf(source);
      if (idx !== -1) this.scheduledNodes.splice(idx, 1);
    };
  }

  reset(): void {
    this.aborted = true;
    for (const node of this.scheduledNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    }
    this.scheduledNodes = [];
    this.context.close().catch(() => {});
  }

  get isActive(): boolean {
    return !this.aborted && this.scheduledNodes.length > 0;
  }
}
