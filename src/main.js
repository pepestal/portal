import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="projects-container">
    
    <!-- SIGNAL Project -->
    <div class="project-wrapper">
      <a href="#" class="project-btn" id="signal-btn">
        <span class="project-name">SIGNAL</span>
        
        <!-- Minimalist Line Graph Animation -->
        <div class="anim-container">
          <svg class="signal-graph" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="signal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(16, 185, 129, 0.2)" />
                <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
              </linearGradient>
            </defs>
            <path class="signal-area" d="M0,80 L50,60 L100,70 L150,40 L200,50 L250,20 L300,35 L350,10 L400,25 L400,100 L0,100 Z" />
            <path class="signal-line" d="M0,80 L50,60 L100,70 L150,40 L200,50 L250,20 L300,35 L350,10 L400,25" />
          </svg>
        </div>
      </a>
      <button class="info-btn" data-target="info-signal">?</button>
      <div class="info-panel" id="info-signal">
        <p>Real-time market analytics, portfolio tracking, and automated signal detection.</p>
      </div>
    </div>

    <!-- TODO Project -->
    <div class="project-wrapper">
      <a href="#" class="project-btn" id="todo-btn">
        <span class="project-name">TODO</span>
        
        <!-- Minimalist Progress Animation -->
        <div class="anim-container">
          <div class="todo-progress">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted);">0/1</span>
            <div class="progress-track">
              <div class="progress-fill"></div>
            </div>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--accent-todo);">1/1</span>
          </div>
        </div>
      </a>
      <button class="info-btn" data-target="info-todo">?</button>
      <div class="info-panel" id="info-todo">
        <p>A sleek daily reminder app. Organizes tasks efficiently with a clean, distraction-free interface.</p>
      </div>
    </div>

  </div>

  <!-- Minimalist System Health -->
  <div class="system-health-container">
    <div class="system-panel" id="system-panel">
      
      <div class="stat-row">
        <span class="stat-label">STATUS</span>
        <span class="stat-value"><span class="live-indicator"></span> ONLINE</span>
      </div>

      <div class="stat-row">
        <span class="stat-label">CORE TEMP</span>
        <span class="stat-value" id="temp-val">45&deg;C</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill fill-temp" id="temp-bar"></div></div>
      </div>

      <div class="stat-row">
        <span class="stat-label">CPU LOAD</span>
        <span class="stat-value" id="cpu-val">12%</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill fill-cpu" id="cpu-bar"></div></div>
      </div>

      <div class="stat-row">
        <span class="stat-label">MEMORY</span>
        <span class="stat-value" id="mem-val">68%</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill fill-mem" id="mem-bar"></div></div>
      </div>

    </div>

    <button class="system-toggle" id="system-toggle">
      <div class="status-dot"></div>
    </button>
  </div>
`

// --- Info Panels Logic ---
document.querySelectorAll('.info-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = btn.getAttribute('data-target');
    const infoPanel = document.getElementById(targetId);
    
    // Close others
    document.querySelectorAll('.info-panel').forEach(panel => {
      if(panel.id !== targetId) panel.classList.remove('active');
    });
    document.querySelectorAll('.info-btn').forEach(b => {
      if(b !== btn) b.classList.remove('active');
    });

    infoPanel.classList.toggle('active');
    btn.classList.toggle('active');
  });
});

// Close panels on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.info-btn') && !e.target.closest('.info-panel')) {
    document.querySelectorAll('.info-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.info-btn').forEach(btn => btn.classList.remove('active'));
  }
});

// --- System Health Logic ---
const systemToggle = document.getElementById('system-toggle');
const systemPanel = document.getElementById('system-panel');

systemToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  systemToggle.classList.toggle('active');
  systemPanel.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.system-health-container')) {
    systemToggle.classList.remove('active');
    systemPanel.classList.remove('active');
  }
});

// Simulated Data Updates for System Health
const tempVal = document.getElementById('temp-val');
const tempBar = document.getElementById('temp-bar');
const cpuVal = document.getElementById('cpu-val');
const cpuBar = document.getElementById('cpu-bar');
const memVal = document.getElementById('mem-val');
const memBar = document.getElementById('mem-bar');

let currentTemp = 45;
let currentCpu = 12;
let currentMem = 68;

setInterval(() => {
  // Temp drift
  currentTemp += (Math.random() * 2) - 1;
  currentTemp = Math.max(35, Math.min(85, currentTemp));
  tempVal.innerHTML = `${Math.round(currentTemp)}&deg;C`;
  tempBar.style.width = `${((currentTemp - 20) / 70) * 100}%`;

  // CPU drift (faster, spikier)
  currentCpu += (Math.random() * 10) - 5;
  currentCpu = Math.max(2, Math.min(98, currentCpu));
  cpuVal.innerText = `${Math.round(currentCpu)}%`;
  cpuBar.style.width = `${Math.round(currentCpu)}%`;

  // Mem drift (slow)
  currentMem += (Math.random() * 1) - 0.5;
  currentMem = Math.max(20, Math.min(95, currentMem));
  memVal.innerText = `${Math.round(currentMem)}%`;
  memBar.style.width = `${Math.round(currentMem)}%`;
}, 2000);
