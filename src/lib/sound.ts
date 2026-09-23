export type SoundKind = "tap" | "advance" | "success" | "celebrate";
export type DanceStyle = "bachata" | "salsa";

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
    osc.frequency.exponentialRampToValueAtTime(
      preset.freq * 1.5,
      now + preset.duration,
    );
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(preset.gain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + preset.duration + 0.02);
}

type HitKind = "kick" | "snare" | "tick" | "wood" | "clave";

function playHit(
  ctx: AudioContext,
  kind: HitKind,
  time: number,
  muted: boolean,
  gainScale = 1,
) {
  if (muted) return;

  if (kind === "kick") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.11 * gainScale, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.2);
    return;
  }

  if (kind === "snare") {
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.07 * gainScale, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.1);
    return;
  }

  const freqs: Record<Exclude<HitKind, "kick" | "snare">, number> = {
    tick: 980,
    wood: 420,
    clave: 1360,
  };
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind === "clave" ? "triangle" : "square";
  osc.frequency.setValueAtTime(freqs[kind], time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(
    (kind === "clave" ? 0.045 : 0.035) * gainScale,
    time + 0.008,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    time + (kind === "wood" ? 0.07 : 0.05),
  );
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.09);
}

/** Soft looping pad so the dance feels musical until real tracks are added. */
function scheduleMusicBed(
  ctx: AudioContext,
  style: DanceStyle,
  time: number,
  muted: boolean,
) {
  if (muted) return;

  const chords =
    style === "bachata"
      ? [
          [196.0, 246.94, 293.66], // G minor-ish
          [174.61, 220.0, 261.63], // F
          [146.83, 196.0, 233.08], // D minor
          [164.81, 207.65, 246.94], // E dim-ish
        ]
      : [
          [130.81, 164.81, 196.0], // C
          [146.83, 185.0, 220.0], // D
          [164.81, 196.0, 246.94], // E minor
          [174.61, 220.0, 261.63], // F
        ];

  const barIndex = Math.floor(time * 0.5) % chords.length;
  const chord = chords[barIndex] ?? chords[0];
  const master = 0.018;

  for (const freq of chord) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(master, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.85);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.9);
  }
}

export type RhythmBeat = {
  /** Zero-based step index within the pattern (bachata 0-3, salsa 0-7). */
  step: number;
  /** Whether this beat is a "danced" step the user should tap. */
  active: boolean;
  label: string;
};

export type RhythmPattern = {
  style: DanceStyle;
  bpm: number;
  stepsPerBar: number;
  /** Labels shown under each pad. */
  labels: string[];
  /** Which step indices count as taps the dancer hits. */
  activeSteps: number[];
};

export const RHYTHM_PATTERNS: Record<DanceStyle, RhythmPattern> = {
  bachata: {
    style: "bachata",
    bpm: 108,
    stepsPerBar: 4,
    labels: ["1", "2", "3", "tap"],
    activeSteps: [0, 1, 2, 3],
  },
  salsa: {
    style: "salsa",
    bpm: 152,
    stepsPerBar: 8,
    labels: ["1", "2", "3", "...", "5", "6", "7", "..."],
    activeSteps: [0, 1, 2, 4, 5, 6],
  },
};

type ScheduledBeat = {
  step: number;
  time: number;
  active: boolean;
  judged: boolean;
};

export type RhythmLoopHandle = {
  stop: () => void;
  /** Judge a tap against the audio clock (early + late grace). */
  judgeTap: () => "hit" | "miss";
};

let activeLoop: RhythmLoopHandle | null = null;

/**
 * Starts a looping rhythm for bachata or salsa.
 * Uses a synth bed by default; pass `musicSrc` when real tracks are ready
 * (e.g. `/audio/bachata.mp3`, `/audio/salsa.mp3`).
 */
export function startRhythmLoop(
  style: DanceStyle,
  options: {
    muted?: boolean;
    bpm?: number;
    /** Optional looping track. Falls back to synth bed when missing/unloadable. */
    musicSrc?: string;
    onBeat?: (beat: RhythmBeat) => void;
  } = {},
): RhythmLoopHandle {
  stopRhythmLoop();

  const pattern = RHYTHM_PATTERNS[style];
  const bpm = options.bpm ?? pattern.bpm;
  const muted = options.muted ?? false;
  const ctx = getContext();

  const scheduled: ScheduledBeat[] = [];
  let musicEl: HTMLAudioElement | null = null;
  // If a track is configured, never play synth tap cues (even while it loads).
  let usingTrack = Boolean(options.musicSrc);

  if (!ctx) {
    const handle: RhythmLoopHandle = {
      stop: () => undefined,
      judgeTap: () => "miss",
    };
    activeLoop = handle;
    return handle;
  }

  void ctx.resume();

  if (options.musicSrc && typeof Audio !== "undefined") {
    musicEl = new Audio(options.musicSrc);
    musicEl.loop = true;
    musicEl.volume = muted ? 0 : 0.42;
    musicEl.preload = "auto";
    musicEl.addEventListener("error", () => {
      usingTrack = false;
      musicEl = null;
    });
    void musicEl.play().then(
      () => {
        usingTrack = true;
      },
      () => {
        usingTrack = false;
        musicEl = null;
      },
    );
  }

  const beatDuration = 60 / bpm;
  /** Generous window so tapping with the signal (or slightly early) counts. */
  const hitWindow = Math.min(0.22, beatDuration * 0.42);
  let step = 0;
  let stopped = false;
  let timer: number | null = null;
  let nextTime = ctx.currentTime + 0.12;
  let bedCounter = 0;

  const bachataHits: HitKind[] = ["kick", "wood", "kick", "tick"];
  const salsaHits: (HitKind | null)[] = [
    "kick",
    "clave",
    "snare",
    null,
    "kick",
    "clave",
    "snare",
    null,
  ];

  function pruneBeats(now: number) {
    while (scheduled.length > 0 && scheduled[0]!.time < now - hitWindow * 2) {
      scheduled.shift();
    }
  }

  function scheduleAhead() {
    if (stopped || !ctx) return;
    const horizon = ctx.currentTime + 0.35;
    while (nextTime < horizon) {
      const label = pattern.labels[step] ?? String(step + 1);
      const active = pattern.activeSteps.includes(step);
      const hit =
        style === "bachata" ? bachataHits[step] : salsaHits[step];

      // With a real track, only the song plays (no synthetic tap/step cues).
      if (!usingTrack && hit) playHit(ctx, hit, nextTime, muted, 1);

      if (!usingTrack && step === 0) {
        scheduleMusicBed(ctx, style, nextTime, muted);
        bedCounter += 1;
        if (bedCounter % 2 === 0) {
          // Extra warmth every other bar
          scheduleMusicBed(ctx, style, nextTime + beatDuration * 0.5, muted);
        }
      }

      scheduled.push({
        step,
        time: nextTime,
        active,
        judged: false,
      });
      pruneBeats(ctx.currentTime);

      const scheduledTime = nextTime;
      const scheduledStep = step;
      const scheduledActive = active;
      const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (stopped) return;
        options.onBeat?.({
          step: scheduledStep,
          active: scheduledActive,
          label,
        });
      }, delayMs);

      step = (step + 1) % pattern.stepsPerBar;
      nextTime += beatDuration;
    }
    timer = window.setTimeout(scheduleAhead, 25);
  }

  scheduleAhead();

  const handle: RhythmLoopHandle = {
    stop: () => {
      stopped = true;
      if (timer !== null) window.clearTimeout(timer);
      if (musicEl) {
        musicEl.pause();
        musicEl.src = "";
        musicEl = null;
      }
      if (activeLoop === handle) activeLoop = null;
    },
    judgeTap: () => {
      if (stopped || !ctx) return "miss";
      const now = ctx.currentTime;
      pruneBeats(now);

      let best: ScheduledBeat | null = null;
      let bestDelta = Number.POSITIVE_INFINITY;

      for (const beat of scheduled) {
        if (!beat.active || beat.judged) continue;
        const delta = Math.abs(beat.time - now);
        if (delta <= hitWindow && delta < bestDelta) {
          best = beat;
          bestDelta = delta;
        }
      }

      if (!best) return "miss";
      best.judged = true;
      return "hit";
    },
  };
  activeLoop = handle;
  return handle;
}

export function stopRhythmLoop(): void {
  activeLoop?.stop();
  activeLoop = null;
}

export function getActiveRhythmLoop(): RhythmLoopHandle | null {
  return activeLoop;
}

export function playStepTap(muted = false): void {
  playSound("tap", muted);
}
