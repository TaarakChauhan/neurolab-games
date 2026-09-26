/* ==========================================================================
   NEUROLAB - Game 9: Speed Math Frenzy
   Rapid arithmetic calculation exercising the intraparietal sulcus & working memory
   ========================================================================== */

class SpeedMathGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.timeLeft = 60;
    this.timer = null;
    this.score = 0;
    this.streak = 0;
    this.totalSolved = 0;
    this.correctCount = 0;

    this.currentEquation = null;

    this.render();
    this.startTimer();
    this.generateProblem();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="math-container">
          <div class="nback-status-pill">
            <span>Time: <strong id="math-timer">60</strong>s</span>
            <span>Score: <strong id="math-score">0</strong></span>
            <span>Multiplier: <strong id="math-multiplier" style="color:var(--amber-primary)">1x</strong> 🔥</span>
          </div>

          <div class="math-equation-card">
            <div class="math-equation-text" id="math-equation">...</div>
          </div>

          <div class="math-options-grid" id="math-options">
            <!-- 4 answer choices -->
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#math-timer');
    this.scoreEl = this.container.querySelector('#math-score');
    this.multEl = this.container.querySelector('#math-multiplier');
    this.eqEl = this.container.querySelector('#math-equation');
    this.optsEl = this.container.querySelector('#math-options');

    this.keyHandler = (e) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && this.currentOptions && this.currentOptions[idx] !== undefined) {
        this.handleChoice(this.currentOptions[idx]);
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  generateProblem() {
    // Generate operation types: +, -, *, mixed
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(12 + Math.random() * 88);
      b = Math.floor(12 + Math.random() * 88);
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(30 + Math.random() * 90);
      b = Math.floor(10 + Math.random() * (a - 10));
      answer = a - b;
    } else {
      a = Math.floor(4 + Math.random() * 14);
      b = Math.floor(4 + Math.random() * 12);
      answer = a * b;
    }

    this.correctAnswer = answer;
    this.eqEl.innerText = `${a} ${op === '*' ? '×' : op} ${b} = ?`;

    // Generate 3 plausible distractors
    const distractors = new Set();
    while (distractors.size < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 10));
      const fake = answer + offset;
      if (fake !== answer && fake > 0) distractors.add(fake);
    }

    const options = [answer, ...distractors].sort(() => 0.5 - Math.random());
    this.currentOptions = options;

    this.optsEl.innerHTML = '';
    options.forEach((val, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn-math-opt';
      btn.innerHTML = `${val} <span style="font-size:0.8rem; opacity:0.5;">[${i + 1}]</span>`;
      btn.addEventListener('click', () => this.handleChoice(val));
      this.optsEl.appendChild(btn);
    });
  }

  handleChoice(val) {
    this.totalSolved++;
    if (val === this.correctAnswer) {
      this.correctCount++;
      this.streak++;
      const mult = Math.min(5, 1 + Math.floor(this.streak / 4));
      this.score += 50 * mult;
      if (window.soundEngine) window.soundEngine.playTap(600 + this.streak * 30);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 30);
      if (window.soundEngine) window.soundEngine.playError();
    }

    const mult = Math.min(5, 1 + Math.floor(this.streak / 4));
    this.scoreEl.innerText = this.score;
    this.multEl.innerText = `${mult}x`;

    this.generateProblem();
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

    const accuracy = this.totalSolved > 0 ? Math.round((this.correctCount / this.totalSolved) * 100) : 0;
    if (window.confettiEngine && this.score > 800) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'speed-math',
      score: this.score,
      domain: 'speed',
      accuracy: `${accuracy}% Accuracy`,
      details: `Solved ${this.correctCount} equations in 60s (${(this.correctCount / 1).toFixed(1)}/min)`,
      performanceRatio: Math.min(1, this.score / 2000)
    });
  }

  destroy() {
    clearInterval(this.timer);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.SpeedMathGame = SpeedMathGame;
