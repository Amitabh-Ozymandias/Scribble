// Web Audio API procedural sound synthesizer for zero-dependency audio effects

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute(): boolean {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
}

export function getIsMuted(): boolean {
  return isAudioMuted;
}

/**
 * 🎯 Played when a player makes a correct guess (cheerful double chime)
 */
export function playCorrectGuess() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "triangle";
  osc2.type = "sine";

  // Note 1: A5 (880Hz)
  osc1.frequency.setValueAtTime(880, now);
  // Note 2: D6 (1174.66Hz)
  osc1.frequency.setValueAtTime(1174.66, now + 0.1);

  osc2.frequency.setValueAtTime(440, now);
  osc2.frequency.setValueAtTime(587.33, now + 0.1);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.35);
  osc2.stop(now + 0.35);
}

/**
 * ⏱️ Played when the timer ticks down (last 10 seconds warning)
 */
export function playTimerTick() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * ⏰ Played when turn ends
 */
export function playTurnEnd() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(392.00, now + 0.15); // G4

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

/**
 * 🏆 Played when the game ends and podium opens (victory fanfare)
 */
export function playGameWin() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.12);

    gain.gain.setValueAtTime(0.15, now + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.3);
  });
}

/**
 * ✏️ Played when a word is selected
 */
export function playWordSelect() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(659.25, now + 0.08);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}
