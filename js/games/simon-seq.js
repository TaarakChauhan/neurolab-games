/* ==========================================================================
   NEUROLAB - Game 6: Simon Sequence (Audio-Visual Memory)
   Sequencing memory challenge using harmonious frequencies & light pulses
   ========================================================================== */

class SimonGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.isPlayingSequence = false;

    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="simon-container">
          <div class="simon-circle-wrap">
            <button class="simon-pad tl" data-pad="0"></button>
            <button class="simon-pad tr" data-pad="1"></button>
            <button class="simon-pad bl" data-pad="2"></button>
            <button class="simon-pad br" data-pad="3"></button>

            <div class="simon-center-hub">
              <span class="simon-hub-label">Streak</span>
              <span class="simon-hub-count" id="simon-count">0</span>
            </div>
          </div>

          <div id="simon-status-msg" style="font-size:0.9rem; color:var(--text-secondary); text-align:center;">
            Listen & watch the sequence...
          </div>
        </div>
      </div>
    `;

    this.pads = this.container.querySelectorAll('.simon-pad');
    this.countEl = this.container.querySelector('#simon-count');
    this.statusEl = this.container.querySelector('#simon-status-msg');

    this.pads.forEach(pad => {
      pad.addEventListener('click', () => {
        if (this.isPlayingSequence) return;
        const idx = parseInt(pad.dataset.pad);
        this.handlePlayerInput(idx);
      });
    });
  }

  startRound() {
    this.sequence.push(Math.floor(Math.random() * 4));
    this.playerStep = 0;
    this.countEl.innerText = this.sequence.length - 1;
    this.playSequence();
  }

  async playSequence() {
    this.isPlayingSequence = true;
    this.statusEl.innerText = 'Memorizing sequence...';
    this.statusEl.style.color = 'var(--cyan-primary)';

    await new Promise(r => setTimeout(r, 600));

    const delay = Math.max(280, 550 - this.sequence.length * 15);

    for (let i = 0; i < this.sequence.length; i++) {
      const padIdx = this.sequence[i];
      await this.activatePad(padIdx, delay * 0.7);
      await new Promise(r => setTimeout(r, delay * 0.3));
    }

    this.isPlayingSequence = false;
    this.statusEl.innerText = 'Your turn! Repeat the pattern.';
    this.statusEl.style.color = 'var(--text-secondary)';
  }

  activatePad(padIdx, duration = 300) {
    return new Promise(resolve => {
      const pad = this.pads[padIdx];
      pad.classList.add('active');
      if (window.soundEngine) window.soundEngine.playSimon(padIdx);

      setTimeout(() => {
        pad.classList.remove('active');
        resolve();
      }, duration);
    });
  }

  handlePlayerInput(idx) {
    this.activatePad(idx, 220);

    if (idx === this.sequence[this.playerStep]) {
      this.playerStep++;

      // Completed full sequence
      if (this.playerStep >= this.sequence.length) {
        this.score = this.sequence.length * 150;
        this.countEl.innerText = this.sequence.length;
        this.statusEl.innerText = 'Perfect! Next sequence incoming...';
        this.statusEl.style.color = 'var(--emerald-primary)';

        setTimeout(() => this.startRound(), 1000);
      }
    } else {
      // Wrong pad clicked!
      if (window.soundEngine) window.soundEngine.playError();
      this.statusEl.innerText = 'Sequence broken!';
      this.statusEl.style.color = 'var(--crimson-alert)';

      this.pads.forEach(p => p.classList.add('active'));
      setTimeout(() => {
        this.pads.forEach(p => p.classList.remove('active'));
        this.gameOver();
      }, 700);
    }
  }

  gameOver() {
    const rounds = Math.max(0, this.sequence.length - 1);
    if (window.confettiEngine && rounds >= 8) {
      window.confettiEngine.fire(90);
      window.soundEngine.playVictory();
    }

    this.onComplete({
      gameId: 'simon-seq',
      score: rounds * 180,
      domain: 'memory',
      accuracy: `${rounds} Notes Sequence`,
      details: rounds >= 10 ? 'Phenomenal acoustic-spatial memory!' : 'Solid sequence retention.',
      performanceRatio: Math.min(1, rounds / 14)
    });
  }

  destroy() {}
}

window.SimonGame = SimonGame;
