/* ============================================================
   LYDERTRONICS — script.js
   All interactive JavaScript for the website
============================================================ */

/* ---- Custom Cursor ---- */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
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
