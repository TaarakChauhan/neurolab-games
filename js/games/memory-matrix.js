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

    while (this.targetCells.size < this.activeCount) {
      this.targetCells.add(Math.floor(Math.random() * total));
    }
    this.palace = { size: this.gridSize, cells: Array.from(this.targetCells) };

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
        this.recallStarted = Date.now();
      }, 1200);
    }, 400);
  }

  handleCellClick(cell, idx) {
    if (!this.isInputAllowed || this.selectedCells.has(idx)) return;
    this.selectedCells.add(idx);

    const rt = Date.now() - (this.recallStarted || Date.now());
    if (window.brainState) {
      window.brainState.logTrial({
        gameId: 'memory-matrix',
        domain: 'memory',
        correct: this.targetCells.has(idx),
        rt,
        tag: 'cell'
      });
    }

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
      performanceRatio: Math.min(1, this.level / 10),
      signals: { palace: this.palace || null }
    });
  }

  destroy() {}
}

window.MemoryMatrixGame = MemoryMatrixGame;
