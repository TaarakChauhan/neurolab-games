/* ==========================================================================
   NEUROLAB - Game 2: Chimp Test (Ayumu Primate Memory Benchmark)
   A living rival plays the same board. Its pace tightens as your span grows.
   ========================================================================== */

class ChimpTestGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.rows = 5;
    this.cols = 8;
    const bonus = window.brainState ? window.brainState.staircase('chimp-test') : 0;
    this.level = 4 + Math.min(3, bonus);
    this.strikes = 0;
    this.maxStrikes = 3;
    this.currentExpected = 1;
    this.tiles = [];
    this.isMasked = false;
    this.youWins = 0;
    this.ayumuWins = 0;
    this.ayumuAt = 0;
    this.roundClaimed = false;
    this.duel = !!window.NEUROLAB_DUEL;
    this.rng = this.duel && window.brainState ? window.brainState.rng(window.brainState.dailySeed()) : null;
    this.boards = this.duel ? this.precomputeBoards() : null;

    this.render();
    this.startRound();
  }

  precomputeBoards() {
    const boards = {};
    const total = this.rows * this.cols;
    for (let level = 4; level <= 12; level++) {
      const indices = [];
      let guard = 0;
      while (indices.length < level && guard < 800) {
        guard++;
        const rand = Math.floor(this.rng() * total);
        if (indices.indexOf(rand) === -1) indices.push(rand);
      }
      boards[level] = indices;
    }
    return boards;
  }

  render() {
    const code = this.duel && window.brainState ? window.brainState.duelCode() : '';
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

          <div class="ayumu-race" id="ayumu-race">
            <span class="ayumu-side you" id="ayumu-you">YOU 0</span>
            <span class="ayumu-status" id="ayumu-status">${this.duel ? 'Sealed board ' + code : 'Ayumu is watching the same tiles'}</span>
            <span class="ayumu-side him" id="ayumu-him">AYUMU 0</span>
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
    this.raceStatus = this.container.querySelector('#ayumu-status');
    this.youEl = this.container.querySelector('#ayumu-you');
    this.himEl = this.container.querySelector('#ayumu-him');
  }

  ayumuPace() {
    const span = window.brainState ? window.brainState.bestSpan() : 0;
    if (span >= 9) return 180;
    if (span >= 7) return 250;
    if (span >= 5) return 360;
    return 520;
  }

  startRound() {
    this.stopAyumu();
    this.currentExpected = 1;
    this.isMasked = false;
    this.ayumuAt = 0;
    this.roundClaimed = false;
    this.choiceStartedAt = Date.now();
    const countEl = document.getElementById('chimp-num-count');
    if (countEl) countEl.innerText = this.level;
    const code = this.duel && window.brainState ? window.brainState.duelCode() : '';
    this.paintRace(code ? code + ' · click 1, then you both race' : 'Click 1. Then both of you are racing.');

    if (!this.boardEl) return;

    const cells = this.boardEl.querySelectorAll('.chimp-cell');
    cells.forEach(c => { c.innerHTML = ''; });

    const totalCells = this.rows * this.cols;
    let indices;
    if (this.boards && this.boards[this.level]) {
      indices = this.boards[this.level].slice();
    } else {
      indices = [];
      while (indices.length < this.level) {
        const rand = Math.floor(Math.random() * totalCells);
        if (indices.indexOf(rand) === -1) indices.push(rand);
      }
    }

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

  paintRace(text) {
    if (this.youEl) this.youEl.innerText = 'YOU ' + this.youWins;
    if (this.himEl) this.himEl.innerText = 'AYUMU ' + this.ayumuWins;
    if (this.raceStatus && text) this.raceStatus.innerText = text;
  }

  markAyumu(num) {
    this.tiles.forEach(t => t.classList.remove('ayumu-ghost'));
    const tile = this.tiles.find(t => parseInt(t.dataset.value, 10) === num);
    if (tile) tile.classList.add('ayumu-ghost');
  }

  startAyumu() {
    this.stopAyumu();
    this.ayumuAt = 1;
    const pace = this.ayumuPace();
    const step = () => {
      if (this.roundClaimed || !this.isMasked) return;
      this.ayumuAt += 1;
      this.markAyumu(this.ayumuAt);
      this.paintRace('Ayumu is on ' + this.ayumuAt);
      if (this.ayumuAt >= this.level) {
        if (!this.roundClaimed) {
          this.roundClaimed = true;
          this.ayumuWins += 1;
          this.paintRace('Ayumu finished the span first');
        }
        return;
      }
      this.ayumuTimer = setTimeout(step, pace);
    };
    this.ayumuTimer = setTimeout(step, pace);
  }

  stopAyumu() {
    if (this.ayumuTimer) {
      clearTimeout(this.ayumuTimer);
      this.ayumuTimer = null;
    }
  }

  logClick(correct, rt, value) {
    if (!window.brainState) return;
    window.brainState.logTrial({
      gameId: 'chimp-test',
      domain: 'memory',
      correct,
      rt,
      tag: 'n' + value
    });
  }

  handleTileClick(tile, value) {
    const rt = Date.now() - (this.choiceStartedAt || Date.now());
    this.choiceStartedAt = Date.now();

    if (value === this.currentExpected) {
      if (this.currentExpected === 1 && !this.isMasked) {
        this.isMasked = true;
        this.tiles.forEach(t => t.classList.add('masked'));
        this.startAyumu();
      }

      tile.classList.remove('masked');
      tile.classList.add('correct');
      if (window.soundEngine) window.soundEngine.playTap(500 + value * 50);
      this.logClick(true, rt, value);

      this.currentExpected++;

      if (this.currentExpected > this.level) {
        this.stopAyumu();
        if (!this.roundClaimed) {
          this.roundClaimed = true;
          this.youWins += 1;
          this.paintRace('You finished the span first');
        }
        if (window.soundEngine) window.soundEngine.playSuccess();
        this.level++;
        setTimeout(() => this.startRound(), 800);
      }
    } else {
      tile.classList.remove('masked');
      tile.classList.add('wrong');
      if (window.soundEngine) window.soundEngine.playError();
      this.logClick(false, rt, value);
      this.stopAyumu();

      this.tiles.forEach(t => {
        t.classList.remove('masked');
        if (parseInt(t.dataset.value, 10) === this.currentExpected) {
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
    this.stopAyumu();
    const span = this.level - 1;
    const finalScore = span * 280 + this.youWins * 70;
    const race = 'You ' + this.youWins + ' · Ayumu ' + this.ayumuWins;
    const ayumuComp = span >= 9
      ? 'Span ' + span + '. ' + race + '. That is Ayumu’s territory.'
      : span >= 7
      ? 'Span ' + span + '. ' + race + '. The rival will be faster next time.'
      : 'Span ' + span + '. ' + race + '. Ayumu is still giving you room.';

    if (window.confettiEngine && span >= 7) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'chimp-test',
      score: finalScore,
      domain: 'memory',
      accuracy: `Max: ${span} Numbers`,
      details: ayumuComp,
      performanceRatio: Math.min(1, span / 10),
      signals: {
        span,
        youWins: this.youWins,
        ayumuWins: this.ayumuWins,
        duel: this.duel,
        duelCode: this.duel && window.brainState ? window.brainState.duelCode() : ''
      }
    });
  }

  destroy() {
    this.stopAyumu();
  }
}

window.ChimpTestGame = ChimpTestGame;
