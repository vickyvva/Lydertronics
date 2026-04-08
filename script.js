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

async function sendMessage() {
  const input = document.getElementById("input");
  const message = input.value;

  if (!message) return;

  const messages = document.getElementById("messages");

  messages.innerHTML += `<p><b>You:</b> ${message}</p>`;

  input.value = "";

  try {
    const res = await fetch("https://ai-chatbot-1-ebvn.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    messages.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
    messages.scrollTop = messages.scrollHeight;

  } catch (error) {
    messages.innerHTML += `<p style="color:red;">Error connecting</p>`;
  }
}

// ===== AI CHATBOT FUNCTIONALITY =====
(function() {
    "use strict";

    // DOM Elements
    const launcher = document.getElementById('chatLauncher');
    const chatWindow = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('closeChatBtn');
    const messagesContainer = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');

    // State
    let isTyping = false;
    let typingIndicatorElement = null;

    // CONFIGURATION - Replace with your actual API endpoint
    const API_CONFIG = {
        url: 'YOUR_API_ENDPOINT_HERE', // e.g., 'https://api.openai.com/v1/chat/completions'
        key: 'YOUR_API_KEY_HERE',       // Your API key
        model: 'gpt-3.5-turbo'          // Your model name
    };

    // Helper: Scroll to bottom
    function scrollToBottom() {
        if (!messagesContainer) return;
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Create message element
    function createMessageElement(text, sender = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        if (sender === 'bot') {
            const avatarSpan = document.createElement('span');
            avatarSpan.className = 'bot-avatar-small';
            avatarSpan.textContent = '🤖';
            const contentSpan = document.createElement('span');
            contentSpan.textContent = text;
            bubble.appendChild(avatarSpan);
            bubble.appendChild(contentSpan);
        } else {
            bubble.textContent = text;
        }

        messageDiv.appendChild(bubble);
        return messageDiv;
    }

    // Show typing indicator
    function showTypingIndicator() {
        if (isTyping) return;
        isTyping = true;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.setAttribute('aria-label', 'AI is typing');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }
        
        messagesContainer.appendChild(indicator);
        typingIndicatorElement = indicator;
        scrollToBottom();
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        if (typingIndicatorElement) {
            typingIndicatorElement.remove();
            typingIndicatorElement = null;
        }
        isTyping = false;
    }

    // Add bot message
    function addBotMessage(text) {
        const botMsg = createMessageElement(text, 'bot');
        messagesContainer.appendChild(botMsg);
        scrollToBottom();
    }

    // ==========================================
    // API CALL FUNCTION - MODIFY THIS SECTION
    // ==========================================
    async function fetchBotResponse(userMessage) {
        // Replace this with your actual API call
        // Example for OpenAI:
        /*
        try {
            const response = await fetch(API_CONFIG.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.key}`
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant.' },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            return 'Sorry, I encountered an error. Please try again.';
        }
        */

        // TEMPORARY MOCK RESPONSE - Remove this and uncomment the API call above
        const mockResponses = [
            "That's interesting! Tell me more. 🤔",
            "I understand what you're saying. How can I assist further? 💡",
            "Great question! Let me help you with that. ✨",
            "I'm here to help! What specific information do you need? 🎯",
            "Thanks for sharing. Is there anything else you'd like to know? 🌟"
        ];
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
                resolve(randomResponse);
            }, 1500);
        });
    }

    // Send user message and get bot response
    async function sendUserMessage(text) {
        if (!text.trim()) return;

        // Add user message
        const userMsg = createMessageElement(text, 'user');
        messagesContainer.appendChild(userMsg);
        scrollToBottom();

        // Clear input
        messageInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        try {
            // Get bot response from API
            const botResponse = await fetchBotResponse(text);
            
            // Remove typing indicator and add response
            removeTypingIndicator();
            addBotMessage(botResponse);
        } catch (error) {
            removeTypingIndicator();
            addBotMessage('Sorry, something went wrong. Please try again.');
            console.error('Error:', error);
        }
    }

    // Toggle chat window
    function openChat() {
        chatWindow.classList.remove('closed');
        setTimeout(() => messageInput.focus(), 150);
    }

    function closeChat() {
        chatWindow.classList.add('closed');
    }

    // Handle send action
    function handleSend() {
        const text = messageInput.value.trim();
        if (!text) return;
        sendUserMessage(text);
    }

    // Event Listeners
    launcher.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatWindow.classList.contains('closed')) {
            openChat();
        }
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeChat();
    });

    sendBtn.addEventListener('click', handleSend);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !chatWindow.classList.contains('closed')) {
            closeChat();
        }
    });

    // Auto-scroll on new messages
    const observer = new MutationObserver(() => {
        if (!chatWindow.classList.contains('closed')) {
            scrollToBottom();
        }
    });
    
    observer.observe(messagesContainer, { childList: true, subtree: true });

    console.log('✅ AI Chatbot Interface Ready');
})();
