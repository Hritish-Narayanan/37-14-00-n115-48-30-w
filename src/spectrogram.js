// Extraterrestrial Signal Interceptor and Spectrogram Visualizer
import { sound } from './audio.js';

export class SignalInterceptor {
  constructor(canvas, onMessageDecoded) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onMessageDecoded = onMessageDecoded;

    this.frequency = 1420.405; // MHz (Hydrogen Line)
    this.signalStrength = 84;
    this.waterfallHistory = [];
    this.maxHistory = 100;
    this.columns = 64;
    this.isDecoding = false;
    this.decodedData = null;

    this.alienChannels = [
      {
        freq: 1420.405,
        name: 'HYDROGEN LINE // WOW! REPETITION',
        glyphs: '⏁⍜⌰⏃⍀ ⎎⍀⟒⍾⎍⟒⋏☊⊬ ⟟⋏⏁⟒⍀☊⟒⌿⏁ 7-14-00',
        translation: 'PRIMARY RECON VECTOR: GROOM LAKE COORDINATES VERIFIED. GRAVIMETRIC AMPLIFIER 115 ONLINE.'
      },
      {
        freq: 432.108,
        name: 'ZETA RETICULI-II // TELEMETRY DOWNLINK',
        glyphs: '⟒⌰⟒⋔⟒⋏⏁ 115 ☊⍜⋏⏁⏃⟟⋏⋔⟒⋏⏁ ⎐⟒☊⏁⍜⍀ ⍜⋔⟟☊⍀⍜⋏',
        translation: 'PROPULSION MATRIX CALIBRATION: DELTA CONFIGURATION RECOMMENDED FOR SUB-LIGHT ATMOSPHERIC TRANSIT.'
      },
      {
        freq: 7.460,
        name: 'ELF SUB-SURFACE // PAPOOSE LAKE S-4 CARRIER',
        glyphs: '⎎⏃☊⟟⌰⟟⏁⊬ ⌰⍜☊☍⎅⍜⍙⋏ ⌿⍀⍜⏁⍜☊⍜⌰ ⋔⟊-12',
        translation: 'MAJESTIC-12 COMMUNIQUE: NON-HUMAN BIOLOGICAL ENTITIES RETAINED UNDER CRYOGENIC STASIS LEVEL-4.'
      }
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initWaterfall();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.min(rect.width * 0.55, 300);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  initWaterfall() {
    this.waterfallHistory = [];
    for (let r = 0; r < this.maxHistory; r++) {
      this.waterfallHistory.push(this.generateRow());
    }
  }

  generateRow() {
    const row = new Float32Array(this.columns);
    const activeCh = this.getCurrentChannel();
    const peakCol = activeCh ? Math.floor((this.frequency % 10) * 6 + 10) % this.columns : -1;

    for (let i = 0; i < this.columns; i++) {
      let noise = Math.random() * 0.28;
      if (peakCol >= 0 && Math.abs(i - peakCol) <= 2) {
        noise += (1 - Math.abs(i - peakCol) * 0.35) * 0.72;
      }
      row[i] = Math.min(1, noise);
    }
    return row;
  }

  getCurrentChannel() {
    return this.alienChannels.find((ch) => Math.abs(ch.freq - this.frequency) < 0.5) || null;
  }

  tuneFrequency(freq) {
    this.frequency = parseFloat(freq);
    sound.playAlienWarble(this.frequency > 500 ? 940 : 340);
  }

  startDecrypt() {
    if (this.isDecoding) return;
    this.isDecoding = true;
    sound.playAlienWarble(1200);

    const ch = this.getCurrentChannel() || this.alienChannels[0];
    let step = 0;
    const interval = setInterval(() => {
      sound.playClick(600 + step * 80);
      step++;
      if (step >= 12) {
        clearInterval(interval);
        this.isDecoding = false;
        this.decodedData = ch;
        sound.playAccessGranted();
        if (this.onMessageDecoded) {
          this.onMessageDecoded(ch);
        }
      }
    }, 120);
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Dark terminal background
    ctx.fillStyle = '#020605';
    ctx.fillRect(0, 0, width, height);

    // Push new row every few frames
    if (Math.random() < 0.6) {
      this.waterfallHistory.unshift(this.generateRow());
      if (this.waterfallHistory.length > this.maxHistory) {
        this.waterfallHistory.pop();
      }
    }

    const rowH = (height - 65) / this.maxHistory;
    const colW = width / this.columns;

    // Render Waterfall Heatmap
    for (let r = 0; r < this.waterfallHistory.length; r++) {
      const row = this.waterfallHistory[r];
      const y = height - 35 - r * rowH;

      for (let c = 0; c < this.columns; c++) {
        const val = row[c];
        const x = c * colW;

        if (val > 0.65) {
          // Intense alien signal (cyan / bright neon)
          ctx.fillStyle = `rgba(0, 255, 200, ${val})`;
        } else if (val > 0.35) {
          // Tactical green
          ctx.fillStyle = `rgba(0, 180, 80, ${val * 0.8})`;
        } else {
          // Background static
          ctx.fillStyle = `rgba(0, 40, 20, ${val * 0.4})`;
        }
        ctx.fillRect(x, y, colW + 0.5, rowH + 0.5);
      }
    }

    // Top Oscilloscope / Fast Fourier Waveform
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.85)';
    ctx.lineWidth = 1.5;
    const topRow = this.waterfallHistory[0] || [];
    for (let i = 0; i < this.columns; i++) {
      const x = i * colW + colW / 2;
      const amp = (topRow[i] || 0) * 45;
      const y = 55 - amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Baseline axis
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, 55);
    ctx.lineTo(width, 55);
    ctx.stroke();

    // Spectrogram Frequency Ruler
    ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.font = '8px "Courier New", monospace';
    const markStep = Math.floor(this.columns / 6);
    for (let i = 0; i <= this.columns; i += markStep) {
      const x = i * colW;
      const freqLabel = (this.frequency - 5 + (i / this.columns) * 10).toFixed(2);
      ctx.fillText(`${freqLabel} MHz`, Math.min(x, width - 45), height - 18);
    }

    // Header info
    const activeCh = this.getCurrentChannel();
    ctx.fillStyle = activeCh ? '#00e5ff' : 'rgba(0, 255, 136, 0.8)';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText(`RECEIVER: AN/FLR-9 WULLENWEBER ARRAY // ${this.frequency.toFixed(3)} MHz`, 8, 14);

    if (activeCh) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`ANOMALY DETECTED: [${activeCh.name}]`, 8, 26);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(`SIGNAL: COSMIC RF STATIC // SEEKING NARROW-BAND EMITTER`, 8, 26);
    }
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}
