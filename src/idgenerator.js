// Area 51 Raider Clearance & Alien Adoption Passport Generator
import { sound } from './audio.js';

export class RaiderBadgeGenerator {
  constructor(canvas, controls) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.controls = controls;

    this.state = {
      callsign: 'NARUTO_RUNNER_420',
      division: 'NARUTO_SQUAD',
      companion: 'PAUL_THE_ALIEN',
      clearance: 'TOP SECRET // CHEEKS CLAPPED',
      fuel: 'MONSTER ENERGY MANGO LOCO',
      raidDate: 'SEPTEMBER 20, 2019',
      coordinates: '37°14′00″ N 115°48′30″ W'
    };

    this.alienImage = new Image();
    this.alienImage.src = '/assets/alien_bestie.jpg';
    this.alienImage.onload = () => this.render();

    this.init();
  }

  init() {
    this.canvas.width = 640;
    this.canvas.height = 380;

    // Bind inputs
    if (this.controls.nameInput) {
      this.controls.nameInput.addEventListener('input', (e) => {
        this.state.callsign = (e.target.value || 'UNNAMED_RAIDER').toUpperCase();
        this.render();
      });
    }

    if (this.controls.divisionSelect) {
      this.controls.divisionSelect.addEventListener('change', (e) => {
        this.state.division = e.target.value;
        sound.playClick(1100);
        this.render();
      });
    }

    if (this.controls.companionSelect) {
      this.controls.companionSelect.addEventListener('change', (e) => {
        this.state.companion = e.target.value;
        sound.playAlienVocal();
        this.render();
      });
    }

    if (this.controls.fuelSelect) {
      this.controls.fuelSelect.addEventListener('change', (e) => {
        this.state.fuel = e.target.value;
        sound.playMonsterCrack();
        this.render();
      });
    }

    if (this.controls.downloadBtn) {
      this.controls.downloadBtn.addEventListener('click', () => {
        this.downloadBadge();
      });
    }

    if (this.controls.copyBtn) {
      this.controls.copyBtn.addEventListener('click', () => {
        this.copyBadgeData();
      });
    }

    this.render();
  }

  getDivisionDetails() {
    switch (this.state.division) {
      case 'NARUTO_SQUAD':
        return { title: 'NARUTO RUNNER BATTALION', perk: 'AGILITY: 999 // FASTER THAN BULLETS', color: '#ff6600', icon: '🏃' };
      case 'KYLE_DRYWALL':
        return { title: 'KYLE DRYWALL BREACHER', perk: 'STRENGTH: MAX // WALL DESTRUCTION', color: '#39ff14', icon: '⚡' };
      case 'ROCK_THROWER':
        return { title: 'ROCK THROWER ARTILLERY', perk: 'RANGE: 500M // SUPPRESSIVE STONES', color: '#ffaa00', icon: '🪨' };
      case 'ALIEN_SYMPATHIZER':
        return { title: 'ALIEN SYMPATHIZER / AYY LMAO', perk: 'CHARISMA: 100 // SNACKS & PEACE', color: '#00e5ff', icon: '👽' };
      case 'KAREN_COMMAND':
        return { title: 'KAREN STRATEGIC COMMAND', perk: 'TACTIC: WILL DEMAND BASE MANAGER', color: '#ff2244', icon: '📢' };
      default:
        return { title: 'CIVILIAN RAIDER', perk: 'WITNESS OF THE UNKNOWN', color: '#00ff88', icon: '🛸' };
    }
  }

  render() {
    const { ctx, canvas } = this;
    const divInfo = this.getDivisionDetails();

    // 1. Background Card with High-Tech Holographic Dark Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#050f0a');
    bgGrad.addColorStop(0.5, '#0b1d14');
    bgGrad.addColorStop(1, '#020905');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle holographic grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Holographic Border & Corner Brackets
    ctx.strokeStyle = divInfo.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Corner brackets
    const bracketSize = 18;
    ctx.fillStyle = divInfo.color;
    // Top-Left
    ctx.fillRect(10, 10, bracketSize, 4);
    ctx.fillRect(10, 10, 4, bracketSize);
    // Top-Right
    ctx.fillRect(canvas.width - 10 - bracketSize, 10, bracketSize, 4);
    ctx.fillRect(canvas.width - 14, 10, 4, bracketSize);
    // Bottom-Left
    ctx.fillRect(10, canvas.height - 14, bracketSize, 4);
    ctx.fillRect(10, canvas.height - 10 - bracketSize, 4, bracketSize);
    // Bottom-Right
    ctx.fillRect(canvas.width - 10 - bracketSize, canvas.height - 14, bracketSize, 4);
    ctx.fillRect(canvas.width - 14, canvas.height - 10 - bracketSize, 4, bracketSize);

    // 3. Header Bar
    ctx.fillStyle = 'rgba(0, 255, 136, 0.12)';
    ctx.fillRect(10, 10, canvas.width - 20, 52);

    ctx.fillStyle = '#00ff88';
    ctx.font = "bold 18px 'Orbitron', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText("DEPARTMENT OF THE AIR FORCE // S-4 SPECIAL ACCESS", 24, 34);

    ctx.fillStyle = '#b7ffd8';
    ctx.font = "12px 'Share Tech Mono', monospace";
    ctx.fillText("OFFICIAL AREA 51 RAIDER PERMIT & ALIEN ADOPTION PASSPORT", 24, 52);

    ctx.fillStyle = divInfo.color;
    ctx.font = "bold 13px 'Orbitron', monospace";
    ctx.textAlign = 'right';
    ctx.fillText("CERTIFIED AUTHENTIC", canvas.width - 24, 38);

    // 4. Photo / Avatar Box (Left Column)
    const photoX = 28;
    const photoY = 80;
    const photoW = 140;
    const photoH = 175;

    ctx.fillStyle = '#000';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = divInfo.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    if (this.alienImage && this.alienImage.complete && this.alienImage.naturalWidth > 0) {
      ctx.drawImage(this.alienImage, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
    } else {
      ctx.fillStyle = '#00ff88';
      ctx.font = '50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(divInfo.icon, photoX + photoW / 2, photoY + photoH / 2 + 18);
    }

    // Clearance Watermark Stamp over Photo
    ctx.save();
    ctx.translate(photoX + photoW / 2, photoY + photoH / 2);
    ctx.rotate(-0.35);
    ctx.strokeStyle = '#ff2244';
    ctx.lineWidth = 2;
    ctx.strokeRect(-60, -18, 120, 36);
    ctx.fillStyle = '#ff2244';
    ctx.font = "bold 12px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText("APPROVED // S-4", 0, 5);
    ctx.restore();

    // 5. Credentials Data Fields (Center/Right Column)
    const dataX = 190;
    let currY = 98;
    const lineSpacing = 32;

    const drawField = (label, val, highlightColor = '#d4fced') => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6f9e88';
      ctx.font = "bold 11px 'Share Tech Mono', monospace";
      ctx.fillText(label, dataX, currY);

      ctx.fillStyle = highlightColor;
      ctx.font = "bold 14px 'Orbitron', sans-serif";
      ctx.fillText(val, dataX + 130, currY);

      // Subtle underline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dataX, currY + 6);
      ctx.lineTo(canvas.width - 28, currY + 6);
      ctx.stroke();

      currY += lineSpacing;
    };

    drawField("CALLSIGN:", this.state.callsign, '#00ff88');
    drawField("DIVISION:", divInfo.title, divInfo.color);
    drawField("PERK / ABILITY:", divInfo.perk, '#ffb700');
    drawField("RESCUED ALIEN:", this.state.companion.replace(/_/g, ' '), '#00e5ff');
    drawField("FUEL SOURCE:", this.state.fuel, '#39ff14');
    drawField("COORDINATES:", this.state.coordinates, '#d4fced');

    // 6. Holographic Barcode & Security Strip at Bottom
    const barY = canvas.height - 65;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(24, barY, canvas.width - 48, 45);

    // Draw Simulated Barcode Lines
    ctx.fillStyle = '#00ff88';
    let bx = 32;
    const barcodeSeed = this.state.callsign.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
    for (let i = 0; i < 65; i++) {
      const bw = ((barcodeSeed * (i + 1)) % 3) + 1;
      if (i % 2 === 0) {
        ctx.fillRect(bx, barY + 8, bw, 24);
      }
      bx += bw + 2;
      if (bx > 280) break;
    }

    ctx.fillStyle = '#6f9e88';
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.fillText(`SN: 37-14-00-N115-48-30-W // SAP-MJ12 // VERIFIED`, 32, barY + 40);

    // Big Official Stamp
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff2244';
    ctx.font = "bold 13px 'Orbitron', monospace";
    ctx.fillText("CLASSIFIED STATUS: DECLASSIFIED", canvas.width - 36, barY + 22);

    ctx.fillStyle = '#ffb700';
    ctx.font = "11px 'Share Tech Mono', monospace";
    ctx.fillText("THEY CANNOT STOP ALL OF US", canvas.width - 36, barY + 38);
  }

  downloadBadge() {
    sound.playCollect();
    const link = document.createElement('a');
    link.download = `area51_raider_pass_${this.state.callsign.toLowerCase()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  copyBadgeData() {
    sound.playClick(1300);
    const text = `🛸 OFFICIAL AREA 51 RAIDER PERMIT 🛸\n` +
      `Callsign: ${this.state.callsign}\n` +
      `Division: ${this.getDivisionDetails().title}\n` +
      `Rescued Alien: ${this.state.companion}\n` +
      `Coordinates: 37°14′00″ N 115°48′30″ W\n` +
      `Status: CHEEKS CLAPPED // VERIFIED ON VERCEL`;

    navigator.clipboard.writeText(text).then(() => {
      const btn = this.controls.copyBtn;
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'COPIED TO CLIPBOARD! ✓';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    });
  }
}
