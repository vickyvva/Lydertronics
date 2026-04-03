/* ============================================================
   LYDERTRONICS — script.js
   Minimal, optimized vanilla JavaScript
   ============================================================ */

'use strict';

/* ─── LOADER / ROBOT SKULL INTRO ─────────────────────────── */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const fillEl    = document.getElementById('loaderFill');
  const pctEl     = document.getElementById('loaderPct');
  const statusEl  = document.getElementById('loaderStatus');

  const statuses = [
    'INITIALIZING NEURAL CORE...',
    'LOADING AI SUBSYSTEMS...',
    'CALIBRATING DATA PIPELINES...',
    'ESTABLISHING CONNECTIONS...',
    'SYSTEM READY',
  ];

  let progress  = 0;
  let msgIndex  = 0;
  const totalMs = 3200;
  const step    = 16;

  const interval = setInterval(() => {
    progress = Math.min(100, progress + (100 / (totalMs / step)));
    if (fillEl) fillEl.style.width = progress.toFixed(1) + '%';
    if (pctEl)  pctEl.textContent  = Math.floor(progress) + '%';

    const thresholds = [20, 45, 65, 85, 99];
    if (thresholds[msgIndex] && progress >= thresholds[msgIndex]) {
      if (statusEl) statusEl.textContent = statuses[msgIndex + 1] || statuses[msgIndex];
      msgIndex++;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(exitLoader, 400);
    }
  }, step);

  function exitLoader() {
    if (!loader) return;
    loader.classList.add('exit');
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }, 850);
  }

  document.body.style.overflow = 'hidden';
})();


/* ─── SMOOTH SCROLL HELPER ───────────────────────────────── */
window.smoothScrollTo = function (selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const navH = document.getElementById('navbar')?.offsetHeight || 66;
  const top  = target.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: 'smooth' });
};


/* ─── TEAM MODAL ─────────────────────────────────────────── */
(function initModal() {
  const modal     = document.getElementById('teamModal');
  const openBtn   = document.getElementById('openTeamModal');
  const closeBtn  = document.getElementById('modalClose');
  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn)  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();


/* ─── NAVBAR: scroll style + active link ─────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const links    = document.getElementById('navLinks');
  const allLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    highlightActive();
  }

  function highlightActive() {
    const sections = ['hero','about','services','projects','why-us','industries','contact'];
    const navH = navbar ? navbar.offsetHeight : 66;
    let current = sections[0];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top - navH - 10 <= 0) {
        current = id;
      }
    });

    allLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    allLinks.forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* ─── CSS PARTICLE GENERATOR (Hero) ─────────────────────── */
(function initParticles() {
  const field = document.getElementById('particlesField');
  if (!field) return;

  const COUNT = 35;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size  = (Math.random() * 3 + 1).toFixed(1);
    const x     = (Math.random() * 100).toFixed(1);
    const y     = (Math.random() * 100).toFixed(1);
    const dur   = (Math.random() * 4 + 3).toFixed(1);
    const delay = (Math.random() * 5).toFixed(1);
    const alpha = (Math.random() * 0.55 + 0.15).toFixed(2);

    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${x}%`,
      `top:${y}%`,
      `opacity:${alpha}`,
      `animation-duration:${dur}s`,
      `animation-delay:-${delay}s`,
    ].join(';');

    frag.appendChild(p);
  }

  field.appendChild(frag);
})();


/* ─── SCROLL FADE-IN (IntersectionObserver) ──────────────── */
(function initFadeIn() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => io.observe(el));
})();


/* ─── CONTACT FORM VALIDATION ────────────────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    fname:  { errId: 'nameErr',  msg: 'Please enter your full name.' },
    femail: { errId: 'emailErr', msg: 'Please enter a valid email address.' },
    fmsg:   { errId: 'msgErr',   msg: 'Please describe your project.' },
  };

  function setErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErrors() {
    Object.values(fields).forEach(f => setErr(f.errId, ''));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const name  = document.getElementById('fname')?.value.trim() || '';
    const email = document.getElementById('femail')?.value.trim() || '';
    const msg   = document.getElementById('fmsg')?.value.trim() || '';
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;
    if (name.length < 2)       { setErr('nameErr',  fields.fname.msg);  valid = false; }
    if (!emailRx.test(email))  { setErr('emailErr', fields.femail.msg); valid = false; }
    if (msg.length < 10)       { setErr('msgErr',   fields.fmsg.msg);   valid = false; }

    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.querySelector('.btn-label').textContent = 'Sending...';
    }

    setTimeout(() => {
      form.reset();
      if (successMsg) successMsg.classList.add('show');
      if (btn) {
        btn.disabled = false;
        btn.querySelector('.btn-label').textContent = 'Send Message';
      }
      setTimeout(() => successMsg?.classList.remove('show'), 5000);
    }, 1200);
  });

  ['fname', 'femail', 'fmsg'].forEach(id => {
    const el = document.getElementById(id);
    const errId = fields[id]?.errId;
    if (el && errId) {
      el.addEventListener('input', () => setErr(errId, ''));
    }
  });
})();


/* ─── NAV LINK SMOOTH SCROLL ─────────────────────────────── */
document.querySelectorAll('.nav-link[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    window.smoothScrollTo(a.getAttribute('href'));
  });
});

document.querySelectorAll('.footer-links a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    window.smoothScrollTo(a.getAttribute('href'));
  });
});


/* ─── BUTTON PRESS HAPTIC EFFECT ─────────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointerdown', () => {
    btn.style.transform = 'scale(0.96)';
  });
  btn.addEventListener('pointerup', () => {
    btn.style.transform = '';
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.transform = '';
  });
});


/* ─── LIGHTWEIGHT CLICK SOUND ────────────────────────────── */
let audioCtx = null;

function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (_) { /* silent fail */ }
}

document.querySelectorAll('.btn, .nav-link').forEach(el => {
  el.addEventListener('click', playClick, { passive: true });
});
