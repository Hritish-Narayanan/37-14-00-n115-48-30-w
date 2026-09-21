// Main Area 51 Classified Terminal Orchestrator
import { sound } from './audio.js';
import { RadarStation } from './radar.js';
import { ReactorEngine } from './reactor.js';
import { SignalInterceptor } from './spectrogram.js';
import { TerminalConsole } from './terminal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live UTC Clock
  const clockEl = document.getElementById('hud-clock');
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toUTCString().split(' ')[4] + ' UTC';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Audio Toggle & Interaction Auto-Start
  const btnSound = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');

  btnSound.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
    soundLabel.textContent = isMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE';
  });

  // Enable audio on any first interaction
  const enableAudioOnFirstClick = () => {
    sound.ensureContext();
    window.removeEventListener('click', enableAudioOnFirstClick);
    window.removeEventListener('keydown', enableAudioOnFirstClick);
  };
  window.addEventListener('click', enableAudioOnFirstClick);
  window.addEventListener('keydown', enableAudioOnFirstClick);

  // 3. CRT Scanline Toggle
  const btnCrt = document.getElementById('btn-crt-toggle');
  const crtLabel = document.getElementById('crt-label');
  btnCrt.addEventListener('click', () => {
    document.body.classList.toggle('crt-disabled');
    const disabled = document.body.classList.contains('crt-disabled');
    crtLabel.textContent = disabled ? 'CRT: OFF' : 'CRT: ON';
    sound.playClick(1000);
  });

  // 4. Station Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const stationPanels = document.querySelectorAll('.station-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.remove('active'));
      stationPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`station-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      sound.playClick(1100);

      // Trigger resize on newly visible canvas engines
      window.dispatchEvent(new Event('resize'));
    });
  });

  // 5. Initialize Groom Lake Radar Station
  const radarCanvas = document.getElementById('radar-canvas');
  let radar = null;
  if (radarCanvas) {
    radar = new RadarStation(radarCanvas, (target) => {
      if (!target) return;
      document.getElementById('intel-designation').textContent = `${target.id} (${target.designation})`;
      document.getElementById('intel-signature').textContent = target.signature;
      document.getElementById('intel-velocity').textContent = target.speed;
      document.getElementById('intel-origin').textContent = target.origin;
      document.getElementById('target-intel-title').textContent = `LOCKED TARGET: [${target.id}]`;
    });

    const btnPing = document.getElementById('btn-ping-radar');
    if (btnPing) {
      btnPing.addEventListener('click', () => {
        sound.playRadarPing(0.3);
      });
    }
  }

  // 6. Initialize Element 115 Reactor Simulation
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
        reactor.setPower(val);
      });
    }

    const btnDelta = document.getElementById('btn-mode-delta');
    const btnOmicron = document.getElementById('btn-mode-omicron');
    if (btnDelta && btnOmicron) {
      btnDelta.addEventListener('click', () => {
        btnDelta.classList.add('active');
        btnOmicron.classList.remove('active');
        reactor.setMode('DELTA');
      });
      btnOmicron.addEventListener('click', () => {
        btnOmicron.classList.add('active');
        btnDelta.classList.remove('active');
        reactor.setMode('OMICRON');
      });
    }

    const btnOverload = document.getElementById('btn-trigger-overload');
    if (btnOverload) {
      btnOverload.addEventListener('click', () => {
        reactor.triggerOverload();
      });
    }
  }

  // 7. Initialize Cosmic RF Interceptor & Decoder
  const spectrogramCanvas = document.getElementById('spectrogram-canvas');
  let interceptor = null;
  if (spectrogramCanvas) {
    const glyphStream = document.getElementById('glyph-stream');
    const decodedText = document.getElementById('decoded-result-text');
    const decryptBtn = document.getElementById('btn-decrypt-signal');
    const decryptSpinner = document.getElementById('decrypt-spinner');
    const decryptBtnText = document.getElementById('decrypt-btn-text');

    interceptor = new SignalInterceptor(spectrogramCanvas, (channel) => {
      decodedText.textContent = channel.translation;
      glyphStream.textContent = channel.glyphs;
      decryptBtnText.textContent = 'TRANSMISSION DECRYPTED // VERIFIED';
      decryptSpinner.style.display = 'none';
      decryptBtn.disabled = false;
    });

    // Preset buttons
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const freq = btn.dataset.freq;
        interceptor.tuneFrequency(freq);
      });
    });

    if (decryptBtn) {
      decryptBtn.addEventListener('click', () => {
        decryptBtn.disabled = true;
        decryptBtnText.textContent = 'DEMODULATING SUB-SPACE CARRIER...';
        decryptSpinner.style.display = 'inline-block';
        interceptor.startDecrypt();
      });
    }
  }

  // 8. DEFCON Alert Level System
  const defconBtns = document.querySelectorAll('.defcon-btn');
  function setDefcon(level) {
    document.body.className = `defcon-${level}`;
    defconBtns.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });

    if (level === 1) {
      sound.startSiren();
    } else {
      sound.stopSiren();
    }
  }

  defconBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lvl = parseInt(btn.dataset.level);
      setDefcon(lvl);
      sound.playClick(lvl === 1 ? 400 : 1200);
    });
  });

  // 9. Redacted Dossiers Interactivity
  const redactedElements = document.querySelectorAll('.redacted');
  redactedElements.forEach((el) => {
    const secretText = el.dataset.secret;
    const placeholder = el.textContent;

    el.addEventListener('click', () => {
      const isRevealed = el.classList.toggle('revealed');
      el.textContent = isRevealed ? secretText : placeholder;
      sound.playClick(isRevealed ? 1500 : 800);
    });

    el.addEventListener('mouseenter', () => {
      if (!el.classList.contains('revealed')) {
        sound.playClick(2100);
      }
    });
  });

  const btnDeclassifyAll = document.getElementById('btn-declassify-all');
  const btnClassifyAll = document.getElementById('btn-classify-all');

  if (btnDeclassifyAll) {
    btnDeclassifyAll.addEventListener('click', () => {
      redactedElements.forEach((el) => {
        el.classList.add('revealed');
        el.textContent = el.dataset.secret;
      });
      sound.playAccessGranted();
    });
  }

  if (btnClassifyAll) {
    btnClassifyAll.addEventListener('click', () => {
      redactedElements.forEach((el) => {
        el.classList.remove('revealed');
        el.textContent = '████████████████████';
      });
      sound.playClick(600);
    });
  }

  // 10. Initialize Terminal Mainframe CLI
  const termContainer = document.getElementById('terminal-shell-container');
  if (termContainer) {
    new TerminalConsole(
      termContainer,
      (lvl) => setDefcon(lvl),
      () => {
        if (reactor) reactor.triggerOverload();
      }
    );
  }
});
