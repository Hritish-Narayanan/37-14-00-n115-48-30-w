// Alien Meme Glyph Translator & Transceiver
import { sound } from './audio.js';

const GLYPH_MAP = {
  a: '⏃', b: '⏚', c: '☊', d: '⎅', e: '⟒', f: '⎎', g: '☌', h: '⊑',
  i: '⟟', j: '⟊', k: '☍', l: '⌰', m: '⋔', n: '⋏', o: '⍜', p: '⌿',
  q: '⍾', r: '⍀', s: '⌇', t: '⏁', u: '⎍', v: '⎐', w: '⍙', x: '⌖',
  y: '⊬', z: '⋉',
  '0': '⊘', '1': '➀', '2': '➁', '3': '➂', '4': '➃',
  '5': '➄', '6': '➅', '7': '➆', '8': '➇', '9': '➈',
  ' ': '   ', '!': '⚡', '?': '⍰'
};

export class AlienTranslator {
  constructor(container) {
    this.container = container;
    this.presets = [
      "Storm Area 51, they can't stop all of us",
      "Clap alien cheeks",
      "Naruto run faster than their bullets",
      "Ayy lmao take me to your leader",
      "We just came to Earth for Baja Blast and Wi-Fi"
    ];

    this.render();
  }

  translate(text) {
    return text
      .toLowerCase()
      .split('')
      .map((char) => GLYPH_MAP[char] || char)
      .join(' ');
  }

  playTransmissionTone() {
    sound.ensureContext();
    if (!sound.ctx || sound.isMuted) return;

    const ctx = sound.ctx;
    const now = ctx.currentTime;
    const notes = [520, 780, 1040, 1320, 1760, 2200];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.07);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(sound.masterGain);

      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="translator-wrapper">
        <div class="translator-controls-top">
          <label for="alien-input">TYPE HUMAN TRANSMISSION (ENGLISH):</label>
          <div class="preset-phrase-row">
            ${this.presets
              .map(
                (p) => `<button class="preset-chip" data-phrase="${p}">${p}</button>`
              )
              .join('')}
          </div>
        </div>

        <textarea id="alien-input" class="alien-text-area" rows="3" placeholder="Enter message to translate into Zeta Reticuli runes..."></textarea>

        <div class="translator-action-bar">
          <button class="action-btn-large" id="btn-transmit-alien">
            <span>📡 TRANSMIT TO ZETA RETICULI</span>
          </button>
          <button class="action-btn" id="btn-copy-runes">
            <span>COPY RUNES</span>
          </button>
        </div>

        <div class="glyph-output-card">
          <div class="glyph-output-header">
            <span class="card-tag">ZETA RETICULI FREQUENCY // CARRIER 1420.405 MHz</span>
            <span class="transmission-status" id="tx-status">READY FOR UPLINK</span>
          </div>
          <div class="alien-rendered-stream" id="alien-rendered-stream">
            ${this.translate("Storm Area 51, they can't stop all of us")}
          </div>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#alien-input');
    const output = this.container.querySelector('#alien-rendered-stream');
    const txBtn = this.container.querySelector('#btn-transmit-alien');
    const copyBtn = this.container.querySelector('#btn-copy-runes');
    const txStatus = this.container.querySelector('#tx-status');

    input.value = "Storm Area 51, they can't stop all of us";

    input.addEventListener('input', () => {
      output.textContent = this.translate(input.value || 'AREA 51');
      sound.playClick(1400);
    });

    this.container.querySelectorAll('.preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.phrase;
        input.value = text;
        output.textContent = this.translate(text);
        sound.playClick(1200);
      });
    });

    txBtn.addEventListener('click', () => {
      this.playTransmissionTone();
      txStatus.textContent = 'TRANSMITTING PACKET (39.17 LIGHT YEARS)...';
      txStatus.classList.add('transmitting');
      output.classList.add('glitch-effect');

      setTimeout(() => {
        txStatus.textContent = 'TRANSMISSION ACKNOWLEDGED BY MOTHERSHIP ✓';
        txStatus.classList.remove('transmitting');
        output.classList.remove('glitch-effect');
        sound.playAlienVocal();
      }, 950);
    });

    copyBtn.addEventListener('click', () => {
      sound.playClick(1300);
      navigator.clipboard.writeText(output.textContent.trim()).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'COPIED! ✓';
        setTimeout(() => { copyBtn.textContent = original; }, 1800);
      });
    });
  }
}
