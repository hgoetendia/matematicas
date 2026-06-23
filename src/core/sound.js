/**
 * Efectos de sonido con WebAudio. Sin archivos: se sintetizan tonos cortos.
 * Todo es tolerante a fallos: si no hay audio disponible, simplemente no suena.
 * El estado de silencio se recuerda en localStorage.
 */
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('matematicas:muted') === '1';
} catch {
  /* sin almacenamiento */
}

function audioCtx() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = AC ? new AC() : null;
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

function tone(freq, duration = 0.15, type = 'sine', when = 0, gain = 0.08) {
  const a = audioCtx();
  if (!a || muted) return;
  if (a.state === 'suspended') a.resume();
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(a.destination);
  const t = a.currentTime + when;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

export const sound = {
  correct() {
    tone(660, 0.12, 'sine', 0);
    tone(880, 0.16, 'sine', 0.1);
  },
  wrong() {
    tone(196, 0.25, 'sawtooth', 0, 0.05);
  },
  timeout() {
    tone(150, 0.3, 'square', 0, 0.04);
  },
  finish() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'sine', i * 0.12));
  },
  get muted() {
    return muted;
  },
  toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem('matematicas:muted', muted ? '1' : '0');
    } catch {
      /* sin almacenamiento */
    }
    return muted;
  },
};
