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
}

window.soundEngine = new SoundEngine();
/* ==========================================================================
   NEUROLAB - High Performance Canvas Confetti Engine
   60fps physics particles with gravity, flutter, and vibrant jewel colors
   ========================================================================== */

class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.colors = ['#00f0ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ffffff'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 90) {
    if (!this.canvas) return;
    this.resize();

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2.5;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 5 + Math.random() * 7,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.particles.length) {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Friction
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      // Draw confetti rectangle
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.confettiEngine = new ConfettiEngine();
/* ==========================================================================
   NEUROLAB - Cognitive State & Progress Tracking Engine
   Local storage persistence, Neuro Quotient (NQ) algorithm & domain metrics
   ========================================================================== */

class BrainState {
  constructor() {
    this.STORAGE_KEY = 'neurolab_state_v1';
    this.data = this.loadState();
    this.verifyStreak();
  }

  getDefaultState() {
    return {
      nq: 1040, // Base Neuro Quotient (Normalized 800 - 1600 scale)
      totalGamesPlayed: 0,
      streak: 1,
      lastPlayedDate: new Date().toISOString().split('T')[0],
      domains: {
        memory: 68,
        speed: 62,
        focus: 74,
        logic: 65,
        spatial: 60
      },
      highScores: {},
      dailyWorkout: {
        date: new Date().toISOString().split('T')[0],
        games: ['chimp-test', 'stroop', 'game-2048'],
        completed: false,
        progress: 0
      }
    };
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse localStorage state', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  verifyStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = this.data.lastPlayedDate;

    if (last !== today) {
      const lastDate = new Date(last);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.data.streak += 1;
      } else if (diffDays > 1) {
        // Streak reset
        this.data.streak = 1;
      }

      this.data.lastPlayedDate = today;

      // Reset daily workout for new day
      if (this.data.dailyWorkout.date !== today) {
        const pool = ['dual-nback', 'chimp-test', 'stroop', 'schulte-grid', 'memory-matrix', 'simon-seq', 'tower-hanoi', 'game-2048', 'speed-math', 'lights-out', 'wordle', 'mental-rotation'];
        // Pick 3 varied games
        const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
        this.data.dailyWorkout = {
          date: today,
          games: shuffled,
          completed: false,
          progress: 0
        };
      }
      this.saveState();
    }
  }

  recordGame(gameId, score, domain, performanceRatio = 1.0) {
    this.data.totalGamesPlayed += 1;

    // Update High Score
    const prevHigh = this.data.highScores[gameId] || 0;
    const isNewHigh = score > prevHigh;
    if (isNewHigh) {
      this.data.highScores[gameId] = score;
    }

    // Adaptive Domain Score Adjust (Bounded 30 to 100)
    if (domain && this.data.domains[domain] !== undefined) {
      const current = this.data.domains[domain];
      const delta = (performanceRatio - 0.5) * 4; // Scaled adjustment
      this.data.domains[domain] = Math.min(100, Math.max(30, Math.round(current + delta)));
    }

    // Update Neuro Quotient (NQ)
    const avgDomain = Object.values(this.data.domains).reduce((a, b) => a + b, 0) / 5;
    this.data.nq = Math.round(800 + (avgDomain / 100) * 800);

    // Update Daily Workout if applicable
    if (!this.data.dailyWorkout.completed && this.data.dailyWorkout.games.includes(gameId)) {
      this.data.dailyWorkout.progress += 1;
      if (this.data.dailyWorkout.progress >= this.data.dailyWorkout.games.length) {
        this.data.dailyWorkout.completed = true;
      }
    }

    this.saveState();

    // Trigger update callbacks
    if (window.radarChart) {
      window.radarChart.update(this.data.domains);
    }
    if (window.app) {
      window.app.renderStats();
    }

    return {
      isNewHigh,
      nq: this.data.nq,
      domainScore: this.data.domains[domain]
    };
  }

  getHighScore(gameId) {
    return this.data.highScores[gameId] || 0;
  }
}

window.brainState = new BrainState();
/* ==========================================================================
   NEUROLAB - Brain Metrics Canvas Radar Chart
   High-DPI retina rendering, glowing polygon, smooth vertex interpolation
   ========================================================================== */

class BrainRadarChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.axes = [
      { key: 'memory', label: 'Memory', color: '#8b5cf6' },
      { key: 'speed', label: 'Speed', color: '#00f0ff' },
      { key: 'focus', label: 'Focus', color: '#ec4899' },
      { key: 'logic', label: 'Logic', color: '#10b981' },
      { key: 'spatial', label: 'Spatial', color: '#f59e0b' }
    ];

    this.currentValues = [60, 60, 60, 60, 60];
    this.targetValues = [60, 60, 60, 60, 60];
    this.animating = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    });

    if (window.brainState) {
      this.update(window.brainState.data.domains, true);
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 280;
    this.height = rect.height || 250;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  update(domainObj, instant = false) {
    this.targetValues = this.axes.map(axis => domainObj[axis.key] || 50);
    if (instant) {
      this.currentValues = [...this.targetValues];
      this.draw();
    } else if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  animate() {
    let diff = 0;
    for (let i = 0; i < this.currentValues.length; i++) {
      const step = (this.targetValues[i] - this.currentValues[i]) * 0.15;
      this.currentValues[i] += step;
      diff += Math.abs(this.targetValues[i] - this.currentValues[i]);
    }

    this.draw();

    if (diff > 0.5) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.currentValues = [...this.targetValues];
      this.draw();
      this.animating = false;
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 34;

    ctx.clearRect(0, 0, this.width, this.height);

    const count = this.axes.length;
    const angleStep = (Math.PI * 2) / count;

    // 1. Draw Concentric Polygonal Web Rings
    const levels = 4;
    for (let l = 1; l <= levels; l++) {
      const levelRadius = (radius / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Draw Spokes / Axis Lines
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();

      // Axis Label
      const labelDist = radius + 22;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;

      ctx.font = '600 11px Outfit, sans-serif';
      ctx.fillStyle = this.axes[i].color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.axes[i].label, lx, ly);
    }

    // 3. Draw Cognitive Polygon with Glowing Fill
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const valRatio = Math.max(0.1, Math.min(1, this.currentValues[i] / 100));
      const valRadius = radius * valRatio;
      const x = centerX + Math.cos(angle) * valRadius;
      const y = centerY + Math.sin(angle) * valRadius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Radial Gradient Fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.35)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.15)');

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // 4. Draw Glowing Vertex Points
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const valRatio = Math.max(0.1, Math.min(1, this.currentValues[i] / 100));
      const valRadius = radius * valRatio;
      const x = centerX + Math.cos(angle) * valRadius;
      const y = centerY + Math.sin(angle) * valRadius;

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = this.axes[i].color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

window.initRadarChart = () => {
  window.radarChart = new BrainRadarChart('brain-radar-chart');
};
/* ==========================================================================
   NEUROLAB - Background Synaptic Neural Network Animation
   Bioluminescent neural nodes with dynamic axonal pulses & magnetic cursor
   ========================================================================== */

class NeuralParticles {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.pulses = [];
    this.mouse = { x: null, y: null, radius: 175 };

    this.palette = ['#00f5ff', '#9d65ff', '#10b981', '#ffaa00', '#ff3366'];

    this.resize();
    this.initNodes();

    window.addEventListener('resize', () => {
      this.resize();
      this.initNodes();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initNodes() {
    this.nodes = [];
    // Density: roughly 1 node per 20000px²
    const count = Math.floor((this.width * this.height) / 20000);
    const nodeCount = Math.max(40, Math.min(90, count));

    for (let i = 0; i < nodeCount; i++) {
      const color = this.palette[Math.floor(Math.random() * this.palette.length)];
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: 1.5 + Math.random() * 2.2,
        color: color,
        alpha: 0.3 + Math.random() * 0.5,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = performance.now() * 0.002;

    // Update & draw nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];

      n.x += n.vx;
      n.y += n.vy;

      // Bounce edges
      if (n.x < 0 || n.x > this.width) n.vx *= -1;
      if (n.y < 0 || n.y > this.height) n.vy *= -1;

      // Dynamic breathing radius
      const currentRadius = n.radius + Math.sin(now + n.pulseOffset) * 0.6;

      // Draw node glow aura
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, currentRadius * 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = n.color;
      this.ctx.globalAlpha = n.alpha * 0.25;
      this.ctx.fill();

      // Draw solid node core
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = n.alpha;
      this.ctx.fill();

      // Connect to nearby nodes (synaptic firing)
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n.x - n2.x;
        const dy = n.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const lineAlpha = (1 - dist / 140) * 0.26;
          this.ctx.beginPath();
          this.ctx.moveTo(n.x, n.y);
          this.ctx.lineTo(n2.x, n2.y);
          this.ctx.strokeStyle = n.color;
          this.ctx.globalAlpha = lineAlpha;
          this.ctx.lineWidth = 0.9;
          this.ctx.stroke();

          // Occasional synaptic electric pulse spark
          if (dist < 100 && (i + j) % 7 === 0) {
            const pulseProgress = (Math.sin(now * 2 + i) + 1) / 2;
            const px = n.x + (n2.x - n.x) * pulseProgress;
            const py = n.y + (n2.y - n.y) * pulseProgress;

            this.ctx.beginPath();
            this.ctx.arc(px, py, 1.6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = lineAlpha * 1.8;
            this.ctx.fill();
          }
        }
      }

      // Magnetic attraction & connection to mouse cursor
      if (this.mouse.x !== null) {
        const mdx = n.x - this.mouse.x;
        const mdy = n.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < this.mouse.radius) {
          const mouseAlpha = (1 - mdist / this.mouse.radius) * 0.45;
          this.ctx.beginPath();
          this.ctx.moveTo(n.x, n.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = '#00f5ff';
          this.ctx.globalAlpha = mouseAlpha;
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

window.initNeuralParticles = () => {
  new NeuralParticles();
};
/* ==========================================================================
   NEUROLAB - Game 1: Dual N-Back
   The scientifically validated working memory & fluid intelligence task
   ========================================================================== */

class DualNBackGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.n = 2; // Default 2-back
    this.totalTrials = 20;
    this.trialIndex = 0;
    this.trialInterval = null;
    this.trialDuration = 2800; // ms per trial
    this.flashDuration = 1000; // ms stimulus is active

    this.letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
    this.history = []; // Array of { pos: 0-8, letter: 'A' }

    // Scoring metrics
    this.posHits = 0;
    this.posFalseAlarms = 0;
    this.posMisses = 0;
    this.audioHits = 0;
    this.audioFalseAlarms = 0;
    this.audioMisses = 0;

    // Responses for current trial
    this.userPosMatched = false;
    this.userAudioMatched = false;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="nback-container">
          <div class="nback-status-pill">
            <span>Level: <strong>${this.n}-Back</strong></span>
            <span>Trial: <strong id="nback-trial-num">0</strong> / ${this.totalTrials}</span>
            <div class="nback-audio-indicator" id="nback-audio-ind">
              <span>🔊 Audio: <span id="nback-letter-disp">-</span></span>
            </div>
          </div>

          <div class="nback-grid" id="nback-grid">
            ${Array.from({ length: 9 }).map((_, i) => `<div class="nback-cell" data-idx="${i}"></div>`).join('')}
          </div>

          <div class="nback-controls">
            <button class="btn-nback-match visual" id="btn-pos-match">
              <strong>Visual Match</strong>
              <span class="nback-key-hint">Press [ A ] or Tap</span>
            </button>
            <button class="btn-nback-match audio" id="btn-audio-match">
              <strong>Audio Match</strong>
              <span class="nback-key-hint">Press [ L ] or Tap</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.btnPos = this.container.querySelector('#btn-pos-match');
    this.btnAudio = this.container.querySelector('#btn-audio-match');
    this.gridCells = this.container.querySelectorAll('.nback-cell');

    this.btnPos.addEventListener('click', () => this.handlePosMatch());
    this.btnAudio.addEventListener('click', () => this.handleAudioMatch());

    this.keyHandler = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        this.btnPos.classList.add('active-press');
        this.handlePosMatch();
        setTimeout(() => this.btnPos.classList.remove('active-press'), 150);
      } else if (e.key === 'l' || e.key === 'L') {
        this.btnAudio.classList.add('active-press');
        this.handleAudioMatch();
        setTimeout(() => this.btnAudio.classList.remove('active-press'), 150);
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.startTrialLoop();
  }

  startTrialLoop() {
    this.trialIndex = 0;
    this.runTrial();
    this.trialInterval = setInterval(() => {
      this.evaluatePreviousTrial();
      this.trialIndex++;
      if (this.trialIndex >= this.totalTrials) {
        this.finishGame();
      } else {
        this.runTrial();
      }
    }, this.trialDuration);
  }

  runTrial() {
    this.userPosMatched = false;
    this.userAudioMatched = false;
    this.btnPos.classList.remove('active-press');
    this.btnAudio.classList.remove('active-press');

    document.getElementById('nback-trial-num').innerText = this.trialIndex + 1;

    // Generate trial stimulus
    // 30% chance to force a match if trial > n
    let pos, letter;
    const canMatch = this.trialIndex >= this.n;

    if (canMatch && Math.random() < 0.35) {
      pos = this.history[this.trialIndex - this.n].pos;
    } else {
      pos = Math.floor(Math.random() * 9);
    }

    if (canMatch && Math.random() < 0.35) {
      letter = this.history[this.trialIndex - this.n].letter;
    } else {
      letter = this.letters[Math.floor(Math.random() * this.letters.length)];
    }

    this.history.push({ pos, letter });

    // Activate visual cell
    this.gridCells.forEach(c => c.classList.remove('active'));
    this.gridCells[pos].classList.add('active');

    // Play Audio Letter
    document.getElementById('nback-letter-disp').innerText = letter;
    if (window.soundEngine) {
      window.soundEngine.playLetter(letter);
    }

    // Deactivate visual cell after flash duration
    setTimeout(() => {
      this.gridCells.forEach(c => c.classList.remove('active'));
      document.getElementById('nback-letter-disp').innerText = '-';
    }, this.flashDuration);
  }

  handlePosMatch() {
    if (this.userPosMatched) return;
    this.userPosMatched = true;
    if (window.soundEngine) window.soundEngine.playTap(700);
    this.btnPos.classList.add('active-press');
  }

  handleAudioMatch() {
    if (this.userAudioMatched) return;
    this.userAudioMatched = true;
    if (window.soundEngine) window.soundEngine.playTap(900);
    this.btnAudio.classList.add('active-press');
  }

  evaluatePreviousTrial() {
    if (this.trialIndex < this.n) return; // Warmup trials

    const targetPos = this.history[this.trialIndex - this.n].pos;
    const currentPos = this.history[this.trialIndex].pos;
    const isPosMatch = targetPos === currentPos;

    const targetLetter = this.history[this.trialIndex - this.n].letter;
    const currentLetter = this.history[this.trialIndex].letter;
    const isAudioMatch = targetLetter === currentLetter;

    // Position evaluation
    if (isPosMatch) {
      if (this.userPosMatched) this.posHits++;
      else this.posMisses++;
    } else if (this.userPosMatched) {
      this.posFalseAlarms++;
    }

    // Audio evaluation
    if (isAudioMatch) {
      if (this.userAudioMatched) this.audioHits++;
      else this.audioMisses++;
    } else if (this.userAudioMatched) {
      this.audioFalseAlarms++;
    }
  }

  finishGame() {
    clearInterval(this.trialInterval);
    window.removeEventListener('keydown', this.keyHandler);

    const eligibleTrials = this.totalTrials - this.n;
    const totalHits = this.posHits + this.audioHits;
    const totalErrors = this.posMisses + this.posFalseAlarms + this.audioMisses + this.audioFalseAlarms;

    // Calculate score
    const accuracy = Math.max(0, Math.round(((totalHits * 1.5 - totalErrors * 0.5) / (eligibleTrials * 1.5)) * 100));
    const finalScore = Math.max(100, Math.round(accuracy * 12 + this.n * 200));

    if (window.confettiEngine && accuracy > 65) {
      window.confettiEngine.fire(80);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'dual-nback',
      score: finalScore,
      domain: 'memory',
      accuracy: `${accuracy}%`,
      details: `Visual Hits: ${this.posHits} | Audio Hits: ${this.audioHits} | Errors: ${totalErrors}`,
      performanceRatio: accuracy / 100
    });
  }

  destroy() {
    clearInterval(this.trialInterval);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.DualNBackGame = DualNBackGame;
/* ==========================================================================
   NEUROLAB - Game 2: Chimp Test (Ayumu Primate Memory Benchmark)
   Tests rapid visuospatial working memory and photographic recall
   ========================================================================== */

class ChimpTestGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.rows = 5;
    this.cols = 8;
    this.level = 4; // Start with 4 numbers
    this.strikes = 0;
    this.maxStrikes = 3;
    this.currentExpected = 1;
    this.tiles = []; // Active tiles on board
    this.isMasked = false;

    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="chimp-container">
          <div class="chimp-hud">
            <div>Numbers to recall: <strong id="chimp-num-count">${this.level}</strong></div>
            <div class="chimp-strikes">
              <div class="strike-dot" id="strike-1"></div>
              <div class="strike-dot" id="strike-2"></div>
              <div class="strike-dot" id="strike-3"></div>
            </div>
          </div>

          <div class="chimp-board" id="chimp-board">
            ${Array.from({ length: this.rows * this.cols })
              .map((_, i) => `<div class="chimp-cell" data-idx="${i}"></div>`)
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.boardEl = this.container.querySelector('#chimp-board');
  }

  startRound() {
    this.currentExpected = 1;
    this.isMasked = false;
    document.getElementById('chimp-num-count').innerText = this.level;

    // Clear board cells
    const cells = this.boardEl.querySelectorAll('.chimp-cell');
    cells.forEach(c => c.innerHTML = '');

    // Pick unique random positions
    const totalCells = this.rows * this.cols;
    const indices = [];
    while (indices.length < this.level) {
      const rand = Math.floor(Math.random() * totalCells);
      if (!indices.includes(rand)) indices.push(rand);
    }

    // Place tiles 1 to N
    this.tiles = indices.map((cellIdx, valIdx) => {
      const num = valIdx + 1;
      const cell = cells[cellIdx];
      const tile = document.createElement('div');
      tile.className = 'chimp-tile';
      tile.innerText = num;
      tile.dataset.value = num;

      tile.addEventListener('click', () => this.handleTileClick(tile, num));
      cell.appendChild(tile);
      return tile;
    });
  }

  handleTileClick(tile, value) {
    if (value === this.currentExpected) {
      // First click masks all tiles
      if (this.currentExpected === 1 && !this.isMasked) {
        this.isMasked = true;
        this.tiles.forEach(t => t.classList.add('masked'));
      }

      tile.classList.remove('masked');
      tile.classList.add('correct');
      if (window.soundEngine) window.soundEngine.playTap(500 + value * 50);

      this.currentExpected++;

      // Completed round successfully!
      if (this.currentExpected > this.level) {
        if (window.soundEngine) window.soundEngine.playSuccess();
        this.level++;
        setTimeout(() => this.startRound(), 800);
      }
    } else {
      // Wrong tile click!
      tile.classList.remove('masked');
      tile.classList.add('wrong');
      if (window.soundEngine) window.soundEngine.playError();

      // Reveal all tiles
      this.tiles.forEach(t => {
        t.classList.remove('masked');
        if (parseInt(t.dataset.value) === this.currentExpected) {
          t.style.borderColor = '#00f0ff';
        }
      });

      this.strikes++;
      const strikeDot = document.getElementById(`strike-${this.strikes}`);
      if (strikeDot) strikeDot.classList.add('filled');

      if (this.strikes >= this.maxStrikes) {
        setTimeout(() => this.gameOver(), 1200);
      } else {
        setTimeout(() => this.startRound(), 1400);
      }
    }
  }

  gameOver() {
    const finalScore = (this.level - 1) * 280;
    const ayumuComp = this.level >= 9
      ? 'Chimpanzee Master: You rival Ayumu’s legendary memory!'
      : this.level >= 7
      ? 'Superior Human: Outperforming 85% of adult humans!'
      : 'Average Human: Strong baseline, keep training your visuospatial buffer.';

    if (window.confettiEngine && this.level >= 7) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'chimp-test',
      score: finalScore,
      domain: 'memory',
      accuracy: `Max: ${this.level - 1} Numbers`,
      details: ayumuComp,
      performanceRatio: Math.min(1, (this.level - 1) / 10)
    });
  }

  destroy() {}
}

window.ChimpTestGame = ChimpTestGame;
/* ==========================================================================
   NEUROLAB - Game 3: Stroop Color Clash
   Measures executive function, prefrontal cognitive control & inhibition
   ========================================================================== */

class StroopGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;

    this.colors = [
      { name: 'Red', hex: '#ef4444', key: '1' },
      { name: 'Blue', hex: '#00f0ff', key: '2' },
      { name: 'Green', hex: '#10b981', key: '3' },
      { name: 'Yellow', hex: '#f59e0b', key: '4' }
    ];

    this.timeLeft = 30;
    this.timer = null;
    this.score = 0;
    this.streak = 0;
    this.totalAttempts = 0;
    this.correctAttempts = 0;
    this.responseTimes = [];
    this.lastWordTime = Date.now();

    this.currentInkColor = null;

    this.render();
    this.startTimer();
    this.nextWord();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="stroop-container">
          <div class="nback-status-pill">
            <span>Time: <strong id="stroop-timer">30</strong>s</span>
            <span>Score: <strong id="stroop-score">0</strong></span>
            <span>Streak: <strong id="stroop-streak" style="color:var(--amber-primary)">0x</strong> 🔥</span>
          </div>

          <div class="stroop-card">
            <span class="stroop-instruction">Select the INK color (NOT the word!)</span>
            <div class="stroop-word" id="stroop-word">READY</div>
          </div>

          <div class="stroop-options">
            ${this.colors
              .map(
                (c, i) => `
                <button class="btn-stroop-color" data-color="${c.name}" style="border-color:${c.hex}; color:${c.hex};">
                  ${c.name} <span style="font-size:0.75rem; opacity:0.6;">[${c.key}]</span>
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.wordEl = this.container.querySelector('#stroop-word');
    this.timerEl = this.container.querySelector('#stroop-timer');
    this.scoreEl = this.container.querySelector('#stroop-score');
    this.streakEl = this.container.querySelector('#stroop-streak');

    // Click listeners
    this.container.querySelectorAll('.btn-stroop-color').forEach(btn => {
      btn.addEventListener('click', () => this.handleAnswer(btn.dataset.color));
    });

    // Keyboard listeners
    this.keyHandler = (e) => {
      const match = this.colors.find(c => c.key === e.key);
      if (match) this.handleAnswer(match.name);
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  nextWord() {
    this.lastWordTime = Date.now();

    // 70% chance incongruent (different word and color), 30% congruent
    const wordItem = this.colors[Math.floor(Math.random() * this.colors.length)];
    let inkItem;

    if (Math.random() < 0.7) {
      const otherColors = this.colors.filter(c => c.name !== wordItem.name);
      inkItem = otherColors[Math.floor(Math.random() * otherColors.length)];
    } else {
      inkItem = wordItem;
    }

    this.currentInkColor = inkItem.name;
    this.wordEl.innerText = wordItem.name;
    this.wordEl.style.color = inkItem.hex;
    this.wordEl.style.transform = 'scale(1.05)';
    setTimeout(() => this.wordEl.style.transform = 'scale(1)', 100);
  }

  handleAnswer(selectedColor) {
    const elapsed = Date.now() - this.lastWordTime;
    this.responseTimes.push(elapsed);
    this.totalAttempts++;

    if (selectedColor === this.currentInkColor) {
      // Correct!
      this.correctAttempts++;
      this.streak++;
      const multiplier = Math.min(4, 1 + Math.floor(this.streak / 5));
      const points = Math.round((Math.max(100, 1000 - elapsed) / 10) * multiplier);
      this.score += points;

      if (window.soundEngine) window.soundEngine.playTap(600 + this.streak * 30);
    } else {
      // Mistake!
      this.streak = 0;
      this.score = Math.max(0, this.score - 50);
      if (window.soundEngine) window.soundEngine.playError();
    }

    this.scoreEl.innerText = this.score;
    this.streakEl.innerText = `${this.streak}x`;

    this.nextWord();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timerEl) this.timerEl.innerText = this.timeLeft;

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  gameOver() {
    clearInterval(this.timer);
    window.removeEventListener('keydown', this.keyHandler);

    const accuracy = this.totalAttempts > 0 ? Math.round((this.correctAttempts / this.totalAttempts) * 100) : 0;
    const avgRt = this.responseTimes.length > 0
      ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
      : 0;

    if (window.confettiEngine && this.score > 800) {
      window.confettiEngine.fire(80);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'stroop',
      score: this.score,
      domain: 'focus',
      accuracy: `${accuracy}%`,
      details: `Avg RT: ${avgRt}ms | Correct: ${this.correctAttempts} / ${this.totalAttempts}`,
      performanceRatio: Math.min(1, this.score / 2000)
    });
  }

  destroy() {
    clearInterval(this.timer);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.StroopGame = StroopGame;
/* ==========================================================================
   NEUROLAB - Game 4: Schulte Grid (5x5)
   Scientific assessment of visual scanning speed, peripheral vision & attention
   ========================================================================== */

class SchulteGridGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.nextTarget = 1;
    this.maxNum = 25;
    this.startTime = null;
    this.timerInterval = null;
    this.elapsedMs = 0;

    this.render();
    this.start();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="schulte-container">
          <div class="schulte-target-banner">
            <span>Find: <strong class="schulte-target-num" id="schulte-target">1</strong></span>
            <span>Time: <strong id="schulte-timer">0.00</strong>s</span>
          </div>

          <div class="schulte-board" id="schulte-board">
            <div class="schulte-center-cross"></div>
            <!-- 25 tiles injected here -->
          </div>

          <div style="font-size:0.8rem; color:var(--text-muted); text-align:center;">
            Tip: Keep your eyes focused on the center red marker and use peripheral vision to locate numbers.
          </div>
        </div>
      </div>
    `;

    this.boardEl = this.container.querySelector('#schulte-board');
    this.targetEl = this.container.querySelector('#schulte-target');
    this.timerEl = this.container.querySelector('#schulte-timer');
  }

  start() {
    this.nextTarget = 1;
    this.targetEl.innerText = this.nextTarget;

    // Shuffle 1 to 25
    const nums = Array.from({ length: this.maxNum }, (_, i) => i + 1);
    nums.sort(() => 0.5 - Math.random());

    // Clear and build tiles
    const existing = this.boardEl.querySelectorAll('.schulte-tile');
    existing.forEach(e => e.remove());

    nums.forEach(num => {
      const tile = document.createElement('div');
      tile.className = 'schulte-tile';
      tile.innerText = num;
      tile.dataset.num = num;

      tile.addEventListener('click', () => this.handleTileClick(tile, num));
      this.boardEl.appendChild(tile);
    });

    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedMs = Date.now() - this.startTime;
      this.timerEl.innerText = (this.elapsedMs / 1000).toFixed(2);
    }, 50);
  }

  handleTileClick(tile, num) {
    if (num === this.nextTarget) {
      tile.classList.add('found');
      if (window.soundEngine) window.soundEngine.playTap(450 + num * 25);

      this.nextTarget++;

      if (this.nextTarget > this.maxNum) {
        this.finishGame();
      } else {
        this.targetEl.innerText = this.nextTarget;
      }
    } else {
      if (window.soundEngine) window.soundEngine.playError();
      tile.style.borderColor = 'var(--crimson-alert)';
      setTimeout(() => tile.style.borderColor = '', 300);
    }
  }

  finishGame() {
    clearInterval(this.timerInterval);
    const totalSec = this.elapsedMs / 1000;

    // Rating based on astronaut / pilot standards:
    // < 28s = Elite, 28-38s = Superior, 38-50s = Good, > 50s = Developing
    const rating = totalSec < 28
      ? 'Elite: Astronaut-grade visual search speed!'
      : totalSec < 40
      ? 'Superior: Excellent peripheral scanning capability.'
      : 'Good: Solid focus, practice will expand your field of view.';

    const score = Math.max(100, Math.round(3000 - totalSec * 45));

    if (window.confettiEngine && totalSec < 42) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'schulte-grid',
      score,
      domain: 'speed',
      accuracy: `${totalSec.toFixed(2)}s`,
      details: rating,
      performanceRatio: Math.max(0.2, Math.min(1, (60 - totalSec) / 40))
    });
  }

  destroy() {
    clearInterval(this.timerInterval);
  }
}

window.SchulteGridGame = SchulteGridGame;
/* ==========================================================================
   NEUROLAB - Game 5: Memory Matrix
   Dynamic spatial pattern recall training the parietal-hippocampal circuit
   ========================================================================== */

class MemoryMatrixGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.gridSize = 3; // 3x3 to 6x6
    this.activeCount = 3;
    this.level = 1;
    this.strikes = 0;
    this.maxStrikes = 3;
    this.targetCells = new Set();
    this.selectedCells = new Set();
    this.isInputAllowed = false;
    this.score = 0;

    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="matrix-container">
          <div class="nback-status-pill">
            <span>Level: <strong id="matrix-lvl">1</strong></span>
            <span>Grid: <strong id="matrix-dim">3x3</strong></span>
            <span>Strikes: <strong id="matrix-strikes" style="color:var(--crimson-alert)">0 / 3</strong></span>
            <span>Score: <strong id="matrix-score">0</strong></span>
          </div>

          <div class="matrix-grid" id="matrix-grid"></div>

          <div style="font-size:0.85rem; color:var(--text-muted); text-align:center;">
            Memorize the highlighted tiles before they turn dark!
          </div>
        </div>
      </div>
    `;

    this.gridEl = this.container.querySelector('#matrix-grid');
    this.lvlEl = this.container.querySelector('#matrix-lvl');
    this.dimEl = this.container.querySelector('#matrix-dim');
    this.strikesEl = this.container.querySelector('#matrix-strikes');
    this.scoreEl = this.container.querySelector('#matrix-score');
  }

  startRound() {
    this.isInputAllowed = false;
    this.targetCells.clear();
    this.selectedCells.clear();

    // Scale grid dimensions based on level
    if (this.level >= 8) {
      this.gridSize = 6;
      this.activeCount = 8 + Math.floor((this.level - 8) / 2);
    } else if (this.level >= 5) {
      this.gridSize = 5;
      this.activeCount = 5 + Math.floor((this.level - 5) / 2);
    } else if (this.level >= 3) {
      this.gridSize = 4;
      this.activeCount = 4 + Math.floor((this.level - 3) / 2);
    } else {
      this.gridSize = 3;
      this.activeCount = 3;
    }

    this.lvlEl.innerText = this.level;
    this.dimEl.innerText = `${this.gridSize}x${this.gridSize}`;
    this.gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 64px)`;
    this.gridEl.style.gridTemplateRows = `repeat(${this.gridSize}, 64px)`;

    // Build cells
    this.gridEl.innerHTML = '';
    const total = this.gridSize * this.gridSize;

    // Pick random target indices
    while (this.targetCells.size < this.activeCount) {
      this.targetCells.add(Math.floor(Math.random() * total));
    }

    const cells = [];
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';
      cell.dataset.idx = i;

      cell.addEventListener('click', () => this.handleCellClick(cell, i));
      this.gridEl.appendChild(cell);
      cells.push(cell);
    }

    // Flash target cells for 1200ms
    setTimeout(() => {
      cells.forEach((cell, idx) => {
        if (this.targetCells.has(idx)) {
          cell.classList.add('flash');
        }
      });

      setTimeout(() => {
        cells.forEach(c => c.classList.remove('flash'));
        this.isInputAllowed = true;
      }, 1200);
    }, 400);
  }

  handleCellClick(cell, idx) {
    if (!this.isInputAllowed || this.selectedCells.has(idx)) return;
    this.selectedCells.add(idx);

    if (this.targetCells.has(idx)) {
      cell.classList.add('selected-correct');
      if (window.soundEngine) window.soundEngine.playTap(520 + this.selectedCells.size * 40);

      // Check if all targets are found
      let correctCount = 0;
      this.targetCells.forEach(t => {
        if (this.selectedCells.has(t)) correctCount++;
      });

      if (correctCount === this.targetCells.size) {
        this.isInputAllowed = false;
        this.score += this.activeCount * 120;
        this.scoreEl.innerText = this.score;
        this.level++;
        if (window.soundEngine) window.soundEngine.playSuccess();
        setTimeout(() => this.startRound(), 900);
      }
    } else {
      cell.classList.add('selected-wrong');
      this.isInputAllowed = false;
      this.strikes++;
      this.strikesEl.innerText = `${this.strikes} / ${this.maxStrikes}`;
      if (window.soundEngine) window.soundEngine.playError();

      // Show targets briefly
      this.gridEl.querySelectorAll('.matrix-cell').forEach((c, i) => {
        if (this.targetCells.has(i)) c.classList.add('flash');
      });

      if (this.strikes >= this.maxStrikes) {
        setTimeout(() => this.gameOver(), 1400);
      } else {
        setTimeout(() => this.startRound(), 1400);
      }
    }
  }

  gameOver() {
    if (window.confettiEngine && this.level >= 6) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'memory-matrix',
      score: this.score,
      domain: 'memory',
      accuracy: `Level ${this.level} (${this.gridSize}x${this.gridSize})`,
      details: `Recalled up to ${this.activeCount} simultaneous spatial coordinates`,
      performanceRatio: Math.min(1, this.level / 10)
    });
  }

  destroy() {}
}

window.MemoryMatrixGame = MemoryMatrixGame;
/* ==========================================================================
   NEUROLAB - Game 6: Simon Sequence (Audio-Visual Memory)
   Sequencing memory challenge using harmonious frequencies & light pulses
   ========================================================================== */

class SimonGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.isPlayingSequence = false;

    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="simon-container">
          <div class="simon-circle-wrap">
            <button class="simon-pad tl" data-pad="0"></button>
            <button class="simon-pad tr" data-pad="1"></button>
            <button class="simon-pad bl" data-pad="2"></button>
            <button class="simon-pad br" data-pad="3"></button>

            <div class="simon-center-hub">
              <span class="simon-hub-label">Streak</span>
              <span class="simon-hub-count" id="simon-count">0</span>
            </div>
          </div>

          <div id="simon-status-msg" style="font-size:0.9rem; color:var(--text-secondary); text-align:center;">
            Listen & watch the sequence...
          </div>
        </div>
      </div>
    `;

    this.pads = this.container.querySelectorAll('.simon-pad');
    this.countEl = this.container.querySelector('#simon-count');
    this.statusEl = this.container.querySelector('#simon-status-msg');

    this.pads.forEach(pad => {
      pad.addEventListener('click', () => {
        if (this.isPlayingSequence) return;
        const idx = parseInt(pad.dataset.pad);
        this.handlePlayerInput(idx);
      });
    });
  }

  startRound() {
    this.sequence.push(Math.floor(Math.random() * 4));
    this.playerStep = 0;
    this.countEl.innerText = this.sequence.length - 1;
    this.playSequence();
  }

  async playSequence() {
    this.isPlayingSequence = true;
    this.statusEl.innerText = 'Memorizing sequence...';
    this.statusEl.style.color = 'var(--cyan-primary)';

    await new Promise(r => setTimeout(r, 600));

    const delay = Math.max(280, 550 - this.sequence.length * 15);

    for (let i = 0; i < this.sequence.length; i++) {
      const padIdx = this.sequence[i];
      await this.activatePad(padIdx, delay * 0.7);
      await new Promise(r => setTimeout(r, delay * 0.3));
    }

    this.isPlayingSequence = false;
    this.statusEl.innerText = 'Your turn! Repeat the pattern.';
    this.statusEl.style.color = 'var(--text-secondary)';
  }

  activatePad(padIdx, duration = 300) {
    return new Promise(resolve => {
      const pad = this.pads[padIdx];
      pad.classList.add('active');
      if (window.soundEngine) window.soundEngine.playSimon(padIdx);

      setTimeout(() => {
        pad.classList.remove('active');
        resolve();
      }, duration);
    });
  }

  handlePlayerInput(idx) {
    this.activatePad(idx, 220);

    if (idx === this.sequence[this.playerStep]) {
      this.playerStep++;

      // Completed full sequence
      if (this.playerStep >= this.sequence.length) {
        this.score = this.sequence.length * 150;
        this.countEl.innerText = this.sequence.length;
        this.statusEl.innerText = 'Perfect! Next sequence incoming...';
        this.statusEl.style.color = 'var(--emerald-primary)';

        setTimeout(() => this.startRound(), 1000);
      }
    } else {
      // Wrong pad clicked!
      if (window.soundEngine) window.soundEngine.playError();
      this.statusEl.innerText = 'Sequence broken!';
      this.statusEl.style.color = 'var(--crimson-alert)';

      this.pads.forEach(p => p.classList.add('active'));
      setTimeout(() => {
        this.pads.forEach(p => p.classList.remove('active'));
        this.gameOver();
      }, 700);
    }
  }

  gameOver() {
    const rounds = Math.max(0, this.sequence.length - 1);
    if (window.confettiEngine && rounds >= 8) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'simon-seq',
      score: rounds * 180,
      domain: 'memory',
      accuracy: `${rounds} Notes Sequence`,
      details: rounds >= 10 ? 'Phenomenal acoustic-spatial memory!' : 'Solid sequence retention.',
      performanceRatio: Math.min(1, rounds / 14)
    });
  }

  destroy() {}
}

window.SimonGame = SimonGame;
/* ==========================================================================
   NEUROLAB - Game 7: Tower of Hanoi
   Classic recursive planning & prefrontal working memory puzzle
   Includes interactive manual solve + animated AI recursive auto-solver
   ========================================================================== */

class TowerHanoiGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.diskCount = 4;
    this.rods = [[], [], []]; // Array of disk sizes [4, 3, 2, 1]
    this.selectedRod = null;
    this.moves = 0;
    this.optimalMoves = Math.pow(2, this.diskCount) - 1;
    this.isAutoSolving = false;

    this.diskColors = [
      '#00f0ff', // 1 - Smallest
      '#8b5cf6', // 2
      '#ec4899', // 3
      '#10b981', // 4
      '#f59e0b', // 5 - Largest
    ];

    this.render();
    this.resetGame();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="hanoi-container">
          <div class="nback-status-pill">
            <span>Disks: 
              <select id="hanoi-disk-select" style="background:transparent; border:none; color:var(--cyan-primary); font-weight:700; cursor:pointer;">
                <option value="3" ${this.diskCount === 3 ? 'selected' : ''}>3 Disks</option>
                <option value="4" ${this.diskCount === 4 ? 'selected' : ''}>4 Disks</option>
                <option value="5" ${this.diskCount === 5 ? 'selected' : ''}>5 Disks</option>
              </select>
            </span>
            <span>Moves: <strong id="hanoi-moves">0</strong></span>
            <span>Optimal: <strong id="hanoi-optimal">${this.optimalMoves}</strong></span>
          </div>

          <div class="hanoi-board">
            <div class="hanoi-board-base"></div>
            <div class="hanoi-rod-wrap" data-rod="0">
              <div class="hanoi-peg"></div>
            </div>
            <div class="hanoi-rod-wrap" data-rod="1">
              <div class="hanoi-peg"></div>
            </div>
            <div class="hanoi-rod-wrap" data-rod="2">
              <div class="hanoi-peg"></div>
            </div>
          </div>

          <div style="display:flex; gap:1rem;">
            <button class="btn-secondary" id="btn-hanoi-reset">Reset</button>
            <button class="btn-primary" id="btn-hanoi-autosolve">
              <span>🤖 Watch AI Recursive Solver</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.rodWraps = this.container.querySelectorAll('.hanoi-rod-wrap');
    this.movesEl = this.container.querySelector('#hanoi-moves');
    this.optimalEl = this.container.querySelector('#hanoi-optimal');
    this.diskSelect = this.container.querySelector('#hanoi-disk-select');
    this.btnReset = this.container.querySelector('#btn-hanoi-reset');
    this.btnAutoSolve = this.container.querySelector('#btn-hanoi-autosolve');

    this.rodWraps.forEach(wrap => {
      wrap.addEventListener('click', () => {
        if (this.isAutoSolving) return;
        const rodIdx = parseInt(wrap.dataset.rod);
        this.handleRodClick(rodIdx);
      });
    });

    this.diskSelect.addEventListener('change', (e) => {
      this.diskCount = parseInt(e.target.value);
      this.optimalMoves = Math.pow(2, this.diskCount) - 1;
      this.optimalEl.innerText = this.optimalMoves;
      this.resetGame();
    });

    this.btnReset.addEventListener('click', () => this.resetGame());
    this.btnAutoSolve.addEventListener('click', () => this.runAutoSolver());
  }

  resetGame() {
    this.isAutoSolving = false;
    this.selectedRod = null;
    this.moves = 0;
    this.movesEl.innerText = this.moves;

    // Disks stored largest to smallest: [4, 3, 2, 1]
    this.rods = [
      Array.from({ length: this.diskCount }, (_, i) => this.diskCount - i),
      [],
      []
    ];

    this.renderDisks();
  }

  renderDisks() {
    this.rodWraps.forEach((wrap, rodIdx) => {
      const existing = wrap.querySelectorAll('.hanoi-disk');
      existing.forEach(d => d.remove());

      const diskArray = this.rods[rodIdx];
      diskArray.forEach((diskSize, i) => {
        const diskEl = document.createElement('div');
        diskEl.className = 'hanoi-disk';
        const widthPercent = 35 + (diskSize / this.diskCount) * 60;
        diskEl.style.width = `${widthPercent}%`;
        diskEl.style.background = this.diskColors[diskSize - 1] || '#00f0ff';
        diskEl.innerText = diskSize;

        // If top disk on selected rod, visually elevate
        if (rodIdx === this.selectedRod && i === diskArray.length - 1) {
          diskEl.classList.add('selected');
        }

        wrap.appendChild(diskEl);
      });
    });
  }

  handleRodClick(rodIdx) {
    if (this.selectedRod === null) {
      // Selecting source rod
      if (this.rods[rodIdx].length > 0) {
        this.selectedRod = rodIdx;
        if (window.soundEngine) window.soundEngine.playTap(500);
        this.renderDisks();
      }
    } else {
      // Placing disk on target rod
      const sourceRod = this.selectedRod;
      const targetRod = rodIdx;
      this.selectedRod = null;

      if (sourceRod === targetRod) {
        this.renderDisks();
        return;
      }

      const sourceDisk = this.rods[sourceRod][this.rods[sourceRod].length - 1];
      const targetTop = this.rods[targetRod].length > 0 
        ? this.rods[targetRod][this.rods[targetRod].length - 1] 
        : Infinity;

      if (sourceDisk < targetTop) {
        // Legal move!
        this.rods[sourceRod].pop();
        this.rods[targetRod].push(sourceDisk);
        this.moves++;
        this.movesEl.innerText = this.moves;
        if (window.soundEngine) window.soundEngine.playTap(600 + sourceDisk * 50);

        this.renderDisks();

        // Check victory (all disks on rod 2)
        if (this.rods[2].length === this.diskCount) {
          this.victory();
        }
      } else {
        // Illegal move (larger disk on smaller)
        if (window.soundEngine) window.soundEngine.playError();
        this.renderDisks();
      }
    }
  }

  async runAutoSolver() {
    this.resetGame();
    this.isAutoSolving = true;
    this.btnAutoSolve.disabled = true;

    const movesList = [];
    const solve = (n, from, to, aux) => {
      if (n === 1) {
        movesList.push([from, to]);
        return;
      }
      solve(n - 1, from, aux, to);
      movesList.push([from, to]);
      solve(n - 1, aux, to, from);
    };

    solve(this.diskCount, 0, 2, 1);

    for (const [from, to] of movesList) {
      if (!this.isAutoSolving) break;
      await new Promise(r => setTimeout(r, 450));
      const disk = this.rods[from].pop();
      this.rods[to].push(disk);
      this.moves++;
      this.movesEl.innerText = this.moves;
      if (window.soundEngine) window.soundEngine.playTap(650);
      this.renderDisks();
    }

    this.btnAutoSolve.disabled = false;
    this.isAutoSolving = false;
    if (this.rods[2].length === this.diskCount) {
      this.victory(true);
    }
  }

  victory(wasAuto = false) {
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.confettiEngine && !wasAuto) window.confettiEngine.fire(90);

    const efficiency = wasAuto ? 50 : Math.round((this.optimalMoves / this.moves) * 100);
    const score = wasAuto ? 300 : Math.round((this.diskCount * 400) * (efficiency / 100));

    this.onComplete({
      gameId: 'tower-hanoi',
      score,
      domain: 'logic',
      accuracy: `${efficiency}% Efficiency`,
      details: wasAuto ? 'Watched AI recursive solver demonstration' : `Solved in ${this.moves} moves (Optimal: ${this.optimalMoves})`,
      performanceRatio: efficiency / 100
    });
  }

  destroy() {
    this.isAutoSolving = false;
  }
}

window.TowerHanoiGame = TowerHanoiGame;
/* ==========================================================================
   NEUROLAB - Game 8: 2048 Neon Fusion
   Spatial numeric strategy game with keyboard & gesture sliding mechanics
   ========================================================================== */

class Game2048 {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.history = [];
    this.won = false;

    this.render();
    this.initGame();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="game2048-container">
          <div class="nback-status-pill">
            <span>Score: <strong id="g2048-score">0</strong></span>
            <button class="btn-secondary" id="btn-2048-undo" style="padding:0.35rem 0.85rem; font-size:0.8rem;">↶ Undo</button>
            <button class="btn-secondary" id="btn-2048-new" style="padding:0.35rem 0.85rem; font-size:0.8rem;">New Game</button>
          </div>

          <div class="game2048-board" id="game2048-board">
            <!-- 16 cells -->
          </div>

          <div style="font-size:0.82rem; color:var(--text-muted); text-align:center;">
            Use Arrow Keys, WASD, or Swipe to slide and merge matching numbers!
          </div>
        </div>
      </div>
    `;

    this.boardEl = this.container.querySelector('#game2048-board');
    this.scoreEl = this.container.querySelector('#g2048-score');
    this.btnUndo = this.container.querySelector('#btn-2048-undo');
    this.btnNew = this.container.querySelector('#btn-2048-new');

    this.btnUndo.addEventListener('click', () => this.undo());
    this.btnNew.addEventListener('click', () => this.initGame());

    // Keyboard controls
    this.keyHandler = (e) => {
      let moved = false;
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code) || ['ArrowUp', 'w', 'W'].includes(e.key)) {
        moved = this.move(0); // Up
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        moved = this.move(1); // Right
      } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code) || ['ArrowDown', 's', 'S'].includes(e.key)) {
        moved = this.move(2); // Down
      } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        moved = this.move(3); // Left
      }
      if (moved) e.preventDefault();
    };
    window.addEventListener('keydown', this.keyHandler);

    // Touch swipe gestures
    let touchStartX = 0, touchStartY = 0;
    this.boardEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.boardEl.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 30) {
        if (absDx > absDy) {
          if (dx > 0) this.move(1); // Right
          else this.move(3); // Left
        } else {
          if (dy > 0) this.move(2); // Down
          else this.move(0); // Up
        }
      }
    }, { passive: true });
  }

  initGame() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.score = 0;
    this.history = [];
    this.scoreEl.innerText = this.score;
    this.addRandomTile();
    this.addRandomTile();
    this.renderBoard();
  }

  addRandomTile() {
    const empty = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const { r, c } = empty[Math.floor(Math.random() * empty.length)];
      this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  renderBoard() {
    this.boardEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        const cell = document.createElement('div');
        cell.className = 'game2048-cell';
        if (val > 0) {
          cell.classList.add(`tile-${val}`);
          cell.innerText = val;
        }
        this.boardEl.appendChild(cell);
      }
    }
  }

  saveHistory() {
    this.history.push({
      grid: this.grid.map(row => [...row]),
      score: this.score
    });
    if (this.history.length > 10) this.history.shift();
  }

  undo() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      this.grid = prev.grid;
      this.score = prev.score;
      this.scoreEl.innerText = this.score;
      this.renderBoard();
      if (window.soundEngine) window.soundEngine.playTap(400);
    }
  }

  move(direction) {
    // 0: Up, 1: Right, 2: Down, 3: Left
    this.saveHistory();
    let rotated = this.rotateGrid(this.grid, direction);
    let moved = false;
    let gainedScore = 0;

    for (let r = 0; r < this.size; r++) {
      const row = rotated[r].filter(v => v !== 0);
      const newRow = [];

      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i] === row[i + 1]) {
          const merged = row[i] * 2;
          newRow.push(merged);
          gainedScore += merged;
          i++; // Skip merged partner
          if (merged === 2048 && !this.won) {
            this.won = true;
            if (window.confettiEngine) window.confettiEngine.fire(100);
            if (window.soundEngine) window.soundEngine.playVictory();
          }
        } else {
          newRow.push(row[i]);
        }
      }

      while (newRow.length < this.size) newRow.push(0);

      for (let c = 0; c < this.size; c++) {
        if (rotated[r][c] !== newRow[c]) moved = true;
      }
      rotated[r] = newRow;
    }

    if (moved) {
      this.grid = this.unrotateGrid(rotated, direction);
      this.score += gainedScore;
      this.scoreEl.innerText = this.score;
      this.addRandomTile();
      this.renderBoard();
      if (window.soundEngine) window.soundEngine.playTap(500 + gainedScore);

      if (this.checkGameOver()) {
        setTimeout(() => this.gameOver(), 600);
      }
    } else {
      this.history.pop(); // Discard unneeded history
    }
    return moved;
  }

  rotateGrid(grid, dir) {
    let result = grid.map(r => [...r]);
    for (let i = 0; i < (4 - dir) % 4; i++) {
      result = result[0].map((_, col) => result.map(row => row[col]).reverse());
    }
    return result;
  }

  unrotateGrid(grid, dir) {
    let result = grid.map(r => [...r]);
    for (let i = 0; i < dir; i++) {
      result = result[0].map((_, col) => result.map(row => row[col]).reverse());
    }
    return result;
  }

  checkGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return false;
        if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
        if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
      }
    }
    return true;
  }

  gameOver() {
    let maxTile = 0;
    this.grid.forEach(row => row.forEach(val => { if (val > maxTile) maxTile = val; }));

    this.onComplete({
      gameId: 'game-2048',
      score: this.score,
      domain: 'logic',
      accuracy: `Max Tile: ${maxTile}`,
      details: `Merged total score: ${this.score}`,
      performanceRatio: Math.min(1, this.score / 4000)
    });
  }

  destroy() {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.Game2048 = Game2048;
/* ==========================================================================
   NEUROLAB - Game 9: Speed Math Frenzy
   Rapid arithmetic calculation exercising the intraparietal sulcus & working memory
   ========================================================================== */

class SpeedMathGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.timeLeft = 60;
    this.timer = null;
    this.score = 0;
    this.streak = 0;
    this.totalSolved = 0;
    this.correctCount = 0;

    this.currentEquation = null;

    this.render();
    this.startTimer();
    this.generateProblem();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="math-container">
          <div class="nback-status-pill">
            <span>Time: <strong id="math-timer">60</strong>s</span>
            <span>Score: <strong id="math-score">0</strong></span>
            <span>Multiplier: <strong id="math-multiplier" style="color:var(--amber-primary)">1x</strong> 🔥</span>
          </div>

          <div class="math-equation-card">
            <div class="math-equation-text" id="math-equation">...</div>
          </div>

          <div class="math-options-grid" id="math-options">
            <!-- 4 answer choices -->
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#math-timer');
    this.scoreEl = this.container.querySelector('#math-score');
    this.multEl = this.container.querySelector('#math-multiplier');
    this.eqEl = this.container.querySelector('#math-equation');
    this.optsEl = this.container.querySelector('#math-options');

    this.keyHandler = (e) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && this.currentOptions && this.currentOptions[idx] !== undefined) {
        this.handleChoice(this.currentOptions[idx]);
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  generateProblem() {
    // Generate operation types: +, -, *, mixed
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(12 + Math.random() * 88);
      b = Math.floor(12 + Math.random() * 88);
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(30 + Math.random() * 90);
      b = Math.floor(10 + Math.random() * (a - 10));
      answer = a - b;
    } else {
      a = Math.floor(4 + Math.random() * 14);
      b = Math.floor(4 + Math.random() * 12);
      answer = a * b;
    }

    this.correctAnswer = answer;
    this.eqEl.innerText = `${a} ${op === '*' ? '×' : op} ${b} = ?`;

    // Generate 3 plausible distractors
    const distractors = new Set();
    while (distractors.size < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 10));
      const fake = answer + offset;
      if (fake !== answer && fake > 0) distractors.add(fake);
    }

    const options = [answer, ...distractors].sort(() => 0.5 - Math.random());
    this.currentOptions = options;

    this.optsEl.innerHTML = '';
    options.forEach((val, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn-math-opt';
      btn.innerHTML = `${val} <span style="font-size:0.8rem; opacity:0.5;">[${i + 1}]</span>`;
      btn.addEventListener('click', () => this.handleChoice(val));
      this.optsEl.appendChild(btn);
    });
  }

  handleChoice(val) {
    this.totalSolved++;
    if (val === this.correctAnswer) {
      this.correctCount++;
      this.streak++;
      const mult = Math.min(5, 1 + Math.floor(this.streak / 4));
      this.score += 50 * mult;
      if (window.soundEngine) window.soundEngine.playTap(600 + this.streak * 30);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 30);
      if (window.soundEngine) window.soundEngine.playError();
    }

    const mult = Math.min(5, 1 + Math.floor(this.streak / 4));
    this.scoreEl.innerText = this.score;
    this.multEl.innerText = `${mult}x`;

    this.generateProblem();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timerEl) this.timerEl.innerText = this.timeLeft;

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  gameOver() {
    clearInterval(this.timer);
    window.removeEventListener('keydown', this.keyHandler);

    const accuracy = this.totalSolved > 0 ? Math.round((this.correctCount / this.totalSolved) * 100) : 0;
    if (window.confettiEngine && this.score > 800) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'speed-math',
      score: this.score,
      domain: 'speed',
      accuracy: `${accuracy}% Accuracy`,
      details: `Solved ${this.correctCount} equations in 60s (${(this.correctCount / 1).toFixed(1)}/min)`,
      performanceRatio: Math.min(1, this.score / 2000)
    });
  }

  destroy() {
    clearInterval(this.timer);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.SpeedMathGame = SpeedMathGame;
/* ==========================================================================
   NEUROLAB - Game 10: Lights Out
   Classic modular arithmetic & boolean matrix parity logic puzzle
   ========================================================================== */

class LightsOutGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.size = 5;
    this.board = [];
    this.moves = 0;
    this.hintCell = null;

    this.render();
    this.newGame();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="lights-container">
          <div class="nback-status-pill">
            <span>Remaining Lights: <strong id="lights-count">0</strong></span>
            <span>Moves: <strong id="lights-moves">0</strong></span>
            <button class="btn-secondary" id="btn-lights-hint" style="padding:0.35rem 0.85rem; font-size:0.8rem;">💡 Hint</button>
            <button class="btn-secondary" id="btn-lights-new" style="padding:0.35rem 0.85rem; font-size:0.8rem;">New Board</button>
          </div>

          <div class="lights-board" id="lights-board">
            <!-- 25 light cells -->
          </div>

          <div style="font-size:0.82rem; color:var(--text-muted); text-align:center;">
            Turn off all glowing nodes. Clicking a node flips it and its 4 direct neighbors!
          </div>
        </div>
      </div>
    `;

    this.boardEl = this.container.querySelector('#lights-board');
    this.countEl = this.container.querySelector('#lights-count');
    this.movesEl = this.container.querySelector('#lights-moves');
    this.btnHint = this.container.querySelector('#btn-lights-hint');
    this.btnNew = this.container.querySelector('#btn-lights-new');

    this.btnHint.addEventListener('click', () => this.showHint());
    this.btnNew.addEventListener('click', () => this.newGame());
  }

  newGame() {
    this.moves = 0;
    this.movesEl.innerText = this.moves;
    this.hintCell = null;
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(false));

    // Guaranteed solvable: simulate 7 to 12 random valid clicks from an all-off board
    const shuffleSteps = 8 + Math.floor(Math.random() * 5);
    this.solutionMoves = [];

    for (let i = 0; i < shuffleSteps; i++) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      this.toggle(r, c);
      this.solutionMoves.push({ r, c });
    }

    this.renderBoard();
  }

  toggle(r, c) {
    const coords = [
      [r, c],
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1]
    ];

    coords.forEach(([row, col]) => {
      if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
        this.board[row][col] = !this.board[row][col];
      }
    });
  }

  renderBoard() {
    this.boardEl.innerHTML = '';
    let litCount = 0;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const isLit = this.board[r][c];
        if (isLit) litCount++;

        const tile = document.createElement('div');
        tile.className = 'light-tile';
        if (isLit) tile.classList.add('lit');
        if (this.hintCell && this.hintCell.r === r && this.hintCell.c === c) {
          tile.classList.add('hint');
        }

        tile.addEventListener('click', () => this.handleClick(r, c));
        this.boardEl.appendChild(tile);
      }
    }

    this.countEl.innerText = litCount;

    if (litCount === 0 && this.moves > 0) {
      this.victory();
    }
  }

  handleClick(r, c) {
    this.moves++;
    this.movesEl.innerText = this.moves;
    this.hintCell = null;
    this.toggle(r, c);
    if (window.soundEngine) window.soundEngine.playTap(550 + (r + c) * 35);
    this.renderBoard();
  }

  showHint() {
    // Pick first lit cell or first remaining solution move
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c]) {
          this.hintCell = { r, c };
          this.renderBoard();
          return;
        }
      }
    }
  }

  victory() {
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.confettiEngine) window.confettiEngine.fire(90);

    const score = Math.max(150, Math.round(1800 - this.moves * 40));

    this.onComplete({
      gameId: 'lights-out',
      score,
      domain: 'logic',
      accuracy: 'Cleared in ' + this.moves + ' Moves',
      details: 'Mastered modular matrix parity and inverted all nodes!',
      performanceRatio: Math.min(1, score / 1500)
    });
  }

  destroy() {}
}

window.LightsOutGame = LightsOutGame;
/* ==========================================================================
   NEUROLAB - Game 11: Wordle Master
   Verbal deduction, lexical retrieval & working memory hypothesis testing
   ========================================================================== */

class WordleGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.wordList = [
      'BRAIN', 'SMART', 'LOGIC', 'FOCUS', 'THINK', 'SOLVE', 'PULSE', 'LEARN',
      'NEURO', 'SPARK', 'FLASH', 'QUICK', 'SHARP', 'POWER', 'SKILL', 'SOLAR',
      'LIGHT', 'STORM', 'TRAIN', 'DREAM', 'CHESS', 'FORCE', 'DISCO', 'CYBER',
      'CLOUD', 'BLOOM', 'MAGIC', 'NEXUS', 'PRISM', 'AUDIO', 'PIXEL', 'MATRIX'
    ];

    this.targetWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
    this.guesses = [];
    this.currentGuess = '';
    this.maxGuesses = 6;
    this.gameOverState = false;

    this.keyStates = {}; // letter -> 'correct' | 'present' | 'absent'

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="wordle-container">
          <div class="nback-status-pill">
            <span>Target: <strong>5-Letter Word</strong></span>
            <span>Attempts: <strong id="wordle-attempt">1</strong> / 6</span>
            <span id="wordle-msg" style="color:var(--cyan-primary); font-weight:600;">Type or tap letters</span>
          </div>

          <div class="wordle-grid" id="wordle-grid">
            ${Array.from({ length: 6 })
              .map(
                (_, r) => `
                <div class="wordle-row" data-row="${r}">
                  ${Array.from({ length: 5 })
                    .map((_, c) => `<div class="wordle-tile" data-col="${c}"></div>`)
                    .join('')}
                </div>
              `
              )
              .join('')}
          </div>

          <div class="wordle-keyboard" id="wordle-kb">
            <!-- 3 rows of keyboard -->
          </div>
        </div>
      </div>
    `;

    this.gridEl = this.container.querySelector('#wordle-grid');
    this.kbEl = this.container.querySelector('#wordle-kb');
    this.msgEl = this.container.querySelector('#wordle-msg');
    this.attemptEl = this.container.querySelector('#wordle-attempt');

    this.renderKeyboard();

    this.keyHandler = (e) => {
      if (this.gameOverState) return;
      if (e.key === 'Enter') {
        this.submitGuess();
      } else if (e.key === 'Backspace') {
        this.removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        this.addLetter(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  renderKeyboard() {
    const layout = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
    ];

    this.kbEl.innerHTML = '';
    layout.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-kb-row';

      row.forEach(key => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'wordle-key';
        keyBtn.innerText = key;
        if (key === 'ENTER' || key === 'DEL') keyBtn.classList.add('wide');

        const state = this.keyStates[key];
        if (state) keyBtn.classList.add(state);

        keyBtn.addEventListener('click', () => {
          if (this.gameOverState) return;
          if (key === 'ENTER') this.submitGuess();
          else if (key === 'DEL') this.removeLetter();
          else this.addLetter(key);
        });

        rowEl.appendChild(keyBtn);
      });

      this.kbEl.appendChild(rowEl);
    });
  }

  addLetter(letter) {
    if (this.currentGuess.length < 5) {
      this.currentGuess += letter;
      this.updateCurrentRow();
      if (window.soundEngine) window.soundEngine.playTap(600);
    }
  }

  removeLetter() {
    if (this.currentGuess.length > 0) {
      this.currentGuess = this.currentGuess.slice(0, -1);
      this.updateCurrentRow();
      if (window.soundEngine) window.soundEngine.playTap(450);
    }
  }

  updateCurrentRow() {
    const rowIdx = this.guesses.length;
    const row = this.gridEl.querySelector(`.wordle-row[data-row="${rowIdx}"]`);
    if (!row) return;

    const tiles = row.querySelectorAll('.wordle-tile');
    tiles.forEach((t, i) => {
      const char = this.currentGuess[i] || '';
      t.innerText = char;
      t.classList.toggle('filled', char !== '');
    });
  }

  submitGuess() {
    if (this.currentGuess.length < 5) {
      this.msgEl.innerText = 'Not enough letters!';
      this.msgEl.style.color = 'var(--crimson-alert)';
      if (window.soundEngine) window.soundEngine.playError();
      return;
    }

    const rowIdx = this.guesses.length;
    const row = this.gridEl.querySelector(`.wordle-row[data-row="${rowIdx}"]`);
    const tiles = row.querySelectorAll('.wordle-tile');
    const guess = this.currentGuess;
    const target = this.targetWord;

    const evaluation = Array(5).fill('absent');
    const targetCounts = {};

    for (let char of target) {
      targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    // First pass: exact matches (green)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        evaluation[i] = 'correct';
        targetCounts[guess[i]]--;
        this.keyStates[guess[i]] = 'correct';
      }
    }

    // Second pass: present matches (yellow)
    for (let i = 0; i < 5; i++) {
      if (evaluation[i] !== 'correct' && targetCounts[guess[i]] > 0) {
        evaluation[i] = 'present';
        targetCounts[guess[i]]--;
        if (this.keyStates[guess[i]] !== 'correct') {
          this.keyStates[guess[i]] = 'present';
        }
      } else if (evaluation[i] !== 'correct') {
        if (!this.keyStates[guess[i]]) {
          this.keyStates[guess[i]] = 'absent';
        }
      }
    }

    // Animate tiles
    tiles.forEach((t, i) => {
      setTimeout(() => {
        t.classList.add(evaluation[i]);
      }, i * 150);
    });

    this.guesses.push(guess);
    this.currentGuess = '';
    this.renderKeyboard();

    setTimeout(() => {
      if (guess === target) {
        this.victory();
      } else if (this.guesses.length >= this.maxGuesses) {
        this.defeat();
      } else {
        this.attemptEl.innerText = this.guesses.length + 1;
        this.msgEl.innerText = 'Keep going!';
        this.msgEl.style.color = 'var(--cyan-primary)';
      }
    }, 1000);
  }

  victory() {
    this.gameOverState = true;
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.confettiEngine) window.confettiEngine.fire(90);

    const attempts = this.guesses.length;
    const score = Math.round(1800 - (attempts - 1) * 250);

    this.onComplete({
      gameId: 'wordle',
      score,
      domain: 'logic',
      accuracy: `Guessed in ${attempts}/6 tries`,
      details: `Word: ${this.targetWord}`,
      performanceRatio: (7 - attempts) / 6
    });
  }

  defeat() {
    this.gameOverState = true;
    if (window.soundEngine) window.soundEngine.playError();
    this.msgEl.innerText = `The word was ${this.targetWord}`;
    this.msgEl.style.color = 'var(--crimson-alert)';

    setTimeout(() => {
      this.onComplete({
        gameId: 'wordle',
        score: 200,
        domain: 'logic',
        accuracy: '0/6 tries',
        details: `The hidden word was ${this.targetWord}`,
        performanceRatio: 0.2
      });
    }, 1500);
  }

  destroy() {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.WordleGame = WordleGame;
/* ==========================================================================
   NEUROLAB - Game 12: Mental Rotation (3D Spatial IQ)
   Shepard & Metzler canonical 3D mental rotation & spatial transformation task
   ========================================================================== */

class MentalRotationGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.totalRounds = 5;
    this.currentRound = 0;
    this.score = 0;
    this.correctCount = 0;
    this.startTime = null;

    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="rotation-container">
          <div class="nback-status-pill">
            <span>Round: <strong id="rot-round">1</strong> / ${this.totalRounds}</span>
            <span>Score: <strong id="rot-score">0</strong></span>
            <span>Accuracy: <strong id="rot-acc" style="color:var(--cyan-primary)">100%</strong></span>
          </div>

          <div class="rotation-reference-card">
            <span class="rotation-reference-label">Reference 3D Object</span>
            <canvas class="rotation-canvas" id="rot-ref-canvas" width="160" height="160"></canvas>
          </div>

          <div style="font-size:0.85rem; color:var(--text-secondary); text-align:center;">
            Which of the 4 objects below is an <strong>exact 3D rotation</strong> of the reference object?
          </div>

          <div class="rotation-candidates-grid" id="rot-candidates">
            <!-- 4 candidate cards -->
          </div>
        </div>
      </div>
    `;

    this.roundEl = this.container.querySelector('#rot-round');
    this.scoreEl = this.container.querySelector('#rot-score');
    this.accEl = this.container.querySelector('#rot-acc');
    this.refCanvas = this.container.querySelector('#rot-ref-canvas');
    this.candidatesEl = this.container.querySelector('#rot-candidates');
  }

  /* Procedural 3D polycube generation */
  generateShape() {
    // Sequence of 3D cubes connected along orthogonal axes [x, y, z]
    const cubes = [{ x: 0, y: 0, z: 0 }];
    const dirs = [
      { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }
    ];

    while (cubes.length < 5) {
      const parent = cubes[cubes.length - 1];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const next = { x: parent.x + d.x, y: parent.y + d.y, z: parent.z + d.z };

      // Avoid self-overlap
      if (!cubes.some(c => c.x === next.x && c.y === next.y && c.z === next.z)) {
        cubes.push(next);
      }
    }
    return cubes;
  }

  // 3D 90-deg step rotations
  rotate3D(cubes, rx, ry, rz) {
    let res = cubes.map(c => ({ ...c }));

    // X-axis rotation
    for (let i = 0; i < rx % 4; i++) {
      res = res.map(c => ({ x: c.x, y: -c.z, z: c.y }));
    }
    // Y-axis rotation
    for (let i = 0; i < ry % 4; i++) {
      res = res.map(c => ({ x: c.z, y: c.y, z: -c.x }));
    }
    // Z-axis rotation
    for (let i = 0; i < rz % 4; i++) {
      res = res.map(c => ({ x: -c.y, y: c.x, z: c.z }));
    }
    return res;
  }

  // Mirror flip (creates chiral enantiomer that cannot be rotated into match)
  mirrorFlip(cubes) {
    return cubes.map(c => ({ x: -c.x, y: c.y, z: c.z }));
  }

  startRound() {
    this.startTime = Date.now();
    this.roundEl.innerText = this.currentRound + 1;

    const baseShape = this.generateShape();
    this.drawIsometric(this.refCanvas, baseShape, '#00f0ff');

    // 1 Correct rotation, 3 False (mirrored or altered)
    const candidates = [];

    // Correct rotated candidate
    const correctRot = this.rotate3D(
      baseShape,
      1 + Math.floor(Math.random() * 3),
      1 + Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 4)
    );
    candidates.push({ shape: correctRot, isMatch: true });

    // 3 Distractors (mirrored and rotated)
    for (let i = 0; i < 3; i++) {
      const mirrored = this.mirrorFlip(baseShape);
      const fakeRot = this.rotate3D(
        mirrored,
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 4)
      );
      candidates.push({ shape: fakeRot, isMatch: false });
    }

    // Shuffle candidates
    candidates.sort(() => 0.5 - Math.random());

    this.candidatesEl.innerHTML = '';
    candidates.forEach((cand, i) => {
      const card = document.createElement('div');
      card.className = 'rotation-card';

      const canvas = document.createElement('canvas');
      canvas.className = 'rotation-canvas';
      canvas.width = 130;
      canvas.height = 130;
      this.drawIsometric(canvas, cand.shape, '#8b5cf6');

      const label = document.createElement('span');
      label.style.fontSize = '0.75rem';
      label.style.color = 'var(--text-muted)';
      label.style.marginTop = '0.5rem';
      label.innerText = `Option ${String.fromCharCode(65 + i)}`;

      card.appendChild(canvas);
      card.appendChild(label);

      card.addEventListener('click', () => this.handlePick(card, cand.isMatch));
      this.candidatesEl.appendChild(card);
    });
  }

  drawIsometric(canvas, cubes, primaryColor) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const size = 18;
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    // Center coordinates
    const cx = w / 2;
    const cy = h / 2 + 10;

    // Sort cubes back-to-front by depth (x + y - z)
    const sorted = [...cubes].sort((a, b) => (a.x + a.y - a.z) - (b.x + b.y - b.z));

    sorted.forEach(c => {
      // Isometric projection
      const px = cx + (c.x - c.y) * size * cos30;
      const py = cy + (c.x + c.y) * size * sin30 - c.z * size;

      this.drawCube(ctx, px, py, size, primaryColor);
    });
  }

  drawCube(ctx, x, y, s, color) {
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    // Top face
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * cos30, y - s + s * sin30);
    ctx.lineTo(x, y - s + 2 * s * sin30);
    ctx.lineTo(x - s * cos30, y - s + s * sin30);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(x - s * cos30, y - s + s * sin30);
    ctx.lineTo(x, y - s + 2 * s * sin30);
    ctx.lineTo(x, y + s * sin30);
    ctx.lineTo(x - s * cos30, y);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(x + s * cos30, y - s + s * sin30);
    ctx.lineTo(x, y - s + 2 * s * sin30);
    ctx.lineTo(x, y + s * sin30);
    ctx.lineTo(x + s * cos30, y);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  handlePick(card, isMatch) {
    const elapsed = Date.now() - this.startTime;

    if (isMatch) {
      this.correctCount++;
      card.style.borderColor = 'var(--emerald-primary)';
      card.style.boxShadow = '0 0 25px var(--emerald-glow)';
      const pts = Math.max(100, Math.round(500 - elapsed / 25));
      this.score += pts;
      if (window.soundEngine) window.soundEngine.playSuccess();
    } else {
      card.style.borderColor = 'var(--crimson-alert)';
      card.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.5)';
      if (window.soundEngine) window.soundEngine.playError();
    }

    this.scoreEl.innerText = this.score;
    this.currentRound++;
    const acc = Math.round((this.correctCount / this.currentRound) * 100);
    this.accEl.innerText = `${acc}%`;

    setTimeout(() => {
      if (this.currentRound >= this.totalRounds) {
        this.gameOver();
      } else {
        this.startRound();
      }
    }, 900);
  }

  gameOver() {
    if (window.confettiEngine && this.score > 1200) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'mental-rotation',
      score: this.score,
      domain: 'spatial',
      accuracy: `${this.correctCount}/${this.totalRounds} Correct`,
      details: 'Evaluated 3D parietal mental rotation vectors',
      performanceRatio: this.correctCount / this.totalRounds
    });
  }

  destroy() {}
}

window.MentalRotationGame = MentalRotationGame;
/* ==========================================================================
   NEUROLAB - Core Application Controller & Platform Orchestrator
   ========================================================================== */

class AppController {
  constructor() {
    this.gamesCatalog = [
      {
        id: 'dual-nback',
        title: 'Dual N-Back',
        category: 'memory',
        icon: '🧠',
        accent: '#8b5cf6',
        desc: 'The gold-standard cognitive training task proven to expand working memory capacity and fluid IQ.',
        neuroscience: 'Activates the dorsolateral prefrontal cortex (DLPFC) by forcing simultaneous maintenance and comparison of auditory and visual representations.',
        difficulty: 'Hard',
        duration: '~3 min',
        lab: 'Jaeggi / Stanford',
        pips: 3,
        classRef: 'DualNBackGame'
      },
      {
        id: 'chimp-test',
        title: 'Ayumu Chimp Test',
        category: 'memory',
        icon: '🐒',
        accent: '#8b5cf6',
        desc: 'Recall sequential numbers scattered across a grid after they instantly mask into blank tiles.',
        neuroscience: 'Tests rapid eidetic encoding and visuospatial working memory based on Tetsuro Matsuzawa’s chimpanzee experiments at Kyoto University.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Kyoto Primate Inst.',
        pips: 2,
        classRef: 'ChimpTestGame'
      },
      {
        id: 'memory-matrix',
        title: 'Memory Matrix',
        category: 'memory',
        icon: '🧩',
        accent: '#8b5cf6',
        desc: 'Memorize and recall active spatial tiles across expanding matrix grids from 3x3 up to 6x6.',
        neuroscience: 'Targets parietal-hippocampal spatial mapping and expands instantaneous visual buffer size.',
        difficulty: 'Adaptive',
        duration: '~2 min',
        lab: 'Visuospatial Lab',
        pips: 2,
        classRef: 'MemoryMatrixGame'
      },
      {
        id: 'simon-seq',
        title: 'Simon Sequence',
        category: 'memory',
        icon: '🎵',
        accent: '#8b5cf6',
        desc: 'Sequential audio-visual memory challenge using harmonious frequencies and light quadrants.',
        neuroscience: 'Strengthens temporal auditory sequence consolidation in the superior temporal gyrus.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Temporal Auditory',
        pips: 2,
        classRef: 'SimonGame'
      },
      {
        id: 'schulte-grid',
        title: 'Schulte Grid 5x5',
        category: 'speed',
        icon: '⚡',
        accent: '#00f0ff',
        desc: 'Find numbers 1 through 25 sequentially at breakneck speed with central fixation point.',
        neuroscience: 'Developed by Walter Schulte to assess visual scanning speed, mental agility, and expand peripheral visual field.',
        difficulty: 'Medium',
        duration: '~1 min',
        lab: 'Walter Schulte 1962',
        pips: 2,
        classRef: 'SchulteGridGame'
      },
      {
        id: 'speed-math',
        title: 'Speed Math Frenzy',
        category: 'speed',
        icon: '🔢',
        accent: '#00f0ff',
        desc: 'Rapid-fire mental calculation with combos and multipliers in a 60-second time trial.',
        neuroscience: 'Stimulates the intraparietal sulcus and bilateral angular gyrus responsible for numerical processing and mental arithmetic.',
        difficulty: 'Fast',
        duration: '60 sec',
        lab: 'Parietal Sulcus',
        pips: 2,
        classRef: 'SpeedMathGame'
      },
      {
        id: 'stroop',
        title: 'Stroop Color Clash',
        category: 'focus',
        icon: '🎯',
        accent: '#ec4899',
        desc: 'Decide the color of the ink while overriding the automatic impulse to read the written word.',
        neuroscience: 'Measures executive control and cognitive inhibition in the anterior cingulate cortex (ACC).',
        difficulty: 'Medium',
        duration: '30 sec',
        lab: 'J. Ridley Stroop 1935',
        pips: 2,
        classRef: 'StroopGame'
      },
      {
        id: 'tower-hanoi',
        title: 'Tower of Hanoi',
        category: 'logic',
        icon: '🏛️',
        accent: '#10b981',
        desc: 'Classic recursive disk relocation logic puzzle with interactive AI solver demonstration.',
        neuroscience: 'Stimulates prefrontal cortex executive planning, hierarchical goal decomposition, and lookahead reasoning.',
        difficulty: 'Hard',
        duration: '~3 min',
        lab: 'Édouard Lucas 1883',
        pips: 3,
        classRef: 'TowerHanoiGame'
      },
      {
        id: 'game-2048',
        title: '2048 Neon Fusion',
        category: 'logic',
        icon: '✨',
        accent: '#10b981',
        desc: 'Slide and merge identical tiles strategically using arrow keys or swipe gestures.',
        neuroscience: 'Builds spatial anticipation, probabilistic risk estimation, and forward planning in the frontal lobes.',
        difficulty: 'Strategic',
        duration: 'Untimed',
        lab: 'Strategic Heuristics',
        pips: 2,
        classRef: 'Game2048'
      },
      {
        id: 'lights-out',
        title: 'Lights Out',
        category: 'logic',
        icon: '💡',
        accent: '#10b981',
        desc: 'Parity matrix puzzle where toggling a node flips its four direct orthogonal neighbors.',
        neuroscience: 'Trains discrete mathematics, binary logic state prediction, and mod-2 matrix transformations.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Discrete Parity Logic',
        pips: 2,
        classRef: 'LightsOutGame'
      },
      {
        id: 'wordle',
        title: 'Wordle Master',
        category: 'logic',
        icon: '🔤',
        accent: '#10b981',
        desc: 'Deduce the secret 5-letter word in 6 attempts using color-coded constraint clues.',
        neuroscience: 'Engages left-hemisphere language networks (Wernicke & Broca areas) and combinatorial elimination.',
        difficulty: 'Medium',
        duration: '~3 min',
        lab: 'Lexical Deduction',
        pips: 2,
        classRef: 'WordleGame'
      },
      {
        id: 'mental-rotation',
        title: '3D Mental Rotation',
        category: 'spatial',
        icon: '🧊',
        accent: '#f59e0b',
        desc: 'Identify matching 3D isometric polycube configurations versus chiral mirrored distractors.',
        neuroscience: 'Evaluates the parietal lobe’s spatial cognitive representation and continuous mental transformation speed.',
        difficulty: 'Hard',
        duration: '~2 min',
        lab: 'Shepard-Metzler 1971',
        pips: 3,
        classRef: 'MentalRotationGame'
      }
    ];

    this.activeFilter = 'all';
    this.searchQuery = '';
    this.activeGameInstance = null;
    this.activeGameMeta = null;
    this.dailyWorkoutActive = false;

    this.initDOM();
    this.renderStats();
    this.renderCatalog();
    this.attachGlobalEvents();

    // Deep-linking support (?game=chimp-test)
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    if (gameParam && this.gamesCatalog.some(g => g.id === gameParam)) {
      this.launchGame(gameParam);
    }
  }

  initDOM() {
    this.catalogSection = document.getElementById('catalog-section');
    this.heroSection = document.getElementById('hero-section');
    this.filterSection = document.getElementById('filter-section');
    this.arenaSection = document.getElementById('game-arena');
    this.arenaStage = document.getElementById('arena-stage');
    this.gamesGrid = document.getElementById('games-grid');

    // Stats
    this.headerNq = document.getElementById('header-nq');
    this.headerStreak = document.getElementById('header-streak');
    this.heroNq = document.getElementById('hero-nq');
    this.heroStreak = document.getElementById('hero-streak');
    this.heroGamesPlayed = document.getElementById('hero-games-played');
    this.heroDailyProgress = document.getElementById('hero-daily-progress');

    // Modals
    this.rulesModal = document.getElementById('rules-modal');
    this.summaryModal = document.getElementById('summary-modal');
  }

  renderStats() {
    const s = window.brainState.data;
    if (this.headerNq) this.headerNq.innerText = s.nq;
    if (this.headerStreak) this.headerStreak.innerText = s.streak;
    if (this.heroNq) this.heroNq.innerText = s.nq;
    if (this.heroStreak) this.heroStreak.innerText = s.streak;
    if (this.heroGamesPlayed) this.heroGamesPlayed.innerText = s.totalGamesPlayed;

    const daily = s.dailyWorkout;
    const progressText = daily.completed ? 'Completed! 🏆' : `${daily.progress} / ${daily.games.length}`;
    if (this.heroDailyProgress) this.heroDailyProgress.innerText = progressText;

    // Daily Goal Progress Bar
    const progressFraction = Math.min(1, daily.progress / daily.games.length);
    const pct = Math.round(progressFraction * 100);
    const barFill = document.getElementById('hero-goal-bar-fill');
    const barPct = document.getElementById('hero-goal-pct');
    if (barFill) barFill.style.width = `${pct}%`;
    if (barPct) barPct.innerText = `${pct}%`;

    // Radar Domain Chips
    if (s.domains) {
      const dMem = document.getElementById('chip-val-memory');
      const dSpd = document.getElementById('chip-val-speed');
      const dFoc = document.getElementById('chip-val-focus');
      const dLog = document.getElementById('chip-val-logic');
      const dSpa = document.getElementById('chip-val-spatial');
      if (dMem) dMem.innerText = s.domains.memory || 60;
      if (dSpd) dSpd.innerText = s.domains.speed || 60;
      if (dFoc) dFoc.innerText = s.domains.focus || 60;
      if (dLog) dLog.innerText = s.domains.logic || 60;
      if (dSpa) dSpa.innerText = s.domains.spatial || 60;
    }

    // Daily workout button state
    const btnDaily = document.getElementById('btn-daily-workout');
    if (btnDaily) {
      if (daily.completed) {
        btnDaily.innerHTML = '<span>🏆 Daily Workout Complete!</span>';
        btnDaily.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      } else {
        btnDaily.innerHTML = `<span>⚡ Daily Workout (${daily.progress}/${daily.games.length})</span>`;
      }
    }
  }

  renderCatalog() {
    this.gamesGrid.innerHTML = '';
    
    // Category filter
    let filtered = this.activeFilter === 'all'
      ? this.gamesCatalog
      : this.gamesCatalog.filter(g => g.category === this.activeFilter);

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.desc.toLowerCase().includes(q) || 
        g.category.toLowerCase().includes(q) ||
        (g.lab && g.lab.toLowerCase().includes(q))
      );
    }

    // Empty state
    if (filtered.length === 0) {
      this.gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 4.5rem 1.5rem; background:rgba(19,28,48,0.4); border-radius:var(--radius-xl); border:1px dashed var(--border-glass-bright);">
          <div style="font-size:2.8rem; margin-bottom:0.75rem; filter:drop-shadow(0 0 15px rgba(0,245,255,0.4));">🔍</div>
          <h3 style="color:#ffffff; font-family:var(--font-display); font-size:1.4rem; font-weight:800; margin-bottom:0.4rem;">No matching cognitive drills found</h3>
          <p style="color:var(--text-secondary); font-size:0.92rem; max-width:440px; margin:0 auto 1.25rem auto;">Try searching for another domain (e.g. "memory", "logic"), cognitive skill, or research lab.</p>
          <button class="btn-secondary" id="btn-reset-search" style="padding:0.5rem 1.2rem;">Clear Search</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const input = document.getElementById('game-search-input');
          if (input) input.value = '';
          this.searchQuery = '';
          const clearBtn = document.getElementById('search-clear-btn');
          if (clearBtn) clearBtn.style.display = 'none';
          this.renderCatalog();
        });
      }
      return;
    }

    filtered.forEach(game => {
      const highScore = window.brainState.getHighScore(game.id);
      const filledPips = game.pips || 2;

      const card = document.createElement('div');
      card.className = 'game-card';
      card.style.setProperty('--card-border', game.accent);
      card.style.setProperty('--card-glow', `${game.accent}44`);
      card.style.setProperty('--card-accent', game.accent);

      card.innerHTML = `
        <div>
          <div class="game-card-top">
            <div class="card-tags-group">
              <span class="card-category-tag" style="background:${game.accent}1f; color:${game.accent}; border:1px solid ${game.accent}55;">
                ${game.category}
              </span>
              <span class="card-science-tag">${game.lab || 'Neuro Lab'}</span>
            </div>
            <div class="card-icon-wrap" style="color:${game.accent};">${game.icon}</div>
          </div>

          <div class="game-card-content">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-desc">${game.desc}</p>
            <div class="game-meta-row">
              <span class="game-meta-item">⏱ ${game.duration}</span>
              <span class="game-meta-item">
                <span style="margin-right:2px;">Tier:</span>
                <span class="difficulty-pips">
                  <span class="pip ${filledPips >= 1 ? 'filled' : ''}"></span>
                  <span class="pip ${filledPips >= 2 ? 'filled' : ''}"></span>
                  <span class="pip ${filledPips >= 3 ? 'filled' : ''}"></span>
                </span>
                <span style="font-weight:700; color:#ffffff; margin-left:3px;">${game.difficulty}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="game-card-footer">
          <div class="high-score-wrap">
            <span class="high-score-label">Personal Best</span>
            <span class="high-score-val" style="color:${highScore > 0 ? 'var(--cyan-primary)' : 'var(--text-muted)'};">${highScore > 0 ? highScore : '—'}</span>
          </div>
          <button class="btn-card-play">Start Drill ➔</button>
        </div>
      `;

      card.addEventListener('click', () => this.launchGame(game.id));
      this.gamesGrid.appendChild(card);
    });
  }

  attachGlobalEvents() {
    // Category Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.category;
        if (window.soundEngine) window.soundEngine.playTap(700);
        this.renderCatalog();
      });
    });

    // Search Input & Clear Button
    const searchInput = document.getElementById('game-search-input');
    const searchClear = document.getElementById('search-clear-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.renderCatalog();
      });

      // Quick key shortcuts: '/' to focus search, 'Escape' to clear
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !this.activeGameInstance) {
          e.preventDefault();
          searchInput.focus();
        } else if (e.key === 'Escape' && document.activeElement === searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          if (searchClear) searchClear.style.display = 'none';
          searchInput.blur();
          this.renderCatalog();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        searchClear.style.display = 'none';
        this.renderCatalog();
        if (searchInput) searchInput.focus();
      });
    }

    // Sound toggle in header
    const btnMute = document.getElementById('btn-sound-toggle');
    if (btnMute) {
      this.updateMuteIcon(btnMute);
      btnMute.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        this.updateMuteIcon(btnMute);
      });
    }

    // Brand click (home)
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', () => this.exitToHub());
    }

    // Daily Workout Button
    const btnDaily = document.getElementById('btn-daily-workout');
    if (btnDaily) {
      btnDaily.addEventListener('click', () => this.startDailyWorkout());
    }

    // Arena Exit Button
    const btnExit = document.getElementById('btn-arena-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => this.exitToHub());
    }

    // Arena Restart Button
    const btnRestart = document.getElementById('btn-arena-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (this.activeGameMeta) this.launchGame(this.activeGameMeta.id);
      });
    }

    // Arena Rules Button
    const btnRules = document.getElementById('btn-arena-rules');
    if (btnRules) {
      btnRules.addEventListener('click', () => this.showRulesModal());
    }

    // Close Modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Summary buttons
    const btnPlayAgain = document.getElementById('btn-summary-replay');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        this.summaryModal.classList.remove('active');
        if (this.activeGameMeta) this.launchGame(this.activeGameMeta.id);
      });
    }

    const btnNextGame = document.getElementById('btn-summary-next');
    if (btnNextGame) {
      btnNextGame.addEventListener('click', () => {
        this.summaryModal.classList.remove('active');
        if (this.dailyWorkoutActive) {
          this.advanceDailyWorkout();
        } else {
          this.exitToHub();
        }
      });
    }
  }

  updateMuteIcon(btn) {
    const isMuted = window.soundEngine.isMuted();
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
  }

  launchGame(gameId) {
    const meta = this.gamesCatalog.find(g => g.id === gameId);
    if (!meta) return;

    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }

    this.activeGameMeta = meta;

    // Switch view to arena
    this.heroSection.style.display = 'none';
    this.filterSection.style.display = 'none';
    this.catalogSection.style.display = 'none';
    this.arenaSection.classList.add('active');

    // Update HUD
    const titleEl = document.getElementById('arena-game-title') || document.getElementById('arena-title');
    const catEl = document.getElementById('arena-game-cat') || document.getElementById('arena-cat');
    const bestEl = document.getElementById('arena-high-score') || document.getElementById('arena-best');
    if (titleEl) titleEl.innerText = meta.title;
    if (catEl) {
      catEl.innerText = meta.category.toUpperCase();
      catEl.style.color = meta.accent;
    }
    if (bestEl) bestEl.innerText = window.brainState.getHighScore(meta.id) || '—';

    // Clear stage and instantiate game
    this.arenaStage.innerHTML = '';

    const GameClass = window[meta.classRef];
    if (GameClass) {
      this.activeGameInstance = new GameClass(this.arenaStage, (result) => {
        this.handleGameComplete(result);
      });
    } else {
      this.arenaStage.innerHTML = `<p style="color:var(--crimson-alert);">Game engine not loaded.</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleGameComplete(result) {
    const record = window.brainState.recordGame(
      result.gameId,
      result.score,
      result.domain,
      result.performanceRatio || 0.75
    );

    this.renderStats();

    // Show summary modal
    const summaryTitle = document.getElementById('summary-title') || document.getElementById('summary-game-title');
    if (summaryTitle) summaryTitle.innerText = `${this.activeGameMeta.title} Completed`;
    const summaryScore = document.getElementById('summary-score');
    if (summaryScore) summaryScore.innerText = result.score;
    const summaryAcc = document.getElementById('summary-accuracy');
    if (summaryAcc) summaryAcc.innerText = result.accuracy || '100%';
    const summaryDet = document.getElementById('summary-details');
    if (summaryDet) summaryDet.innerText = result.details || '';
    const summaryNq = document.getElementById('summary-nq-change');
    if (summaryNq) summaryNq.innerText = `Updated Cognitive Quotient (NQ): ${record.nq}`;

    const newHighBadge = document.getElementById('summary-new-record') || document.getElementById('summary-new-high');
    if (newHighBadge) {
      newHighBadge.style.display = record.isNewHigh ? 'inline-block' : 'none';
    }

    const nextBtn = document.getElementById('btn-summary-next');
    if (nextBtn) {
      if (this.dailyWorkoutActive) {
        nextBtn.innerText = 'Next Daily Drill ➔';
      } else {
        nextBtn.innerText = 'Back to Hub ➔';
      }
    }

    if (this.summaryModal) this.summaryModal.classList.add('active');
    if (window.confettiEngine && (record.isNewHigh || result.performanceRatio > 0.8)) {
      window.confettiEngine.fire(80);
    }
  }

  startDailyWorkout() {
    this.dailyWorkoutActive = true;
    const daily = window.brainState.data.dailyWorkout;
    const gameId = daily.games[daily.progress] || daily.games[0];
    this.launchGame(gameId);
  }

  advanceDailyWorkout() {
    const daily = window.brainState.data.dailyWorkout;
    if (daily.completed || daily.progress >= daily.games.length) {
      this.dailyWorkoutActive = false;
      this.exitToHub();
      if (window.confettiEngine) window.confettiEngine.fire(120);
    } else {
      const nextGameId = daily.games[daily.progress];
      this.launchGame(nextGameId);
    }
  }

  showRulesModal() {
    if (!this.activeGameMeta) return;
    const meta = this.activeGameMeta;

    const titleEl = document.getElementById('rules-modal-title');
    if (titleEl) titleEl.innerText = `${meta.title} — Protocols`;
    const bodyEl = document.getElementById('rules-modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <p style="font-size:1.02rem; margin-bottom:1.35rem; color:#ffffff; line-height:1.6;">${meta.desc}</p>
        <div class="modal-neuro-callout">
          <strong>🔬 Clinical Neuroscience Foundation</strong>
          <span>${meta.neuroscience}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:1.25rem; margin-top:1.35rem; font-size:0.88rem; color:var(--text-muted);">
          <span>⏱ Duration: <strong style="color:#ffffff;">${meta.duration}</strong></span>
          <span>🔥 Difficulty: <strong style="color:var(--amber-primary);">${meta.difficulty}</strong></span>
          <span>🏛 Lab: <strong style="color:var(--cyan-primary);">${meta.lab || 'Cognitive Science'}</strong></span>
        </div>
      `;
    }
    if (this.rulesModal) this.rulesModal.classList.add('active');
  }

  exitToHub() {
    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }
    this.activeGameInstance = null;
    this.activeGameMeta = null;
    this.dailyWorkoutActive = false;

    this.arenaSection.classList.remove('active');
    this.heroSection.style.display = 'grid';
    this.filterSection.style.display = 'flex';
    this.catalogSection.style.display = 'block';

    this.renderStats();
    this.renderCatalog();
    if (window.radarChart) {
      window.radarChart.draw();
    }
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  if (window.initNeuralParticles) window.initNeuralParticles();
  if (window.initRadarChart) window.initRadarChart();
  window.app = new AppController();
});
