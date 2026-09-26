/* ==========================================================================
   NEUROLAB - Game 11: Wordle Master
   Verbal deduction, lexical retrieval & working memory hypothesis testing
   ========================================================================== */

class WordleGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.wordList = [
      'BRAIN', 'SMART', 'LOGIC', 'FOCUS', 'THINK', 'SOLVE', 'PULSE', 'LEARN',
      'NEURO', 'SPARK', 'FLASH', 'QUICK', 'SHARP', 'POWER', 'SKILL', 'SOLAR',
      'LIGHT', 'STORM', 'TRAIN', 'DREAM', 'CHESS', 'FORCE', 'DISCO', 'CYBER',
      'CLOUD', 'BLOOM', 'MAGIC', 'NEXUS', 'PRISM', 'AUDIO', 'PIXEL', 'MATRIX'
    ];

    this.targetWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
    this.guesses = [];
    this.currentGuess = '';
    this.maxGuesses = 6;
    this.gameOverState = false;

    this.keyStates = {}; // letter -> 'correct' | 'present' | 'absent'

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-stage-wrapper">
        <div class="wordle-container">
          <div class="nback-status-pill">
            <span>Target: <strong>5-Letter Word</strong></span>
            <span>Attempts: <strong id="wordle-attempt">1</strong> / 6</span>
            <span id="wordle-msg" style="color:var(--cyan-primary); font-weight:600;">Type or tap letters</span>
          </div>

          <div class="wordle-grid" id="wordle-grid">
            ${Array.from({ length: 6 })
              .map(
                (_, r) => `
                <div class="wordle-row" data-row="${r}">
                  ${Array.from({ length: 5 })
                    .map((_, c) => `<div class="wordle-tile" data-col="${c}"></div>`)
                    .join('')}
                </div>
              `
              )
              .join('')}
          </div>

          <div class="wordle-keyboard" id="wordle-kb">
            <!-- 3 rows of keyboard -->
          </div>
        </div>
      </div>
    `;

    this.gridEl = this.container.querySelector('#wordle-grid');
    this.kbEl = this.container.querySelector('#wordle-kb');
    this.msgEl = this.container.querySelector('#wordle-msg');
    this.attemptEl = this.container.querySelector('#wordle-attempt');

    this.renderKeyboard();

    this.keyHandler = (e) => {
      if (this.gameOverState) return;
      if (e.key === 'Enter') {
        this.submitGuess();
      } else if (e.key === 'Backspace') {
        this.removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        this.addLetter(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  renderKeyboard() {
    const layout = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
    ];

    this.kbEl.innerHTML = '';
    layout.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-kb-row';

      row.forEach(key => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'wordle-key';
        keyBtn.innerText = key;
        if (key === 'ENTER' || key === 'DEL') keyBtn.classList.add('wide');

        const state = this.keyStates[key];
        if (state) keyBtn.classList.add(state);

        keyBtn.addEventListener('click', () => {
          if (this.gameOverState) return;
          if (key === 'ENTER') this.submitGuess();
          else if (key === 'DEL') this.removeLetter();
          else this.addLetter(key);
        });

        rowEl.appendChild(keyBtn);
      });

      this.kbEl.appendChild(rowEl);
    });
  }

  addLetter(letter) {
    if (this.currentGuess.length < 5) {
      this.currentGuess += letter;
      this.updateCurrentRow();
      if (window.soundEngine) window.soundEngine.playTap(600);
    }
  }

  removeLetter() {
    if (this.currentGuess.length > 0) {
      this.currentGuess = this.currentGuess.slice(0, -1);
      this.updateCurrentRow();
      if (window.soundEngine) window.soundEngine.playTap(450);
    }
  }

  updateCurrentRow() {
    const rowIdx = this.guesses.length;
    const row = this.gridEl.querySelector(`.wordle-row[data-row="${rowIdx}"]`);
    if (!row) return;

    const tiles = row.querySelectorAll('.wordle-tile');
    tiles.forEach((t, i) => {
      const char = this.currentGuess[i] || '';
      t.innerText = char;
      t.classList.toggle('filled', char !== '');
    });
  }

  submitGuess() {
    if (this.currentGuess.length < 5) {
      this.msgEl.innerText = 'Not enough letters!';
      this.msgEl.style.color = 'var(--crimson-alert)';
      if (window.soundEngine) window.soundEngine.playError();
      return;
    }

    const rowIdx = this.guesses.length;
    const row = this.gridEl.querySelector(`.wordle-row[data-row="${rowIdx}"]`);
    const tiles = row.querySelectorAll('.wordle-tile');
    const guess = this.currentGuess;
    const target = this.targetWord;

    const evaluation = Array(5).fill('absent');
    const targetCounts = {};

    for (let char of target) {
      targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    // First pass: exact matches (green)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        evaluation[i] = 'correct';
        targetCounts[guess[i]]--;
        this.keyStates[guess[i]] = 'correct';
      }
    }

    // Second pass: present matches (yellow)
    for (let i = 0; i < 5; i++) {
      if (evaluation[i] !== 'correct' && targetCounts[guess[i]] > 0) {
        evaluation[i] = 'present';
        targetCounts[guess[i]]--;
        if (this.keyStates[guess[i]] !== 'correct') {
          this.keyStates[guess[i]] = 'present';
        }
      } else if (evaluation[i] !== 'correct') {
        if (!this.keyStates[guess[i]]) {
          this.keyStates[guess[i]] = 'absent';
        }
      }
    }

    // Animate tiles
    tiles.forEach((t, i) => {
      setTimeout(() => {
        t.classList.add(evaluation[i]);
      }, i * 150);
    });

    this.guesses.push(guess);
    this.currentGuess = '';
    this.renderKeyboard();

    setTimeout(() => {
      if (guess === target) {
        this.victory();
      } else if (this.guesses.length >= this.maxGuesses) {
        this.defeat();
      } else {
        this.attemptEl.innerText = this.guesses.length + 1;
        this.msgEl.innerText = 'Keep going!';
        this.msgEl.style.color = 'var(--cyan-primary)';
      }
    }, 1000);
  }

  victory() {
    this.gameOverState = true;
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.confettiEngine) window.confettiEngine.fire(90);

    const attempts = this.guesses.length;
    const score = Math.round(1800 - (attempts - 1) * 250);

    this.onComplete({
      gameId: 'wordle',
      score,
      domain: 'logic',
      accuracy: `Guessed in ${attempts}/6 tries`,
      details: `Word: ${this.targetWord}`,
      performanceRatio: (7 - attempts) / 6
    });
  }

  defeat() {
    this.gameOverState = true;
    if (window.soundEngine) window.soundEngine.playError();
    this.msgEl.innerText = `The word was ${this.targetWord}`;
    this.msgEl.style.color = 'var(--crimson-alert)';

    setTimeout(() => {
      this.onComplete({
        gameId: 'wordle',
        score: 200,
        domain: 'logic',
        accuracy: '0/6 tries',
        details: `The hidden word was ${this.targetWord}`,
        performanceRatio: 0.2
      });
    }, 1500);
  }

  destroy() {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.WordleGame = WordleGame;
