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
