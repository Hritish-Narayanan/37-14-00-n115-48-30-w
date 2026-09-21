// Groom Lake Vector Radar Engine
import { sound } from './audio.js';

export class RadarStation {
  constructor(canvas, onTargetSelected) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onTargetSelected = onTargetSelected;
    this.angle = 0;
    this.sweepSpeed = 0.025; // radians per frame
    this.activeTarget = null;
    this.mousePos = { x: -1, y: -1 };
    this.lastBeepTime = 0;

    // Facility landmarks relative to center
    this.landmarks = [
      { name: 'GROOM RUNWAY 14L/32R', x: 25, y: -15, type: 'facility' },
      { name: 'S-4 PAPOOSE LAKE', x: -65, y: 70, type: 'classified' },
      { name: 'HANGAR 18', x: 45, y: -35, type: 'facility' },
      { name: 'JANET TERMINAL', x: 10, y: -50, type: 'facility' },
      { name: 'SECTOR 4 PERIMETER', x: -90, y: 110, type: 'perimeter' }
    ];

    // Tactical anomalies
    this.anomalies = [
      {
        id: 'UAP-ALPHA-9',
        designation: 'TRANSMEDIUM DISK (SPORT MODEL)',
        r: 110,
        theta: 0.8,
        speed: 'MACH 28.4',
        altitude: '84,000 FT',
        signature: 'GRAVIMETRIC DISTORTION',
        origin: 'ZETA RETICULI-II',
        threat: 'HIGH',
        dx: 0.3,
        dy: -0.2,
        x: 0,
        y: 0,
        history: []
      },
      {
        id: 'BOGIE-04-TIC-TAC',
        designation: 'CYLINDRICAL VEHICLE',
        r: 160,
        theta: 2.6,
        speed: 'HOVER (0 KTS)',
        altitude: '1,200 FT AGL',
        signature: 'ZERO THERMAL FLIR',
        origin: 'CLASSIFIED // S-4 RETRIEVAL',
        threat: 'MONITORED',
        dx: -0.1,
        dy: 0.15,
        x: 0,
        y: 0,
        history: []
      },
      {
        id: 'SPECIMEN-115-BEACON',
        designation: 'SUBNUCLEAR EMITTER',
        r: 75,
        theta: 4.1,
        speed: 'STATIONARY (S-4)',
        altitude: '-300 FT SUBTERRANEAN',
        signature: '7.46 HZ GRAVITY A-WAVE',
        origin: 'ELEMENT 115 REACTOR CORE',
        threat: 'CONTAINED',
        dx: 0,
        dy: 0,
        x: 0,
        y: 0,
        history: []
      },
      {
        id: 'RAID-NARUTO-01',
        designation: 'NARUTO RUNNER INVASION FLOCK',
        r: 130,
        theta: 1.2,
        speed: 'MACH 2.8 (ARMS EXTENDED)',
        altitude: 'SURFACE LEVEL // SPRINTING',
        signature: 'ORANGE HOODIE INFRARED HEAT',
        origin: 'RACHEL, NEVADA HWY 375',
        threat: 'CANNOT BE STOPPED',
        dx: 0.45,
        dy: -0.3,
        x: 0,
        y: 0,
        history: []
      },
      {
        id: 'KYLE-FORCE-ONE',
        designation: 'DRYWALL BREACH BRIGADE',
        r: 95,
        theta: 3.4,
        speed: '35 MPH // MONSTER FUEL',
        altitude: 'FENCE PERIMETER',
        signature: 'HIGH-CAFFEINE SEISMIC VIBRATION',
        origin: 'LOCAL GAS STATION',
        threat: 'PUNCHING SECTOR 4 FENCE',
        dx: -0.25,
        dy: 0.2,
        x: 0,
        y: 0,
        history: []
      },
      {
        id: 'AYY-LMAO-VIP',
        designation: 'RESCUED ALIEN PAUL (CHILLIN\')',
        r: 50,
        theta: 5.1,
        speed: 'HOVERING WITH SNACKS',
        altitude: '15 FT AGL',
        signature: 'PEACE SIGNS & WI-FI UPLINK',
        origin: 'ZETA RETICULI BINARY SYSTEM',
        threat: 'EXTREMELY FRIENDLY',
        dx: 0.15,
        dy: 0.1,
        x: 0,
        y: 0,
        history: []
      }
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupListeners();
    this.animate();
  }

  deployRaider() {
    const r = Math.random() * 80 + 70;
    const theta = Math.random() * Math.PI * 2;
    const num = Math.floor(Math.random() * 900 + 100);
    const newRaider = {
      id: `RAIDER-#${num}`,
      designation: 'REINFORCEMENT RUNNER',
      r,
      theta,
      speed: 'SPRINTING AT MACH 1.5',
      altitude: 'GROUND SPRINT',
      signature: 'DETERMINED ENERGY',
      origin: 'AREA 51 PERIMETER',
      threat: 'SEARCHING FOR ALIENS',
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      x: 0,
      y: 0,
      history: []
    };
    this.anomalies.push(newRaider);
    sound.playNarutoSwoosh();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.min(rect.width, 480);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.radius = Math.min(this.cx, this.cy) - 25;

    // Recalculate anomaly initial positions
    this.anomalies.forEach((a) => {
      a.x = this.cx + Math.cos(a.theta) * (a.r * (this.radius / 190));
      a.y = this.cy + Math.sin(a.theta) * (a.r * (this.radius / 190));
    });
  }

  setupListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mousePos = { x: -1, y: -1 };
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = null;
      for (const a of this.anomalies) {
        const dist = Math.hypot(mx - a.x, my - a.y);
        if (dist < 20) {
          found = a;
          break;
        }
      }

      this.activeTarget = found;
      sound.playClick(found ? 1600 : 700);
      if (this.onTargetSelected) {
        this.onTargetSelected(found);
      }
    });
  }

  updateAnomalies() {
    const scale = this.radius / 190;
    this.anomalies.forEach((a) => {
      if (a.dx !== 0 || a.dy !== 0) {
        a.x += a.dx;
        a.y += a.dy;

        // Bounce inside radius
        const dist = Math.hypot(a.x - this.cx, a.y - this.cy);
        if (dist > this.radius * 0.9) {
          a.dx = -a.dx + (Math.random() * 0.2 - 0.1);
          a.dy = -a.dy + (Math.random() * 0.2 - 0.1);
        }

        // Random jitter for erratic extraterrestrial flight
        if (Math.random() < 0.03 && a.id.includes('ALPHA')) {
          a.dx = (Math.random() - 0.5) * 2.5;
          a.dy = (Math.random() - 0.5) * 2.5;
        }
      }

      // Record trail history
      if (!a.history) a.history = [];
      a.history.push({ x: a.x, y: a.y });
      if (a.history.length > 25) a.history.shift();

      // Check if sweep beam passes over anomaly
      const angleToA = (Math.atan2(a.y - this.cy, a.x - this.cx) + Math.PI * 2) % (Math.PI * 2);
      const angleDiff = Math.abs(this.angle - angleToA);
      if (angleDiff < this.sweepSpeed * 1.5) {
        a.lastSweepTime = performance.now();
        const now = performance.now();
        if (now - this.lastBeepTime > 200) {
          sound.playRadarPing(dist / this.radius);
          this.lastBeepTime = now;
        }
      }
    });
  }

  draw() {
    const { ctx, cx, cy, radius, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Deep Tactical Background
    ctx.fillStyle = '#020704';
    ctx.fillRect(0, 0, width, height);

    // Circular radar grid clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 25, 12, 0.45)';
    ctx.fill();
    ctx.clip();

    // Concentric Range Rings
    const ringCount = 4;
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= ringCount; i++) {
      ctx.beginPath();
      const r = (radius / ringCount) * i;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
      ctx.font = '9px "Courier New", monospace';
      ctx.fillText(`${i * 12.5} KM`, cx + 4, cy - r + 11);
    }

    // Crosshairs & Azimuth Bearing Lines
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // 45 degree angle guides
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
    ctx.beginPath();
    const d = radius * 0.7071;
    ctx.moveTo(cx - d, cy - d);
    ctx.lineTo(cx + d, cy + d);
    ctx.moveTo(cx - d, cy + d);
    ctx.lineTo(cx + d, cy - d);
    ctx.stroke();
    ctx.setLineDash([]);

    // Landmarks / Facilities
    this.landmarks.forEach((lm) => {
      const lx = cx + lm.x * (radius / 130);
      const ly = cy + lm.y * (radius / 130);

      ctx.fillStyle = lm.type === 'classified' ? 'rgba(255, 80, 80, 0.8)' : 'rgba(0, 229, 255, 0.7)';
      ctx.beginPath();
      ctx.rect(lx - 2, ly - 2, 4, 4);
      ctx.fill();

      ctx.font = '8px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(lm.name, lx + 6, ly + 3);
    });

    // Anomaly trails & icons
    this.anomalies.forEach((a) => {
      const now = performance.now();
      const timeSinceSweep = now - (a.lastSweepTime || 0);
      const fade = Math.max(0.15, 1 - timeSinceSweep / 2500);

      // Trail
      if (a.history && a.history.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.12 * fade})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(a.history[0].x, a.history[0].y);
        for (let i = 1; i < a.history.length; i++) {
          ctx.lineTo(a.history[i].x, a.history[i].y);
        }
        ctx.stroke();
      }

      // Blip
      const isTargeted = this.activeTarget && this.activeTarget.id === a.id;
      const blipColor = isTargeted ? 'rgba(255, 50, 50,' : 'rgba(0, 255, 136,';

      // Outer glow
      const glowGrad = ctx.createRadialGradient(a.x, a.y, 1, a.x, a.y, isTargeted ? 18 : 10);
      glowGrad.addColorStop(0, `${blipColor} ${0.9 * fade})`);
      glowGrad.addColorStop(1, `${blipColor} 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(a.x, a.y, isTargeted ? 18 : 10, 0, Math.PI * 2);
      ctx.fill();

      // Blip center
      ctx.fillStyle = `${blipColor} ${fade})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, isTargeted ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Target lock box
      if (isTargeted) {
        ctx.strokeStyle = '#ff3344';
        ctx.lineWidth = 1;
        const bSize = 12;
        ctx.strokeRect(a.x - bSize, a.y - bSize, bSize * 2, bSize * 2);

        // Reticle ticks
        ctx.beginPath();
        ctx.moveTo(a.x - bSize - 4, a.y);
        ctx.lineTo(a.x - bSize, a.y);
        ctx.moveTo(a.x + bSize + 4, a.y);
        ctx.lineTo(a.x + bSize, a.y);
        ctx.moveTo(a.x, a.y - bSize - 4);
        ctx.lineTo(a.x, a.y - bSize);
        ctx.moveTo(a.x, a.y + bSize + 4);
        ctx.lineTo(a.x, a.y + bSize);
        ctx.stroke();

        ctx.fillStyle = '#ff4455';
        ctx.font = 'bold 9px "Courier New", monospace';
        ctx.fillText(`[LOCK: ${a.id}]`, a.x + bSize + 6, a.y - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(`${a.speed} // ${a.altitude}`, a.x + bSize + 6, a.y + 7);
      } else {
        ctx.fillStyle = `rgba(0, 255, 136, ${0.6 * fade})`;
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(a.id, a.x + 8, a.y + 3);
      }
    });

    // Radar Sweep Beam
    const sweepAngle = this.angle;
    const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    sweepGradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
    sweepGradient.addColorStop(0.7, 'rgba(0, 255, 136, 0.15)');
    sweepGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepAngle - 0.35, sweepAngle);
    ctx.closePath();
    ctx.fillStyle = sweepGradient;
    ctx.fill();

    // Leading sweep line
    ctx.strokeStyle = 'rgba(150, 255, 200, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // Restore outer clip

    // Radar Outer Ring & Compass Heading Marks
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const tickLen = isMajor ? 8 : 4;
      const x1 = cx + Math.cos(rad) * (radius - 1);
      const y1 = cy + Math.sin(rad) * (radius - 1);
      const x2 = cx + Math.cos(rad) * (radius - 1 - tickLen);
      const y2 = cy + Math.sin(rad) * (radius - 1 - tickLen);

      ctx.strokeStyle = isMajor ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 255, 136, 0.3)';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isMajor) {
        const tx = cx + Math.cos(rad) * (radius - 17);
        const ty = cy + Math.sin(rad) * (radius - 17);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        ctx.font = '8px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let label = deg.toString().padStart(3, '0') + '°';
        if (deg === 0) label = 'N';
        if (deg === 90) label = 'E';
        if (deg === 180) label = 'S';
        if (deg === 270) label = 'W';
        ctx.fillText(label, tx, ty);
      }
    }

    // Top-Left Radar HUD Telemetry
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('SYS: AN/FPS-117 GROOM RADAR ARRAY', 10, 8);
    ctx.fillText('LOC: 37°14\'00"N 115°48\'30"W [S-4/RANGE 4800]', 10, 20);
    ctx.fillText(`BEARING: ${(Math.round((this.angle * 180) / Math.PI) % 360).toString().padStart(3, '0')}° MAG`, 10, 32);

    // Target readout on top right
    ctx.textAlign = 'right';
    if (this.activeTarget) {
      ctx.fillStyle = '#ff4455';
      ctx.fillText(`LOCKED: ${this.activeTarget.id}`, width - 10, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${this.activeTarget.designation}`, width - 10, 20);
      ctx.fillText(`ALT: ${this.activeTarget.altitude} | SPD: ${this.activeTarget.speed}`, width - 10, 32);
    } else {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.fillText('TARGET: NONE [CLICK BLIP TO TRACK]', width - 10, 8);
    }
  }

  animate() {
    this.angle = (this.angle + this.sweepSpeed) % (Math.PI * 2);
    this.updateAnomalies();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}
