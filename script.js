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
        const isOpen = navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', function(event) {
        if (event.target.matches('a')) {
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Open menu');
        }
    });
}

// Close expanded controls with Escape.
document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.branch.open, .sub-branch.open').forEach(function(item) {
        item.classList.remove('open');
        const button = item.querySelector(':scope > button');
        const content = item.querySelector(':scope > ul');
        if (button) button.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('aria-hidden', 'true');
    });
    if (navLinks && hamburger) {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
    }
});

// Resource finder: filters the existing subject tree without duplicating content.
const resourceSearch = document.getElementById('resourceSearch');
const searchStatus = document.getElementById('searchStatus');
if (resourceSearch) {
    resourceSearch.addEventListener('input', function() {
        const query = resourceSearch.value.trim().toLowerCase();
        const allBranches = document.querySelectorAll('.branch');
        let visibleSubjects = 0;

        allBranches.forEach(function(branch) {
            const items = branch.querySelectorAll('.branch-content > li');
            let branchMatches = branch.querySelector('.branch-node').textContent.toLowerCase().includes(query);

            items.forEach(function(item) {
                const matches = item.textContent.toLowerCase().includes(query);
                item.classList.toggle('is-filtered-out', Boolean(query) && !matches && !branchMatches);
                branchMatches = branchMatches || matches;
            });

            branch.classList.toggle('is-filtered-out', Boolean(query) && !branchMatches);
            branch.classList.toggle('is-search-open', Boolean(query) && branchMatches);
            if (branchMatches) visibleSubjects += 1;
        });

        searchStatus.textContent = query ? `${visibleSubjects} subject${visibleSubjects === 1 ? '' : 's'} match “${resourceSearch.value.trim()}”.` : '';
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

// Smooth neon cursor for mouse/trackpad users. Touch devices retain their native cursor behavior.
const cursorGlow = document.querySelector('.cursor-glow');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (cursorGlow && finePointer.matches) {
    let targetX = -100;
    let targetY = -100;
    let framePending = false;

    document.body.classList.add('cursor-ready');
    document.addEventListener('pointermove', function(event) {
        targetX = event.clientX;
        targetY = event.clientY;
        cursorGlow.classList.add('is-visible');
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(function() {
            cursorGlow.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
            framePending = false;
        });
    });
    document.addEventListener('pointerover', function(event) {
        cursorGlow.classList.toggle('is-active', Boolean(event.target.closest('a, button, input, summary')));
    });
    document.addEventListener('pointerleave', function() { cursorGlow.classList.remove('is-visible'); });
}
