// S-4 Groom Lake Delirium Orchestrator [37°14′00″ N 115°48′30″ W]
import { sound } from './audio.js';
import { NarutoRunnerGame } from './minigame.js';
import { RaiderBadgeGenerator } from './idgenerator.js';
import { MemeSoundboard } from './soundboard.js';
import { AlienTranslator } from './translator.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. S-4 Ambient Waves Audio & Paranoid Desert Cover
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
          // Create S-4 Desert Seer Autoplay Cover
          const cover = document.createElement('div');
          cover.id = 'autoplay-cover';
          cover.innerHTML = `
            <img src="/images/ListenWell.gif" draggable="false" alt="The Desert Seer" />
            <p style="line-height: 2; font-size: 15px; color: #c1b492; max-width: 600px;">
              ＨＥＹ． ＨＥＹ  ＹＯＵ． ＤＯＮ’Ｔ  ＣＬＯＳＥ  ＴＨＩＳ  ＴＡＢ．<br><br>
              Ｐｕｔ  ｄｏｗｎ  ｔｈｅ  ｃｏｐｐｅｒ  ｗｉｒｅ  ａｎｄ  ｌｉｓｔｅｎ  ｔｏ  ｍｅ． 
              Ｉ  ｈａｖｅ  ｂｅｅｎ  ｄｒｉｎｋｉｎｇ  ｗａｒｍ  ｔｅｑｕｉｌａ  ｂｅｈｉｎｄ  ｔｈｅ  Ｌｉｔｔｌｅ  Ａ’Ｌｅ’Ｉｎｎ  ｓｉｎｃｅ  １９９４． 
              Ｔｈｅ  ｒａｄａｒ  ｄｏｅｓｎ’ｔ  ｂｏｕｎｃｅ  ｏｆｆ  ｓａｕｃｅｒｓ，  ｉｔ  ｂｏｕｎｃｅｓ  ｏｆｆ  
              <span style="color: #ff0055; text-shadow: 0 0 8px #ff0055;">ＢＯＢ  ＬＡＺＡＲ’Ｓ  ＵＮＲＥＳＯＬＶＥＤ  ＧＵＩＬＴ</span>．<br><br>
              Ｔｈｅ  ｖｏｉｄ  ｉｓ  ｈｕｍｍｉｎｇ  ａｔ  ７．４６  Ｈｚ． Ｉｆ  ｙｏｕｒ  ｍｏｌａｒｓ  ｓｔａｒｔ  ｖｉｂｒａｔｉｎｇ， 
              ｔｈａｔ  ｍｅａｎｓ  ｙｏｕ’ｒｅ  ｄｏｉｎｇ  ｉｔ  ｒｉｇｈｔ．<br><br>
              <span style="border: 1px solid #00ff41; padding: 8px 18px; color: #00ff41; background: #000; display: inline-block; margin-top: 12px; cursor: pointer; letter-spacing: 1px; box-shadow: 0 0 10px rgba(0,255,65,0.4);">
                ［ ＣＬＩＣＫ  ＴＯ  ＵＮＣＯＲＫ  ＴＨＥ  ＦＲＥＱＵＥＮＣＹ  ＆  ＥＮＴＥＲ  ＴＨＥ  ＳＡＮＤ ］
              </span>
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

  // 1.5. Tiled Repeating GIF Background Rounds (Rotates every 10s to a random GIF)
  const TILED_GIFS = [
    { path: '/images/back1.gif', size: '140px 140px', name: 'EYES_OF_GROOM' },
    { path: '/images/back2.gif', size: '140px 140px', name: 'WALL_OF_EYES' },
    { path: '/images/00warning.gif', size: '130px 130px', name: 'WARNING_CASCADE' },
    { path: '/images/deadend.gif', size: '140px 140px', name: 'DEAD_END_VOID' },
    { path: '/images/thisshouldnotexist.gif', size: '140px 140px', name: 'FORBIDDEN_SKULL' },
    { path: '/images/vvv.gif', size: '180px 180px', name: 'DEMONIC_FLESH_STATIC' },
    { path: '/images/rre2.gif', size: '200px 130px', name: 'PAPOOSE_FLESH_MAW' },
    { path: '/images/With_Wilbells_will_why_waste_whit_worrying.gif', size: '180px 140px', name: 'HYPNOTIC_VORTEX' },
    { path: '/images/ListenWell.gif', size: '160px 160px', name: 'THE_LISTENER' },
    { path: '/images/unn4.gif', size: '160px 40px', name: 'PULSATING_SUTURE' },
    { path: '/images/bbn.gif', size: '180px 45px', name: 'SURVEILLANCE_LATTICE' },
    { path: '/images/beyondthepointof.gif', size: '220px 80px', name: 'BEYOND_THE_POINT' },
    { path: '/images/zz2.gif', size: '80px 80px', name: 'BLINKING_EYEBALLS' },
    { path: '/images/zz4.gif', size: '90px 90px', name: 'CURSED_HEX_SEALS' },
    { path: '/images/zz.gif', size: '70px 70px', name: 'THREAD_RUNE_WEAVE' }
  ];

  const tiledBgEl = document.getElementById('tiled-void-bg');
  const bgRotationHud = document.getElementById('bg-rotation-hud');
  const bgRotationNameEl = document.getElementById('bg-rotation-name');
  const bgTimerEl = document.getElementById('bg-timer');
  const bgRoundCountEl = document.getElementById('bg-round-count');
  const btnBreakReality = document.getElementById('btn-break-reality');

  let currentGifIndex = 0;
  let bgRound = 1;
  let bgSecondsRemaining = 10;
  let isBrokenReality = false;
  let brokenShuffleInterval = null;

  function setTiledBackground(index) {
    if (!tiledBgEl) return;
    const gif = TILED_GIFS[index];
    currentGifIndex = index;

    // Trigger glitch pulse during transition
    tiledBgEl.classList.add('glitching');
    setTimeout(() => {
      tiledBgEl.style.backgroundImage = `url("${gif.path}")`;
      tiledBgEl.style.backgroundSize = gif.size;
      setTimeout(() => {
        tiledBgEl.classList.remove('glitching');
      }, 250);
    }, 50);

    if (bgRotationNameEl) {
      bgRotationNameEl.textContent = gif.name;
    }
    if (bgRoundCountEl) {
      bgRoundCountEl.textContent = `${bgRound}`;
    }
  }

  function cycleRandomBackground() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * TILED_GIFS.length);
    } while (nextIndex === currentGifIndex && TILED_GIFS.length > 1);

    bgRound++;
    setTiledBackground(nextIndex);
    bgSecondsRemaining = 10;
    if (bgTimerEl) bgTimerEl.textContent = '１０';
  }

  // 1-second countdown ticker for the 10-second background cycle
  setInterval(() => {
    if (isBrokenReality) return;
    bgSecondsRemaining--;
    if (bgSecondsRemaining <= 0) {
      cycleRandomBackground();
      sound.playGlitchStatic();
    } else if (bgTimerEl) {
      const fullwidth = ['０','１','２','３','４','５','６','７','８','９','１０'];
      bgTimerEl.textContent = fullwidth[bgSecondsRemaining] || `${bgSecondsRemaining}`;
    }
  }, 1000);

  // Allow clicking HUD to cycle immediately
  if (bgRotationHud) {
    bgRotationHud.addEventListener('click', () => {
      sound.playClick(1500);
      sound.playGlitchStatic();
      cycleRandomBackground();
    });
  }

  // Initialize initial background
  setTiledBackground(0);

  // 1.6. "BREAK REALITY" Toggle (Intense broken glitch mode)
  if (btnBreakReality) {
    btnBreakReality.addEventListener('click', () => {
      isBrokenReality = !isBrokenReality;
      sound.ensureContext();

      if (isBrokenReality) {
        document.body.classList.add('reality-broken');
        btnBreakReality.classList.add('active');
        btnBreakReality.textContent = '［ ＲＥＳＴＯＲＥ  ＲＥＡＬＩＴＹ ］';
        sound.playAlienWarble(550);
        sound.playMonsterCrack();

        // Rapidly shuffle background every 750ms in broken mode
        brokenShuffleInterval = setInterval(() => {
          const randIdx = Math.floor(Math.random() * TILED_GIFS.length);
          bgRound++;
          setTiledBackground(randIdx);
          sound.playGlitchStatic();
        }, 750);
      } else {
        document.body.classList.remove('reality-broken');
        btnBreakReality.classList.remove('active');
        btnBreakReality.textContent = '［ ＢＲＥＡＫ  ＲＥＡＬＩＴＹ ］';
        clearInterval(brokenShuffleInterval);
        bgSecondsRemaining = 10;
        if (bgTimerEl) bgTimerEl.textContent = '１０';
        sound.playClick(900);
      }
    });
  }

  // 1.7. Random Periodic Glitch Twitches (Keeps the site feeling broken & glitchy)
  setInterval(() => {
    if (Math.random() < 0.55) {
      const glitchTargets = document.querySelectorAll('.term-glitch-header, .depth-title, #info, .broken-status-ribbon');
      if (glitchTargets.length) {
        const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
        target.style.filter = 'invert(1) hue-rotate(120deg) contrast(1.8)';
        target.style.transform = `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 4}px)`;
        setTimeout(() => {
          target.style.filter = '';
          target.style.transform = '';
        }, 130);
      }
    }
  }, 4000);
  const raidTimerEl = document.getElementById('term-raid-timer');
  const raidStartTime = new Date('2019-09-20T03:00:00Z').getTime();

  function updateRaidTimer() {
    if (!raidTimerEl) return;
    const diff = Date.now() - raidStartTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    raidTimerEl.textContent = `［ ＤＡＹＳ  ＳＰＥＮＴ  ＲＡＭＢＬＩＮＧ  ＩＮ  ＴＨＥ  ＳＡＮＤ  ＳＩＮＣＥ  ＴＨＥ  ２０１９  ＲＡＩＤ ： ${days}Ｄ  ${hours}Ｈ  ${mins}Ｍ  ${secs}Ｓ ］`;
  }
  setInterval(updateRaidTimer, 1000);
  updateRaidTimer();

  // 3. Weird Interactive Anomaly Poking (thisshouldnotexist.gif)
  const pokeAnomaly = document.getElementById('btn-poke-anomaly');
  if (pokeAnomaly) {
    pokeAnomaly.addEventListener('click', () => {
      sound.playFbiOpenUp();
      sound.playAlienWarble(320);
      document.body.classList.add('shaking');
      setTimeout(() => {
        document.body.classList.remove('shaking');
      }, 500);
    });
  }

  // 4. Interactive Flesh Maw Hover / Click (rre2.gif / vvv.gif)
  const rreMaw = document.getElementById('rre-maw');
  if (rreMaw) {
    rreMaw.addEventListener('mouseenter', () => {
      sound.playTractorBeam();
    });
    rreMaw.addEventListener('click', () => {
      sound.playLaserPew();
      sound.playAlienVocal();
    });
  }

  // 5. Interactive Mystic Seal (Oneiromancy.png)
  const sealOneiromancy = document.getElementById('seal-oneiromancy');
  if (sealOneiromancy) {
    sealOneiromancy.addEventListener('click', () => {
      sound.playXFiles();
      sealOneiromancy.style.transform = 'rotate(180deg) scale(1.2)';
      setTimeout(() => {
        sealOneiromancy.style.transform = 'rotate(0deg) scale(1)';
      }, 600);
    });
  }

  // 6. Interactive Eye Bar Hover (un.gif / unn4.gif)
  const unBar = document.getElementById('un-bar');
  if (unBar) {
    unBar.addEventListener('mouseenter', () => {
      sound.playGeigerClick(8);
    });
    unBar.addEventListener('click', () => {
      sound.playMonsterCrack();
    });
  }

  // 7. Initialize Naruto Runner Mini-Game
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

  // 8. Initialize Soundboard
  const soundboardContainer = document.getElementById('soundboard-container');
  if (soundboardContainer) {
    new MemeSoundboard(soundboardContainer);
  }

  // 9. Initialize Raider ID & Alien Permit
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

  // 10. Initialize Redacted Dossiers
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

  // 11. Initialize Alien Glyph Translator
  const translatorContainer = document.getElementById('translator-container');
  if (translatorContainer) {
    new AlienTranslator(translatorContainer);
  }
});
