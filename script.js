/* ============================================================
   LYDERTRONICS v3 — script.js
   Performance-first JavaScript
   - Canvas cursor (bypasses all CSS stacking contexts)
   - Lightweight scroll reveal (IntersectionObserver)
   - No heavy libraries, no canvas particle network
   ============================================================ */

/* ============================================================
   1. CANVAS CURSOR
   Drawn on a full-viewport canvas with z-index 2147483647.
   Cannot be occluded by backdrop-filter, filter, or transform
   compositing layers — guaranteed always on top.
============================================================ */
(function () {
  /* Create canvas */
  const cc = document.createElement('canvas');
  cc.id = 'cc';
  document.body.prepend(cc);
  const ctx = cc.getContext('2d');

  /* Resize to fill viewport */
  function resize() {
    cc.width  = window.innerWidth;
    cc.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* State */
  let mx = -200, my = -200; /* dot — instant */
  let rx = -200, ry = -200; /* ring — lagged */
  let hover = false;
  let visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    visible = true;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { visible = false; });

  /* Detect interactive elements */
  document.addEventListener('mouseover', e => {
    hover = !!e.target.closest(
      'a, button, .svc-card, .proj-card, .ind-card, .hc, .wi, .rc, .fc, .ap-row'
    );
  }, { passive: true });

  /* Draw loop — only transform & opacity, no layout */
  const CYAN   = '#ff5c00'; /* orange dot */
  const LIME   = '#00b4a6'; /* teal on hover */
  const SPEED  = 0.13;

  function draw() {
    rx += (mx - rx) * SPEED;
    ry += (my - ry) * SPEED;

    ctx.clearRect(0, 0, cc.width, cc.height);

    if (!visible) { requestAnimationFrame(draw); return; }

    const col   = hover ? LIME   : CYAN;
    const dotR  = hover ? 9      : 5;
    const ringR = hover ? 26     : 16;
    const alpha = hover ? 0.55   : 0.45;

    /* Ring */
    ctx.beginPath();
    ctx.arc(rx, ry, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = col.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace('rgba(ff5c00', 'rgba(255,92,0').replace('rgba(00b4a6', 'rgba(0,180,166');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* Dot */
    ctx.beginPath();
    ctx.arc(mx, my, dotR, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();

    requestAnimationFrame(draw);
  }

  /* Simpler color handling */
  function drawFrame() {
    rx += (mx - rx) * SPEED;
    ry += (my - ry) * SPEED;
    ctx.clearRect(0, 0, cc.width, cc.height);

    if (!visible) { requestAnimationFrame(drawFrame); return; }

    const isHover = hover;
    const dotR    = isHover ? 9  : 5;
    const ringR   = isHover ? 26 : 16;
    const dotCol  = isHover ? 'rgba(0,180,166,1)'     : 'rgba(255,92,0,1)';
    const ringCol = isHover ? 'rgba(0,180,166,0.5)'   : 'rgba(255,92,0,0.45)';

    /* Outer ring */
    ctx.beginPath();
    ctx.arc(rx, ry, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = ringCol;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* Dot */
    ctx.beginPath();
    ctx.arc(mx, my, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dotCol;
    ctx.fill();

    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  /* Hide native cursor everywhere */
  const s = document.createElement('style');
  s.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(s);
})();

/* ============================================================
   2. SCROLL REVEAL
   Uses IntersectionObserver — zero scroll event overhead.
   Only toggles a CSS class; browser handles the animation.
============================================================ */
(function () {
  const els = document.querySelectorAll('.sr, .sr-l, .sr-r');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        obs.unobserve(e.target); /* fire once */
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ============================================================
   3. NAVBAR — shadow on scroll (no backdrop-filter used)
============================================================ */
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================================
   4. MOBILE NAV TOGGLE
============================================================ */
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ============================================================
   5. CONTACT FORM — lightweight mock submit
   ===== EDIT: Replace with real form submission logic =====
============================================================ */
function sendMsg() {
  const fn  = document.getElementById('fn').value.trim();
  const em  = document.getElementById('em').value.trim();
  const sv  = document.getElementById('sv').value;
  const msg = document.getElementById('msg').value.trim();

  if (!fn || !em || !sv || !msg) {
    alert('Please complete all required fields: Name, Email, Service, and Message.');
    return;
  }

  /* Show toast */
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);

  /* Clear fields */
  ['fn','ln','em','co','sv','msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
