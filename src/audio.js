// Procedural Web Audio API sound synthesizer for Area 51 Black-Site Terminal
class SoundFX {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.humOsc = null;
    this.humGain = null;
    this.isMuted = false;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
      this.startAmbientHum();
    } catch (e) {
      console.warn('AudioContext init failed:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(val) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  // Tactical Terminal Key Click
  playClick(pitch = 1200) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Vector Radar Ping
  playRadarPing(distance = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = 1800 - distance * 400;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Geiger Counter Tick
  playGeiger() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.005; // 5ms burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.005);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  // Extraterrestrial Signal Warble
  playAlienWarble(freq = 880) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    mod.type = 'sawtooth';
    mod.frequency.setValueAtTime(14, now); // FM modulation rate
    modGain.gain.setValueAtTime(180, now);

    mod.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(0.15, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    carrier.connect(mainGain);
    mainGain.connect(this.masterGain);

    mod.start(now);
    carrier.start(now);
    mod.stop(now + 0.28);
    carrier.stop(now + 0.28);
  }

  // Gravimetric Ambient Hum
  startAmbientHum() {
    if (!this.ctx || this.humOsc) return;
    try {
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOsc.type = 'sine';
      this.humOsc.frequency.setValueAtTime(43.65, this.ctx.currentTime); // Low F# hum

      this.humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.humOsc.connect(this.humGain);
      this.humGain.connect(this.masterGain);

      this.humOsc.start();
    } catch (e) {
      console.warn('Failed to start hum:', e);
    }
  }

  // Emergency Klaxon / Containment Breach Siren
  startSiren() {
    if (this.sirenGain) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.setValueAtTime(0.2, now);

    this.sirenOsc1 = this.ctx.createOscillator();
    this.sirenOsc1.type = 'sawtooth';
    this.sirenOsc1.frequency.setValueAtTime(600, now);

    // LFO to modulate pitch up and down
    const lfo = this.ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.setValueAtTime(0.7, now); // 1.4s cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, now);

    lfo.connect(this.sirenOsc1.frequency);

    this.sirenOsc1.connect(this.sirenGain);
    this.sirenGain.connect(this.masterGain);

    this.sirenOsc1.start();
    lfo.start();
    this.sirenLfo = lfo;
  }

  stopSiren() {
    if (this.sirenGain) {
      try {
        this.sirenOsc1.stop();
        this.sirenLfo.stop();
        this.sirenOsc1.disconnect();
        this.sirenLfo.disconnect();
        this.sirenGain.disconnect();
      } catch (e) {}
      this.sirenOsc1 = null;
      this.sirenLfo = null;
      this.sirenGain = null;
    }
  }

  // Security Access Granted / Declassified Sound
  playAccessGranted() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C high chime
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }
}

export const sound = new SoundFX();
