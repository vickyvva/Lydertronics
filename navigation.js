'use strict';

(() => {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const compact = window.matchMedia('(max-width: 1000px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
  }

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  compact.addEventListener('change', () => setOpen(false));
  const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 18);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
  header.classList.add('nav-ready');
})();
