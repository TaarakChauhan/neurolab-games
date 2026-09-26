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
