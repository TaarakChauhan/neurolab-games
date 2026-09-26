/* ==========================================================================
   NEUROLAB - Core Application Controller & Platform Orchestrator
   ========================================================================== */

class AppController {
  constructor() {
    this.gamesCatalog = [
      {
        id: 'dual-nback',
        title: 'Dual N-Back',
        category: 'memory',
        icon: '🧠',
        accent: '#8b5cf6',
        desc: 'The gold-standard cognitive training task proven to expand working memory capacity and fluid IQ.',
        neuroscience: 'Activates the dorsolateral prefrontal cortex (DLPFC) by forcing simultaneous maintenance and comparison of auditory and visual representations.',
        difficulty: 'Hard',
        duration: '~3 min',
        lab: 'Jaeggi / Stanford',
        pips: 3,
        classRef: 'DualNBackGame'
      },
      {
        id: 'chimp-test',
        title: 'Ayumu Chimp Test',
        category: 'memory',
        icon: '🐒',
        accent: '#8b5cf6',
        desc: 'Recall sequential numbers scattered across a grid after they instantly mask into blank tiles.',
        neuroscience: 'Tests rapid eidetic encoding and visuospatial working memory based on Tetsuro Matsuzawa’s chimpanzee experiments at Kyoto University.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Kyoto Primate Inst.',
        pips: 2,
        classRef: 'ChimpTestGame'
      },
      {
        id: 'memory-matrix',
        title: 'Memory Matrix',
        category: 'memory',
        icon: '🧩',
        accent: '#8b5cf6',
        desc: 'Memorize and recall active spatial tiles across expanding matrix grids from 3x3 up to 6x6.',
        neuroscience: 'Targets parietal-hippocampal spatial mapping and expands instantaneous visual buffer size.',
        difficulty: 'Adaptive',
        duration: '~2 min',
        lab: 'Visuospatial Lab',
        pips: 2,
        classRef: 'MemoryMatrixGame'
      },
      {
        id: 'simon-seq',
        title: 'Simon Sequence',
        category: 'memory',
        icon: '🎵',
        accent: '#8b5cf6',
        desc: 'Sequential audio-visual memory challenge using harmonious frequencies and light quadrants.',
        neuroscience: 'Strengthens temporal auditory sequence consolidation in the superior temporal gyrus.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Temporal Auditory',
        pips: 2,
        classRef: 'SimonGame'
      },
      {
        id: 'schulte-grid',
        title: 'Schulte Grid 5x5',
        category: 'speed',
        icon: '⚡',
        accent: '#00f0ff',
        desc: 'Find numbers 1 through 25 sequentially at breakneck speed with central fixation point.',
        neuroscience: 'Developed by Walter Schulte to assess visual scanning speed, mental agility, and expand peripheral visual field.',
        difficulty: 'Medium',
        duration: '~1 min',
        lab: 'Walter Schulte 1962',
        pips: 2,
        classRef: 'SchulteGridGame'
      },
      {
        id: 'speed-math',
        title: 'Speed Math Frenzy',
        category: 'speed',
        icon: '🔢',
        accent: '#00f0ff',
        desc: 'Rapid-fire mental calculation with combos and multipliers in a 60-second time trial.',
        neuroscience: 'Stimulates the intraparietal sulcus and bilateral angular gyrus responsible for numerical processing and mental arithmetic.',
        difficulty: 'Fast',
        duration: '60 sec',
        lab: 'Parietal Sulcus',
        pips: 2,
        classRef: 'SpeedMathGame'
      },
      {
        id: 'stroop',
        title: 'Stroop Color Clash',
        category: 'focus',
        icon: '🎯',
        accent: '#ec4899',
        desc: 'Decide the color of the ink while overriding the automatic impulse to read the written word.',
        neuroscience: 'Measures executive control and cognitive inhibition in the anterior cingulate cortex (ACC).',
        difficulty: 'Medium',
        duration: '30 sec',
        lab: 'J. Ridley Stroop 1935',
        pips: 2,
        classRef: 'StroopGame'
      },
      {
        id: 'tower-hanoi',
        title: 'Tower of Hanoi',
        category: 'logic',
        icon: '🏛️',
        accent: '#10b981',
        desc: 'Classic recursive disk relocation logic puzzle with interactive AI solver demonstration.',
        neuroscience: 'Stimulates prefrontal cortex executive planning, hierarchical goal decomposition, and lookahead reasoning.',
        difficulty: 'Hard',
        duration: '~3 min',
        lab: 'Édouard Lucas 1883',
        pips: 3,
        classRef: 'TowerHanoiGame'
      },
      {
        id: 'game-2048',
        title: '2048 Neon Fusion',
        category: 'logic',
        icon: '✨',
        accent: '#10b981',
        desc: 'Slide and merge identical tiles strategically using arrow keys or swipe gestures.',
        neuroscience: 'Builds spatial anticipation, probabilistic risk estimation, and forward planning in the frontal lobes.',
        difficulty: 'Strategic',
        duration: 'Untimed',
        lab: 'Strategic Heuristics',
        pips: 2,
        classRef: 'Game2048'
      },
      {
        id: 'lights-out',
        title: 'Lights Out',
        category: 'logic',
        icon: '💡',
        accent: '#10b981',
        desc: 'Parity matrix puzzle where toggling a node flips its four direct orthogonal neighbors.',
        neuroscience: 'Trains discrete mathematics, binary logic state prediction, and mod-2 matrix transformations.',
        difficulty: 'Medium',
        duration: '~2 min',
        lab: 'Discrete Parity Logic',
        pips: 2,
        classRef: 'LightsOutGame'
      },
      {
        id: 'wordle',
        title: 'Wordle Master',
        category: 'logic',
        icon: '🔤',
        accent: '#10b981',
        desc: 'Deduce the secret 5-letter word in 6 attempts using color-coded constraint clues.',
        neuroscience: 'Engages left-hemisphere language networks (Wernicke & Broca areas) and combinatorial elimination.',
        difficulty: 'Medium',
        duration: '~3 min',
        lab: 'Lexical Deduction',
        pips: 2,
        classRef: 'WordleGame'
      },
      {
        id: 'mental-rotation',
        title: '3D Mental Rotation',
        category: 'spatial',
        icon: '🧊',
        accent: '#f59e0b',
        desc: 'Identify matching 3D isometric polycube configurations versus chiral mirrored distractors.',
        neuroscience: 'Evaluates the parietal lobe’s spatial cognitive representation and continuous mental transformation speed.',
        difficulty: 'Hard',
        duration: '~2 min',
        lab: 'Shepard-Metzler 1971',
        pips: 3,
        classRef: 'MentalRotationGame'
      }
    ];

    this.activeFilter = 'all';
    this.searchQuery = '';
    this.activeGameInstance = null;
    this.activeGameMeta = null;
    this.dailyWorkoutActive = false;

    this.initDOM();
    this.renderStats();
    this.renderCatalog();
    this.attachGlobalEvents();

    // Deep-linking support (?game=chimp-test)
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    if (gameParam && this.gamesCatalog.some(g => g.id === gameParam)) {
      this.launchGame(gameParam);
    }
  }

  initDOM() {
    this.catalogSection = document.getElementById('catalog-section');
    this.heroSection = document.getElementById('hero-section');
    this.filterSection = document.getElementById('filter-section');
    this.arenaSection = document.getElementById('game-arena');
    this.arenaStage = document.getElementById('arena-stage');
    this.gamesGrid = document.getElementById('games-grid');

    // Stats
    this.headerNq = document.getElementById('header-nq');
    this.headerStreak = document.getElementById('header-streak');
    this.heroNq = document.getElementById('hero-nq');
    this.heroStreak = document.getElementById('hero-streak');
    this.heroGamesPlayed = document.getElementById('hero-games-played');
    this.heroDailyProgress = document.getElementById('hero-daily-progress');

    // Modals
    this.rulesModal = document.getElementById('rules-modal');
    this.summaryModal = document.getElementById('summary-modal');
  }

  renderStats() {
    const s = window.brainState.data;
    if (this.headerNq) this.headerNq.innerText = s.nq;
    if (this.headerStreak) this.headerStreak.innerText = s.streak;
    if (this.heroNq) this.heroNq.innerText = s.nq;
    if (this.heroStreak) this.heroStreak.innerText = s.streak;
    if (this.heroGamesPlayed) this.heroGamesPlayed.innerText = s.totalGamesPlayed;

    const daily = s.dailyWorkout;
    const progressText = daily.completed ? 'Completed! 🏆' : `${daily.progress} / ${daily.games.length}`;
    if (this.heroDailyProgress) this.heroDailyProgress.innerText = progressText;

    // Daily Goal Progress Bar
    const progressFraction = Math.min(1, daily.progress / daily.games.length);
    const pct = Math.round(progressFraction * 100);
    const barFill = document.getElementById('hero-goal-bar-fill');
    const barPct = document.getElementById('hero-goal-pct');
    if (barFill) barFill.style.width = `${pct}%`;
    if (barPct) barPct.innerText = `${pct}%`;

    // Radar Domain Chips
    if (s.domains) {
      const dMem = document.getElementById('chip-val-memory');
      const dSpd = document.getElementById('chip-val-speed');
      const dFoc = document.getElementById('chip-val-focus');
      const dLog = document.getElementById('chip-val-logic');
      const dSpa = document.getElementById('chip-val-spatial');
      if (dMem) dMem.innerText = s.domains.memory || 60;
      if (dSpd) dSpd.innerText = s.domains.speed || 60;
      if (dFoc) dFoc.innerText = s.domains.focus || 60;
      if (dLog) dLog.innerText = s.domains.logic || 60;
      if (dSpa) dSpa.innerText = s.domains.spatial || 60;
    }

    // Daily workout button state
    const btnDaily = document.getElementById('btn-daily-workout');
    if (btnDaily) {
      if (daily.completed) {
        btnDaily.innerHTML = '<span>🏆 Daily Workout Complete!</span>';
        btnDaily.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      } else {
        btnDaily.innerHTML = `<span>⚡ Daily Workout (${daily.progress}/${daily.games.length})</span>`;
      }
    }
  }

  renderCatalog() {
    this.gamesGrid.innerHTML = '';
    
    // Category filter
    let filtered = this.activeFilter === 'all'
      ? this.gamesCatalog
      : this.gamesCatalog.filter(g => g.category === this.activeFilter);

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.desc.toLowerCase().includes(q) || 
        g.category.toLowerCase().includes(q) ||
        (g.lab && g.lab.toLowerCase().includes(q))
      );
    }

    // Empty state
    if (filtered.length === 0) {
      this.gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 4.5rem 1.5rem; background:rgba(19,28,48,0.4); border-radius:var(--radius-xl); border:1px dashed var(--border-glass-bright);">
          <div style="font-size:2.8rem; margin-bottom:0.75rem; filter:drop-shadow(0 0 15px rgba(0,245,255,0.4));">🔍</div>
          <h3 style="color:#ffffff; font-family:var(--font-display); font-size:1.4rem; font-weight:800; margin-bottom:0.4rem;">No matching cognitive drills found</h3>
          <p style="color:var(--text-secondary); font-size:0.92rem; max-width:440px; margin:0 auto 1.25rem auto;">Try searching for another domain (e.g. "memory", "logic"), cognitive skill, or research lab.</p>
          <button class="btn-secondary" id="btn-reset-search" style="padding:0.5rem 1.2rem;">Clear Search</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const input = document.getElementById('game-search-input');
          if (input) input.value = '';
          this.searchQuery = '';
          const clearBtn = document.getElementById('search-clear-btn');
          if (clearBtn) clearBtn.style.display = 'none';
          this.renderCatalog();
        });
      }
      return;
    }

    filtered.forEach(game => {
      const highScore = window.brainState.getHighScore(game.id);
      const filledPips = game.pips || 2;

      const card = document.createElement('div');
      card.className = 'game-card';
      card.style.setProperty('--card-border', game.accent);
      card.style.setProperty('--card-glow', `${game.accent}44`);
      card.style.setProperty('--card-accent', game.accent);

      card.innerHTML = `
        <div>
          <div class="game-card-top">
            <div class="card-tags-group">
              <span class="card-category-tag" style="background:${game.accent}1f; color:${game.accent}; border:1px solid ${game.accent}55;">
                ${game.category}
              </span>
              <span class="card-science-tag">${game.lab || 'Neuro Lab'}</span>
            </div>
            <div class="card-icon-wrap" style="color:${game.accent};">${game.icon}</div>
          </div>

          <div class="game-card-content">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-desc">${game.desc}</p>
            <div class="game-meta-row">
              <span class="game-meta-item">⏱ ${game.duration}</span>
              <span class="game-meta-item">
                <span style="margin-right:2px;">Tier:</span>
                <span class="difficulty-pips">
                  <span class="pip ${filledPips >= 1 ? 'filled' : ''}"></span>
                  <span class="pip ${filledPips >= 2 ? 'filled' : ''}"></span>
                  <span class="pip ${filledPips >= 3 ? 'filled' : ''}"></span>
                </span>
                <span style="font-weight:700; color:#ffffff; margin-left:3px;">${game.difficulty}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="game-card-footer">
          <div class="high-score-wrap">
            <span class="high-score-label">Personal Best</span>
            <span class="high-score-val" style="color:${highScore > 0 ? 'var(--cyan-primary)' : 'var(--text-muted)'};">${highScore > 0 ? highScore : '—'}</span>
          </div>
          <button class="btn-card-play">Start Drill ➔</button>
        </div>
      `;

      card.addEventListener('click', () => this.launchGame(game.id));
      this.gamesGrid.appendChild(card);
    });
  }

  attachGlobalEvents() {
    // Category Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.category;
        if (window.soundEngine) window.soundEngine.playTap(700);
        this.renderCatalog();
      });
    });

    // Search Input & Clear Button
    const searchInput = document.getElementById('game-search-input');
    const searchClear = document.getElementById('search-clear-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.renderCatalog();
      });

      // Quick key shortcuts: '/' to focus search, 'Escape' to clear
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !this.activeGameInstance) {
          e.preventDefault();
          searchInput.focus();
        } else if (e.key === 'Escape' && document.activeElement === searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          if (searchClear) searchClear.style.display = 'none';
          searchInput.blur();
          this.renderCatalog();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        searchClear.style.display = 'none';
        this.renderCatalog();
        if (searchInput) searchInput.focus();
      });
    }

    // Sound toggle in header
    const btnMute = document.getElementById('btn-sound-toggle');
    if (btnMute) {
      this.updateMuteIcon(btnMute);
      btnMute.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        this.updateMuteIcon(btnMute);
      });
    }

    // Brand click (home)
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', () => this.exitToHub());
    }

    // Daily Workout Button
    const btnDaily = document.getElementById('btn-daily-workout');
    if (btnDaily) {
      btnDaily.addEventListener('click', () => this.startDailyWorkout());
    }

    // Arena Exit Button
    const btnExit = document.getElementById('btn-arena-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => this.exitToHub());
    }

    // Arena Restart Button
    const btnRestart = document.getElementById('btn-arena-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (this.activeGameMeta) this.launchGame(this.activeGameMeta.id);
      });
    }

    // Arena Rules Button
    const btnRules = document.getElementById('btn-arena-rules');
    if (btnRules) {
      btnRules.addEventListener('click', () => this.showRulesModal());
    }

    // Close Modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Summary buttons
    const btnPlayAgain = document.getElementById('btn-summary-replay');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        this.summaryModal.classList.remove('active');
        if (this.activeGameMeta) this.launchGame(this.activeGameMeta.id);
      });
    }

    const btnNextGame = document.getElementById('btn-summary-next');
    if (btnNextGame) {
      btnNextGame.addEventListener('click', () => {
        this.summaryModal.classList.remove('active');
        if (this.dailyWorkoutActive) {
          this.advanceDailyWorkout();
        } else {
          this.exitToHub();
        }
      });
    }
  }

  updateMuteIcon(btn) {
    const isMuted = window.soundEngine.isMuted();
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
  }

  launchGame(gameId) {
    const meta = this.gamesCatalog.find(g => g.id === gameId);
    if (!meta) return;

    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }

    this.activeGameMeta = meta;

    // Switch view to arena
    this.heroSection.style.display = 'none';
    this.filterSection.style.display = 'none';
    this.catalogSection.style.display = 'none';
    this.arenaSection.classList.add('active');

    // Update HUD
    const titleEl = document.getElementById('arena-game-title') || document.getElementById('arena-title');
    const catEl = document.getElementById('arena-game-cat') || document.getElementById('arena-cat');
    const bestEl = document.getElementById('arena-high-score') || document.getElementById('arena-best');
    if (titleEl) titleEl.innerText = meta.title;
    if (catEl) {
      catEl.innerText = meta.category.toUpperCase();
      catEl.style.color = meta.accent;
    }
    if (bestEl) bestEl.innerText = window.brainState.getHighScore(meta.id) || '—';

    // Clear stage and instantiate game
    this.arenaStage.innerHTML = '';

    const GameClass = window[meta.classRef];
    if (GameClass) {
      this.activeGameInstance = new GameClass(this.arenaStage, (result) => {
        this.handleGameComplete(result);
      });
    } else {
      this.arenaStage.innerHTML = `<p style="color:var(--crimson-alert);">Game engine not loaded.</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleGameComplete(result) {
    const record = window.brainState.recordGame(
      result.gameId,
      result.score,
      result.domain,
      result.performanceRatio || 0.75
    );

    this.renderStats();

    // Show summary modal
    const summaryTitle = document.getElementById('summary-title') || document.getElementById('summary-game-title');
    if (summaryTitle) summaryTitle.innerText = `${this.activeGameMeta.title} Completed`;
    const summaryScore = document.getElementById('summary-score');
    if (summaryScore) summaryScore.innerText = result.score;
    const summaryAcc = document.getElementById('summary-accuracy');
    if (summaryAcc) summaryAcc.innerText = result.accuracy || '100%';
    const summaryDet = document.getElementById('summary-details');
    if (summaryDet) summaryDet.innerText = result.details || '';
    const summaryNq = document.getElementById('summary-nq-change');
    if (summaryNq) summaryNq.innerText = `Updated Cognitive Quotient (NQ): ${record.nq}`;

    const newHighBadge = document.getElementById('summary-new-record') || document.getElementById('summary-new-high');
    if (newHighBadge) {
      newHighBadge.style.display = record.isNewHigh ? 'inline-block' : 'none';
    }

    const nextBtn = document.getElementById('btn-summary-next');
    if (nextBtn) {
      if (this.dailyWorkoutActive) {
        nextBtn.innerText = 'Next Daily Drill ➔';
      } else {
        nextBtn.innerText = 'Back to Hub ➔';
      }
    }

    if (this.summaryModal) this.summaryModal.classList.add('active');
    if (window.confettiEngine && (record.isNewHigh || result.performanceRatio > 0.8)) {
      window.confettiEngine.fire(80);
    }
  }

  startDailyWorkout() {
    this.dailyWorkoutActive = true;
    const daily = window.brainState.data.dailyWorkout;
    const gameId = daily.games[daily.progress] || daily.games[0];
    this.launchGame(gameId);
  }

  advanceDailyWorkout() {
    const daily = window.brainState.data.dailyWorkout;
    if (daily.completed || daily.progress >= daily.games.length) {
      this.dailyWorkoutActive = false;
      this.exitToHub();
      if (window.confettiEngine) window.confettiEngine.fire(120);
    } else {
      const nextGameId = daily.games[daily.progress];
      this.launchGame(nextGameId);
    }
  }

  showRulesModal() {
    if (!this.activeGameMeta) return;
    const meta = this.activeGameMeta;

    const titleEl = document.getElementById('rules-modal-title');
    if (titleEl) titleEl.innerText = `${meta.title} — Protocols`;
    const bodyEl = document.getElementById('rules-modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <p style="font-size:1.02rem; margin-bottom:1.35rem; color:#ffffff; line-height:1.6;">${meta.desc}</p>
        <div class="modal-neuro-callout">
          <strong>🔬 Clinical Neuroscience Foundation</strong>
          <span>${meta.neuroscience}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:1.25rem; margin-top:1.35rem; font-size:0.88rem; color:var(--text-muted);">
          <span>⏱ Duration: <strong style="color:#ffffff;">${meta.duration}</strong></span>
          <span>🔥 Difficulty: <strong style="color:var(--amber-primary);">${meta.difficulty}</strong></span>
          <span>🏛 Lab: <strong style="color:var(--cyan-primary);">${meta.lab || 'Cognitive Science'}</strong></span>
        </div>
      `;
    }
    if (this.rulesModal) this.rulesModal.classList.add('active');
  }

  exitToHub() {
    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }
    this.activeGameInstance = null;
    this.activeGameMeta = null;
    this.dailyWorkoutActive = false;

    this.arenaSection.classList.remove('active');
    this.heroSection.style.display = 'grid';
    this.filterSection.style.display = 'flex';
    this.catalogSection.style.display = 'block';

    this.renderStats();
    this.renderCatalog();
    if (window.radarChart) {
      window.radarChart.draw();
    }
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  if (window.initNeuralParticles) window.initNeuralParticles();
  if (window.initRadarChart) window.initRadarChart();
  window.app = new AppController();
});
