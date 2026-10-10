/* ==========================================================================
   NEUROLAB - Interference Protocol
   One board, two tasks. The cost of switching is the score that matters.
   SCAN: tap the requested number while a color-word shouts from the center.
   INK: name the ink and ignore the number.
   ========================================================================== */

class InterferenceGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.colors = [
      { name: 'Red', hex: '#ef4444', key: '1' },
      { name: 'Blue', hex: '#00f0ff', key: '2' },
      { name: 'Green', hex: '#10b981', key: '3' },
      { name: 'Yellow', hex: '#f59e0b', key: '4' }
    ];
    this.totalTrials = 12;
    this.trialIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.nextNumber = 1;
    this.trials = [];
    this.schedule = [];
    let mode = 'scan';
    for (let i = 0; i < this.totalTrials; i++) {
      if (i > 0 && i % 3 === 0) mode = mode === 'scan' ? 'ink' : 'scan';
      this.schedule.push(mode);
    }
    this.alive = true;

    this.render();
    this.present();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="ix-container">
          <div class="nback-status-pill">
            <span>Trial: <strong id="ix-trial">1</strong> / ${this.totalTrials}</span>
            <span>Score: <strong id="ix-score">0</strong></span>
            <span>Task: <strong id="ix-task">SCAN</strong></span>
          </div>

          <div class="ix-banner" id="ix-banner">SCAN 1</div>
          <div class="stroop-word ix-word" id="ix-word">READY</div>
          <p class="ix-hint">Obey the banner. SCAN means the number. INK means the color of the ink, never the word.</p>

          <div class="ix-numbers" id="ix-numbers"></div>
          <div class="stroop-options ix-colors" id="ix-colors">
            ${this.colors.map(c => `
              <button class="btn-stroop-color" data-color="${c.name}" style="border-color:${c.hex}; color:${c.hex};">
                ${c.name} <span style="font-size:0.75rem; opacity:0.6;">[${c.key}]</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.trialEl = this.container.querySelector('#ix-trial');
    this.scoreEl = this.container.querySelector('#ix-score');
    this.taskEl = this.container.querySelector('#ix-task');
    this.bannerEl = this.container.querySelector('#ix-banner');
    this.wordEl = this.container.querySelector('#ix-word');
    this.numbersEl = this.container.querySelector('#ix-numbers');

    this.container.querySelectorAll('.btn-stroop-color').forEach(btn => {
      btn.addEventListener('click', () => this.answer('ink', btn.dataset.color));
    });

    this.keyHandler = (e) => {
      const match = this.colors.find(c => c.key === e.key);
      if (match) this.answer('ink', match.name);
      if (e.key >= '1' && e.key <= '9' && e.target && e.target.tagName !== 'INPUT') {
        /* Color keys share 1-4. Number keys only count when no color owns them
           and the player is in SCAN. Digits 5-9 are always numbers. */
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  present() {
    if (!this.alive) return;
    const mode = this.schedule[this.trialIndex];
    this.mode = mode;
    this.shownAt = Date.now();
    this.locked = false;

    const word = this.colors[Math.floor(Math.random() * this.colors.length)];
    let ink = word;
    if (Math.random() < 0.75) {
      const others = this.colors.filter(c => c.name !== word.name);
      ink = others[Math.floor(Math.random() * others.length)];
    }
    this.inkName = ink.name;
    this.wordName = word.name;
    if (this.wordEl) {
      this.wordEl.innerText = word.name.toUpperCase();
      this.wordEl.style.color = ink.hex;
    }

    const target = ((this.nextNumber - 1) % 8) + 1;
    this.scanTarget = target;
    const pool = new Set([target]);
    while (pool.size < 6) pool.add(1 + Math.floor(Math.random() * 8));
    const nums = Array.from(pool).sort(() => Math.random() - 0.5);

    if (this.numbersEl) {
      this.numbersEl.innerHTML = '';
      nums.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'ix-num' + (mode === 'ink' ? ' dim' : '');
        btn.innerText = String(n);
        btn.addEventListener('click', () => this.answer('scan', n));
        this.numbersEl.appendChild(btn);
      });
    }

    if (this.trialEl) this.trialEl.innerText = String(this.trialIndex + 1);
    if (this.taskEl) this.taskEl.innerText = mode.toUpperCase();
    if (this.bannerEl) {
      this.bannerEl.innerText = mode === 'scan' ? 'SCAN ' + target : 'INK';
      this.bannerEl.dataset.mode = mode;
    }
    this.container.querySelectorAll('.btn-stroop-color').forEach(btn => {
      btn.classList.toggle('dim', mode === 'scan');
    });
  }

  answer(channel, value) {
    if (this.locked || !this.alive) return;
    this.locked = true;
    const rt = Date.now() - this.shownAt;
    const switched = this.trialIndex > 0 && this.schedule[this.trialIndex] !== this.schedule[this.trialIndex - 1];
    let correct = false;
    if (this.mode === 'scan') correct = channel === 'scan' && value === this.scanTarget;
    else correct = channel === 'ink' && value === this.inkName;

    if (correct) {
      this.correctCount += 1;
      const bonus = switched ? 1.4 : 1;
      this.score += Math.round(Math.max(40, 220 - rt / 8) * bonus);
      if (this.mode === 'scan') this.nextNumber += 1;
      if (window.soundEngine) window.soundEngine.playTap(640);
    } else if (window.soundEngine) {
      window.soundEngine.playError();
    }

    this.trials.push({ correct, rt, switched, mode: this.mode });
    if (window.brainState) {
      window.brainState.logTrial({
        gameId: 'interference',
        domain: 'focus',
        correct,
        rt,
        tag: switched ? 'switch' : 'repeat'
      });
    }
    if (this.scoreEl) this.scoreEl.innerText = String(this.score);

    this.trialIndex += 1;
    if (this.trialIndex >= this.totalTrials) {
      setTimeout(() => this.finish(), 420);
    } else {
      setTimeout(() => this.present(), 280);
    }
  }

  mean(list) {
    if (!list.length) return 0;
    return list.reduce((a, b) => a + b, 0) / list.length;
  }

  finish() {
    this.alive = false;
    window.removeEventListener('keydown', this.keyHandler);
    const accuracy = this.trials.length ? this.correctCount / this.trials.length : 0;
    const switchRts = this.trials.filter(t => t.switched && t.correct).map(t => t.rt);
    const repeatRts = this.trials.filter(t => !t.switched && t.correct).map(t => t.rt);
    const switchCost = (switchRts.length && repeatRts.length) ? this.mean(switchRts) - this.mean(repeatRts) : 0;
    const speed = Math.max(0, Math.min(1, (900 - this.mean(this.trials.map(t => t.rt))) / 700));
    const ratio = Math.max(0, Math.min(1, accuracy * 0.75 + speed * 0.25));

    if (window.confettiEngine && accuracy >= 0.75) {
      window.confettiEngine.fire(70);
      if (window.soundEngine) window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'interference',
      score: this.score,
      domain: 'focus',
      accuracy: Math.round(accuracy * 100) + '%',
      details: 'Switch cost ' + Math.round(switchCost) + ' ms across ' + this.trials.length + ' trials.',
      performanceRatio: ratio,
      signals: { switchCostMs: switchCost, accuracy }
    });
  }

  destroy() {
    this.alive = false;
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.InterferenceGame = InterferenceGame;
