/* =============================================
   ANIMATIONS — Efeitos 3D, Vanta, GSAP, parallax
   ============================================= */

(() => {
    'use strict';

    /* ---------- Hero 3D com Vanta.js ---------- */
    const heroBg = document.getElementById('hero-bg');

    if (heroBg && window.VANTA && window.THREE) {
        try {
            window.__vanta = VANTA.WAVES({
                el: heroBg,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200,
                minWidth: 200,
                scale: 1,
                scaleMobile: 1,
                color: 0x1a3a66,
                backgroundColor: 0x0b1f3a,
                shininess: 36,
                waveHeight: 20,
                waveSpeed: 0.55,
                zoom: 0.9
            });
        } catch (err) {
            console.warn('Vanta.js indisponível — usando fundo estático:', err);
        }
    } else if (heroBg) {
        heroBg.classList.add('hero-bg-fallback');
    }

    /* ---------- Animações GSAP ---------- */
    const gsapReady = () => typeof window.gsap !== 'undefined';

    if (gsapReady()) {
        window.gsap.registerPlugin(window.ScrollTrigger);

        /* Intro do hero */
        const heroIntro = () => {
            const timeline = window.gsap.timeline({ delay: 0.15 });
            timeline
                .from('.hero-badge', { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out' })
                .from('.hero-title', { y: 46, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.35')
                .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
                .from('.hero-actions .btn', { y: 24, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out' }, '-=0.45')
                .from('.hero-stats', { y: 34, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
                .from('.hero-scroll', { opacity: 0, duration: 0.6 }, '-=0.3');
        };

        if (document.readyState === 'complete') {
            heroIntro();
        } else {
            window.addEventListener('load', heroIntro, { once: true });
        }

        /* Reveal ao scroll */
        window.gsap.utils.toArray('[data-reveal]').forEach(el => {
            window.gsap.fromTo(el,
                { opacity: 0, y: 42 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 86%' }
                }
            );
        });
    }

    /* ---------- Efeito Tilt 3D nos cartões ---------- */
    const tiltCards = document.querySelectorAll('.tilt');
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (!isTouch && tiltCards.length && window.matchMedia('(min-width: 769px)').matches) {
        tiltCards.forEach(card => {
            let raf = null;

            const onMove = (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = null;
                    const rect = card.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / rect.width;
                    const py = (e.clientY - rect.top) / rect.height;
                    const rotateY = (px - 0.5) * 10;
                    const rotateX = (0.5 - py) * 10;

                    card.style.transform =
                        `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

                    const inner = card.querySelector('.tilt-inner');
                    if (inner) {
                        inner.style.transform = `translateZ(${Math.abs(py) * 20 + 18}px)`;
                    }
                });
            };

            const onLeave = () => {
                if (raf) {
                    cancelAnimationFrame(raf);
                    raf = null;
                }
                card.style.transform = '';
                const inner = card.querySelector('.tilt-inner');
                if (inner) inner.style.transform = '';
            };

            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
        });
    }

    /* ---------- Contadores animados (stats) ---------- */
    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length) {
        const animateCounter = (el) => {
            const target = parseFloat(el.dataset.counter);
            const duration = 1600;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased);
                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    /* ---------- Parallax suave nos orbes do hero ---------- */
    const orbs = document.querySelectorAll('.hero-orb');

    if (orbs.length && !isTouch) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;

            orbs.forEach((orb, index) => {
                orb.style.transform = `translate(${(index % 2 ? -1 : 1) * x}px, ${(index % 2 ? 1 : -1) * y}px)`;
            });
        }, { passive: true });
    }
})();
