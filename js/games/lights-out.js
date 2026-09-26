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
