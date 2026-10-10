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

    this.domains = [
      { key: 'memory', color: '#9d65ff' },
      { key: 'speed', color: '#00f5ff' },
      { key: 'focus', color: '#ff3366' },
      { key: 'logic', color: '#10b981' },
      { key: 'spatial', color: '#ffaa00' }
    ];
    this.domainScores = { memory: 68, speed: 62, focus: 74, logic: 65, spatial: 60 };
    if (window.brainState && window.brainState.data) {
      this.domainScores = { ...this.domainScores, ...window.brainState.data.domains };
    }

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
      const lobe = this.domains[i % this.domains.length];
      const band = i % this.domains.length;
      this.nodes.push({
        x: ((band + Math.random()) / this.domains.length) * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 1.5 + Math.random() * 2.2,
        color: lobe.color,
        domain: lobe.key,
        alpha: 0.35 + Math.random() * 0.5,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  sync(domains) {
    if (domains) this.domainScores = { ...this.domainScores, ...domains };
  }

  pulse(domain, correct = true) {
    if (!this.nodes || !this.nodes.length) return;
    const pool = this.nodes.filter(n => n.domain === domain);
    const src = pool.length ? pool : this.nodes;
    const a = src[Math.floor(Math.random() * src.length)];
    const b = src[Math.floor(Math.random() * src.length)];
    this.pulses.push({
      x: a.x,
      y: a.y,
      tx: b.x,
      ty: b.y,
      t: 0,
      color: correct ? a.color : '#ff3366'
    });
    if (this.pulses.length > 28) this.pulses.shift();
  }

  replay(trials) {
    if (typeof setTimeout !== 'function') return;
    (trials || []).slice(-18).forEach((trial, i) => {
      setTimeout(() => this.pulse(trial.domain, trial.correct !== false), i * 130);
    });
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

        const same = n.domain && n.domain === n2.domain;
        const score = (this.domainScores && this.domainScores[n.domain]) || 60;
        const reach = same ? 128 + (score - 50) * 0.55 : 96;
        if (dist < reach) {
          const weight = same ? 0.55 + (score / 100) * 1.7 : 0.55;
          const lineAlpha = (1 - dist / reach) * (same ? 0.34 : 0.14);
          this.ctx.beginPath();
          this.ctx.moveTo(n.x, n.y);
          this.ctx.lineTo(n2.x, n2.y);
          this.ctx.strokeStyle = same ? n.color : '#94a3b8';
          this.ctx.globalAlpha = lineAlpha;
          this.ctx.lineWidth = weight;
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

    for (let p = this.pulses.length - 1; p >= 0; p--) {
      const pulse = this.pulses[p];
      pulse.t += 0.035;
      if (pulse.t >= 1) {
        this.pulses.splice(p, 1);
        continue;
      }
      const px = pulse.x + (pulse.tx - pulse.x) * pulse.t;
      const py = pulse.y + (pulse.ty - pulse.y) * pulse.t;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      this.ctx.fillStyle = pulse.color;
      this.ctx.globalAlpha = (1 - pulse.t) * 0.9;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

window.initNeuralParticles = () => {
  window.neuralField = new NeuralParticles();
};
