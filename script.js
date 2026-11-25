'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzvbgwo';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const serviceSelect = document.getElementById('fservice');
document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (serviceSelect) serviceSelect.value = link.dataset.service;
  });
});

const revealItems = document.querySelectorAll('.reveal');
if (!prefersReducedMotion && 'IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => {
    item.classList.add('reveal-pending');
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

// Pause decorative loops off screen and while the tab is hidden.
const motionSections = [...document.querySelectorAll('.hero, .performance-section, .work-section, .page-hero')];
if ('IntersectionObserver' in window) {
  const visibleSections = new Set();
  const syncMotion = () => motionSections.forEach(section => {
    section.classList.toggle('motion-paused', document.hidden || !visibleSections.has(section));
  });
  const motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleSections.add(entry.target);
      else visibleSections.delete(entry.target);
    });
    syncMotion();
  });
  motionSections.forEach(section => motionObserver.observe(section));
  document.addEventListener('visibilitychange', syncMotion);
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
  processFill.style.transform = `scaleX(${prefersReducedMotion ? 1 : pct.toFixed(3)})`;
}
let processFrame = 0;
function scheduleProcessFill() {
  if (processFrame || !processFill) return;
  processFrame = requestAnimationFrame(() => {
    processFrame = 0;
    updateProcessFill();
  });
}
window.addEventListener('scroll', scheduleProcessFill, { passive: true });
window.addEventListener('resize', scheduleProcessFill, { passive: true });
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
  window.location.hash = 'apply';
  jobSelect.focus({ preventScroll: true });
  document.getElementById('apply').scrollIntoView({ block: 'start' });
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
      <button class="job-apply" type="button" data-job="${escapeHtml(job.title)}">Apply for this job <span class="arrow-up" aria-hidden="true"></span></button>
    </article>`;
  }).join('');

  jobsGrid.querySelectorAll('.job-apply').forEach(button => {
    button.addEventListener('click', () => chooseJob(button.dataset.job || ''));
  });
}

function getIssueSection(body, heading) {
  if (!body) return '';
  const marker = `### ${heading}`;
  const start = body.indexOf(marker);
  if (start === -1) return '';
  const remainder = body.slice(start + marker.length).replace(/^\s*\n/, '');
  const nextHeading = remainder.search(/\n###\s+/);
  const value = (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim();
  return value === '_No response_' ? '' : value;
}

function issueToCareerJob(issue) {
  if (!issue || issue.pull_request || !String(issue.title || '').startsWith('[CAREER JOB]')) return null;
  const maintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(issue.author_association);
  const approved = issue.labels?.some(label => label.name === 'career-approved');
  if (!maintainer && !approved) return null;
  const body = String(issue.body || '');
  const title = getIssueSection(body, 'Job title') || String(issue.title || '').replace(/^\[CAREER JOB\]\s*/i, '').trim();
  const role = getIssueSection(body, 'Role');
  const category = getIssueSection(body, 'Category') || 'AI Data Operations';
  const location = getIssueSection(body, 'Location / working mode') || 'Remote / Project-based';
  const rawResponsibilities = getIssueSection(body, 'Responsibilities');
  const responsibilities = rawResponsibilities
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(line => line && line !== '_No response_');

  if (!title || !role || !responsibilities.length) return null;
  return {
    id: `issue-${issue.number}`,
    title,
    role,
    category,
    location,
    status: 'Open',
    responsibilities,
    source: 'github-issue',
    issueNumber: issue.number
  };
}

function mergeCareerJobs(staticJobs, issueJobs) {
  const result = [];
  const seen = new Set();
  [...issueJobs, ...staticJobs].forEach(job => {
    const key = String(job.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(job);
  });
  return result;
}

function populateJobSelect(jobs) {
  if (!jobSelect) return;
  const previous = jobSelect.value;
  jobSelect.innerHTML = '<option value="">Choose an open job</option>';
  jobs
    .filter(job => String(job.status || 'Open').toLowerCase() === 'open')
    .forEach(job => {
      const option = document.createElement('option');
      option.value = job.title;
      option.textContent = `${job.title} — ${job.role}`;
      jobSelect.appendChild(option);
    });
  jobSelect.value = jobs.some(job => job.title === previous) ? previous : '';
  updateSelectedJobNote();
}

async function fetchStaticCareerJobs() {
  const response = await fetch('jobs.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load jobs.json (${response.status})`);
  const data = await response.json();
  return Array.isArray(data.jobs) ? data.jobs : [];
}

async function fetchIssueCareerJobs() {
  const response = await fetch('https://api.github.com/repos/vickyvva/Lydertronics/issues?state=open&per_page=100', {
    headers: { 'Accept': 'application/vnd.github+json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Could not load GitHub career issues (${response.status})`);
  const issues = await response.json();
  return Array.isArray(issues) ? issues.map(issueToCareerJob).filter(Boolean) : [];
}

async function loadCareersJobs() {
  if (!jobsGrid && !jobSelect) return;

  jobSelect?.addEventListener('change', updateSelectedJobNote);
  const staticRequest = fetchStaticCareerJobs();
  const issueRequest = fetchIssueCareerJobs();
  let localJobs = [];
  let issueJobs = [];
  let rendered = false;

  function displayJobs() {
    const merged = mergeCareerJobs(localJobs, issueJobs);
    if (rendered && merged.length === careersJobs.length && merged.every((job, i) => job === careersJobs[i])) return;
    const focusedJob = jobsGrid?.contains(document.activeElement) ? document.activeElement.dataset.job : '';
    careersJobs = merged;
    renderJobs(merged);
    populateJobSelect(merged);
    if (focusedJob) {
      const buttons = jobsGrid.querySelectorAll('[data-job]');
      Array.from(buttons).find(button => button.dataset.job === focusedJob)?.focus({ preventScroll: true });
    }
    rendered = true;
  }

  const results = await Promise.allSettled([
    staticRequest.then(jobs => { localJobs = jobs; if (jobs.length) displayJobs(); }),
    issueRequest.then(jobs => { issueJobs = jobs; if (jobs.length) displayJobs(); })
  ]);
  if (results.every(result => result.status === 'rejected') && jobsGrid) {
    jobsGrid.innerHTML = '<p class="jobs-empty">Current opportunities could not be loaded. Refresh this page or <a href="mailto:contact@lydertronicsai.com">email our team</a>.</p>';
    return;
  }
  displayJobs();
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
      setStatus(status, 'We could not send the form right now. Please try again or email contact@lydertronicsai.com.', 'error');
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
      setStatus(status, 'We could not submit the application. Please try again or email contact@lydertronicsai.com.', 'error');
    } finally {
      if (button) { button.disabled = false; button.innerHTML = original; }
    }
  });
}
