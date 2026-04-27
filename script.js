
const cursor = document.getElementById('cursor');
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});


const luna = document.getElementById('luna');
const arlo = document.getElementById('arlo');

let lunaX = window.innerWidth  * 0.55;
let lunaY = window.innerHeight * 0.45;
let arloX = window.innerWidth  * 0.67;
let arloY = window.innerHeight * 0.50;

const DOG_W = 54;
const DOG_H = 54;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function setDogPos(el, x, y) {
  el.style.left = (x - DOG_W / 2) + 'px';
  el.style.top  = (y - DOG_H / 2) + 'px';
}

setDogPos(luna, lunaX, lunaY);
setDogPos(arlo, arloX, arloY);


const TREATS      = ['🦴', '🦴', '🦴', '🐟', '🥩', '🍗'];
const CATCH_RADIUS = 39;
let treatCount   = 0;
const counter    = document.getElementById('treat-counter');
const activeTreats = []; 


function moveDogs() {

  const lTargetX = clamp(mx - 170, DOG_W, window.innerWidth  - DOG_W);
  const lTargetY = clamp(my - 150, DOG_H, window.innerHeight - DOG_H - 70);
  lunaX += (lTargetX - lunaX) * 0.07;
  lunaY += (lTargetY - lunaY) * 0.07;


  const aTargetX = clamp(mx + 140, DOG_W, window.innerWidth  - DOG_W);
  const aTargetY = clamp(my + 120, DOG_H, window.innerHeight - DOG_H - 70);
  arloX += (aTargetX - arloX) * 0.05;
  arloY += (aTargetY - arloY) * 0.05;

  setDogPos(luna, lunaX, lunaY);
  setDogPos(arlo, arloX, arloY);

  checkTreats();
  requestAnimationFrame(moveDogs);
}

moveDogs();

function spawnTreat(x, y) {
  const el = document.createElement('div');
  el.className   = 'treat';
  el.textContent = TREATS[Math.floor(Math.random() * TREATS.length)];


  const tx = x - 11;
  const ty = y - 11;
  el.style.left = tx + 'px';
  el.style.top  = ty + 'px';
  document.body.appendChild(el);


  setTimeout(() => {
    if (!el.classList.contains('eaten')) el.classList.add('idle');
  }, 420);

  const record = { el, x: tx, y: ty, eaten: false };
  activeTreats.push(record);

  treatCount++;
  counter.textContent = `🦴 ${treatCount} treat${treatCount !== 1 ? 's' : ''}`;
}

function eatTreat(record, dogEl) {
  if (record.eaten) return;
  record.eaten = true;


  dogEl.classList.remove('caught');
  void dogEl.offsetWidth;
  dogEl.classList.add('caught');
  dogEl.addEventListener('animationend', () => dogEl.classList.remove('caught'), { once: true });


  record.el.classList.remove('idle');
  record.el.classList.add('eaten');
  setTimeout(() => {
    record.el.remove();
    activeTreats.splice(activeTreats.indexOf(record), 1);
  }, 380);
}


function checkTreats() {
  for (const rec of activeTreats) {
    if (rec.eaten) continue;

    const tx = rec.x + 11;
    const ty = rec.y + 11;

    const ldx = lunaX - tx;
    const ldy = lunaY - ty;
    if (Math.sqrt(ldx * ldx + ldy * ldy) < CATCH_RADIUS) {
      eatTreat(rec, luna);
      continue;
    }

    const adx = arloX - tx;
    const ady = arloY - ty;
    if (Math.sqrt(adx * adx + ady * ady) < CATCH_RADIUS) {
      eatTreat(rec, arlo);
    }
  }
}

// ── Paw prints on click ──
function spawnPaw(x, y) {
  const p = document.createElement('div');
  p.className   = 'paw';
  p.textContent = '🐾';
  p.style.left  = (x - 8) + 'px';
  p.style.top   = (y - 8) + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 900);
}


document.addEventListener('click', e => {
  const uiSelectors = '#top-right-controls, #social-bar, #timer-panel, button, a';
  if (e.target.closest(uiSelectors)) return;
  spawnTreat(e.clientX, e.clientY);
  spawnPaw(
    e.clientX + (Math.random() - 0.5) * 30,
    e.clientY + (Math.random() - 0.5) * 30
  );
});


const panel    = document.getElementById('timer-panel');
const showBtn  = document.getElementById('show-timer-btn');
const display  = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const modeBtns = document.querySelectorAll('.mode-btn');

let timerVisible = false;
let timerMins    = 25;
let remaining    = timerMins * 60;
let interval     = null;
let running      = false;

function fmt(s) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

display.textContent = fmt(remaining);


showBtn.addEventListener('click', () => {
  timerVisible = !timerVisible;
  panel.classList.toggle('visible', timerVisible);
  showBtn.textContent = timerVisible ? 'Hide Timer' : 'Show Timer';
});


btnStart.addEventListener('click', () => {
  if (running) return;
  running = true;
  btnStart.classList.add('active');

  interval = setInterval(() => {
    remaining--;
    display.textContent = fmt(remaining);

    if (remaining <= 0) {
      clearInterval(interval);
      running = false;
      btnStart.classList.remove('active');

      
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          spawnTreat(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.6
          );
        }, i * 150);
      }
    }
  }, 1000);
});


btnPause.addEventListener('click', () => {
  clearInterval(interval);
  running = false;
  btnStart.classList.remove('active');
});


btnReset.addEventListener('click', () => {
  clearInterval(interval);
  running = false;
  btnStart.classList.remove('active');
  remaining = timerMins * 60;
  display.textContent = fmt(remaining);
});


modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    clearInterval(interval);
    running = false;
    btnStart.classList.remove('active');
    timerMins = parseInt(btn.dataset.mins, 10);
    remaining = timerMins * 60;
    display.textContent = fmt(remaining);
  });
});
