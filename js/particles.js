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
