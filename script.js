'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzvbgwo';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const siteHeader = document.getElementById('siteHeader');
const updateHeader = () => siteHeader?.classList.toggle('scrolled', window.scrollY > 18);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.classList.toggle('open', open);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('open');
  }));
}

function scrollToTarget(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const offset = (siteHeader?.offsetHeight || 72) + 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href === '#') return;
  link.addEventListener('click', event => {
    if (!document.querySelector(href)) return;
    event.preventDefault();
    scrollToTarget(href);
  });
});

const revealItems = document.querySelectorAll('.reveal');
if (!prefersReducedMotion && 'IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

function animateCounter(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';
  const target = Number(el.dataset.counter || 0);
  const suffix = el.dataset.suffix || '';
  const decimals = String(target).includes('.') ? 1 : 0;
  if (prefersReducedMotion) {
    el.textContent = target.toFixed(decimals) + suffix;
    return;
  }
  const duration = 1450;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll('[data-counter]');
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: .55 });
  counters.forEach(el => counterObserver.observe(el));
} else counters.forEach(animateCounter);

if (!prefersReducedMotion && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(1000px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('mousemove', event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${(x * .08).toFixed(1)}px, ${(y * .08).toFixed(1)}px) translateY(-2px)`;
    });
    button.addEventListener('mouseleave', () => { button.style.transform = ''; });
  });
}

const processSection = document.getElementById('process');
const processFill = document.getElementById('processFill');
function updateProcessFill() {
  if (!processSection || !processFill) return;
  const rect = processSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const total = rect.height + viewport;
  const progressed = viewport - rect.top;
  const pct = Math.max(0, Math.min(1, progressed / total));
  processFill.style.width = `${(pct * 100).toFixed(1)}%`;
}
window.addEventListener('scroll', updateProcessFill, { passive: true });
updateProcessFill();

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

// Do not display the company phone number publicly.
document.querySelectorAll('a[href^="tel:+917981520897"]').forEach(link => link.remove());

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

const jobsGrid = document.getElementById('jobsGrid');
const jobSelect = document.getElementById('jobSelect');
const selectedJobNote = document.getElementById('selectedJobNote');
let careersJobs = [];

function updateSelectedJobNote() {
  if (!jobSelect || !selectedJobNote) return;
  const job = careersJobs.find(item => item.title === jobSelect.value);
  if (!job) {
    selectedJobNote.textContent = '';
    selectedJobNote.classList.remove('visible');
    return;
  }
  selectedJobNote.textContent = `Selected project: ${job.title} — ${job.role}`;
  selectedJobNote.classList.add('visible');
}

function chooseJob(title) {
  if (!jobSelect) return;
  jobSelect.value = title;
  updateSelectedJobNote();
  scrollToTarget('#apply');
  window.setTimeout(() => jobSelect.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 550);
}

function renderJobs(jobs) {
  if (!jobsGrid) return;
  const openJobs = jobs.filter(job => String(job.status || 'Open').toLowerCase() === 'open');
  if (!openJobs.length) {
    jobsGrid.innerHTML = '<div class="jobs-empty">There are no open projects at the moment. Please check back later.</div>';
    return;
  }

  jobsGrid.innerHTML = openJobs.map((job, index) => {
    const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
    return `<article class="job-card" style="animation-delay:${Math.min(index * 70, 350)}ms">
      <div class="job-meta">
        <span class="job-category">${escapeHtml(job.category || 'AI Data Project')}</span>
        <span class="job-status">${escapeHtml(job.status || 'Open')}</span>
      </div>
      <h3>${escapeHtml(job.title)}</h3>
      <div class="job-role"><span>Role</span><strong>${escapeHtml(job.role)}</strong></div>
      <p class="job-location">${escapeHtml(job.location || 'Remote / Project-based')}</p>
      <div class="job-responsibilities">
        <span>Responsibilities</span>
        <ul>${responsibilities.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <button class="job-apply" type="button" data-job="${escapeHtml(job.title)}">Apply for this job <b>↗</b></button>
    </article>`;
  }).join('');

  jobsGrid.querySelectorAll('.job-apply').forEach(button => {
    button.addEventListener('click', () => chooseJob(button.dataset.job || ''));
  });
}

async function loadCareersJobs() {
  if (!jobsGrid && !jobSelect) return;
  try {
    const response = await fetch(`jobs.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load jobs.json (${response.status})`);
    const data = await response.json();
    careersJobs = Array.isArray(data.jobs) ? data.jobs : [];
    renderJobs(careersJobs);

    if (jobSelect) {
      careersJobs
        .filter(job => String(job.status || 'Open').toLowerCase() === 'open')
        .forEach(job => {
          const option = document.createElement('option');
          option.value = job.title;
          option.textContent = `${job.title} — ${job.role}`;
          jobSelect.appendChild(option);
        });
      jobSelect.addEventListener('change', updateSelectedJobNote);
    }
  } catch (error) {
    console.error(error);
    if (jobsGrid) jobsGrid.innerHTML = '<div class="jobs-empty">Current opportunities could not be loaded. Please refresh the page or try again later.</div>';
  }
}
loadCareersJobs();

function setStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `form-status${type ? ` ${type}` : ''}`;
}

async function submitToFormspree(payload) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);
  return response;
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const status = document.getElementById('formStatus');
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(status, '');
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const button = contactForm.querySelector('button[type="submit"]');
    const original = button?.innerHTML || 'Send project brief';
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    try {
      const payload = Object.fromEntries(new FormData(contactForm).entries());
      payload.form_type = 'Project Enquiry';
      payload.source = 'Lydertronics Website';
      await submitToFormspree(payload);
      contactForm.reset();
      setStatus(status, 'Thanks — your project brief has been sent. We’ll review it and get back to you.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(status, 'We could not send the form right now. Please email lydertronicsai@trainbot.in directly.', 'error');
    } finally {
      if (button) { button.disabled = false; button.innerHTML = original; }
    }
  });
}

const freelancerForm = document.getElementById('freelancerForm');
if (freelancerForm) {
  const status = document.getElementById('freelancerStatus');
  freelancerForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(status, '');
    if (!freelancerForm.checkValidity()) { freelancerForm.reportValidity(); return; }
    const button = freelancerForm.querySelector('button[type="submit"]');
    const original = button?.innerHTML || 'Submit application';
    if (button) { button.disabled = true; button.textContent = 'Submitting…'; }
    try {
      const payload = Object.fromEntries(new FormData(freelancerForm).entries());
      payload.form_type = 'Career Project Application';
      payload.source = 'Lydertronics Careers';
      await submitToFormspree(payload);
      freelancerForm.reset();
      updateSelectedJobNote();
      setStatus(status, 'Application received. We’ll contact you if your profile matches the selected project.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(status, 'We could not submit the application. Please try again or email lydertronicsai@trainbot.in.', 'error');
    } finally {
      if (button) { button.disabled = false; button.innerHTML = original; }
    }
  });
}
