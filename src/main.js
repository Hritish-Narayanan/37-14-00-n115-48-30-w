// Simple Area 51 Alien Meme Hub Orchestrator
import { sound } from './audio.js';
import { NarutoRunnerGame } from './minigame.js';
import { RaiderBadgeGenerator } from './idgenerator.js';
import { MemeSoundboard } from './soundboard.js';
import { AlienTranslator } from './translator.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elapsed Raid Counter (Since September 20, 2019)
  const raidTimerText = document.getElementById('raid-timer-text');
  const raidStartTime = new Date('2019-09-20T03:00:00Z').getTime();

  function updateRaidTimer() {
    if (!raidTimerText) return;
    const diff = Date.now() - raidStartTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    raidTimerText.textContent = `SEPT 20, 2019 RAID: ${days} DAYS, ${hours}H ${mins}M ${secs}S AGO`;
  }
  setInterval(updateRaidTimer, 1000);
  updateRaidTimer();

  // 2. Sound Toggle & Auto-Start
  const btnSound = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  const unlockAudio = () => {
    sound.ensureContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // 3. Initialize Naruto Runner Mini-Game
  const minigameCanvas = document.getElementById('minigame-canvas');
  let game = null;
  if (minigameCanvas) {
    game = new NarutoRunnerGame(minigameCanvas);

    const btnStart = document.getElementById('btn-game-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        game.start();
      });
    }

    const heroPlayBtn = document.getElementById('hero-play-btn');
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', () => {
        setTimeout(() => {
          if (game) game.start();
        }, 300);
      });
    }

    // High Score Display Sync
    const highScoreEl = document.getElementById('game-high-score-display');
    if (highScoreEl) {
      setInterval(() => {
        if (game) {
          highScoreEl.textContent = `RECORD: ${game.highScore} PTS`;
        }
      }, 500);
    }
  }

  // 4. Initialize Alien Meme Soundboard
  const soundboardContainer = document.getElementById('soundboard-container');
  if (soundboardContainer) {
    new MemeSoundboard(soundboardContainer);
  }

  // 5. Initialize Raider ID & Alien Adoption Permit
  const idCanvas = document.getElementById('idgen-canvas');
  if (idCanvas) {
    new RaiderBadgeGenerator(idCanvas, {
      nameInput: document.getElementById('id-callsign'),
      divisionSelect: document.getElementById('id-division'),
      companionSelect: document.getElementById('id-companion'),
      fuelSelect: document.getElementById('id-fuel'),
      downloadBtn: document.getElementById('btn-download-badge'),
      copyBtn: document.getElementById('btn-copy-badge')
    });
  }

  // 6. Initialize Declassified Meme Dossiers Redactions
  const redactedElements = document.querySelectorAll('.redacted');
  redactedElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      sound.playGeigerClick(2);
    });
    el.addEventListener('click', () => {
      el.classList.toggle('revealed');
      sound.playClick(1300);
    });
  });

  const btnDeclassify = document.getElementById('btn-declassify-all');
  const btnClassify = document.getElementById('btn-classify-all');
  if (btnDeclassify) {
    btnDeclassify.addEventListener('click', () => {
      redactedElements.forEach((el) => el.classList.add('revealed'));
      sound.playAccessGranted();
    });
  }
  if (btnClassify) {
    btnClassify.addEventListener('click', () => {
      redactedElements.forEach((el) => el.classList.remove('revealed'));
      sound.playClick(800);
    });
  }

  // 7. Initialize Alien Glyph Translator
  const translatorContainer = document.getElementById('translator-container');
  if (translatorContainer) {
    new AlienTranslator(translatorContainer);
  }
});
