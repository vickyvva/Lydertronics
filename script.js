/* ═══════════════════════════════════════════════════════════
   LYDERTRONICS — script.js
   AI Data Services Website | trainbot.in
═══════════════════════════════════════════════════════════ */

/* ─── NAVBAR: Frosted-glass on scroll ───────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

/* ─── MOBILE MENU: Hamburger toggle ────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Called by onclick on each mobile nav link
function closeMobile() {
  mobileMenu.classList.remove('open');
}

/* ─── SCROLL-REVEAL: Fade elements up on enter ─────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger each card for a cascade effect
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target); // Animate once only
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

/* ─── CONTACT FORM: Show success message ───────────────── */
function handleSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('formMsg');
  msg.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    msg.style.display = 'none';
  }, 5000);
}

/* ─── SMOOTH SCROLL: Close mobile menu on nav link click ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      closeMobile();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
