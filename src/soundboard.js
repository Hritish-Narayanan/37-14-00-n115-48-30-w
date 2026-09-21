// S-4 Alien Meme Soundboard Controller
import { sound } from './audio.js';

export class MemeSoundboard {
  constructor(container) {
    this.container = container;
    this.buttons = [
      { id: 'sb-xfiles', name: 'X-FILES MELODY', icon: '🛸', desc: 'Cosmic 5-note mystery theme', action: () => sound.playXFiles() },
      { id: 'sb-ayylmao', name: 'AYY LMAO', icon: '👽', desc: 'Synthesized alien voice formant', action: () => sound.playAlienVocal() },
      { id: 'sb-fbi', name: 'FBI OPEN UP!', icon: '🚨', desc: 'Heavy sub-bass wall breach explosion', action: () => sound.playFbiOpenUp() },
      { id: 'sb-monster', name: 'CRACK A MONSTER', icon: '⚡', desc: 'Kyle fuel: can crack & fizzy bubbles', action: () => sound.playMonsterCrack() },
      { id: 'sb-naruto', name: 'NARUTO SWOOSH', icon: '🏃', desc: 'Sonic boom arms-back sprint', action: () => sound.playNarutoSwoosh() },
      { id: 'sb-laser', name: 'LASER BLASTER', icon: '🔫', desc: 'Area 51 arcade pew-pew', action: () => sound.playLaserPew() },
      { id: 'sb-beam', name: 'TRACTOR BEAM', icon: '🌌', desc: 'Alien saucer abduction frequency', action: () => sound.playTractorBeam() },
      { id: 'sb-geiger', name: 'ELEMENT 115 GEIGER', icon: '☢️', desc: 'Moscovium ionization radiation clicks', action: () => sound.playGeigerClick(22) },
      { id: 'sb-siren', name: 'DEFCON 1 KLAXON', icon: '📢', desc: 'High-voltage base emergency siren', action: () => sound.startSiren() }
    ];

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="soundboard-grid">
        ${this.buttons
          .map(
            (b) => `
          <button class="soundboard-btn" id="${b.id}" data-btn="${b.id}">
            <div class="sb-btn-top">
              <span class="sb-icon">${b.icon}</span>
              <span class="sb-wave-indicator"></span>
            </div>
            <div class="sb-btn-name">${b.name}</div>
            <div class="sb-btn-desc">${b.desc}</div>
          </button>
        `
          )
          .join('')}
      </div>
      <div class="soundboard-siren-stop-row">
        <button class="action-btn" id="btn-stop-siren">SILENCE BASE ALARM</button>
      </div>
    `;

    // Bind click events
    this.buttons.forEach((b) => {
      const el = this.container.querySelector(`#${b.id}`);
      if (el) {
        el.addEventListener('click', () => {
          el.classList.add('playing');
          b.action();
          setTimeout(() => el.classList.remove('playing'), 650);
        });
      }
    });

    const stopSirenBtn = this.container.querySelector('#btn-stop-siren');
    if (stopSirenBtn) {
      stopSirenBtn.addEventListener('click', () => {
        sound.stopSiren();
        sound.playClick(900);
      });
    }
  }
}
