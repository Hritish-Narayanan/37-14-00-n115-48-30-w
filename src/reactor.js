// Element 115 Gravimetric Reactor Simulation Engine
import { sound } from './audio.js';

export class ReactorEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.injectionPower = 72; // %
    this.frequency = 7.46; // Hz
    this.fieldStrength = 1.84; // Tesla
    this.mode = 'DELTA'; // DELTA or OMICRON
    this.overload = false;
    this.particles = [];
    this.rotAngle1 = 0;
    this.rotAngle2 = 0;
    this.rotAngle3 = 0;
    this.distortionPhase = 0;
    this.geigerTimer = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.min(rect.width * 0.75, 420);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      this.particles.push(this.spawnParticle());
    }
  }

  spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 120;
    return {
      x: this.cx + Math.cos(angle) * dist,
      y: this.cy + Math.sin(angle) * dist,
      angle: angle,
      dist: dist,
      speed: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
      radialSpeed: (Math.random() - 0.5) * 0.6,
      size: 1 + Math.random() * 2.5,
      life: 0.2 + Math.random() * 0.8,
      decay: 0.005 + Math.random() * 0.015,
      hue: Math.random() > 0.6 ? 165 : 285 // Greenish or Violet/Antimatter
    };
  }

  triggerOverload() {
    this.overload = true;
    sound.playAlienWarble(320);
    for (let i = 0; i < 6; i++) {
      setTimeout(() => sound.playGeiger(), i * 60);
    }
    setTimeout(() => {
      this.overload = false;
    }, 3500);
  }

  setPower(val) {
    this.injectionPower = val;
    if (Math.random() < 0.3) {
      sound.playGeiger();
    }
  }

  setMode(mode) {
    this.mode = mode;
    sound.playClick(1400);
  }

  draw() {
    const { ctx, cx, cy, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Dark reactor chamber background
    ctx.fillStyle = '#030807';
    ctx.fillRect(0, 0, width, height);

    // Space-Time Curvature Grid (Gravimetric Lensing effect)
    this.distortionPhase += 0.04 * (this.injectionPower / 50);
    ctx.lineWidth = 1;
    const cols = 14;
    const rows = 10;
    const cellW = width / cols;
    const cellH = height / rows;

    ctx.strokeStyle = 'rgba(0, 255, 136, 0.07)';
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        let px = x * cellW;
        let py = y * cellH;
        // Gravimetric warp calculation
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = 220;
        if (dist < maxDist) {
          const warpFactor = (1 - dist / maxDist) * (this.injectionPower / 100) * 22;
          const warpAngle = Math.atan2(dy, dx) + (this.mode === 'DELTA' ? 0.3 : -0.3);
          px -= Math.cos(warpAngle) * warpFactor * Math.sin(this.distortionPhase + dist * 0.05);
          py -= Math.sin(warpAngle) * warpFactor * Math.cos(this.distortionPhase + dist * 0.05);
        }
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      for (let y = 0; y <= rows; y++) {
        let px = x * cellW;
        let py = y * cellH;
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = 220;
        if (dist < maxDist) {
          const warpFactor = (1 - dist / maxDist) * (this.injectionPower / 100) * 22;
          const warpAngle = Math.atan2(dy, dx);
          px -= Math.cos(warpAngle) * warpFactor * Math.sin(this.distortionPhase + dist * 0.05);
          py -= Math.sin(warpAngle) * warpFactor * Math.cos(this.distortionPhase + dist * 0.05);
        }
        if (y === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Concentric Magnetic Containment Rings
    const ringSpeedMult = (this.injectionPower / 50) * (this.overload ? 2.5 : 1);
    this.rotAngle1 += 0.02 * ringSpeedMult;
    this.rotAngle2 -= 0.03 * ringSpeedMult;
    this.rotAngle3 += 0.015 * ringSpeedMult;

    // Draw Magnetic Field Rings (3D Elliptical Projection)
    this.drawRing(cx, cy, 140, 55, this.rotAngle1, 'rgba(0, 229, 255, 0.4)', 2);
    this.drawRing(cx, cy, 110, 80, this.rotAngle2, 'rgba(0, 255, 136, 0.5)', 2);
    this.drawRing(cx, cy, 75, 120, this.rotAngle3, 'rgba(210, 90, 255, 0.45)', 1.5);

    // Gravity Wave Emission Ripples
    const waveRadius = ((performance.now() * 0.05 * (this.frequency / 7.46)) % 160) + 20;
    ctx.strokeStyle = `rgba(0, 255, 136, ${Math.max(0, 1 - waveRadius / 160) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary wave
    const waveRadius2 = ((performance.now() * 0.05 * (this.frequency / 7.46) + 80) % 160) + 20;
    ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - waveRadius2 / 160) * 0.35})`;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius2, 0, Math.PI * 2);
    ctx.stroke();

    // Antimatter / Subatomic Particles
    this.particles.forEach((p, idx) => {
      p.angle += p.speed * (this.injectionPower / 50);
      p.dist += p.radialSpeed;
      if (p.dist < 20 || p.dist > 150) p.radialSpeed = -p.radialSpeed;

      const px = cx + Math.cos(p.angle) * p.dist;
      const py = cy + Math.sin(p.angle) * (p.dist * 0.7);

      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles[idx] = this.spawnParticle();
      }

      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.life * (this.injectionPower / 60)})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Element 115 Core (Triangular / Cone Wedge representation)
    const coreColor = this.overload ? 'rgba(255, 40, 40, 0.95)' : 'rgba(0, 255, 170, 0.95)';
    const coreGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 55);
    coreGlow.addColorStop(0, this.overload ? 'rgba(255, 60, 60, 0.9)' : 'rgba(0, 255, 200, 0.9)');
    coreGlow.addColorStop(0.4, this.overload ? 'rgba(255, 0, 50, 0.4)' : 'rgba(120, 0, 255, 0.35)');
    coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fill();

    // Moscovium 115 Wedge
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(performance.now() * 0.002) * 0.1);
    ctx.fillStyle = coreColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const wedgeH = 24;
    ctx.moveTo(0, -wedgeH);
    ctx.lineTo(wedgeH * 0.866, wedgeH * 0.6);
    ctx.lineTo(-wedgeH * 0.866, wedgeH * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Element 115 Symbol / Glyph
    ctx.fillStyle = '#030807';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('115', 0, 2);
    ctx.restore();

    // 3 Directional Gravity Emitter Vectors (Omicron or Delta Config)
    const emitters = this.mode === 'DELTA' ? [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3] : [Math.PI / 2, Math.PI / 2, Math.PI / 2];
    emitters.forEach((ang, i) => {
      const ex = cx + Math.cos(ang + this.rotAngle1 * 0.2) * 95;
      const ey = cy + Math.sin(ang + this.rotAngle1 * 0.2) * 95;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Vector ray
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Random Geiger counter tick during high power
    if (this.injectionPower > 70 && Math.random() < (this.injectionPower / 100) * 0.08) {
      sound.playGeiger();
    }

    // Telemetry Text
    ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.font = '9px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`REACTOR STATUS: ${this.overload ? 'CRITICAL OVERLOAD' : 'NOMINAL // A-WAVE LOCKED'}`, 12, 16);
    ctx.fillText(`ISOTOPE: UNUNPENTIUM-115 [MOSCOVIUM]`, 12, 28);
    ctx.fillText(`HARMONIC: ${this.frequency.toFixed(2)} HZ (GRAVITY-A)`, 12, 40);
    ctx.fillText(`AMPLIFIERS: 3X IN ${this.mode} CONFIGURATION`, 12, 52);

    ctx.textAlign = 'right';
    ctx.fillStyle = this.overload ? '#ff3344' : '#00e5ff';
    ctx.fillText(`EFFICIENCY: 99.98% [THERMOELECTRIC]`, width - 12, 16);
    ctx.fillText(`CONTAINMENT: ${this.fieldStrength.toFixed(2)} TESLA`, width - 12, 28);
    ctx.fillText(`OUTPUT: ${(this.injectionPower * 14.8).toFixed(1)} MW`, width - 12, 40);
  }

  drawRing(cx, cy, rx, ry, rotation, color, lineWidth) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}
