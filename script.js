/* ============================================================
   LYDERTRONICS — script.js
   ============================================================ */

'use strict';

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

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

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


/* ─── ENHANCED PARTICLE GENERATOR (Hero) ─────────────────── */
(function initParticles() {
  const field = document.getElementById('particlesField');
  if (!field) return;

  const COUNT = 40;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size  = (Math.random() * 4 + 2).toFixed(1);
    const x     = (Math.random() * 100).toFixed(1);
    const y     = (Math.random() * 100).toFixed(1);
    const dur   = (Math.random() * 6 + 4).toFixed(1);
    const delay = (Math.random() * 8).toFixed(1);
    const alpha = (Math.random() * 0.6 + 0.2).toFixed(2);

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


/* ─── SCROLL FADE-IN WITH ENHANCED STAGGER ───────────────── */
(function initFadeIn() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  items.forEach(el => io.observe(el));
})();


/* ─── SERVICE CARDS SCROLL REVEAL ────────────────────────── */
(function initServiceCardsReveal() {
  const cards = document.querySelectorAll('.svc-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) rotateX(0)';
          }, index * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
  );

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px) rotateX(-10deg)';
    card.style.transition = 'opacity .8s cubic-bezier(.23,1,.32,1), transform .8s cubic-bezier(.23,1,.32,1)';
    observer.observe(card);
  });
})();


/* ─── PARALLAX EFFECT ON SCROLL ──────────────────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const orbs  = hero.querySelectorAll('.orb');
  const cubes = hero.querySelectorAll('.cube-3d');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const limit = hero.offsetHeight;

    if (scrolled < limit) {
      orbs.forEach((orb, index) => {
        const speed = 0.3 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
      });

      cubes.forEach((cube, index) => {
        const speed = 0.2 + (index * 0.15);
        cube.style.transform = `translateY(${scrolled * speed}px)`;
      });
    }
  }, { passive: true });
})();


/* ─── PARALLAX CARDS ON SCROLL ───────────────────────────── */
(function initCardParallax() {
  const cards = document.querySelectorAll('.glass-card');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity .8s ease, transform .8s ease';
    observer.observe(card);
  });
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


/* ─── ENHANCED BUTTON MICRO-INTERACTIONS ─────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointerdown', () => {
    btn.style.transition = 'transform .1s ease';
    btn.style.transform = 'scale(0.97)';
  });

  btn.addEventListener('pointerup', () => {
    btn.style.transition = 'all .4s cubic-bezier(.34,1.56,.64,1)';
    btn.style.transform = '';
  });

  btn.addEventListener('pointerleave', () => {
    btn.style.transition = 'all .4s cubic-bezier(.34,1.56,.64,1)';
    btn.style.transform = '';
  });

  if (btn.classList.contains('btn-primary')) {
    btn.addEventListener('mousemove', e => {
      const rect  = btn.getBoundingClientRect();
      const moveX = (e.clientX - rect.left - rect.width  / 2) * 0.1;
      const moveY = (e.clientY - rect.top  - rect.height / 2) * 0.1;
      btn.style.transform = `translate(${moveX}px, ${moveY}px) translateY(-3px) scale(1.05)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  }
});


/* ─── SUBTLE CLICK SOUND ─────────────────────────────────── */
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


/* ─── NUMBER COUNTER ANIMATION ───────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-n, .about-stat-n');

  const animateCounter = (element) => {
    const target   = parseFloat(element.textContent);
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.innerHTML = element.innerHTML.replace(/[\d.]+/, target.toFixed(1));
        clearInterval(timer);
      } else {
        element.innerHTML = element.innerHTML.replace(/[\d.]+/, current.toFixed(1));
      }
    }, 16);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => io.observe(counter));
})();


/* ─── PROGRESS BAR ANIMATION ─────────────────────────────── */
(function initProgressBars() {
  const bars = document.querySelectorAll('.acc-fill');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.style.getPropertyValue('--w') || '0%';
        setTimeout(() => { bar.style.width = width; }, 200);
        io.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => io.observe(bar));
})();


/* ─── CURSOR GLOW EFFECT ─────────────────────────────────── */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.4), transparent);
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.15s ease;
    display: none;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.display = 'block';
    glow.style.left = e.clientX - 10 + 'px';
    glow.style.top  = e.clientY - 10 + 'px';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.display = 'none';
  });
})();


/* ============================================================
   AI CHATBOT — API CONNECTED (single, clean version)
   ============================================================ */
(function initChatbot() {
  const launcher   = document.getElementById('chatLauncher');
  const chatWindow = document.getElementById('chatWindow');
  const closeBtn   = document.getElementById('closeChatBtn');
  const messages   = document.getElementById('chatMessages');
  const input      = document.getElementById('messageInput');
  const sendBtn    = document.getElementById('sendMessageBtn');

  if (!launcher || !chatWindow || !messages || !input || !sendBtn) return;

  /* ── open / close ── */
  launcher.addEventListener('click', () => {
    chatWindow.classList.remove('closed');
    chatWindow.classList.add('open');
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('closed');
    chatWindow.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !chatWindow.classList.contains('closed')) {
      const teamModal = document.getElementById('teamModal');
      if (!teamModal?.classList.contains('open')) {
        chatWindow.classList.add('closed');
        chatWindow.classList.remove('open');
      }
    }
  });

  /* ── send triggers ── */
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ── main send function ── */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    // Disable input while waiting
    sendBtn.disabled = true;
    input.disabled   = true;
    input.value      = '';

    // Show user bubble
    appendMessage('user', escapeHtml(text));

    // Show typing indicator
    const typingEl = appendTyping();

    try {
      const res = await  fetch("https://ai-chatbot-2-qjpk.onrender.com/chat", {
        
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      typingEl.remove();
      appendMessage('bot', escapeHtml(data.reply || '⚠️ Empty response'));

    } catch (err) {
      console.error('Chatbot error:', err);
      typingEl.remove();
      appendMessage('bot', '⚠️ Could not reach server. Please try again.');
    } finally {
      sendBtn.disabled = false;
      input.disabled   = false;
      input.focus();
    }
  }

  /* ── helpers ── */
  function appendMessage(role, htmlContent) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    if (role === 'bot') {
      div.innerHTML = `
        <div class="bubble">
          <span class="bot-avatar-small">🤖</span>
          <span>${htmlContent}</span>
        </div>`;
    } else {
      div.innerHTML = `<div class="bubble">${htmlContent}</div>`;
    }

    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'message bot typing-indicator';
    div.innerHTML = `
      <div class="bubble">
        <span class="bot-avatar-small">🤖</span>
        <span class="dots"><span>.</span><span>.</span><span>.</span></span>
      </div>`;
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function scrollBottom() {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;')
      .replace(/\n/g, '<br>');
  }
})();


console.log('%c🚀 Lydertronics Website Loaded', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('%cPowering AI with Precision Data', 'color: #7a8aaa; font-size: 12px;');
