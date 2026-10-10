/* ==========================================================================
   NEUROLAB - Web Audio API Synthesizer Engine
   Zero external dependencies, instant feedback, high fidelity sound effects
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('neurolab_muted') === 'true';
    this.initContext();
  }

  initContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  ensureContext() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('neurolab_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /* Play gentle UI tap */
  playTap(pitch = 600) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /* Correct action chime */
  playSuccess() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  /* Error / Incorrect buzzer */
  playError() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  /* Simon Pad Harmonic Note */
  playSimon(index) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const freqs = [329.63, 261.63, 220.00, 164.81]; // E4, C4, A3, E3
    const freq = freqs[index % freqs.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  /* Dual N-Back Auditory Letter Stimulus */
  playLetter(letter) {
    if (this.muted) return;
    this.ensureContext();

    // Use speech synthesis if available for crisp distinct letters, fallback to synth tones
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } else if (this.ctx) {
      const charCode = letter.charCodeAt(0);
      const freq = 200 + (charCode % 12) * 50;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    }
  }

  /* Radiant Level Up / Win Fanfare */
  playVictory() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  /* A finished drill becomes a short piece. Correct notes sit on a
     pentatonic. A miss detunes. Faster taps are shorter. */
  rememberTrial(trial) {
    if (!this.phrase) this.phrase = [];
    this.phrase.push({
      correct: !!trial.correct,
      rt: trial.rt || 600,
      domain: trial.domain || 'memory'
    });
    if (this.phrase.length > 48) this.phrase.shift();
  }

  playMind(trials) {
    const notes = (trials && trials.length ? trials : this.phrase || []).slice(-32);
    if (!notes.length || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    let t = this.ctx.currentTime + 0.06;
    notes.forEach((note, i) => {
      const base = scale[i % scale.length];
      const freq = note.correct ? base : base * 0.943;
      const dur = Math.max(0.09, Math.min(0.32, (note.rt || 560) / 2200));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = note.correct ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(note.correct ? 0.09 : 0.05, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur * 0.82;
    });
  }
}

window.soundEngine = new SoundEngine();
