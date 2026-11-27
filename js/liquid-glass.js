/* Kyant InteractiveHighlight & Damped Fluid Elasticity Physics for Web */
(function initLiquidGlassPhysics() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (reduced) return;

  /* 1. InteractiveHighlight Radial Caustic on Glass Surfaces & Buttons */
  const glassTargets = document.querySelectorAll(
    '.chapter, .role-section, .del-form-card, .contact-card, .apple-btn-primary, .apple-btn-secondary, .nav-link-btn'
  );

  glassTargets.forEach((el) => {
    let hover = 0;
    let targetHover = 0;
    let rafId = null;

    function tickGlow() {
      hover += (targetHover - hover) * 0.16;
      el.style.setProperty('--lg-press', hover.toFixed(3));
      if (Math.abs(targetHover - hover) > 0.01) {
        rafId = requestAnimationFrame(tickGlow);
      } else {
        el.style.setProperty('--lg-press', String(targetHover));
        rafId = null;
      }
    }

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lg-x', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--lg-y', `${(e.clientY - r.top).toFixed(1)}px`);
      if (targetHover !== 1) {
        targetHover = 1;
        if (!rafId) rafId = requestAnimationFrame(tickGlow);
      }
    }, { passive: true });

    el.addEventListener('pointerleave', () => {
      targetHover = 0;
      if (!rafId) rafId = requestAnimationFrame(tickGlow);
    }, { passive: true });
  });

  /* 2. Kyant LiquidButton Hyperbolic Tangent (tanh) Spring Micro-Elasticity on Pills */
  if (!isTouch) {
    const fluidPills = document.querySelectorAll('.apple-btn-primary, .apple-btn-secondary, .nav-link-btn, .email-chip');
    fluidPills.forEach((btn) => {
      let cx = 0, cy = 0, sx = 1, sy = 1;
      let tx = 0, ty = 0, tsx = 1, tsy = 1;
      let raf = null;

      function tickElastic() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        sx += (tsx - sx) * 0.2;
        sy += (tsy - sy) * 0.2;
        btn.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        if (
          Math.abs(tx - cx) > 0.04 ||
          Math.abs(ty - cy) > 0.04 ||
          Math.abs(tsx - sx) > 0.002 ||
          Math.abs(tsy - sy) > 0.002
        ) {
          raf = requestAnimationFrame(tickElastic);
        } else {
          if (tx === 0 && ty === 0 && tsx === 1 && tsy === 1) {
            btn.style.transform = '';
          }
          raf = null;
        }
      }

      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width * 0.5);
        const dy = e.clientY - (r.top + r.height * 0.5);
        const maxOffset = Math.min(r.width, r.height) * 0.18;
        tx = maxOffset * Math.tanh((0.35 * dx) / Math.max(1, maxOffset));
        ty = maxOffset * Math.tanh((0.35 * dy) / Math.max(1, maxOffset));
        tsx = 1.035;
        tsy = 1.02;
        if (!raf) raf = requestAnimationFrame(tickElastic);
      }, { passive: true });

      btn.addEventListener('pointerdown', () => {
        tsx = 0.97;
        tsy = 1.04;
        if (!raf) raf = requestAnimationFrame(tickElastic);
      }, { passive: true });

      btn.addEventListener('pointerup', () => {
        tsx = 1.04;
        tsy = 1.02;
        if (!raf) raf = requestAnimationFrame(tickElastic);
      }, { passive: true });

      btn.addEventListener('pointerleave', () => {
        tx = 0; ty = 0; tsx = 1; tsy = 1;
        if (!raf) raf = requestAnimationFrame(tickElastic);
      }, { passive: true });
    });
  }

  /* 3. Independent CSS `scale` Liquid Droplet Stretch on Gliders (never touches `transform: translateX`) */
  function attachGliderRipple(containerSelector, gliderSelector) {
    const container = document.querySelector(containerSelector);
    const glider = document.querySelector(gliderSelector);
    if (!container || !glider || typeof glider.animate !== 'function') return;

    container.addEventListener('click', () => {
      glider.animate(
        [
          { scale: '1 1' },
          { scale: '1.16 0.88', offset: 0.28 },
          { scale: '0.96 1.05', offset: 0.65 },
          { scale: '1 1' }
        ],
        { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    });
  }
  attachGliderRipple('.lang-pill', '.lang-glider');
  attachGliderRipple('.segmented', '#roleGlider');
})();
