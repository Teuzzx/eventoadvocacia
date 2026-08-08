/* =============================================
   MAIN — Navegação, header, preloader, FAQ, topos
   ============================================= */

(() => {
    'use strict';

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');

    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 800);
    }

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
        // Fallback: nunca deixar o preloader preso
        setTimeout(hidePreloader, 4000);
    }

    /* ---------- Header scroll ---------- */
    const header = document.getElementById('header');

    function updateHeader() {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    /* ---------- Menu mobile ---------- */
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navBackdrop = document.getElementById('navBackdrop');

    function closeMenu() {
        nav?.classList.remove('active');
        navBackdrop?.classList.remove('show');
        document.body.style.overflow = '';
        const icon = menuToggle?.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav?.classList.toggle('active');
            navBackdrop?.classList.toggle('show', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        });
    }

    navBackdrop?.addEventListener('click', closeMenu);
    nav?.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

    /* ---------- Scroll suave com offset do header ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = 84;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
            history.replaceState(null, '', targetId);
        });
    });

    /* ---------- Link ativo no scroll ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window && sections.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${entry.target.id}`;
                    link.classList.toggle('active', isActive);
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(section => sectionObserver.observe(section));
    }

    /* ---------- Botão voltar ao topo ---------- */
    const btnTop = document.getElementById('btnTop');

    window.addEventListener('scroll', () => {
        if (!btnTop) return;
        btnTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });

    btnTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- FAQ (accordion) ---------- */
    document.querySelectorAll('.accordion-item').forEach(item => {
        const headerBtn = item.querySelector('.accordion-header');
        const panel = item.querySelector('.accordion-panel');

        headerBtn?.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.accordion-item.active').forEach(other => {
                other.classList.remove('active');
                const otherPanel = other.querySelector('.accordion-panel');
                if (otherPanel) otherPanel.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });
})();
