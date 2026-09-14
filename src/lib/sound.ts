export type SoundKind = "tap" | "advance" | "success" | "celebrate";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

const presets: Record<
  SoundKind,
  { freq: number; duration: number; type: OscillatorType; gain: number }
> = {
  tap: { freq: 520, duration: 0.06, type: "sine", gain: 0.03 },
  advance: { freq: 660, duration: 0.1, type: "triangle", gain: 0.04 },
  success: { freq: 784, duration: 0.18, type: "sine", gain: 0.05 },
  celebrate: { freq: 880, duration: 0.35, type: "triangle", gain: 0.06 },
};

/** Soft synthesized cues — no external audio assets required. */
export function playSound(kind: SoundKind, muted = false): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;

  void ctx.resume();
  const preset = presets[kind];
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = preset.type;
  osc.frequency.setValueAtTime(preset.freq, now);
  if (kind === "celebrate") {
    osc.frequency.exponentialRampToValueAtTime(preset.freq * 1.5, now + preset.duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(preset.gain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + preset.duration + 0.02);
}
