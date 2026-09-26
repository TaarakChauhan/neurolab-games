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
