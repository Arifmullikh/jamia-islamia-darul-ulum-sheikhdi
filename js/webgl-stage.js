/* Two-Pass Three.js WebGL Stage:
   Pass 1: Silk Aurora + Glowing Caustic Orbs + Sacred 8-Point Wireframe Lattice + Starlight Field
   Pass 2: Kyant Liquid Glass SDF Refraction + 7-Band Chromatic Dispersion + 45° Directional Specular Rim Lenses */
(function initWebGLStage() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* ---------- PASS 1: Backdrop Cosmic Scene -> FBO RenderTarget ---------- */
    const rtWidth = Math.max(2, Math.floor(window.innerWidth * Math.min(dpr, 1.5)));
    const rtHeight = Math.max(2, Math.floor(window.innerHeight * Math.min(dpr, 1.5)));
    const backdropRT = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      generateMipmaps: false
    });

    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
    bgCamera.position.set(0, 0, 11);

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTheme: { value: document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0 }
    };

    const auroraMat = new THREE.ShaderMaterial({
      uniforms,
      depthWrite: false,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.999, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uScroll;
        uniform vec2 uMouse;
        uniform float uTheme;

        float wave(vec2 p, float t) {
          return sin(p.x * 2.1 + t) * cos(p.y * 1.7 - t * 0.7) +
                 0.5 * sin(p.x * 4.2 - t * 1.1 + p.y * 2.4);
        }

        void main() {
          vec2 uv = vUv;
          vec2 m = (uMouse - 0.5) * 0.35;
          float t = uTime * 0.36;

          float w1 = wave(uv * 1.85 + m + vec2(0.0, uScroll * 1.3), t);
          float w2 = wave(uv * 2.75 - m * 0.8 + vec2(uScroll * 0.85, -uScroll * 0.55), t * 0.85);
          float aurora = smoothstep(-0.32, 1.22, w1 * 0.6 + w2 * 0.4);
          float goldBand = smoothstep(0.42, 1.12, w2 * 0.72 + sin(uv.x * 3.1 + t) * 0.3);

          // Soft caustic glow nodes aligned near hero floating glass lenses so refraction shimmers richly
          float leftCaustic = exp(-length((uv - vec2(0.16, 0.64)) * vec2(1.4, 2.2)) * 3.8);
          float rightCaustic = exp(-length((uv - vec2(0.84, 0.50)) * vec2(1.4, 2.2)) * 3.8);
          float causticFade = clamp(1.0 - uScroll * 2.4, 0.0, 1.0);

          vec3 darkBase = vec3(0.012, 0.016, 0.028);
          vec3 darkTeal = vec3(0.05, 0.48, 0.43);
          vec3 darkGold = vec3(0.68, 0.50, 0.18);
          vec3 colDark = darkBase
            + darkTeal * (aurora * 0.25 + leftCaustic * 0.36 * causticFade)
            + darkGold * (goldBand * 0.14 + rightCaustic * 0.30 * causticFade);

          vec3 lightBase = vec3(0.984, 0.986, 0.994);
          vec3 lightTeal = vec3(0.70, 0.90, 0.89);
          vec3 lightGold = vec3(0.96, 0.87, 0.70);
          vec3 colLight = mix(lightBase, lightTeal, clamp(aurora * 0.40 + leftCaustic * 0.38 * causticFade, 0.0, 1.0));
          colLight = mix(colLight, lightGold, clamp(goldBand * 0.25 + rightCaustic * 0.34 * causticFade, 0.0, 1.0));

          gl_FragColor = vec4(mix(colDark, colLight, uTheme), 1.0);
        }
      `
    });
    const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), auroraMat);
    bgQuad.frustumCulled = false;
    bgScene.add(bgQuad);

    /* Sacred Islamic 8-Point Wireframe Lattice */
    const latticeGroup = new THREE.Group();
    const ringGeoA = new THREE.TorusGeometry(3.2, 0.022, 8, 8);
    const ringGeoB = new THREE.TorusGeometry(3.2, 0.022, 8, 8);
    const innerGeo = new THREE.OctahedronGeometry(1.75, 1);

    const tealWireMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0.14 });
    const goldWireMat = new THREE.MeshBasicMaterial({ color: 0xeab348, wireframe: true, transparent: true, opacity: 0.12 });
    const coreWireMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.09 });

    const ringA = new THREE.Mesh(ringGeoA, tealWireMat);
    const ringB = new THREE.Mesh(ringGeoB, goldWireMat);
    ringB.rotation.z = Math.PI / 4;
    const coreMesh = new THREE.Mesh(innerGeo, coreWireMat);

    latticeGroup.add(ringA, ringB, coreMesh);
    latticeGroup.position.set(0, 0.2, -1.5);
    bgScene.add(latticeGroup);

    /* Starlight Galaxy Particles */
    const pCount = window.innerWidth < 768 ? 650 : 1400;
    const positions = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);
    const colEmerald = new THREE.Color(0x14b8a6);
    const colGold = new THREE.Color(0xeab348);

    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26;
      positions[i3 + 1] = (Math.random() - 0.5) * 24;
      positions[i3 + 2] = (Math.random() - 0.5) * 18 - 2;
      const c = i % 3 === 0 ? colGold : colEmerald;
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.068, vertexColors: true, transparent: true, opacity: 0.58, sizeAttenuation: true
    });
    const stars = new THREE.Points(pGeo, pMat);
    bgScene.add(stars);

    /* ---------- PASS 2: Kyant Liquid Glass SDF Refraction + 7-Band Dispersion ---------- */
    const glassScene = new THREE.Scene();
    const glassCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const glassUniforms = {
      tBackdrop: { value: backdropRT.texture },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTheme: { value: uniforms.uTheme.value }
    };

    const liquidGlassMat = new THREE.ShaderMaterial({
      uniforms: glassUniforms,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;

        uniform sampler2D tBackdrop;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uScroll;
        uniform vec2 uMouse;
        uniform float uTheme;

        float sdRoundedRect(vec2 coord, vec2 halfSize, float radius) {
          vec2 cornerCoord = abs(coord) - (halfSize - vec2(radius));
          float outside = length(max(cornerCoord, 0.0)) - radius;
          float inside = min(max(cornerCoord.x, cornerCoord.y), 0.0);
          return outside + inside;
        }

        vec2 gradSdRoundedRect(vec2 coord, vec2 halfSize, float radius) {
          vec2 cornerCoord = abs(coord) - (halfSize - vec2(radius));
          if (cornerCoord.x >= 0.0 || cornerCoord.y >= 0.0) {
            vec2 m = max(cornerCoord, 0.0);
            float len = length(m);
            return len > 0.0001 ? sign(coord) * (m / len) : vec2(0.0);
          } else {
            float gradX = step(cornerCoord.y, cornerCoord.x);
            return sign(coord) * vec2(gradX, 1.0 - gradX);
          }
        }

        float circleMap(float x) {
          return 1.0 - sqrt(max(0.0, 1.0 - x * x));
        }

        vec3 sampleBackdrop(vec2 px) {
          vec2 clampedUv = clamp(px / uResolution, vec2(0.002), vec2(0.998));
          return texture2D(tBackdrop, clampedUv).rgb;
        }

        vec3 renderLiquidCapsule(
          vec2 fragPx,
          vec2 centerPx,
          vec2 halfSize,
          float radius,
          float refHeight,
          float refAmount,
          float dispersionAmt,
          float visibility,
          vec3 baseCol
        ) {
          if (visibility <= 0.01) return baseCol;

          vec2 centered = fragPx - centerPx;
          float sd = sdRoundedRect(centered, halfSize, radius);

          // Soft ambient outer elevation shadow
          float shadowMask = smoothstep(26.0, 0.0, sd) * step(0.0, sd);
          vec3 shadowTint = mix(vec3(0.0), vec3(0.04, 0.14, 0.18), uTheme);
          vec3 outCol = mix(baseCol, shadowTint, shadowMask * (0.28 - 0.18 * uTheme) * visibility);

          if (sd > 0.5) return outCol;

          float insideDist = max(0.0, -sd);
          float depthRatio = clamp(1.0 - insideDist / max(refHeight, 1.0), 0.0, 1.0);
          float d = circleMap(depthRatio) * (-refAmount);

          float gradRadius = min(radius * 1.45, min(halfSize.x, halfSize.y));
          vec2 rawGrad = gradSdRoundedRect(centered, halfSize, gradRadius);
          vec2 radialDir = length(centered) > 0.001 ? normalize(centered) : vec2(0.0);
          vec2 grad = normalize(rawGrad + 0.35 * radialDir);

          vec2 refractedPx = fragPx + d * grad;

          // Kyant 7-spectrum chromatic dispersion across curved rim
          float dispFactor = dispersionAmt * ((centered.x * centered.y) / max(1.0, halfSize.x * halfSize.y));
          vec2 disp = d * grad * dispFactor;

          vec3 glassSample;
          if (insideDist < refHeight) {
            vec3 rCol = sampleBackdrop(refractedPx + disp);
            vec3 oCol = sampleBackdrop(refractedPx + disp * (2.0 / 3.0));
            vec3 yCol = sampleBackdrop(refractedPx + disp * (1.0 / 3.0));
            vec3 gCol = sampleBackdrop(refractedPx);
            vec3 cCol = sampleBackdrop(refractedPx - disp * (1.0 / 3.0));
            vec3 bCol = sampleBackdrop(refractedPx - disp * (2.0 / 3.0));
            vec3 pCol = sampleBackdrop(refractedPx - disp);

            glassSample.r = rCol.r / 3.5 + oCol.r / 3.5 + yCol.r / 3.5 + pCol.r / 7.0;
            glassSample.g = oCol.g / 7.0 + yCol.g / 3.5 + gCol.g / 3.5 + cCol.g / 3.5;
            glassSample.b = cCol.b / 3.0 + bCol.b / 3.0 + pCol.b / 3.0;
          } else {
            glassSample = sampleBackdrop(fragPx + grad * (-refAmount * 0.28));
          }

          // Glass vibrancy + subtle crystal tint
          vec3 frostTint = mix(vec3(0.06, 0.12, 0.16), vec3(0.95, 0.99, 1.0), uTheme);
          glassSample = mix(glassSample * 1.10, frostTint, mix(0.14, 0.22, uTheme));

          // Kyant DefaultHighlight 45deg Specular Rim Shader
          float angle = 0.785398 + uMouse.x * 0.45;
          vec2 lightNormal = vec2(cos(angle), sin(angle));
          float dotVal = dot(grad, lightNormal);
          float rimSpec = pow(abs(dotVal), 1.35);
          float rimMask = smoothstep(2.6, 0.0, insideDist);
          vec3 specColor = mix(vec3(0.55, 0.96, 0.88), vec3(1.0, 0.98, 0.92), step(0.0, dotVal));
          glassSample += specColor * rimSpec * rimMask * mix(0.36, 0.58, uTheme);

          // Anti-aliased edge composite
          float edgeAlpha = smoothstep(0.5, -1.2, sd);
          return mix(outCol, glassSample, edgeAlpha * visibility);
        }

        void main() {
          vec2 fragPx = vUv * uResolution;
          vec3 col = texture2D(tBackdrop, vUv).rgb;

          float minDim = min(uResolution.x, uResolution.y);
          float heroVis = clamp(1.0 - uScroll * 2.5, 0.0, 1.0);
          float desktopVis = smoothstep(700.0, 1020.0, uResolution.x) * heroVis;

          // Left floating Liquid Glass Capsule (subtle ambient lens)
          if (desktopVis > 0.01) {
            vec2 cL = vec2(uResolution.x * 0.13, uResolution.y * 0.62 + sin(uTime * 0.7) * 18.0);
            vec2 sL = vec2(74.0, 108.0);
            col = renderLiquidCapsule(fragPx, cL, sL, 38.0, 28.0, 26.0, 0.72, desktopVis * 0.88, col);

            // Right floating Liquid Glass Capsule
            vec2 cR = vec2(uResolution.x * 0.87, uResolution.y * 0.48 + cos(uTime * 0.62) * 20.0);
            vec2 sR = vec2(84.0, 84.0);
            col = renderLiquidCapsule(fragPx, cR, sR, 42.0, 26.0, 24.0, 0.75, desktopVis * 0.88, col);
          }

          // Cursor-reactive floating micro Liquid Drop lens in Hero area
          float dropVis = smoothstep(760.0, 1020.0, uResolution.x) * clamp(1.0 - uScroll * 3.0, 0.0, 1.0) * 0.72;
          if (dropVis > 0.01) {
            vec2 cursorPx = uMouse * uResolution;
            vec2 dropSize = vec2(minDim * 0.042, minDim * 0.042);
            col = renderLiquidCapsule(fragPx, cursorPx, dropSize, dropSize.x, 16.0, 18.0, 0.65, dropVis, col);
          }

          gl_FragColor = vec4(col, 0.94);
        }
      `
    });

    const glassQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), liquidGlassMat);
    glassQuad.frustumCulled = false;
    glassScene.add(glassQuad);

    /* ---------- Reactive Mouse, Theme & Scroll State ---------- */
    let targetMx = 0.5, targetMy = 0.5, mx = 0.5, my = 0.5;
    let targetTheme = uniforms.uTheme.value;

    window.addEventListener('pointermove', (e) => {
      targetMx = e.clientX / Math.max(1, window.innerWidth);
      targetMy = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    }, { passive: true });

    window.addEventListener('sheikhdi-theme-change', (e) => {
      targetTheme = e.detail === 'light' ? 1.0 : 0.0;
    });

    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const curDpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(curDpr);
      renderer.setSize(w, h);
      bgCamera.aspect = w / h;
      bgCamera.updateProjectionMatrix();
      backdropRT.setSize(
        Math.max(2, Math.floor(w * Math.min(curDpr, 1.5))),
        Math.max(2, Math.floor(h * Math.min(curDpr, 1.5)))
      );
      glassUniforms.uResolution.value.set(w, h);
    }, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (document.hidden) return;

      const t = clock.getElapsedTime();
      const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollNorm = Math.min(1, Math.max(0, window.scrollY / maxS));

      mx += (targetMx - mx) * 0.075;
      my += (targetMy - my) * 0.075;

      uniforms.uTime.value = t;
      uniforms.uScroll.value += (scrollNorm - uniforms.uScroll.value) * 0.08;
      uniforms.uMouse.value.set(mx, my);
      uniforms.uTheme.value += (targetTheme - uniforms.uTheme.value) * 0.08;

      glassUniforms.uTime.value = t;
      glassUniforms.uScroll.value = uniforms.uScroll.value;
      glassUniforms.uMouse.value.set(mx, my);
      glassUniforms.uTheme.value = uniforms.uTheme.value;

      const isLight = uniforms.uTheme.value;
      const readFade = Math.max(0.28, 1.0 - uniforms.uScroll.value * 2.2);
      tealWireMat.opacity = (0.14 - isLight * 0.05) * readFade;
      goldWireMat.opacity = (0.12 - isLight * 0.03) * readFade;
      coreWireMat.opacity = (0.09 - isLight * 0.03) * readFade;
      pMat.opacity = (0.58 - isLight * 0.24) * Math.max(0.45, readFade);

      latticeGroup.rotation.x = 0.25 + (my - 0.5) * 0.35 + uniforms.uScroll.value * 1.4;
      latticeGroup.rotation.y = t * 0.09 + (mx - 0.5) * 0.45 + uniforms.uScroll.value * 2.2;
      latticeGroup.position.y = 0.2 - uniforms.uScroll.value * 1.6;
      coreMesh.rotation.y = -t * 0.16;

      stars.rotation.y = t * 0.02 + (mx - 0.5) * 0.12;
      stars.rotation.x = (my - 0.5) * 0.1 - uniforms.uScroll.value * 0.45;

      bgCamera.position.x += ((mx - 0.5) * 0.7 - bgCamera.position.x) * 0.04;
      bgCamera.position.y += ((my - 0.5) * 0.5 - bgCamera.position.y) * 0.04;

      // Pass 1 -> RenderTarget
      renderer.setRenderTarget(backdropRT);
      renderer.render(bgScene, bgCamera);

      // Pass 2 -> Screen with Liquid Glass optical lenses
      renderer.setRenderTarget(null);
      renderer.render(glassScene, glassCamera);
    }
    animate();
  } catch (err) {
    // Graceful silent fallback if WebGL context is unavailable
  }
})();
