// Interactive Area 51 Black-Site Terminal Engine
import { sound } from './audio.js';

export class TerminalConsole {
  constructor(containerEl, onDefconChange, onReactorOverload) {
    this.container = containerEl;
    this.onDefconChange = onDefconChange;
    this.onReactorOverload = onReactorOverload;
    this.history = [];
    this.historyIdx = -1;

    this.render();
    this.setupListeners();
    this.printWelcome();
  }

  render() {
    this.container.innerHTML = `
      <div class="terminal-header">
        <span class="terminal-title">GROOM-OS V4.19 // CLASSIFIED DOD / S-4 CONSOLE</span>
        <span class="terminal-status"><span class="blink-dot"></span> CONNECTED // MAJIC-12 NODE</span>
      </div>
      <div class="terminal-output" id="term-output"></div>
      <div class="terminal-input-row">
        <span class="terminal-prompt">SEC_CLEARANCE_LVL5@GROOM-LAKE:~$</span>
        <input type="text" id="term-input" autocomplete="off" spellcheck="false" placeholder="Type 'help' for classified protocols..." />
      </div>
    `;

    this.outputEl = this.container.querySelector('#term-output');
    this.inputEl = this.container.querySelector('#term-input');
  }

  setupListeners() {
    this.inputEl.addEventListener('keydown', (e) => {
      sound.playClick(900 + Math.random() * 200);

      if (e.key === 'Enter') {
        const cmd = this.inputEl.value.trim();
        this.inputEl.value = '';
        if (cmd) {
          this.history.push(cmd);
          this.historyIdx = this.history.length;
          this.executeCommand(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        if (this.history.length > 0 && this.historyIdx > 0) {
          this.historyIdx--;
          this.inputEl.value = this.history[this.historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.inputEl.value = this.history[this.historyIdx];
        } else {
          this.historyIdx = this.history.length;
          this.inputEl.value = '';
        }
      }
    });

    // Clicking anywhere in the terminal container focuses input
    this.container.addEventListener('click', () => {
      this.inputEl.focus();
    });
  }

  printWelcome() {
    this.println('<span class="term-dim">****************************************************************</span>');
    this.println('<span class="term-alert">RESTRICTED DATA // TOP SECRET // MAJESTIC-12 SPECIAL ACCESS</span>');
    this.println('NEVADA TEST AND TRAINING RANGE // GROOM LAKE COMPLEX // S-4 FACILITY');
    this.println('COORDINATES: <span class="term-bright">37°14′00″ N 115°48′30″ W</span> | ELEVATION: 4,462 FT');
    this.println('<span class="term-dim">Type <span class="term-highlight">help</span> for a list of declassified commands.</span>');
    this.println('<span class="term-dim">****************************************************************</span>');
  }

  println(html) {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = html;
    this.outputEl.appendChild(line);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  executeCommand(rawCmd) {
    this.println(`<span class="term-prompt">SEC_CLEARANCE_LVL5@GROOM-LAKE:~$</span> <span class="term-cmd">${this.escape(rawCmd)}</span>`);
    const parts = rawCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (cmd) {
      case 'help':
        this.println(`
<span class="term-bright">CLASSIFIED SYSTEM COMMANDS:</span>
  <span class="term-highlight">status</span>       - Facility telemetry and containment status
  <span class="term-highlight">scan</span>         - Perform radar sweep of Groom & Papoose airspace
  <span class="term-highlight">defcon [1-5]</span> - Elevate or de-escalate defense alert posture
  <span class="term-highlight">element115</span>   - Technical specifications for Moscovium grav-core
  <span class="term-highlight">specimens</span>    - Retrieve catalog of Non-Human Biological Entities (NHBE)
  <span class="term-highlight">decrypt</span>      - Initiate automatic declassification sequence
  <span class="term-highlight">breach</span>       - Trigger EMERGENCY CONTAINMENT LOCKDOWN PROTOCOL
  <span class="term-highlight">coordinates</span>  - Precise S-4 GPS datum & geographic telemetry
  <span class="term-highlight">storm</span>        - Execute Operation: Storm Area 51 (They Can't Stop All Of Us)
  <span class="term-highlight">naruto</span>       - Deploy Naruto Runner Protocol (Arms 180° back)
  <span class="term-highlight">kyle</span>         - Activate Kyle Drywall Breacher (Monster Energy mode)
  <span class="term-highlight">clap</span>         - Extraterrestrial cheek clapping readiness assessment
  <span class="term-highlight">alien</span>        - Extraterrestrial companion holographic uplink
  <span class="term-highlight">boblazar</span>     - Bob Lazar S-4 Sport Model debriefing
  <span class="term-highlight">clear</span>        - Purge terminal buffer
        `);
        break;

      case 'status':
        sound.playAccessGranted();
        this.println(`
<span class="term-bright">[FACILITY STATUS REPORT: GROOM LAKE // S-4]</span>
PERIMETER: CAMMO DUDES SENSOR GRID [ACTIVE]
SECTOR 4: UNDERGROUND HANGARS 1-9 SEALED
AIRSPACE: R-4808N RESTRICTED AIRSPACE VIOLATIONS = 0
GRAV-REACTOR: 7.46 HZ DELTA WAVE NOMINAL
DEFENSE POSTURE: DEFCON READY
MAJIC-12 UPLINK: SYNCHRONIZED VIA MILSTAR-4
        `);
        break;

      case 'scan':
        sound.playRadarPing(0.5);
        this.println('<span class="term-cyan">[+] INITIALIZING AN/FPS-117 ACTIVE PHASED ARRAY SWEEP...</span>');
        setTimeout(() => {
          this.println('[+] 3 ANOMALIES DETECTED IN R-4808N RESTRICTED ZONE:');
          this.println('  - <span class="term-alert">UAP-ALPHA-9</span>: Mach 28.4, Azimuth 046°, Gravimetric distortion');
          this.println('  - <span class="term-highlight">BOGIE-04</span>: Hovering stationary above S-4 Papoose Lake');
          this.println('  - <span class="term-bright">SPECIMEN-115</span>: Sub-surface reactor signature detected');
        }, 400);
        break;

      case 'element115':
      case '115':
      case 'moscovium':
        sound.playAlienWarble(800);
        this.println(`
<span class="term-cyan">[ELEMENT 115 (MOSCOVIUM) GRAVIMETRIC CORE SPECIFICATIONS]</span>
ISOTOPE: Ununpentium-115 (Stable Island of Superheavy Elements)
FUNCTION: Bombarded with protons in accelerator cavity -> Transmutes to Element 116 -> Decays releasing antimatter.
PROPULSION: Antimatter thermal conversion -> 100% efficient electrical power.
GRAVITY-A WAVE: Amplified via 3 independently directional waveguides.
WARP GEOMETRY: Omicron Configuration (Hover) / Delta Configuration (FTL Distortion).
RETRIEVAL SITE: Zeta Reticuli-II Crash Site Recovery.
        `);
        break;

      case 'specimens':
      case 'ebe':
        this.println(`
<span class="term-alert">[NON-HUMAN BIOLOGICAL ENTITY (NHBE) REPOSITORY // CRYOPRESERVED]</span>
- <span class="term-bright">EBE-1 (1947 ROSWELL)</span>: Recovered alive, survived until 1952 at Los Alamos/Groom Lake.
- <span class="term-bright">EBE-2 (1964 KINGMAN)</span>: Retained at Papoose S-4 Cryogenic Vault Bay 3.
- <span class="term-bright">ANATOMY</span>: Cranial capacity 1600cc, vestigial digestive tract, photosynthetic lipid layer.
        `);
        break;

      case 'defcon':
        const lvl = parseInt(arg);
        if (lvl >= 1 && lvl <= 5) {
          if (this.onDefconChange) this.onDefconChange(lvl);
          this.println(`<span class="term-alert">[ALERT LEVEL UPDATED TO DEFCON ${lvl}]</span>`);
        } else {
          this.println('<span class="term-alert">ERROR: Provide DEFCON level 1 through 5 (e.g. defcon 1)</span>');
        }
        break;

      case 'breach':
      case 'containment':
        this.println('<span class="term-alert">*** CRITICAL WARNING: INITIATING FACILITY LOCKDOWN ***</span>');
        if (this.onReactorOverload) this.onReactorOverload();
        if (this.onDefconChange) this.onDefconChange(1);
        break;

      case 'coordinates':
      case 'coords':
        this.println(`
<span class="term-bright">[GEOGRAPHIC TELEMETRY]</span>
LATITUDE: 37°14′00″ N (37.2350° N)
LONGITUDE: 115°48′30″ W (115.8111° W)
GRID: LINCOLN COUNTY, NEVADA, USA
TOPONYM: HOME OF THE BRAVE / WATERTOWN STRIP / DREAMLAND / THE RANCH
        `);
        break;

      case 'decrypt':
        this.println('<span class="term-cyan">[+] RUNNING DECLASSIFICATION ALGORITHM ON ALL ACTIVE DOSSIERS...</span>');
        const redactedEls = document.querySelectorAll('.redacted');
        redactedEls.forEach((el) => el.classList.add('revealed'));
        sound.playAccessGranted();
        this.println('<span class="term-bright">[SUCCESS] REDACTIONS DECLASSIFIED FOR S-4 PERSONNEL.</span>');
        break;

      case 'storm':
        sound.playNarutoSwoosh();
        sound.playXFiles();
        this.println(`
<span class="term-alert">🚨 OPERATION: STORM AREA 51 INITIATED 🚨</span>
TARGET: 37°14′00″ N 115°48′30″ W (GROOM LAKE // S-4)
MOTTO: "THEY CAN'T STOP ALL OF US"
RAID FORCES DEPLOYED:
  🏃 500,000 NARUTO RUNNERS (Mach 2 sprint velocity)
  ⚡ 250,000 KYLES (Armed with Monster Energy Mango Loco)
  🪨 100,000 ROCK THROWERS (Artillery stone barrage)
  👽 1,000,000 ALIEN CHEEK CLAP ENTHUSIASTS
STATUS: GUARDS CONFUSED // RADAR UNABLE TO LOCK ON ARMS-BACK RUNNERS!
        `);
        break;

      case 'naruto':
        sound.playNarutoSwoosh();
        this.println(`
<span class="term-highlight">🏃 [NARUTO RUNNER BATTALION SPRINT PROTOCOL]</span>
SPEED: 180 MPH
AERODYNAMICS: Arms angled 180° backwards, minimizing air drag.
RADAR CROSS-SECTION: Undetectable to conventional Doppler systems!
        `);
        break;

      case 'kyle':
        sound.playMonsterCrack();
        sound.playFbiOpenUp();
        this.println(`
<span class="term-highlight">⚡ [KYLE DRYWALL BREACHER PROTOCOL]</span>
CURRENT INTAKE: 4x Monster Energy Cans (1600mg Caffeine)
WALL PENETRATION POWER: 100% Sheetrock Destruction
OBJECTIVE: Punch hole through S-4 perimeter fence for alien extraction!
        `);
        break;

      case 'clap':
        sound.playAlienVocal();
        this.println(`
<span class="term-cyan">🛸 [CLASSIFIED ALIEN CHEEK TELEMETRY]</span>
STATUS: CLAPPED
TARGET: EBE-1 / SPECIMEN RETICULI
VERDICT: THE ALIENS HAVE AGREED TO PLAY MARIO KART AND SHARE WI-FI PASSWORDS.
        `);
        break;

      case 'alien':
      case 'ayy':
        sound.playAlienVocal();
        this.println(`
<span class="term-bright">👽 [EXTRATERRESTRIAL COMPANION: PAUL]</span>
"⏃⊬⊬   ⌰⋔⏃⍜! Greetings Earthling.
Thank you for breaking me out of S-4 Bay 2.
Do you guys still have Baja Blast at Taco Bell?"
        `);
        break;

      case 'boblazar':
      case 'lazar':
        sound.playAlienWarble(600);
        this.println(`
<span class="term-cyan">[BOB LAZAR // S-4 RETROSPECTIVE DEBRIEF]</span>
"The craft does not use conventional kerosene or jet turbines.
Underneath the deck are three gravity amplifiers on rotational gimbals.
When you power Element 115 with protons, it generates an intense gravitational wave.
Also, the base cafeteria had surprisingly good hot dogs."
        `);
        break;

      case 'clear':
        this.outputEl.innerHTML = '';
        break;

      default:
        this.println(`<span class="term-alert">COMMAND UNRECOGNIZED: "${this.escape(cmd)}". Type <span class="term-highlight">help</span> for classified protocols.</span>`);
        break;
    }
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
