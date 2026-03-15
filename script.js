/* ============================================================
   LYDERTRONICS — script.js
   All interactive JavaScript for the website
============================================================ */

/* ============================================================
   CANVAS CURSOR
   Drawn directly on a <canvas> with z-index 2147483647.
   Canvas 2D drawing bypasses ALL CSS stacking contexts,
   backdrop-filter, filter, and transform compositing —
   it is always visually on top of everything.
============================================================ */
(function () {
  /* Create the canvas and inject it as first child of body */
  const cc = document.createElement('canvas');
  cc.id = 'cursor-canvas';
  cc.style.cssText = [
    'position:fixed', 'top:0', 'left:0',
    'width:100vw', 'height:100vh',
    'z-index:2147483647',
    'pointer-events:none'
  ].join(';');
  document.body.prepend(cc);

  const ctx = cc.getContext('2d');

  /* Resize canvas to match viewport */
  function resize() {
    cc.width  = window.innerWidth;
    cc.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* State */
  let mx = -100, my = -100;   // dot  position (instant)
  let rx = -100, ry = -100;   // ring position (lagged)
  let isHover = false;

  /* Track mouse */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  /* Detect hover over interactive elements */
  document.addEventListener('mouseover', e => {
    isHover = !!e.target.closest('a, button, .bento-card, .proj-card, .why-item, .ind-card');
  });
  document.addEventListener('mouseout', () => { isHover = false; });

  /* Hide when leaving window */
  document.addEventListener('mouseleave', () => { mx = -200; my = -200; });

  /* Colours */
  const CYAN = '#00d2ff';
  const LIME = '#b3ff00';

  /* Draw loop */
  function draw() {
    /* Lerp ring toward dot */
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;

    ctx.clearRect(0, 0, cc.width, cc.height);

    const dotR  = isHover ? 10 : 6;
    const ringR = isHover ? 28 : 18;
    const col   = isHover ? LIME : CYAN;

    /* Outer ring */
    ctx.beginPath();
    ctx.arc(rx, ry, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = isHover ? 'rgba(179,255,0,0.6)' : 'rgba(0,210,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* Inner dot */
    ctx.beginPath();
    ctx.arc(mx, my, dotR, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();

    /* Subtle glow behind dot */
    ctx.beginPath();
    ctx.arc(mx, my, dotR + 6, 0, Math.PI * 2);
    ctx.fillStyle = isHover ? 'rgba(179,255,0,0.12)' : 'rgba(0,210,255,0.12)';
    ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();

  /* Hide system cursor */
  document.body.style.cursor = 'none';
  const styleTag = document.createElement('style');
  styleTag.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(styleTag);
})();

/* ---- Bento card radial glow (mouse-tracking) ---- */
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mx', x);
    card.style.setProperty('--my', y);
  });
});

/* ---- Neural canvas particle network ---- */
(function () {
  const canvas = document.getElementById('neural-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const NUM_PARTICLES = 80;
  const MAX_DIST      = 130;
  const particles     = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Initialise particles */
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Draw connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,210,255,${(1 - d / MAX_DIST) * 0.18})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    /* Draw & move particles */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,210,255,0.5)';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---- Scroll Reveal ---- */
const revElements = document.querySelectorAll('.rev, .rev-l, .rev-r');
const revObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      revObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revElements.forEach(el => revObserver.observe(el));

/* ---- Navbar scroll effect ---- */
window.addEventListener('scroll', () => {
  const navBg = document.querySelector('nav .nav-bg');
  if (navBg) {
    navBg.style.background = window.scrollY > 50
      ? 'rgba(5,8,14,.96)'
      : 'rgba(5,8,14,.82)';
  }
});

/* ---- Mobile nav toggle ---- */
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ---- Contact form submit (mock) ---- */
function sendMsg() {
  const fn  = document.getElementById('fn').value.trim();
  const em  = document.getElementById('em').value.trim();
  const sv  = document.getElementById('sv').value;
  const msg = document.getElementById('msg').value.trim();

  if (!fn || !em || !sv || !msg) {
    alert('Please complete all required fields: Name, Email, Service, and Message.');
    return;
  }

  /* Show success toast */
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);

  /* Reset form fields */
  ['fn', 'ln', 'em', 'co', 'sv', 'msg'].forEach(id => {
    document.getElementById(id).value = '';
  });
}
