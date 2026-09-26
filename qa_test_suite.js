/* ==========================================================================
   NEUROLAB - Comprehensive CLI QA Automated Test Suite
   Runs on JavaScriptCore engine to validate all 12 games, logic, and state
   ========================================================================== */

var window = globalThis;
var document = {
  getElementById: function(id) {
    return {
      id: id,
      innerText: '',
      innerHTML: '',
      style: {},
      classList: {
        add: function() {},
        remove: function() {},
        toggle: function() {},
        contains: function() { return false; }
      },
      addEventListener: function() {},
      getContext: function() {
        return {
          clearRect: function() {},
          beginPath: function() {},
          arc: function() {},
          fill: function() {},
          stroke: function() {},
          moveTo: function() {},
          lineTo: function() {},
          closePath: function() {},
          save: function() {},
          restore: function() {},
          translate: function() {},
          rotate: function() {},
          fillRect: function() {},
          scale: function() {},
          createRadialGradient: function() {
            return { addColorStop: function() {} };
          }
        };
      },
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; },
      getBoundingClientRect: function() {
        return { width: 300, height: 250 };
      }
    };
  },
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      innerText: '',
      innerHTML: '',
      dataset: {},
      style: {},
      children: [],
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        toggle: function(c, v) { if (v === undefined) v = !this.classes.has(c); if (v) this.classes.add(c); else this.classes.delete(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      appendChild: function(child) { this.children.push(child); return child; },
      addEventListener: function() {},
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; },
      remove: function() {}
    };
  },
  addEventListener: function() {}
};

var localStorageStore = {};
var localStorage = {
  getItem: function(k) { return localStorageStore[k] || null; },
  setItem: function(k, v) { localStorageStore[k] = String(v); },
  removeItem: function(k) { delete localStorageStore[k]; },
  clear: function() { localStorageStore = {}; }
};
window.localStorage = localStorage;
window.addEventListener = function() {};
window.innerWidth = 1440;
window.innerHeight = 900;
window.devicePixelRatio = 2;

// Load Core Modules
load("js/audio.js");
load("js/confetti.js");
load("js/state.js");
load("js/radar.js");
load("js/particles.js");

// Load 12 Games
load("js/games/dual-nback.js");
load("js/games/chimp-test.js");
load("js/games/stroop.js");
load("js/games/schulte-grid.js");
load("js/games/memory-matrix.js");
load("js/games/simon-seq.js");
load("js/games/tower-hanoi.js");
load("js/games/game-2048.js");
load("js/games/speed-math.js");
load("js/games/lights-out.js");
load("js/games/wordle.js");
load("js/games/mental-rotation.js");

var passed = 0;
var failed = 0;
var total = 0;

function assert(name, condition, extra) {
  total++;
  if (condition) {
    passed++;
    print("  [PASS] " + name + (extra ? " (" + extra + ")" : ""));
  } else {
    failed++;
    print("  [FAIL] " + name + " - " + (extra || "assertion failed"));
  }
}

function createMockContainer() {
  var container = document.createElement('div');
  container.innerHTML = '';
  container.querySelectorAll = function(sel) {
    // Basic selector support for our tests
    var results = [];
    function traverse(node) {
      if (!node) return;
      if (sel.startsWith('.')) {
        var cls = sel.slice(1);
        if (node.classList && node.classList.contains(cls)) results.push(node);
      } else if (sel.startsWith('#')) {
        var id = sel.slice(1);
        if (node.id === id) results.push(node);
      } else if (node.tagName && node.tagName.toLowerCase() === sel.toLowerCase()) {
        results.push(node);
      }
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          traverse(node.children[i]);
        }
      }
    }
    traverse(container);
    return results;
  };
  container.querySelector = function(sel) {
    var res = container.querySelectorAll(sel);
    return res.length > 0 ? res[0] : null;
  };
  return container;
}

print("=================================================");
print("       NEUROLAB COGNITIVE QA TEST SUITE          ");
print("=================================================");

// 1. Audio Engine
print("\n--- Testing Sound Engine ---");
assert("SoundEngine exists", !!window.soundEngine);
assert("SoundEngine can mute and unmute", typeof window.soundEngine.toggleMute === 'function');
assert("SoundEngine initial state is unmuted", window.soundEngine.isMuted() === false);
window.soundEngine.toggleMute();
assert("SoundEngine toggles to muted", window.soundEngine.isMuted() === true);
window.soundEngine.toggleMute();

// 2. Confetti Engine
print("\n--- Testing Confetti Engine ---");
assert("ConfettiEngine exists", !!window.confettiEngine);
assert("ConfettiEngine has fire method", typeof window.confettiEngine.fire === 'function');

// 3. BrainState Persistence & Algorithm
print("\n--- Testing Brain State & Metrics ---");
assert("BrainState is initialized", !!window.brainState);
assert("Base NQ is within healthy scale (800 - 1600)", window.brainState.data.nq >= 800 && window.brainState.data.nq <= 1600);
assert("All 5 domains are tracked", Object.keys(window.brainState.data.domains).length === 5);
var rec = window.brainState.recordGame('test-game', 1200, 'memory', 0.95);
assert("Score is recorded and returns valid updated NQ", rec.nq >= 800);
assert("High score is retrieved accurately", window.brainState.getHighScore('test-game') === 1200);

// 4. Game 1: Dual N-Back
print("\n--- Testing Game 1: Dual N-Back ---");
var nback = new DualNBackGame(createMockContainer(), function() {});
assert("Dual N-Back initializes correctly", typeof nback.runTrial === 'function');
assert("Dual N-Back letters pool is defined", nback.letters.length === 8);
nback.handlePosMatch();
assert("Dual N-Back handles user visual match", nback.userPosMatched === true);
nback.handleAudioMatch();
assert("Dual N-Back handles user audio match", nback.userAudioMatched === true);
nback.destroy();

// 5. Game 2: Chimp Test
print("\n--- Testing Game 2: Ayumu Chimp Test ---");
var chimp = new ChimpTestGame(createMockContainer(), function() {});
assert("Chimp Test initializes 8x5 grid dimensions", chimp.rows === 5 && chimp.cols === 8);
assert("Chimp Test starts at level 4", chimp.level === 4);
assert("Chimp Test has 0 initial strikes", chimp.strikes === 0);
chimp.destroy();

// 6. Game 3: Stroop Color Clash
print("\n--- Testing Game 3: Stroop Color Clash ---");
var stroop = new StroopGame(createMockContainer(), function() {});
assert("Stroop has 4 primary color vectors", stroop.colors.length === 4);
assert("Stroop timer initializes at 30s", stroop.timeLeft === 30);
var targetInk = stroop.currentInkColor;
stroop.handleAnswer(targetInk);
assert("Stroop correctly evaluates matching ink color", stroop.score > 0 && stroop.streak === 1);
stroop.destroy();

// 7. Game 4: Schulte Grid
print("\n--- Testing Game 4: Schulte Grid ---");
var schulte = new SchulteGridGame(createMockContainer(), function() {});
assert("Schulte Grid contains 25 numbers", schulte.maxNum === 25);
assert("Schulte Grid starts with target 1", schulte.nextTarget === 1);
var mockTile = document.createElement('div');
schulte.handleTileClick(mockTile, 1);
assert("Schulte Grid advances to target 2 after click", schulte.nextTarget === 2);
schulte.destroy();

// 8. Game 5: Memory Matrix
print("\n--- Testing Game 5: Memory Matrix ---");
var matrix = new MemoryMatrixGame(createMockContainer(), function() {});
assert("Memory Matrix begins with 3x3 grid", matrix.gridSize === 3);
assert("Memory Matrix selects 3 active target cells", matrix.targetCells.size === 3);
matrix.destroy();

// 9. Game 6: Simon Sequence
print("\n--- Testing Game 6: Simon Sequence ---");
var simon = new SimonGame(createMockContainer(), function() {});
assert("Simon Sequence initializes sequence array", simon.sequence.length >= 1);
assert("Simon Sequence initial player step is 0", simon.playerStep === 0);
simon.destroy();

// 10. Game 7: Tower of Hanoi
print("\n--- Testing Game 7: Tower of Hanoi ---");
var hanoi = new TowerHanoiGame(createMockContainer(), function() {});
assert("Tower of Hanoi initializes 3 rods", hanoi.rods.length === 3);
assert("Tower of Hanoi default disk count is 4", hanoi.diskCount === 4);
assert("Optimal moves formula matches 2^4 - 1 = 15", hanoi.optimalMoves === 15);
hanoi.rods = [[3], [1], []];
hanoi.selectedRod = 0;
hanoi.handleRodClick(1);
assert("Tower of Hanoi rejects illegal move (larger disk on smaller)", hanoi.rods[0].length === 1 && hanoi.rods[1].length === 1);
hanoi.destroy();

// 11. Game 8: 2048 Neon Fusion
print("\n--- Testing Game 8: 2048 Neon Fusion ---");
var g2048 = new Game2048(createMockContainer(), function() {});
assert("2048 initializes 4x4 grid", g2048.size === 4 && g2048.grid.length === 4);
var active2048Tiles = 0;
g2048.grid.forEach(function(row) {
  row.forEach(function(val) { if (val > 0) active2048Tiles++; });
});
assert("2048 starts with 2 active tiles", active2048Tiles === 2);
// Test move rotation logic
g2048.grid = [
  [2, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];
var moved = g2048.move(3); // Left
assert("2048 merges identical adjacent tiles", g2048.grid[0][0] === 4 && g2048.score === 4);
g2048.destroy();

// 12. Game 9: Speed Math Frenzy
print("\n--- Testing Game 9: Speed Math Frenzy ---");
var math = new SpeedMathGame(createMockContainer(), function() {});
assert("Speed Math creates answer options", math.currentOptions && math.currentOptions.length === 4);
assert("Speed Math sets correct answer", typeof math.correctAnswer === 'number');
math.handleChoice(math.correctAnswer);
assert("Speed Math increases score on correct answer", math.score > 0 && math.streak === 1);
math.destroy();

// 13. Game 10: Lights Out
print("\n--- Testing Game 10: Lights Out ---");
var lights = new LightsOutGame(createMockContainer(), function() {});
assert("Lights Out initializes 5x5 board", lights.size === 5 && lights.board.length === 5);
var initialFlip = lights.board[0][0];
lights.toggle(0, 0);
assert("Lights Out toggles target node", lights.board[0][0] !== initialFlip);
lights.destroy();

// 14. Game 11: Wordle Master
print("\n--- Testing Game 11: Wordle Master ---");
var wordle = new WordleGame(createMockContainer(), function() {});
assert("Wordle target word is 5 letters", wordle.targetWord && wordle.targetWord.length === 5);
assert("Wordle dictionary contains curated words", wordle.wordList.length >= 20);
wordle.addLetter('S');
wordle.addLetter('M');
wordle.addLetter('A');
assert("Wordle tracks entered letters", wordle.currentGuess === 'SMA');
wordle.removeLetter();
assert("Wordle removes letters with backspace", wordle.currentGuess === 'SM');
wordle.destroy();

// 15. Game 12: Mental Rotation (3D Spatial IQ)
print("\n--- Testing Game 12: 3D Mental Rotation ---");
var rot = new MentalRotationGame(createMockContainer(), function() {});
var baseShape = rot.generateShape();
assert("Mental Rotation generates 5-cube 3D configuration", baseShape.length === 5);
var rotatedShape = rot.rotate3D(baseShape, 1, 2, 0);
assert("Mental Rotation performs 3D spatial rotation", rotatedShape.length === 5);
var mirroredShape = rot.mirrorFlip(baseShape);
assert("Mental Rotation produces chiral mirror distractor", mirroredShape.length === 5);
rot.destroy();

print("\n=================================================");
print("QA TEST SUMMARY: " + passed + " / " + total + " PASSED (" + Math.round((passed / total) * 100) + "%)");
print("=================================================");
