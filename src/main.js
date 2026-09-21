// Terminal 00 // S-4 Groom Lake Orchestrator
import { sound } from './audio.js';
import { NarutoRunnerGame } from './minigame.js';
import { RaiderBadgeGenerator } from './idgenerator.js';
import { MemeSoundboard } from './soundboard.js';
import { AlienTranslator } from './translator.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Terminal 00 Autoplay Overlay & Background Waves Audio
  const bgAudio = document.getElementById('bg-music');
  let audioPlaying = false;

  function attemptPlayAudio() {
    if (!bgAudio) return;
    const promise = bgAudio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          audioPlaying = true;
          updateSoundButtonState(true);
        })
        .catch(() => {
          // Create iconic Terminal 00 "ListenWell" Autoplay Cover
          const cover = document.createElement('div');
          cover.id = 'autoplay-cover';
          cover.innerHTML = `
            <img src="/images/ListenWell.gif" draggable="false" alt="Listen Well" />
            <p>
              Ｓｏｍｅｔｈｉｎｇ  ｈａｓ  ｏｂｆｕｓｃａｔｅｄ  ｔｈｅｉｒ  ｖｏｉｃｅｓ  ｏｎｃｅ  ｍｏｒｅ．．．<br><br>
              Ｎｏ  ｍａｔｔｅｒ，  Ｉ  ｓｈａｌｌ  ｍａｋｅ  ｙｏｕ  <span style="color: #D2738A;">ＬＩＳＴＥＮ</span>．<br><br>
              ［ ＣＬＩＣＫ  ＴＯ  ＰＥＮＥＴＲＡＴＥ  ＴＨＥ  ＶＯＩＤ ］
            </p>
          `;
          document.body.appendChild(cover);

          cover.addEventListener('click', () => {
            cover.classList.add('hide');
            setTimeout(() => {
              if (cover.parentNode) cover.parentNode.removeChild(cover);
            }, 800);

            sound.ensureContext();
            bgAudio.play().then(() => {
              audioPlaying = true;
              updateSoundButtonState(true);
            }).catch(() => {});
          });
        });
    }
  }

  const btnSound = document.getElementById('btn-sound-toggle');
  function updateSoundButtonState(active) {
    if (!btnSound) return;
    btnSound.textContent = active ? '［ ＳＯＵＮＤ ： ＯＮ ］' : '［ ＳＯＵＮＤ ： ＯＦＦ ］';
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      sound.ensureContext();
      if (!bgAudio) return;
      if (bgAudio.paused) {
        bgAudio.play();
        audioPlaying = true;
        updateSoundButtonState(true);
        sound.setVolume(0.25);
      } else {
        bgAudio.pause();
        audioPlaying = false;
        updateSoundButtonState(false);
        sound.setVolume(0);
      }
    });
  }

  attemptPlayAudio();

  // 2. Terminal 00 Time Elapsed Counter
  const raidTimerEl = document.getElementById('term-raid-timer');
  const raidStartTime = new Date('2019-09-20T03:00:00Z').getTime();

  function updateRaidTimer() {
    if (!raidTimerEl) return;
    const diff = Date.now() - raidStartTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    raidTimerEl.textContent = `［ ＴＩＭＥ  ＳＩＮＣＥ  ＴＨＥ  ＳＥＰＴＥＭＢＥＲ  ２０，  ２０１９  ＢＲＥＡＣＨ ： ${days}Ｄ  ${hours}Ｈ  ${mins}Ｍ  ${secs}Ｓ ］`;
  }
  setInterval(updateRaidTimer, 1000);
  updateRaidTimer();

  // 3. Initialize Naruto Runner Mini-Game
  const minigameCanvas = document.getElementById('minigame-canvas');
  let game = null;
  if (minigameCanvas) {
    game = new NarutoRunnerGame(minigameCanvas);

    const btnStart = document.getElementById('btn-game-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        sound.ensureContext();
        game.start();
      });
    }

    const highScoreEl = document.getElementById('game-high-score-display');
    if (highScoreEl) {
      setInterval(() => {
        if (game) {
          highScoreEl.textContent = `ＲＥＣＯＲＤ ： ${game.highScore}`;
        }
      }, 500);
    }
  }

  // 4. Initialize Soundboard
  const soundboardContainer = document.getElementById('soundboard-container');
  if (soundboardContainer) {
    new MemeSoundboard(soundboardContainer);
  }

  // 5. Initialize Raider ID & Alien Permit
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

  // 6. Initialize Redacted Dossiers
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
