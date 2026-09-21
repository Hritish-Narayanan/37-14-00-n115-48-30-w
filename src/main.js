// Main Area 51 Alien Meme Terminal Orchestrator
import { sound } from './audio.js';
import { RadarStation } from './radar.js';
import { ReactorEngine } from './reactor.js';
import { TerminalConsole } from './terminal.js';
import { NarutoRunnerGame } from './minigame.js';
import { RaiderBadgeGenerator } from './idgenerator.js';
import { MemeSoundboard } from './soundboard.js';
import { AlienTranslator } from './translator.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live UTC Clock
  const clockEl = document.getElementById('hud-clock');
  function updateClock() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toUTCString().split(' ')[4] + ' UTC';
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Elapsed Raid Timer (Since Sept 20, 2019)
  const raidElapsedEl = document.getElementById('raid-elapsed-badge');
  const raidStartTime = new Date('2019-09-20T03:00:00Z').getTime();

  function updateRaidTimer() {
    if (!raidElapsedEl) return;
    const diff = Date.now() - raidStartTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    raidElapsedEl.textContent = `TIME SINCE 2019 RAID: ${days}D ${hours}H ${mins}M ${secs}S`;
  }
  setInterval(updateRaidTimer, 1000);
  updateRaidTimer();

  // 3. Master Audio Switch & Interaction Auto-Start
  const btnSound = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
      if (soundLabel) soundLabel.textContent = isMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE';
    });
  }

  const enableAudioOnFirstClick = () => {
    sound.ensureContext();
    window.removeEventListener('click', enableAudioOnFirstClick);
    window.removeEventListener('keydown', enableAudioOnFirstClick);
  };
  window.addEventListener('click', enableAudioOnFirstClick);
  window.addEventListener('keydown', enableAudioOnFirstClick);

  // 4. CRT Scanline Toggle
  const btnCrt = document.getElementById('btn-crt-toggle');
  const crtLabel = document.getElementById('crt-label');
  if (btnCrt) {
    btnCrt.addEventListener('click', () => {
      document.body.classList.toggle('crt-disabled');
      const disabled = document.body.classList.contains('crt-disabled');
      if (crtLabel) crtLabel.textContent = disabled ? 'CRT: OFF' : 'CRT: ON';
      sound.playClick(1000);
    });
  }

  // 5. Station Navigation Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const stationPanels = document.querySelectorAll('.station-panel');

  function switchTab(targetTab) {
    tabButtons.forEach((b) => b.classList.remove('active'));
    stationPanels.forEach((p) => p.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const targetPanel = document.getElementById(`station-${targetTab}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    sound.playClick(1100);
    window.dispatchEvent(new Event('resize'));
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  const btnHeroPlay = document.getElementById('btn-hero-play');
  if (btnHeroPlay) {
    btnHeroPlay.addEventListener('click', () => {
      switchTab('minigame');
      if (minigame) minigame.start();
    });
  }

  // 6. Initialize Groom Lake Radar
  const radarCanvas = document.getElementById('radar-canvas');
  let radar = null;
  if (radarCanvas) {
    radar = new RadarStation(radarCanvas, (target) => {
      if (!target) return;
      const desEl = document.getElementById('intel-designation');
      const sigEl = document.getElementById('intel-signature');
      const velEl = document.getElementById('intel-velocity');
      const origEl = document.getElementById('intel-origin');
      const threatEl = document.getElementById('intel-threat');
      const titleEl = document.getElementById('target-intel-title');

      if (desEl) desEl.textContent = `${target.id} (${target.designation})`;
      if (sigEl) sigEl.textContent = target.signature || 'CLASSIFIED';
      if (velEl) velEl.textContent = target.speed || 'VARIABLE';
      if (origEl) origEl.textContent = target.origin || 'UNKNOWN';
      if (threatEl) threatEl.textContent = target.threat || 'MONITORED';
      if (titleEl) titleEl.textContent = `LOCKED TARGET: [${target.id}]`;
    });

    const btnPing = document.getElementById('btn-ping-radar');
    if (btnPing) {
      btnPing.addEventListener('click', () => {
        sound.playRadarPing(0.3);
      });
    }

    const btnDeploy = document.getElementById('btn-deploy-raider');
    if (btnDeploy) {
      btnDeploy.addEventListener('click', () => {
        if (radar) radar.deployRaider();
      });
    }
  }

  // 7. Initialize Naruto Runner Mini-Game
  const minigameCanvas = document.getElementById('minigame-canvas');
  let minigame = null;
  if (minigameCanvas) {
    minigame = new NarutoRunnerGame(minigameCanvas);
    const btnStart = document.getElementById('btn-game-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        minigame.start();
      });
    }
  }

  // 8. Initialize Raider ID & Alien Adoption Generator
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

  // 9. Initialize Meme Soundboard
  const soundboardContainer = document.getElementById('soundboard-container');
  if (soundboardContainer) {
    new MemeSoundboard(soundboardContainer);
  }

  // 10. Initialize Alien Translator
  const translatorContainer = document.getElementById('translator-container');
  if (translatorContainer) {
    new AlienTranslator(translatorContainer);
  }

  // 11. Initialize Element 115 Reactor Simulation
  const reactorCanvas = document.getElementById('reactor-canvas');
  let reactor = null;
  if (reactorCanvas) {
    reactor = new ReactorEngine(reactorCanvas);

    const sliderInjection = document.getElementById('slider-injection');
    const valInjection = document.getElementById('val-injection');
    if (sliderInjection && valInjection) {
      sliderInjection.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        valInjection.textContent = `${val}% [${(val * 14.8).toFixed(1)} MW]`;
        reactor.setInjectionPower(val / 100);
        sound.playGeigerClick(Math.floor(val / 6));
      });
    }

    const btnDelta = document.getElementById('btn-mode-delta');
    const btnOmicron = document.getElementById('btn-mode-omicron');
    if (btnDelta && btnOmicron) {
      btnDelta.addEventListener('click', () => {
        btnDelta.classList.add('active');
        btnOmicron.classList.remove('active');
        reactor.setConfiguration('DELTA');
        sound.playAlienWarble(800);
      });
      btnOmicron.addEventListener('click', () => {
        btnOmicron.classList.add('active');
        btnDelta.classList.remove('active');
        reactor.setConfiguration('OMICRON');
        sound.playAlienWarble(520);
      });
    }

    const btnOverload = document.getElementById('btn-trigger-overload');
    if (btnOverload) {
      btnOverload.addEventListener('click', () => {
        reactor.triggerOverload();
        sound.playSirenBurst(3);
        sound.playFbiOpenUp();
      });
    }
  }

  // 12. Declassified Dossiers Redaction Click/Hover
  const redactedSpans = document.querySelectorAll('.redacted');
  redactedSpans.forEach((span) => {
    span.addEventListener('mouseenter', () => {
      sound.playGeigerClick(2);
    });
    span.addEventListener('click', () => {
      span.classList.toggle('revealed');
      sound.playClick(1400);
    });
  });

  const btnDeclassifyAll = document.getElementById('btn-declassify-all');
  const btnClassifyAll = document.getElementById('btn-classify-all');
  if (btnDeclassifyAll) {
    btnDeclassifyAll.addEventListener('click', () => {
      redactedSpans.forEach((span) => span.classList.add('revealed'));
      sound.playAccessGranted();
    });
  }
  if (btnClassifyAll) {
    btnClassifyAll.addEventListener('click', () => {
      redactedSpans.forEach((span) => span.classList.remove('revealed'));
      sound.playClick(700);
    });
  }

  // 13. DEFCON Posture Buttons
  const defconButtons = document.querySelectorAll('.defcon-btn');
  function setDefconLevel(level) {
    document.body.className = document.body.className.replace(/defcon-[1-5]/g, '').trim();
    document.body.classList.add(`defcon-${level}`);

    defconButtons.forEach((b) => {
      if (parseInt(b.dataset.level) === level) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    if (level === 1) {
      sound.startSiren();
      const beacon = document.getElementById('emergency-beacon');
      if (beacon) beacon.classList.add('active');
    } else {
      sound.stopSiren();
      const beacon = document.getElementById('emergency-beacon');
      if (beacon) beacon.classList.remove('active');
      sound.playClick(800 + level * 100);
    }
  }

  defconButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setDefconLevel(parseInt(btn.dataset.level));
    });
  });

  // 14. Initialize S-4 Mainframe Terminal
  const termContainer = document.getElementById('terminal-shell-container');
  if (termContainer) {
    new TerminalConsole(
      termContainer,
      (lvl) => setDefconLevel(lvl),
      () => {
        if (reactor) reactor.triggerOverload();
      }
    );
  }
});
