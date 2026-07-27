/* ==========================================================================
   NEB Solution Hub — script.js
   - Vanilla JS (ES6)
   - Fully integrated interactions: mobile menu, dark mode, typing, scroll reveal,
     counters, mindmap toggles, FAQ accordion, carousel, lazy images, toasts,
     back-to-top, search, keyboard accessibility, ripple, and small UX helpers.
   - Author: NEB Solution Hub (Rambir)
   ========================================================================== */

/* ============================
   Quick selector helpers
   ============================ */
const $ = (sel, ctx = document) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

/* ============================
   Cached DOM elements
   ============================ */
const body = document.body;
const html = document.documentElement;
const loadingScreen = $('#loading-screen');
const toastEl = $('#toast');
const themeToggle = $('#theme-toggle');
const themeIcon = $('#theme-icon');
const mobileToggle = $('#mobile-menu-toggle');
const mobileMenu = $('#mobile-menu');
const navLinks = $$('.nav-link');
const mobileLinks = $$('.mobile-link');
const searchInput = $('#search-input');
const searchBtn = $('#search-btn');
const statsEls = $$('.stat');
const typingEl = $('.typing');
const carouselTrack = $('.carousel-track');
const carouselPrev = $('.carousel-prev');
const carouselNext = $('.carousel-next');
const faqButtons = $$('.faq-q');
const newsletterForm = $('#newsletter-form');
const newsletterEmail = $('#newsletter-email');
const backToTop = $('#back-to-top');
const branchNodes = $$('.branch-node');
const subNodes = $$('.sub-node');
const lazyImages = $$('.lazy');
const currentYearEl = $('#current-year');

/* ============================
   Small utilities
   ============================ */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const debounce = (fn, wait = 200) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};
const escapeHtml = (s = '') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ============================
   Toast queue (accessible)
   ============================ */
const toastQueue = [];
let toastTimer = null;
function showToast(message, isError = false, duration = 3500) {
  toastQueue.push({ message, isError, duration });
  if (!toastTimer) processToastQueue();
}
function processToastQueue() {
  if (!toastQueue.length) {
    toastTimer = null;
    toastEl.hidden = true;
    return;
  }
  const { message, isError, duration } = toastQueue.shift();
  toastEl.hidden = false;
  toastEl.textContent = message;
  toastEl.style.background = isError ? 'linear-gradient(90deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))' : '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
    toastTimer = null;
    setTimeout(processToastQueue, 200);
  }, duration);
}

/* ============================
   Loading screen
   ============================ */
function hideLoadingScreen() {
  if (!loadingScreen) return;
  loadingScreen.style.opacity = '0';
  loadingScreen.setAttribute('aria-hidden', 'true');
  setTimeout(() => loadingScreen.style.display = 'none', 350);
}

/* ============================
   Theme: dark / light with persistence
   ============================ */
function initTheme() {
  try {
    const saved = localStorage.getItem('neb-theme');
    if (saved === 'dark') body.classList.add('dark');
    else if (saved === 'light') body.classList.remove('dark');
  } catch (e) { /* ignore storage errors */ }
  updateThemeIcon();

  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    try { localStorage.setItem('neb-theme', isDark ? 'dark' : 'light'); } catch (e) {}
    animateThemeTransition();
    updateThemeIcon();
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
  });
}
function updateThemeIcon() {
  const isDark = body.classList.contains('dark');
  if (!themeIcon) return;
  themeIcon.innerHTML = isDark
    ? '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>'
    : '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
}
function animateThemeTransition() {
  html.style.transition = 'background .35s ease, color .35s ease';
  setTimeout(() => html.style.transition = '', 400);
}

/* ============================
   Mobile menu (accessible)
   ============================ */
function initMobileMenu() {
  if (!mobileToggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.hidden = false;
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.querySelector('a, button, input')?.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.hidden = true;
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.focus();
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.hidden) openMenu(); else closeMenu();
  });

  mobileLinks.forEach(l => l.addEventListener('click', () => closeMenu()));

  document.addEventListener('click', (e) => {
    if (!mobileMenu.hidden && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu();
  });
}

/* ============================
   Typing effect for hero headline
   ============================ */
function initTypingEffect() {
  if (!typingEl) return;
  const phrases = JSON.parse(typingEl.dataset.phrases || '[]');
  if (!phrases.length) return;
  let idx = 0, char = 0, forward = true;

  function tick() {
    const current = phrases[idx];
    if (!current) return;
    if (forward) {
      typingEl.textContent = current.slice(0, ++char);
      if (char === current.length) {
        forward = false;
        setTimeout(tick, 1200);
        return;
      }
    } else {
      typingEl.textContent = current.slice(0, --char);
      if (char === 0) {
        forward = true;
        idx = (idx + 1) % phrases.length;
      }
    }
    setTimeout(tick, forward ? 60 : 30);
  }
  tick();
}

/* ============================
   Scroll reveal (IntersectionObserver)
   ============================ */
function initScrollReveal() {
  const revealEls = $$('.reveal, .branch, .feature, .note-card, .testimonial, .stat');
  if (!revealEls.length || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(12px)';
    observer.observe(el);
  });
}

/* ============================
   Animated counters (runs once when visible)
   ============================ */
function initCounters() {
  if (!statsEls.length) return;
  if (!('IntersectionObserver' in window)) {
    statsEls.forEach(s => animateCounter(s));
    return;
  }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        o.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  statsEls.forEach(s => obs.observe(s));
}
function animateCounter(stat) {
  const el = stat.querySelector('.stat-number');
  const target = parseInt(stat.dataset.target || '0', 10) || 0;
  const duration = clamp(Math.floor(target / 200), 800, 1600);
  const start = 0;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * (target - start) + start);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============================
   Carousel (testimonials) with ARIA
   ============================ */
function initCarousel() {
  if (!carouselTrack) return;
  const slides = Array.from(carouselTrack.children);
  if (!slides.length) return;
  let index = 0;
  const gap = 16;

  function update() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    carouselTrack.style.transform = `translateX(-${index * (slideWidth + gap)}px)`;
    carouselTrack.setAttribute('aria-label', `Testimonial ${index + 1} of ${slides.length}`);
  }

  carouselNext?.addEventListener('click', () => { index = (index + 1) % slides.length; update(); });
  carouselPrev?.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; update(); });

  let auto = setInterval(() => { index = (index + 1) % slides.length; update(); }, 6000);
  carouselTrack.addEventListener('mouseenter', () => clearInterval(auto));
  carouselTrack.addEventListener('mouseleave', () => auto = setInterval(() => { index = (index + 1) % slides.length; update(); }, 6000));
  carouselTrack.addEventListener('focusin', () => clearInterval(auto));
  carouselTrack.addEventListener('focusout', () => auto = setInterval(() => { index = (index + 1) % slides.length; update(); }, 6000));

  window.addEventListener('resize', debounce(update, 120));
  update();
}

/* ============================
   FAQ accordion (accessible)
   ============================ */
function initFAQ() {
  faqButtons.forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => toggleFAQ(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFAQ(btn); }
    });
  });
}
function toggleFAQ(btn) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  const panel = btn.nextElementSibling;
  if (!panel) return;
  if (expanded) panel.hidden = true;
  else panel.hidden = false;
}

/* ============================
   Mindmap branch toggles (delegated + keyboard)
   ============================ */
function initMindmapToggles() {
  // Branch nodes
  branchNodes.forEach(node => {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-expanded', 'false');
    node.addEventListener('click', () => toggleBranch(node));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBranch(node); }
    });
  });

  // Sub-nodes
  subNodes.forEach(node => {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-expanded', 'false');
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSub(node);
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleSub(node); }
    });
  });
}
function toggleBranch(node) {
  const parent = node.parentElement;
  const isOpen = parent.classList.toggle('open');
  node.setAttribute('aria-expanded', String(isOpen));
  const content = parent.querySelector('.branch-content');
  if (content) content.setAttribute('aria-hidden', String(!isOpen));
}
function toggleSub(node) {
  const parent = node.parentElement;
  const isOpen = parent.classList.toggle('open');
  node.setAttribute('aria-expanded', String(isOpen));
  const content = parent.querySelector('.sub-content');
  if (content) content.setAttribute('aria-hidden', String(!isOpen));
}

/* ============================
   Lazy load images (IntersectionObserver)
   ============================ */
function initLazyImages() {
  if (!lazyImages.length) return;
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.onload = () => img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    lazyImages.forEach(img => { if (img.dataset.src) img.src = img.dataset.src; img.classList.remove('lazy'); });
  }
}

/* ============================
   Search UI (debounced, sanitized)
   ============================ */
function initSearch() {
  if (!searchInput || !searchBtn) return;
  searchBtn.addEventListener('click', () => { searchInput.focus(); showToast('Search is instant — try "Calculus" or "Mechanics"'); });

  const doSearch = debounce(() => {
    const q = searchInput.value.trim();
    if (!q) { showToast('Type a topic to search', true); return; }
    showToast(`Searching for "${escapeHtml(q)}"...`);
    document.querySelector('#notes')?.scrollIntoView({ behavior: 'smooth' });
  }, 300);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
  });
}

/* ============================
   Newsletter form (validation)
   ============================ */
function initNewsletter() {
  if (!newsletterForm) return;
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (newsletterEmail?.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', true);
      newsletterEmail?.focus();
      return;
    }
    showToast('Subscribed — check your inbox for confirmation');
    newsletterForm.reset();
  });
}

/* ============================
   Back to top button
   ============================ */
function initBackToTop() {
  if (!backToTop) return;
  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 600) backToTop.hidden = false;
    else backToTop.hidden = true;
  }, 80));
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================
   Active nav link on scroll
   ============================ */
function initActiveNavOnScroll() {
  const sections = $$('main section[id]');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = $(`.nav-link[href="#${id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.45 });
  sections.forEach(s => obs.observe(s));
}

/* ============================
   Smooth scroll for internal links with focus management
   ============================ */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#' || href === '#!') return;
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 450);
  }
});

/* ============================
   Ripple effect for buttons (pointer-based)
   ============================ */
document.addEventListener('pointerdown', (e) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ============================
   Keyboard shortcuts & accessibility helpers
   ============================ */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === 'Escape') {
      if (mobileMenu && !mobileMenu.hidden) { mobileMenu.hidden = true; mobileToggle.setAttribute('aria-expanded', 'false'); }
      if (!toastEl.hidden) toastEl.hidden = true;
    }
  });

  // Focus-visible polyfill: add class when Tab used
  let usingKeyboard = false;
  window.addEventListener('keydown', (e) => { if (e.key === 'Tab') { usingKeyboard = true; document.documentElement.classList.add('using-keyboard'); } });
  window.addEventListener('mousedown', () => { if (usingKeyboard) { usingKeyboard = false; document.documentElement.classList.remove('using-keyboard'); } });
}

/* ============================
   Small visual helper: optional mouse tilt for floating cards
   (lightweight, only if elements exist)
   ============================ */
function initFloatingTilt() {
  const cards = $$('.floating-card');
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 6; // rotateX
      const ry = (px - 0.5) * -8; // rotateY
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.01)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================
   Initialize everything on DOMContentLoaded
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  // Basic UI
  initTheme();
  initMobileMenu();
  initTypingEffect();
  initScrollReveal();
  initCounters();
  initCarousel();
  initFAQ();
  initMindmapToggles();
  initLazyImages();
  initSearch();
  initNewsletter();
  initBackToTop();
  initActiveNavOnScroll();
  initKeyboardShortcuts();
  initFloatingTilt();

  // Hide loading screen after a short delay for polish
  setTimeout(hideLoadingScreen, 600);

  // Set current year in footer
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
});

/* ============================
   End of script.js
   - Keep this file modular and minimal. Add features by creating small functions
     and wiring them into DOMContentLoaded above.
   ============================ */
