/* ==========================================================================
   NEUROLAB - Cognitive State, Trial Ledger & Protocol Engine
   Every tap is stored. The Neuro Quotient is rebuilt from those taps.
   ========================================================================== */

class BrainState {
  constructor() {
    this.STORAGE_KEY = 'neurolab_state_v2';
    this.LEGACY_KEY = 'neurolab_state_v1';
    this.data = this.normalize(this.loadState());
    this.verifyCalendar();
  }

  catalog() {
    return [
      { id: 'dual-nback', domain: 'memory', title: 'Dual N-Back' },
      { id: 'chimp-test', domain: 'memory', title: 'Ayumu Chimp Test' },
      { id: 'memory-matrix', domain: 'memory', title: 'Memory Matrix' },
      { id: 'simon-seq', domain: 'memory', title: 'Simon Sequence' },
      { id: 'schulte-grid', domain: 'speed', title: 'Schulte Grid' },
      { id: 'speed-math', domain: 'speed', title: 'Speed Math' },
      { id: 'stroop', domain: 'focus', title: 'Stroop' },
      { id: 'interference', domain: 'focus', title: 'Interference' },
      { id: 'tower-hanoi', domain: 'logic', title: 'Tower of Hanoi' },
      { id: 'game-2048', domain: 'logic', title: '2048' },
      { id: 'lights-out', domain: 'logic', title: 'Lights Out' },
      { id: 'wordle', domain: 'logic', title: 'Wordle' },
      { id: 'mental-rotation', domain: 'spatial', title: 'Mental Rotation' }
    ];
  }

  titleFor(gameId) {
    const found = this.catalog().find(g => g.id === gameId);
    return found ? found.title : gameId;
  }

  today() {
    const d = new Date();
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }

  daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  hash(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* Mulberry32. Same seed, same boards, on every machine. */
  rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  dailySeed() {
    return this.hash(this.today() + ':neurolab-duel');
  }

  duelCode() {
    const compact = this.today().replace(/-/g, '');
    return 'AYU-' + compact + '-' + String(this.dailySeed() % 10000).padStart(4, '0');
  }

  getDefaultState() {
    const today = this.today();
    return {
      nq: 1040,
      totalGamesPlayed: 0,
      streak: 0,
      lastPlayedDate: null,
      domains: {
        memory: 68,
        speed: 62,
        focus: 74,
        logic: 65,
        spatial: 60
      },
      highScores: {},
      levels: {},
      ledger: [],
      sessions: [],
      nqHistory: [],
      palace: null,
      dailyWorkout: {
        date: today,
        games: ['chimp-test', 'stroop', 'game-2048'],
        completed: false,
        progress: 0
      }
    };
  }

  normalize(data) {
    const base = this.getDefaultState();
    const merged = {
      ...base,
      ...data,
      domains: { ...base.domains, ...(data && data.domains) },
      highScores: { ...(data && data.highScores) },
      levels: { ...(data && data.levels) },
      ledger: Array.isArray(data && data.ledger) ? data.ledger : [],
      sessions: Array.isArray(data && data.sessions) ? data.sessions : [],
      nqHistory: Array.isArray(data && data.nqHistory) ? data.nqHistory : [],
      dailyWorkout: { ...base.dailyWorkout, ...(data && data.dailyWorkout) }
    };
    if (typeof merged.nq !== 'number' || merged.nq < 800 || merged.nq > 1600) {
      merged.nq = 1040;
    }
    return merged;
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      const legacy = localStorage.getItem(this.LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
          ...parsed,
          ledger: [],
          sessions: [],
          levels: {},
          nqHistory: parsed.nq ? [{ t: Date.now(), nq: parsed.nq }] : [],
          palace: null
        };
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

  queueSave() {
    if (typeof setTimeout !== 'function') {
      this.saveState();
      return;
    }
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.saveState(), 350);
  }

  verifyCalendar() {
    const today = this.today();
    const last = this.data.lastPlayedDate;
    if (last && this.daysBetween(last, today) > 1) {
      this.data.streak = 0;
    }
    const workout = this.data.dailyWorkout;
    if (!workout || workout.date !== today || !workout.prescribed) {
      this.data.dailyWorkout = {
        date: today,
        games: this.composeWorkout(today),
        completed: false,
        progress: 0,
        prescribed: true
      };
    }
    this.saveState();
  }

  /* Three drills aimed at the thinnest domains. Stable for the whole day. */
  composeWorkout(date) {
    const roll = this.rng(this.hash(String(date) + ':protocol'));
    const ranked = Object.entries(this.data.domains).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    const picked = [];
    ranked.forEach(([domain]) => {
      if (picked.length >= 3) return;
      const pool = this.catalog().filter(g => g.domain === domain && picked.indexOf(g.id) === -1);
      if (!pool.length) return;
      picked.push(pool[Math.floor(roll() * pool.length)].id);
    });
    return picked;
  }

  markPlayedToday() {
    const today = this.today();
    if (this.data.lastPlayedDate === today) return;
    const gap = this.data.lastPlayedDate ? this.daysBetween(this.data.lastPlayedDate, today) : 999;
    this.data.streak = gap === 1 ? (this.data.streak || 0) + 1 : 1;
    this.data.lastPlayedDate = today;
  }

  staircase(gameId) {
    return this.data.levels[gameId] || 0;
  }

  bestSpan() {
    let best = 0;
    this.data.sessions.forEach(s => {
      if (s.gameId === 'chimp-test' && s.signals && s.signals.span > best) best = s.signals.span;
    });
    return best;
  }

  logTrial(trial) {
    if (!trial) return;
    const row = {
      gameId: trial.gameId || 'unknown',
      domain: trial.domain || 'memory',
      correct: !!trial.correct,
      rt: Math.max(0, Math.round(trial.rt || 0)),
      tag: trial.tag || '',
      ts: Date.now()
    };
    this.data.ledger.push(row);
    if (this.data.ledger.length > 480) {
      this.data.ledger.splice(0, this.data.ledger.length - 480);
    }
    if (window.soundEngine && window.soundEngine.rememberTrial) {
      window.soundEngine.rememberTrial(row);
    }
    if (window.neuralField && window.neuralField.pulse) {
      window.neuralField.pulse(row.domain, row.correct);
    }
    this.queueSave();
    return row;
  }

  recordGame(gameId, score, domain, performanceRatio = 1.0, signals = null) {
    const ratio = Math.max(0, Math.min(1, Number(performanceRatio) || 0));
    this.data.totalGamesPlayed += 1;
    this.markPlayedToday();

    const prevHigh = this.data.highScores[gameId] || 0;
    const isNewHigh = score > prevHigh;
    if (isNewHigh) this.data.highScores[gameId] = score;

    if (domain && this.data.domains[domain] !== undefined) {
      const current = this.data.domains[domain];
      const delta = (ratio - 0.5) * 6;
      let next = current + delta;
      const recent = this.data.sessions.filter(s => s.domain === domain).slice(-6);
      if (recent.length >= 3) {
        const evidence = recent.reduce((sum, s) => sum + s.ratio, 0) / recent.length;
        const target = 30 + evidence * 70;
        next = next * 0.65 + target * 0.35;
      }
      this.data.domains[domain] = Math.min(100, Math.max(30, Math.round(next)));
    }

    const lvl = this.data.levels[gameId] || 0;
    if (ratio >= 0.82) this.data.levels[gameId] = Math.min(6, lvl + 1);
    else if (ratio < 0.4) this.data.levels[gameId] = Math.max(0, lvl - 1);

    const avgDomain = Object.values(this.data.domains).reduce((a, b) => a + b, 0) / 5;
    this.data.nq = Math.round(800 + (avgDomain / 100) * 800);
    this.data.nq = Math.min(1600, Math.max(800, this.data.nq));

    const session = {
      t: Date.now(),
      date: this.today(),
      gameId,
      domain,
      score,
      ratio,
      signals: signals || {}
    };
    this.data.sessions.push(session);
    if (this.data.sessions.length > 80) {
      this.data.sessions.splice(0, this.data.sessions.length - 80);
    }
    this.data.nqHistory.push({ t: session.t, nq: this.data.nq });
    if (this.data.nqHistory.length > 48) {
      this.data.nqHistory.splice(0, this.data.nqHistory.length - 48);
    }
    if (signals && signals.palace && signals.palace.cells) {
      this.data.palace = {
        size: signals.palace.size || 3,
        cells: signals.palace.cells.slice(0, 36),
        gameId,
        t: Date.now()
      };
    }

    if (!this.data.dailyWorkout.completed && this.data.dailyWorkout.games.includes(gameId)) {
      this.data.dailyWorkout.progress += 1;
      if (this.data.dailyWorkout.progress >= this.data.dailyWorkout.games.length) {
        this.data.dailyWorkout.completed = true;
      }
    }

    this.saveState();

    if (window.radarChart) window.radarChart.update(this.data.domains);
    if (window.neuralField && window.neuralField.sync) window.neuralField.sync(this.data.domains);
    if (window.app) window.app.renderStats();

    return {
      isNewHigh,
      nq: this.data.nq,
      domainScore: domain ? this.data.domains[domain] : null,
      note: this.labNote()
    };
  }

  getHighScore(gameId) {
    return this.data.highScores[gameId] || 0;
  }

  labNote() {
    const sessions = this.data.sessions;
    if (!sessions.length) {
      const names = (this.data.dailyWorkout.games || []).map(id => this.titleFor(id)).join(' · ');
      return 'The ledger is empty. Finish a drill and this line will name the cost of the word, the span you held, and the domain that is thin. Today’s protocol is already written: ' + names + '.';
    }

    const last = sessions[sessions.length - 1];
    const weakest = Object.entries(this.data.domains).sort((a, b) => a[1] - b[1])[0];
    const lines = [];
    lines.push(this.titleFor(last.gameId) + ' closed at ' + Math.round(last.ratio * 100) + ' on the scale.');

    const sig = last.signals || {};
    if (typeof sig.interferenceMs === 'number' && sig.interferenceMs !== 0) {
      const ms = Math.round(sig.interferenceMs);
      lines.push(ms > 30
        ? 'Reading the word cost ' + ms + ' ms against the ink.'
        : 'Ink and word landed within ' + Math.abs(ms) + ' ms of each other.');
    }
    if (typeof sig.span === 'number') {
      lines.push('Span held at ' + sig.span + '. You took ' + (sig.youWins || 0) + ' rounds, Ayumu took ' + (sig.ayumuWins || 0) + '.');
    }
    if (typeof sig.switchCostMs === 'number') {
      lines.push('Changing tasks cost ' + Math.round(sig.switchCostMs) + ' ms.');
    }
    if (typeof sig.seconds === 'number') {
      lines.push('The grid fell in ' + sig.seconds.toFixed(2) + 's.');
    }

    const recent = this.data.ledger.slice(-12);
    if (recent.length >= 6) {
      const first = recent.slice(0, 4).reduce((s, t) => s + t.rt, 0) / 4;
      const tail = recent.slice(-4).reduce((s, t) => s + t.rt, 0) / 4;
      if (tail > first * 1.35 && tail > 400) {
        lines.push('The last taps slowed. Stop while the trace is still clean.');
      }
    }

    const protocol = (this.data.dailyWorkout.games || []).map(id => this.titleFor(id)).join(' · ');
    lines.push('Thin domain: ' + weakest[0] + ' (' + weakest[1] + '). Protocol: ' + protocol + '.');
    return lines.join(' ');
  }
}

window.brainState = new BrainState();
