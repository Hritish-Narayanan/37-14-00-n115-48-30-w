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
  // --- ALIEN MEME SOUND EFFECTS ---

  // X-Files 5-note mystery melody
  playXFiles() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Notes: G4, A4, Bb4, D5, C5
    const notes = [392.00, 440.00, 466.16, 587.33, 523.25];
    const startTime = this.ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = startTime + idx * 0.28;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Subtle vibrato
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.value = 5.5;
      vibratoGain.gain.value = 6;
      vibrato.connect(osc.frequency);
      vibrato.start(noteTime);
      vibrato.stop(noteTime + 0.35);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  // Synthesized "Ayy Lmao" extraterrestrial voice formant simulation
  playAlienVocal() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Two syllables: "Ayy" then "Lmaoo"
    const syllables = [
      { start: 0, dur: 0.25, f0: 380, f1: 650, f2: 2100 },
      { start: 0.28, dur: 0.45, f0: 320, f1: 450, f2: 1200 }
    ];

    syllables.forEach(s => {
      const t = now + s.start;
      const osc = this.ctx.createOscillator();
      const filter1 = this.ctx.createBiquadFilter();
      const filter2 = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(s.f0, t);
      osc.frequency.exponentialRampToValueAtTime(s.f0 * 0.85, t + s.dur);

      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(s.f1, t);
      filter1.Q.value = 4.0;

      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(s.f2, t);
      filter2.Q.value = 3.0;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s.dur);

      osc.connect(filter1);
      osc.connect(filter2);
      filter1.connect(gain);
      filter2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + s.dur + 0.01);
    });
  }

  // Naruto Sprint Whoosh (rapid pitch descending noise rush)
  playNarutoSwoosh() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.35;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + dur);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // Monster Energy Can Crack & Fizz
  playMonsterCrack() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 1. Pop/Snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

    snapGain.gain.setValueAtTime(0.45, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.07);

    // 2. Soda Fizz
    const dur = 0.5;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const fizz = this.ctx.createBufferSource();
    fizz.buffer = buffer;

    const fizzFilter = this.ctx.createBiquadFilter();
    fizzFilter.type = 'highpass';
    fizzFilter.frequency.setValueAtTime(4500, now + 0.05);

    const fizzGain = this.ctx.createGain();
    fizzGain.gain.setValueAtTime(0.01, now);
    fizzGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
    fizzGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    fizz.connect(fizzFilter);
    fizzFilter.connect(fizzGain);
    fizzGain.connect(this.masterGain);

    fizz.start(now + 0.04);
  }

  // Alien Laser Blaster (Pew Pew)
  playLaserPew() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // FBI Open Up / Heavy Breach Impact
  playFbiOpenUp() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Heavy bass kick
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.46);

    // Distortion metal clatter
    const dur = 0.35;
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  // Alien Tractor Beam modulation
  playTractorBeam() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.8;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + dur);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, now);
    lfoGain.gain.setValueAtTime(45, now);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + dur);
    osc.stop(now + dur);
  }

  // Mini-Game Jump sound
  playJump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Mini-Game Item Collect / Power-Up Chime
  playCollect() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Mini-Game Game Over
  playGameOver() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.46);
  }
}

export const sound = new SoundFX();
