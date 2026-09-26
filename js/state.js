/* ==========================================================================
   NEUROLAB - Cognitive State & Progress Tracking Engine
   Local storage persistence, Neuro Quotient (NQ) algorithm & domain metrics
   ========================================================================== */

class BrainState {
  constructor() {
    this.STORAGE_KEY = 'neurolab_state_v1';
    this.data = this.loadState();
    this.verifyStreak();
  }

  getDefaultState() {
    return {
      nq: 1040, // Base Neuro Quotient (Normalized 800 - 1600 scale)
      totalGamesPlayed: 0,
      streak: 1,
      lastPlayedDate: new Date().toISOString().split('T')[0],
      domains: {
        memory: 68,
        speed: 62,
        focus: 74,
        logic: 65,
        spatial: 60
      },
      highScores: {},
      dailyWorkout: {
        date: new Date().toISOString().split('T')[0],
        games: ['chimp-test', 'stroop', 'game-2048'],
        completed: false,
        progress: 0
      }
    };
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse localStorage state', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  verifyStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = this.data.lastPlayedDate;

    if (last !== today) {
      const lastDate = new Date(last);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.data.streak += 1;
      } else if (diffDays > 1) {
        // Streak reset
        this.data.streak = 1;
      }

      this.data.lastPlayedDate = today;

      // Reset daily workout for new day
      if (this.data.dailyWorkout.date !== today) {
        const pool = ['dual-nback', 'chimp-test', 'stroop', 'schulte-grid', 'memory-matrix', 'simon-seq', 'tower-hanoi', 'game-2048', 'speed-math', 'lights-out', 'wordle', 'mental-rotation'];
        // Pick 3 varied games
        const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
        this.data.dailyWorkout = {
          date: today,
          games: shuffled,
          completed: false,
          progress: 0
        };
      }
      this.saveState();
    }
  }

  recordGame(gameId, score, domain, performanceRatio = 1.0) {
    this.data.totalGamesPlayed += 1;

    // Update High Score
    const prevHigh = this.data.highScores[gameId] || 0;
    const isNewHigh = score > prevHigh;
    if (isNewHigh) {
      this.data.highScores[gameId] = score;
    }

    // Adaptive Domain Score Adjust (Bounded 30 to 100)
    if (domain && this.data.domains[domain] !== undefined) {
      const current = this.data.domains[domain];
      const delta = (performanceRatio - 0.5) * 4; // Scaled adjustment
      this.data.domains[domain] = Math.min(100, Math.max(30, Math.round(current + delta)));
    }

    // Update Neuro Quotient (NQ)
    const avgDomain = Object.values(this.data.domains).reduce((a, b) => a + b, 0) / 5;
    this.data.nq = Math.round(800 + (avgDomain / 100) * 800);

    // Update Daily Workout if applicable
    if (!this.data.dailyWorkout.completed && this.data.dailyWorkout.games.includes(gameId)) {
      this.data.dailyWorkout.progress += 1;
      if (this.data.dailyWorkout.progress >= this.data.dailyWorkout.games.length) {
        this.data.dailyWorkout.completed = true;
      }
    }

    this.saveState();

    // Trigger update callbacks
    if (window.radarChart) {
      window.radarChart.update(this.data.domains);
    }
    if (window.app) {
      window.app.renderStats();
    }

    return {
      isNewHigh,
      nq: this.data.nq,
      domainScore: this.data.domains[domain]
    };
  }

  getHighScore(gameId) {
    return this.data.highScores[gameId] || 0;
  }
}

window.brainState = new BrainState();
