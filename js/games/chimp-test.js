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
