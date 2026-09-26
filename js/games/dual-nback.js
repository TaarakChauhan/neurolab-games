/* ==========================================================================
   NEUROLAB - Game 1: Dual N-Back
   The scientifically validated working memory & fluid intelligence task
   ========================================================================== */

class DualNBackGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.n = 2; // Default 2-back
    this.totalTrials = 20;
    this.trialIndex = 0;
    this.trialInterval = null;
    this.trialDuration = 2800; // ms per trial
    this.flashDuration = 1000; // ms stimulus is active

    this.letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
    this.history = []; // Array of { pos: 0-8, letter: 'A' }

    // Scoring metrics
    this.posHits = 0;
    this.posFalseAlarms = 0;
    this.posMisses = 0;
    this.audioHits = 0;
    this.audioFalseAlarms = 0;
    this.audioMisses = 0;

    // Responses for current trial
    this.userPosMatched = false;
    this.userAudioMatched = false;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="nback-container">
          <div class="nback-status-pill">
            <span>Level: <strong>${this.n}-Back</strong></span>
            <span>Trial: <strong id="nback-trial-num">0</strong> / ${this.totalTrials}</span>
            <div class="nback-audio-indicator" id="nback-audio-ind">
              <span>🔊 Audio: <span id="nback-letter-disp">-</span></span>
            </div>
          </div>

          <div class="nback-grid" id="nback-grid">
            ${Array.from({ length: 9 }).map((_, i) => `<div class="nback-cell" data-idx="${i}"></div>`).join('')}
          </div>

          <div class="nback-controls">
            <button class="btn-nback-match visual" id="btn-pos-match">
              <strong>Visual Match</strong>
              <span class="nback-key-hint">Press [ A ] or Tap</span>
            </button>
            <button class="btn-nback-match audio" id="btn-audio-match">
              <strong>Audio Match</strong>
              <span class="nback-key-hint">Press [ L ] or Tap</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.btnPos = this.container.querySelector('#btn-pos-match');
    this.btnAudio = this.container.querySelector('#btn-audio-match');
    this.gridCells = this.container.querySelectorAll('.nback-cell');

    this.btnPos.addEventListener('click', () => this.handlePosMatch());
    this.btnAudio.addEventListener('click', () => this.handleAudioMatch());

    this.keyHandler = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        this.btnPos.classList.add('active-press');
        this.handlePosMatch();
        setTimeout(() => this.btnPos.classList.remove('active-press'), 150);
      } else if (e.key === 'l' || e.key === 'L') {
        this.btnAudio.classList.add('active-press');
        this.handleAudioMatch();
        setTimeout(() => this.btnAudio.classList.remove('active-press'), 150);
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.startTrialLoop();
  }

  startTrialLoop() {
    this.trialIndex = 0;
    this.runTrial();
    this.trialInterval = setInterval(() => {
      this.evaluatePreviousTrial();
      this.trialIndex++;
      if (this.trialIndex >= this.totalTrials) {
        this.finishGame();
      } else {
        this.runTrial();
      }
    }, this.trialDuration);
  }

  runTrial() {
    this.userPosMatched = false;
    this.userAudioMatched = false;
    this.btnPos.classList.remove('active-press');
    this.btnAudio.classList.remove('active-press');

    document.getElementById('nback-trial-num').innerText = this.trialIndex + 1;

    // Generate trial stimulus
    // 30% chance to force a match if trial > n
    let pos, letter;
    const canMatch = this.trialIndex >= this.n;

    if (canMatch && Math.random() < 0.35) {
      pos = this.history[this.trialIndex - this.n].pos;
    } else {
      pos = Math.floor(Math.random() * 9);
    }

    if (canMatch && Math.random() < 0.35) {
      letter = this.history[this.trialIndex - this.n].letter;
    } else {
      letter = this.letters[Math.floor(Math.random() * this.letters.length)];
    }

    this.history.push({ pos, letter });

    // Activate visual cell
    this.gridCells.forEach(c => c.classList.remove('active'));
    this.gridCells[pos].classList.add('active');

    // Play Audio Letter
    document.getElementById('nback-letter-disp').innerText = letter;
    if (window.soundEngine) {
      window.soundEngine.playLetter(letter);
    }

    // Deactivate visual cell after flash duration
    setTimeout(() => {
      this.gridCells.forEach(c => c.classList.remove('active'));
      document.getElementById('nback-letter-disp').innerText = '-';
    }, this.flashDuration);
  }

  handlePosMatch() {
    if (this.userPosMatched) return;
    this.userPosMatched = true;
    if (window.soundEngine) window.soundEngine.playTap(700);
    this.btnPos.classList.add('active-press');
  }

  handleAudioMatch() {
    if (this.userAudioMatched) return;
    this.userAudioMatched = true;
    if (window.soundEngine) window.soundEngine.playTap(900);
    this.btnAudio.classList.add('active-press');
  }

  evaluatePreviousTrial() {
    if (this.trialIndex < this.n) return; // Warmup trials

    const targetPos = this.history[this.trialIndex - this.n].pos;
    const currentPos = this.history[this.trialIndex].pos;
    const isPosMatch = targetPos === currentPos;

    const targetLetter = this.history[this.trialIndex - this.n].letter;
    const currentLetter = this.history[this.trialIndex].letter;
    const isAudioMatch = targetLetter === currentLetter;

    // Position evaluation
    if (isPosMatch) {
      if (this.userPosMatched) this.posHits++;
      else this.posMisses++;
    } else if (this.userPosMatched) {
      this.posFalseAlarms++;
    }

    // Audio evaluation
    if (isAudioMatch) {
      if (this.userAudioMatched) this.audioHits++;
      else this.audioMisses++;
    } else if (this.userAudioMatched) {
      this.audioFalseAlarms++;
    }
  }

  finishGame() {
    clearInterval(this.trialInterval);
    window.removeEventListener('keydown', this.keyHandler);

    const eligibleTrials = this.totalTrials - this.n;
    const totalHits = this.posHits + this.audioHits;
    const totalErrors = this.posMisses + this.posFalseAlarms + this.audioMisses + this.audioFalseAlarms;

    // Calculate score
    const accuracy = Math.max(0, Math.round(((totalHits * 1.5 - totalErrors * 0.5) / (eligibleTrials * 1.5)) * 100));
    const finalScore = Math.max(100, Math.round(accuracy * 12 + this.n * 200));

    if (window.confettiEngine && accuracy > 65) {
      window.confettiEngine.fire(80);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'dual-nback',
      score: finalScore,
      domain: 'memory',
      accuracy: `${accuracy}%`,
      details: `Visual Hits: ${this.posHits} | Audio Hits: ${this.audioHits} | Errors: ${totalErrors}`,
      performanceRatio: accuracy / 100
    });
  }

  destroy() {
    clearInterval(this.trialInterval);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.DualNBackGame = DualNBackGame;
