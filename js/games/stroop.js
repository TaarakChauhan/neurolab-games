/* ==========================================================================
   NEUROLAB - Game 3: Stroop Color Clash
   Measures executive function, prefrontal cognitive control & inhibition
   ========================================================================== */

class StroopGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;

    this.colors = [
      { name: 'Red', hex: '#ef4444', key: '1' },
      { name: 'Blue', hex: '#00f0ff', key: '2' },
      { name: 'Green', hex: '#10b981', key: '3' },
      { name: 'Yellow', hex: '#f59e0b', key: '4' }
    ];

    this.timeLeft = 30;
    this.timer = null;
    this.score = 0;
    this.streak = 0;
    this.totalAttempts = 0;
    this.correctAttempts = 0;
    this.responseTimes = [];
    this.trialLog = [];
    this.lastWordTime = Date.now();

    this.currentInkColor = null;
    this.currentWord = null;
    this.currentCongruent = false;

    this.render();
    this.startTimer();
    this.nextWord();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="stroop-container">
          <div class="nback-status-pill">
            <span>Time: <strong id="stroop-timer">30</strong>s</span>
            <span>Score: <strong id="stroop-score">0</strong></span>
            <span>Streak: <strong id="stroop-streak" style="color:var(--amber-primary)">0x</strong> 🔥</span>
          </div>

          <div class="stroop-card">
            <span class="stroop-instruction">Select the INK color (NOT the word!)</span>
            <div class="stroop-word" id="stroop-word">READY</div>
          </div>

          <div class="stroop-options">
            ${this.colors
              .map(
                (c, i) => `
                <button class="btn-stroop-color" data-color="${c.name}" style="border-color:${c.hex}; color:${c.hex};">
                  ${c.name} <span style="font-size:0.75rem; opacity:0.6;">[${c.key}]</span>
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.wordEl = this.container.querySelector('#stroop-word');
    this.timerEl = this.container.querySelector('#stroop-timer');
    this.scoreEl = this.container.querySelector('#stroop-score');
    this.streakEl = this.container.querySelector('#stroop-streak');

    // Click listeners
    this.container.querySelectorAll('.btn-stroop-color').forEach(btn => {
      btn.addEventListener('click', () => this.handleAnswer(btn.dataset.color));
    });

    // Keyboard listeners
    this.keyHandler = (e) => {
      const match = this.colors.find(c => c.key === e.key);
      if (match) this.handleAnswer(match.name);
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  nextWord() {
    this.lastWordTime = Date.now();

    // 70% chance incongruent (different word and color), 30% congruent
    const wordItem = this.colors[Math.floor(Math.random() * this.colors.length)];
    let inkItem;

    if (Math.random() < 0.7) {
      const otherColors = this.colors.filter(c => c.name !== wordItem.name);
      inkItem = otherColors[Math.floor(Math.random() * otherColors.length)];
    } else {
      inkItem = wordItem;
    }

    this.currentInkColor = inkItem.name;
    this.currentWord = wordItem.name;
    this.currentCongruent = wordItem.name === inkItem.name;
    this.wordEl.innerText = wordItem.name;
    this.wordEl.style.color = inkItem.hex;
    this.wordEl.style.transform = 'scale(1.05)';
    setTimeout(() => this.wordEl.style.transform = 'scale(1)', 100);
  }

  handleAnswer(selectedColor) {
    const elapsed = Date.now() - this.lastWordTime;
    this.responseTimes.push(elapsed);
    this.totalAttempts++;
    const correct = selectedColor === this.currentInkColor;
    this.trialLog.push({ correct, rt: elapsed, congruent: this.currentCongruent });
    if (window.brainState) {
      window.brainState.logTrial({
        gameId: 'stroop',
        domain: 'focus',
        correct,
        rt: elapsed,
        tag: this.currentCongruent ? 'congruent' : 'incongruent'
      });
    }

    if (correct) {
      // Correct!
      this.correctAttempts++;
      this.streak++;
      const multiplier = Math.min(4, 1 + Math.floor(this.streak / 5));
      const points = Math.round((Math.max(100, 1000 - elapsed) / 10) * multiplier);
      this.score += points;

      if (window.soundEngine) window.soundEngine.playTap(600 + this.streak * 30);
    } else {
      // Mistake!
      this.streak = 0;
      this.score = Math.max(0, this.score - 50);
      if (window.soundEngine) window.soundEngine.playError();
    }

    this.scoreEl.innerText = this.score;
    this.streakEl.innerText = `${this.streak}x`;

    this.nextWord();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timerEl) this.timerEl.innerText = this.timeLeft;

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  gameOver() {
    clearInterval(this.timer);
    window.removeEventListener('keydown', this.keyHandler);

    const accuracy = this.totalAttempts > 0 ? Math.round((this.correctAttempts / this.totalAttempts) * 100) : 0;
    const avgRt = this.responseTimes.length > 0
      ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
      : 0;
    const mean = (rows) => rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : 0;
    const cong = this.trialLog.filter(t => t.correct && t.congruent).map(t => t.rt);
    const inc = this.trialLog.filter(t => t.correct && !t.congruent).map(t => t.rt);
    const interferenceMs = cong.length && inc.length ? mean(inc) - mean(cong) : 0;

    if (window.confettiEngine && this.score > 800) {
      window.confettiEngine.fire(80);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'stroop',
      score: this.score,
      domain: 'focus',
      accuracy: `${accuracy}%`,
      details: `Avg RT: ${avgRt}ms | Ink cost: ${Math.round(interferenceMs)}ms | Correct: ${this.correctAttempts} / ${this.totalAttempts}`,
      performanceRatio: Math.min(1, this.score / 2000),
      signals: { interferenceMs, avgRt }
    });
  }

  destroy() {
    clearInterval(this.timer);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.StroopGame = StroopGame;
