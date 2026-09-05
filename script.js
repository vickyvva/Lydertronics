'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzvbgwo';

// Header state
const siteHeader = document.getElementById('siteHeader');
const updateHeader = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 18);
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Mobile navigation
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Smooth in-page navigation with fixed header offset
function scrollToTarget(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const offset = (siteHeader?.offsetHeight || 70) + 14;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
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

// Gentle reveal animation
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealItems.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

// Footer year
const currentYear = new Date().getFullYear();
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = String(currentYear);
});

function setStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `form-status${type ? ` ${type}` : ''}`;
}

async function submitToFormspree(payload) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);
  return response;
}

// Project contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const contactStatus = document.getElementById('formStatus');
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(contactStatus, '');

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const button = contactForm.querySelector('button[type="submit"]');
    const original = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }

    try {
      const payload = Object.fromEntries(new FormData(contactForm).entries());
      payload.form_type = 'Project Enquiry';
      payload.source = 'Lydertronics Website';
      await submitToFormspree(payload);
      contactForm.reset();
      setStatus(contactStatus, 'Thanks — your project brief has been sent. We’ll review it and get back to you.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(contactStatus, 'We could not send the form right now. Please email lydertronicsai@trainbot.in directly.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || 'Send';
      }
    }
  });
}

// Freelancer application form
const freelancerForm = document.getElementById('freelancerForm');
if (freelancerForm) {
  const freelancerStatus = document.getElementById('freelancerStatus');
  freelancerForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(freelancerStatus, '');

    if (!freelancerForm.checkValidity()) {
      freelancerForm.reportValidity();
      return;
    }

    const button = freelancerForm.querySelector('button[type="submit"]');
    const original = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitting…';
    }

    try {
      const payload = Object.fromEntries(new FormData(freelancerForm).entries());
      payload.form_type = 'Freelancer Application';
      payload.source = 'Lydertronics Careers';
      await submitToFormspree(payload);
      freelancerForm.reset();
      setStatus(freelancerStatus, 'Application received. We’ll contact you if your profile matches a suitable project.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(freelancerStatus, 'We could not submit the application. Please try again or email lydertronicsai@trainbot.in.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || 'Submit application';
      }
    }
  });
}
