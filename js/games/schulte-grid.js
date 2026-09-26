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
