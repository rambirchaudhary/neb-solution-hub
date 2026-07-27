/* script.js
   Mindmap toggles, scroll reveal, FAQ, mobile menu, small helpers
*/

(() => {
  const $ = (sel, ctx = document) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  /* Set current year in footer */
  document.addEventListener('DOMContentLoaded', () => {
    const y = new Date().getFullYear();
    const el = document.getElementById('year');
    if (el) el.textContent = y;
  });

  /* Scroll reveal */
  function initReveal() {
    const els = $$('.reveal, .section, .feature, .card');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  }

  /* Mindmap expand/collapse */
  function initMindmap() {
    const buttons = $$('.branch-node');
    buttons.forEach(btn => {
      const targetId = btn.getAttribute('aria-controls');
      const content = targetId ? document.getElementById(targetId) : btn.nextElementSibling;
      if (!content) return;

      // initial state
      btn.setAttribute('aria-expanded', 'false');
      content.classList.remove('open');
      content.setAttribute('aria-hidden', 'true');

      const toggle = () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (expanded) {
          content.classList.remove('open');
          content.setAttribute('aria-hidden', 'true');
        } else {
          content.classList.add('open');
          content.setAttribute('aria-hidden', 'false');
        }
      };

      btn.addEventListener('click', toggle);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); content.querySelector('a, button')?.focus(); }
      });
    });
  }

  /* FAQ accordion */
  function initFAQ() {
    $$('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        item.classList.toggle('open');
        panel.hidden = open;
      });
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
    });
  }

  /* Mobile menu */
  function initMobileMenu() {
    const toggle = $('#mobile-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.hidden = true; document.body.style.overflow = ''; }));
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.hidden = true;
        document.body.style.overflow = '';
      }
    });
  }

  /* Smooth internal link focus */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }, 400);
    }
  });

  /* Initialize on DOM ready */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initMindmap();
    initFAQ();
    initMobileMenu();
  });
})();
