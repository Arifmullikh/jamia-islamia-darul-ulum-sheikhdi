/* GSAP 3 + ScrollTrigger + Lenis Smooth Inertia + Magnetic Cursor Choreography */
(function initMotionEngine() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* 1. Fast Luxury Curtain Preloader */
  const preloader = document.getElementById('preloader');
  const pctEl = document.getElementById('preloaderPct');
  const fillEl = document.getElementById('preloaderFill');

  function playHeroEntrance() {
    if (!hasGSAP || reduced) return;
    gsap.from('.seal-medallion', { scale: 0.78, y: 26, opacity: 0, duration: 0.9, ease: 'power4.out' });
    gsap.from('.hero-eyebrow', { y: 18, opacity: 0, duration: 0.7, delay: 0.1, ease: 'power3.out' });
    gsap.from('.split-inner', { yPercent: 115, opacity: 0, duration: 0.95, stagger: 0.1, delay: 0.15, ease: 'power4.out' });
    gsap.from('.hero-lead, .hero-cta, .hero-meta-line', { y: 24, opacity: 0, duration: 0.8, stagger: 0.09, delay: 0.32, ease: 'power3.out' });
  }

  if (preloader && !reduced && hasGSAP) {
    const prog = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.classList.add('is-done');
        playHeroEntrance();
      }
    });
    tl.to(prog, {
      val: 100,
      duration: 0.68,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(prog.val);
        if (pctEl) pctEl.textContent = String(v).padStart(2, '0') + '%';
        if (fillEl) fillEl.style.transform = `scaleX(${prog.val / 100})`;
      }
    }).to(preloader, {
      yPercent: -100,
      duration: 0.65,
      ease: 'power4.inOut'
    });
  } else {
    if (preloader) preloader.classList.add('is-done');
  }

  /* 2. Lenis Smooth Inertia Scrolling */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function rafLoop(time) { lenis.raf(time); requestAnimationFrame(rafLoop); }
      requestAnimationFrame(rafLoop);
    }
  } else if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  window.smoothScrollTo = function (target) {
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        window.smoothScrollTo(id);
      }
    });
  });

  /* 3. Magnetic Custom Cursor */
  (function initCursor() {
    const ring = document.getElementById('cursorRing');
    if (!ring || !hasGSAP || reduced || window.matchMedia('(hover: none)').matches) return;

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.24, ease: 'power3.out' });
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.24, ease: 'power3.out' });
    let shown = false;

    window.addEventListener('pointermove', (e) => {
      if (!shown) { ring.classList.add('active'); shown = true; }
      xTo(e.clientX);
      yTo(e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', () => { ring.classList.remove('active'); shown = false; });

    document.querySelectorAll('a, button, .chapter, .bento-tile, .perm-btn').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-hover');
        const lbl = el.getAttribute('data-cursor');
        if (lbl) {
          ring.textContent = lbl;
          ring.classList.add('has-label');
        }
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-hover', 'has-label');
        ring.textContent = '';
      });
    });
  })();

  /* 4. 3D Tactile Tilt on Seal Medallion, Apple Device Frame & Bento Tiles */
  function attachTilt(el, maxX, maxY) {
    if (!el || reduced) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function tick() {
      cx += (tx - cx) * 0.11; cy += (ty - cy) * 0.11;
      el.style.transform = `perspective(1100px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (0.5 - py) * maxX;
      ty = (px - 0.5) * maxY;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      if (!raf) raf = requestAnimationFrame(tick);
    });
    el.addEventListener('pointerleave', () => {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }
  attachTilt(document.querySelector('.seal-medallion'), 14, 16);
  attachTilt(document.querySelector('.device-frame'), 8, 10);
  document.querySelectorAll('.bento-tile').forEach(tile => attachTilt(tile, 4, 5));

  /* 5. GSAP ScrollTrigger Choreography */
  if (hasGSAP && !reduced) {
    // Hero Parallax & Scale-out Scrub
    const heroInner = document.getElementById('heroInner');
    if (heroInner) {
      gsap.to(heroInner, {
        scale: 0.93,
        y: 38,
        opacity: 0.16,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-stage',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    // Responsive Pinned Device Showcase on Desktop (>= 981px)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 981px)', () => {
      const pinCol = document.querySelector('.device-pin-col');
      const chaptersEl = document.querySelector('.chapters');
      if (pinCol && chaptersEl) {
        ScrollTrigger.create({
          trigger: '#showcaseGrid',
          start: 'top 104px',
          end: 'bottom bottom',
          pin: pinCol,
          pinSpacing: false
        });
      }
    });

    // Bento 3D Staggered Entrance
    gsap.from('.bento-tile', {
      y: 48,
      rotateX: 8,
      opacity: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.bento-grid',
        start: 'top 82%',
        once: true
      }
    });

    // Role Section & Policy Articles smooth entrance
    gsap.utils.toArray('.gsap-rise').forEach(el => {
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 0.78,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true
        }
      });
    });
  }

  /* 6. Scroll Ribbon + Showcase Chapter Activation + TOC Scrollspy */
  function updateTocBar() {
    const active = document.querySelector('.toc-a.active');
    const bar = document.getElementById('tocBar');
    if (!active || !bar) return;
    bar.style.transform = `translateY(${active.offsetTop + 6}px)`;
    bar.style.height = `${Math.max(18, active.offsetHeight - 12)}px`;
  }
  window.updateTocBar = updateTocBar;

  (function initScrollSpy() {
    const ribbon = document.getElementById('scrollLine');
    const nav = document.getElementById('topNav');
    const backTop = document.getElementById('backTop');
    const ringArc = document.getElementById('ringArc');
    const chapters = Array.from(document.querySelectorAll('.chapter'));
    const tocLinks = Array.from(document.querySelectorAll('.toc-a'));
    const articles = tocLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const circum = 119.38;
    let lastScene = 0;

    function tick() {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, y / max));
      if (ribbon) ribbon.style.transform = `scaleX(${p})`;
      if (ringArc) ringArc.style.strokeDashoffset = (circum * (1 - p)).toFixed(2);
      if (nav) nav.classList.toggle('scrolled', y > 14);
      if (backTop) backTop.classList.toggle('show', y > 420);

      const mid = window.innerHeight * 0.45;
      let bestIdx = lastScene, bestDist = Infinity;
      chapters.forEach((ch, idx) => {
        const r = ch.getBoundingClientRect();
        if (r.bottom > 80 && r.top < window.innerHeight - 60) {
          const d = Math.abs((r.top + r.height / 2) - mid);
          if (d < bestDist) { bestDist = d; bestIdx = idx; }
        }
      });
      if (bestIdx !== lastScene && typeof window.activateScene === 'function') {
        lastScene = bestIdx;
        window.activateScene(bestIdx);
      }

      const mark = y + 185;
      let aIdx = 0;
      articles.forEach((art, i) => {
        if (!art.classList.contains('hidden-search') && art.offsetTop <= mark) aIdx = i;
      });
      tocLinks.forEach((l, i) => l.classList.toggle('active', i === aIdx));
      updateTocBar();
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', updateTocBar, { passive: true });
    requestAnimationFrame(tick);
  })();
})();
