// Naruto Runner: Area 51 Escape Mini-Game Engine
import { sound } from './audio.js';

export class NarutoRunnerGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
    this.isPlaying = false;
    this.isGameOver = false;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('area51_raider_highscore') || '0', 10);
    this.distance = 0;
    this.speed = 6;
    this.gameTime = 0;

    // Player State
    this.player = {
      x: 80,
      y: 0,
      width: 44,
      height: 60,
      vy: 0,
      gravity: 0.72,
      jumpForce: -13.5,
      isGrounded: false,
      jumpsLeft: 2,
      isSliding: false,
      slideTimer: 0,
      shieldTimer: 0, // Monster Energy invincibility
      animFrame: 0
    };

    this.groundY = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.bgStars = [];
    this.bgMountains = [];

    this.obstacleTimer = 0;
    this.collectibleTimer = 0;

    this.memeQuotes = [
      "Detained by Guard Steve at Gate 3!",
      "Caught eating mystery pudding in Hangar 18!",
      "Tripped over a classified weather balloon!",
      "Tractor-beamed into an alien probe chamber!",
      "Drywall punched back! Needs more Monster Energy!",
      "Arrested for asking the base commander for the Wi-Fi password!"
    ];
    this.currentQuote = "";

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initBackground();
    this.bindInputs();
    this.drawIntroScreen();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = Math.min(parent.clientWidth || 800, 900);
    this.canvas.height = 360;
    this.groundY = this.canvas.height - 55;
    this.player.y = this.groundY - this.player.height;
  }

  initBackground() {
    this.bgStars = [];
    for (let i = 0; i < 45; i++) {
      this.bgStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.groundY - 80),
        size: Math.random() * 2 + 1,
        blink: Math.random() * Math.PI * 2
      });
    }

    this.bgMountains = [];
    for (let i = 0; i < 15; i++) {
      this.bgMountains.push({
        x: i * 80,
        height: 60 + Math.sin(i * 1.5) * 35 + Math.random() * 20
      });
    }
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        this.handleJump();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.handleSlide(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        this.handleSlide(false);
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (!this.isPlaying) {
        this.start();
      } else if (clickY > this.canvas.height * 0.7) {
        this.handleSlide(true);
        setTimeout(() => this.handleSlide(false), 450);
      } else {
        this.handleJump();
      }
    });
  }

  handleJump() {
    if (!this.isPlaying) {
      this.start();
      return;
    }
    if (this.player.jumpsLeft > 0) {
      this.player.vy = this.player.jumpForce;
      this.player.jumpsLeft--;
      this.player.isGrounded = false;
      this.player.isSliding = false;
      sound.playJump();
      this.spawnDust(this.player.x + 10, this.player.y + this.player.height, 8);
    }
  }

  handleSlide(active) {
    if (!this.isPlaying || !this.player.isGrounded) return;
    this.player.isSliding = active;
    if (active) {
      sound.playNarutoSwoosh();
      this.spawnDust(this.player.x + 5, this.groundY, 5);
    }
  }

  start() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.isPlaying = true;
    this.isGameOver = false;
    this.score = 0;
    this.distance = 0;
    this.speed = 6.2;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.obstacleTimer = 70;
    this.collectibleTimer = 110;
    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.jumpsLeft = 2;
    this.player.isSliding = false;
    this.player.shieldTimer = 0;

    sound.playClick(1400);
    this.loop();
  }

  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    sound.playGameOver();

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('area51_raider_highscore', this.highScore.toString());
    }

    this.currentQuote = this.memeQuotes[Math.floor(Math.random() * this.memeQuotes.length)];
    this.drawGameOverScreen();
  }

  spawnObstacle() {
    const types = ['guard', 'cactus', 'laser', 'ufo_beam'];
    const type = types[Math.floor(Math.random() * types.length)];
    let width = 34;
    let height = 48;
    let y = this.groundY - height;

    if (type === 'laser') {
      // High laser tripwire: must slide under!
      y = this.groundY - 65;
      height = 22;
      width = 65;
    } else if (type === 'cactus') {
      width = 28;
      height = 42;
      y = this.groundY - height;
    } else if (type === 'ufo_beam') {
      width = 45;
      height = 80;
      y = this.groundY - height;
    }

    this.obstacles.push({
      type,
      x: this.canvas.width + 30,
      y,
      width,
      height
    });
  }

  spawnCollectible() {
    const isMonster = Math.random() > 0.45;
    this.collectibles.push({
      type: isMonster ? 'monster' : 'alien',
      x: this.canvas.width + 40,
      y: this.groundY - (50 + Math.random() * 85),
      width: 28,
      height: 28,
      floatAngle: Math.random() * Math.PI
    });
  }

  spawnDust(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: -(Math.random() * 3 + 1),
        vy: -(Math.random() * 2),
        size: Math.random() * 4 + 2,
        alpha: 1,
        color: '#ffb700'
      });
    }
  }

  spawnBurst(x, y, color = '#00ff88') {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        alpha: 1,
        color
      });
    }
  }

  update() {
    this.gameTime++;
    this.distance += this.speed * 0.15;
    this.score += 0.2;
    this.speed = Math.min(13.5, 6.2 + this.distance * 0.0035);

    // Player Invincibility timer
    if (this.player.shieldTimer > 0) {
      this.player.shieldTimer--;
      this.score += 0.3; // bonus score while boosted!
    }

    // Player Physics
    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;

    const normalHeight = 60;
    const slideHeight = 32;

    if (this.player.isSliding && this.player.isGrounded) {
      this.player.height = slideHeight;
    } else {
      this.player.height = normalHeight;
    }

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpsLeft = 2;
    }

    // Spawn running dust
    if (this.player.isGrounded && this.gameTime % 5 === 0) {
      this.spawnDust(this.player.x + 5, this.groundY, 1);
    }

    // Obstacles
    this.obstacleTimer--;
    if (this.obstacleTimer <= 0) {
      this.spawnObstacle();
      this.obstacleTimer = Math.floor(Math.random() * 40 + 75 - Math.min(30, this.distance * 0.02));
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed;

      // Collision Check
      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        if (this.player.shieldTimer > 0) {
          // Smash obstacle with Monster Energy shield!
          sound.playFbiOpenUp();
          this.spawnBurst(obs.x + obs.width / 2, obs.y + obs.height / 2, '#39ff14');
          this.obstacles.splice(i, 1);
          this.score += 200;
          continue;
        } else {
          this.gameOver();
          return;
        }
      }

      if (obs.x + obs.width < -20) {
        this.obstacles.splice(i, 1);
      }
    }

    // Collectibles
    this.collectibleTimer--;
    if (this.collectibleTimer <= 0) {
      this.spawnCollectible();
      this.collectibleTimer = Math.floor(Math.random() * 70 + 90);
    }

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.speed;
      col.floatAngle += 0.06;

      // Collision Check
      if (
        this.player.x < col.x + col.width &&
        this.player.x + this.player.width > col.x &&
        this.player.y < col.y + col.height &&
        this.player.y + this.player.height > col.y
      ) {
        if (col.type === 'monster') {
          sound.playMonsterCrack();
          this.player.shieldTimer = 260; // ~4.5 seconds of invincibility
          this.spawnBurst(col.x, col.y, '#39ff14');
          this.score += 150;
        } else {
          sound.playAlienVocal();
          this.spawnBurst(col.x, col.y, '#00e5ff');
          this.score += 500;
        }
        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.x + col.width < -20) {
        this.collectibles.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Sky Gradient & Nevada Desert Backdrop
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#020504');
    skyGrad.addColorStop(0.7, '#071810');
    skyGrad.addColorStop(1, '#0c2419');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, this.groundY);

    // Stars
    ctx.fillStyle = '#b7ffd8';
    this.bgStars.forEach((star) => {
      star.blink += 0.05;
      const alpha = 0.4 + Math.sin(star.blink) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Distant Nevada Desert Mountains
    ctx.fillStyle = '#06130d';
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    this.bgMountains.forEach((m, idx) => {
      ctx.lineTo(m.x, this.groundY - m.height);
    });
    ctx.lineTo(canvas.width, this.groundY);
    ctx.closePath();
    ctx.fill();

    // S-4 Perimeter Fence & Desert Ground
    ctx.fillStyle = '#11291d';
    ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

    // Perimeter Warning Line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(canvas.width, this.groundY);
    ctx.stroke();

    // Fence Posts
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.25)';
    ctx.lineWidth = 1;
    for (let x = -((this.distance * 2) % 40); x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY - 25);
      ctx.lineTo(x, this.groundY);
      ctx.stroke();
      // Cross wire
      ctx.beginPath();
      ctx.moveTo(x, this.groundY - 20);
      ctx.lineTo(x + 40, this.groundY - 10);
      ctx.stroke();
    }

    // 2. Draw Collectibles
    this.collectibles.forEach((col) => {
      const floatOffset = Math.sin(col.floatAngle) * 5;
      const drawY = col.y + floatOffset;

      if (col.type === 'monster') {
        // Monster Energy Can
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(col.x, drawY, col.width, col.height, 4);
        ctx.fill();
        ctx.stroke();

        // M Claw Logo
        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', col.x + col.width / 2, drawY + 18);
      } else {
        // Alien Bestie Companion
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.ellipse(col.x + col.width / 2, drawY + col.height / 2, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Big black alien eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(col.x + col.width / 2 - 4, drawY + col.height / 2 - 2, 3, 5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(col.x + col.width / 2 + 4, drawY + col.height / 2 - 2, 3, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Peace sign symbol
        ctx.fillStyle = '#00e5ff';
        ctx.font = '12px sans-serif';
        ctx.fillText('✌️', col.x + col.width + 4, drawY + 10);
      }
    });

    // 3. Draw Obstacles
    this.obstacles.forEach((obs) => {
      if (obs.type === 'guard') {
        // Area 51 Guard
        ctx.fillStyle = '#1c2e24';
        ctx.fillRect(obs.x + 8, obs.y + 16, obs.width - 16, obs.height - 16);
        // Helmet / Head
        ctx.fillStyle = '#2c4a3a';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + 10, 9, 0, Math.PI * 2);
        ctx.fill();
        // Flashlight beam
        ctx.fillStyle = 'rgba(255, 255, 100, 0.25)';
        ctx.beginPath();
        ctx.moveTo(obs.x + 6, obs.y + 24);
        ctx.lineTo(obs.x - 70, obs.y - 10);
        ctx.lineTo(obs.x - 70, obs.y + 45);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === 'cactus') {
        ctx.fillStyle = '#195932';
        ctx.fillRect(obs.x + 10, obs.y, 8, obs.height);
        // Arms
        ctx.fillRect(obs.x, obs.y + 12, 10, 6);
        ctx.fillRect(obs.x, obs.y + 6, 6, 12);
        ctx.fillRect(obs.x + 18, obs.y + 18, 10, 6);
        ctx.fillRect(obs.x + 22, obs.y + 12, 6, 12);
      } else if (obs.type === 'laser') {
        // High laser tripwire
        ctx.strokeStyle = '#ff2244';
        ctx.shadowColor = '#ff2244';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height / 2);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff2244';
        ctx.font = '10px monospace';
        ctx.fillText('⚡ LASER ⚡', obs.x + 4, obs.y - 4);
      } else if (obs.type === 'ufo_beam') {
        // UFO hovering above shooting tractor beam
        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        // UFO Saucer
        ctx.fillStyle = '#223344';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // 4. Draw Naruto Runner
    this.drawPlayer();

    // 5. Draw Particles
    this.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 6. Draw HUD (Score, Distance, Highscore, Boost Bar)
    ctx.fillStyle = '#00ff88';
    ctx.font = "bold 16px 'Orbitron', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${Math.floor(this.score)}`, 20, 28);
    ctx.fillText(`DISTANCE: ${Math.floor(this.distance)}M`, 180, 28);

    ctx.fillStyle = '#ffb700';
    ctx.textAlign = 'right';
    ctx.fillText(`RECORD: ${this.highScore} PTS`, canvas.width - 20, 28);

    // Invincible Boost Gauge
    if (this.player.shieldTimer > 0) {
      const gaugeWidth = 140;
      const pct = this.player.shieldTimer / 260;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(20, 40, gaugeWidth, 12);
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(20, 40, gaugeWidth * pct, 12);
      ctx.strokeStyle = '#39ff14';
      ctx.strokeRect(20, 40, gaugeWidth, 12);
      ctx.font = '10px monospace';
      ctx.fillText('⚡ MONSTER ENERGY BOOST ⚡', 24, 49);
    }
  }

  drawPlayer() {
    const { ctx } = this;
    const { x, y, width, height, isSliding, shieldTimer } = this.player;

    ctx.save();

    // Invincibility Shield Aura
    if (shieldTimer > 0) {
      ctx.strokeStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, width * 0.8, height * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (isSliding) {
      // SLIDING POSE: Low profile, arms forward, sliding along dirt
      ctx.fillStyle = '#ff6600'; // Orange Hoodie
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Head & Headband
      ctx.fillStyle = '#ffcc99';
      ctx.beginPath();
      ctx.arc(x + width - 8, y + 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Black ninja headband
      ctx.fillStyle = '#222';
      ctx.fillRect(x + width - 12, y + 4, 10, 4);
    } else {
      // ICONIC NARUTO RUNNING POSE: Torso tilted 45° forward, arms stretched straight backwards!
      const bob = Math.sin(this.gameTime * 0.35) * 3;
      const drawY = y + bob;

      // Backward Stretched Arms (Iconic Naruto arms trailing behind!)
      ctx.strokeStyle = '#e65c00';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 18, drawY + 22);
      ctx.lineTo(x - 22, drawY + 12); // Left arm swept back
      ctx.stroke();

      // Orange Torso / Hoodie tilted forward
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(x + 8, drawY + 16);
      ctx.lineTo(x + 32, drawY + 24);
      ctx.lineTo(x + 22, drawY + 44);
      ctx.lineTo(x + 4, drawY + 38);
      ctx.closePath();
      ctx.fill();

      // Head with spiky hair
      ctx.fillStyle = '#ffcc99';
      ctx.beginPath();
      ctx.arc(x + 30, drawY + 14, 10, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Spiky Hair
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(x + 22, drawY + 8);
      ctx.lineTo(x + 26, drawY - 4);
      ctx.lineTo(x + 32, drawY + 4);
      ctx.lineTo(x + 38, drawY - 6);
      ctx.lineTo(x + 42, drawY + 8);
      ctx.closePath();
      ctx.fill();

      // Headband
      ctx.fillStyle = '#111';
      ctx.fillRect(x + 28, drawY + 6, 8, 5);

      // Running Legs (alternating stride)
      const legCycle = Math.sin(this.gameTime * 0.4);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x + 12, drawY + 40);
      ctx.lineTo(x + 12 - legCycle * 14, drawY + 54);
      ctx.lineTo(x + 8 - legCycle * 18, drawY + 60);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 18, drawY + 40);
      ctx.lineTo(x + 18 + legCycle * 14, drawY + 54);
      ctx.lineTo(x + 22 + legCycle * 18, drawY + 60);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawIntroScreen() {
    const { ctx, canvas } = this;
    this.draw();

    ctx.fillStyle = 'rgba(2, 7, 5, 0.82)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff88';
    ctx.font = "bold 26px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('🏃 NARUTO RUNNER: AREA 51 ESCAPE', canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = '#ffb700';
    ctx.font = "14px 'Share Tech Mono', monospace";
    ctx.fillText("THEY CAN'T STOP ALL OF US — RUN FASTER THAN THEIR BULLETS!", canvas.width / 2, canvas.height / 2 - 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = "13px 'Chakra Petch', sans-serif";
    ctx.fillText('[SPACE / UP / CLICK] = JUMP / DOUBLE JUMP   |   [DOWN / S] = SLIDE UNDER LASERS', canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(canvas.width / 2 - 110, canvas.height / 2 + 45, 220, 38);
    ctx.fillStyle = '#000000';
    ctx.font = "bold 15px 'Orbitron', monospace";
    ctx.fillText('CLICK TO SPRINT!', canvas.width / 2, canvas.height / 2 + 69);
  }

  drawGameOverScreen() {
    const { ctx, canvas } = this;
    ctx.fillStyle = 'rgba(10, 2, 4, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff2244';
    ctx.font = "bold 28px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ MISSION COMPROMISED // BUSTED!', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#ffccdd';
    ctx.font = "15px 'Share Tech Mono', monospace";
    ctx.fillText(this.currentQuote, canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#00ff88';
    ctx.font = "bold 18px 'Orbitron', monospace";
    ctx.fillText(`FINAL SCORE: ${Math.floor(this.score)}   |   DISTANCE: ${Math.floor(this.distance)}M`, canvas.width / 2, canvas.height / 2 + 15);

    ctx.fillStyle = '#ffb700';
    ctx.font = "13px 'Share Tech Mono', monospace";
    ctx.fillText(`PERSONAL BEST: ${this.highScore} PTS`, canvas.width / 2, canvas.height / 2 + 40);

    // Restart Button
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(canvas.width / 2 - 110, canvas.height / 2 + 60, 220, 38);
    ctx.fillStyle = '#000000';
    ctx.font = "bold 15px 'Orbitron', monospace";
    ctx.fillText('TRY AGAIN (SPACE / CLICK)', canvas.width / 2, canvas.height / 2 + 84);
  }

  loop() {
    if (!this.isPlaying) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }
}
