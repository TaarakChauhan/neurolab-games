# 🧠 NEUROLAB - Elite Brain Games & Cognitive Training Suite

A laboratory-grade suite of **12 scientifically grounded brain training games** built with HTML5, Vanilla CSS, and modern JavaScript. Designed with stunning cyber-neuromorphic aesthetics, real-time Canvas visualizations, Web Audio API synthesizers, and zero external build dependencies.

---

## 🚀 Quick Start

You can run the web app in two ways:

### Option 1: Direct File Launch
Double click [`index.html`](file:///Users/tacmach/Documents/brain%20games/index.html) to open directly in any browser (Chrome, Safari, Edge, Firefox).

### Option 2: Local HTTP Server (Recommended)
Open Terminal and run:
```bash
cd "/Users/tacmach/Documents/brain games"
python3 -m http.server 8765
```
Then visit: [http://localhost:8765](http://localhost:8765)

---

## 🎮 The 12 Cognitive Brain Games

| Game | Category | Cognitive Target | Description |
|---|---|---|---|
| **Dual N-Back** | Working Memory | Dorsolateral Prefrontal Cortex (DLPFC) | Monitor simultaneous auditory and spatial streams $N$ steps back. Signal Detection Theory scoring. |
| **Ayumu Chimp Test** | Working Memory | Visuospatial Scratchpad & Eidetic Recall | Recall scrambled numbers 1–9+ after they mask into blank holographic tiles, competing with Ayumu the chimp. |
| **Memory Matrix** | Working Memory | Parietal-Hippocampal Spatial Map | Memorize and recall expanding coordinate patterns from 3x3 to 6x6. |
| **Simon Sequence** | Working Memory | Auditory-Visual Sequencing (STG) | Harmonic frequencies and color quadrant sequence recall with progressive speed. |
| **Schulte Grid 5x5** | Processing Speed | Visual Search & Peripheral Field | Locate numbers 1 through 25 sequentially while maintaining central fixation. |
| **Speed Math Frenzy** | Processing Speed | Intraparietal Sulcus Arithmetic | 60-second rapid-fire mental arithmetic calculations with streak combo multipliers. |
| **Stroop Color Clash** | Focus & Inhibition | Anterior Cingulate Cortex (ACC) | Identify ink colors while overriding the automatic impulse to read the written word. |
| **Tower of Hanoi** | Logic & Planning | Prefrontal Executive Decomposition | Recursive disk transfer puzzle with moves counter vs optimal $2^n - 1$ formula and AI auto-solver. |
| **2048 Neon Fusion** | Logic & Planning | Spatial Forward Planning & Strategy | Slide and merge tiles with swipe and arrow keys, featuring undo and merge animations. |
| **Lights Out** | Logic & Planning | Boolean Matrix Parity Logic | Invert all illuminated nodes where clicking toggles the cell and its 4 orthogonal neighbors. Includes hints. |
| **Wordle Master** | Logic & Planning | Lexical Working Memory & Deduction | 6 attempts to deduce a secret 5-letter word with color-coded constraints. |
| **3D Mental Rotation** | Spatial & 3D IQ | Parietal Spatial Transformation | Canonical Shepard & Metzler task identifying true 3D rotated polycubes versus chiral mirror distractors. |

---

## ✨ Key Features & Architecture

1. **Cyber-Neuromorphic Aesthetics**:
   - Deep obsidian dark mode (`#07090e`) with jewel-tone accents (Electric Violet, Neon Cyan, Emerald, Solar Amber, Rose Magenta).
   - Interactive synaptic particle network on HTML5 Canvas that responds to cursor proximity.
   - Glassmorphic panels with backdrop blurs and subtle edge glows.

2. **Real-Time Cognitive Radar Chart**:
   - High-DPI canvas radar chart tracking performance across **5 cognitive domains**: Memory, Speed, Focus, Logic, and Spatial.
   - Dynamic **Neuro Quotient (NQ)** algorithm scaling from 800 to 1600 based on session performance.

3. **Daily 3-Game Workout Mode**:
   - Chains three varied cognitive drills each day and tracks daily training streaks.

4. **Pure Web Audio API Synthesizer**:
   - Zero audio assets or external sound files needed.
   - Synthesizes marimba taps, crystal-clear success chords, error buzzers, and musical tones in real time.
   - Master mute toggle in the header.

5. **60fps Canvas Confetti Engine**:
   - Smooth celebratory particle bursts upon high scores and victories.

6. **Local Persistence**:
   - All high scores, personal bests, NQ history, and streaks persist in `localStorage`.
