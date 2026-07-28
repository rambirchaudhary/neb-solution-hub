// Mindmap branch toggle (with ARIA state syncing)
const branches = document.querySelectorAll('.branch-node');
branches.forEach(function(node) {
    node.addEventListener('click', function() {
        const branch = node.closest('.branch');
        const isOpen = branch.classList.toggle('open');
        node.setAttribute('aria-expanded', String(isOpen));
        const content = branch.querySelector('.branch-content');
        if (content) content.setAttribute('aria-hidden', String(!isOpen));
    });
});

// Nested sub-branch toggle (Notes / Past Year Questions)
const subNodes = document.querySelectorAll('.sub-node');
subNodes.forEach(function(node) {
    node.addEventListener('click', function(e) {
        e.stopPropagation();
        const subBranch = node.closest('.sub-branch');
        const isOpen = subBranch.classList.toggle('open');
        node.setAttribute('aria-expanded', String(isOpen));
        const content = subBranch.querySelector('.sub-content');
        if (content) content.setAttribute('aria-hidden', String(!isOpen));
    });
});

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}

// FAQ accordion toggle
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', function() {
        const isOpen = item.classList.toggle('open');
        question.setAttribute('aria-expanded', String(isOpen));
    });
});

// Scroll reveal using IntersectionObserver
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });
revealElements.forEach(function(el) {
    revealObserver.observe(el);
});

// Back to top button
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}