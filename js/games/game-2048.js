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
