/* Real-Time Three.js WebGL Stage: Custom GLSL Silk Aurora Shader + 3D Geometric Lattice + Starlight Galaxy */
(function initWebGLStage() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    /* 1. Fullscreen GLSL Silk Aurora Background Quad */
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTheme: { value: document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0 }
    };

    const shaderMat = new THREE.ShaderMaterial({
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
          float t = uTime * 0.35;

          float w1 = wave(uv * 1.8 + m + vec2(0.0, uScroll * 1.4), t);
          float w2 = wave(uv * 2.6 - m * 0.8 + vec2(uScroll * 0.9, -uScroll * 0.6), t * 0.85);
          float aurora = smoothstep(-0.35, 1.25, w1 * 0.6 + w2 * 0.4);
          float goldBand = smoothstep(0.45, 1.15, w2 * 0.7 + sin(uv.x * 3.0 + t) * 0.3);

          // Dark mode palette: Obsidian + Teal + Champagne Gold
          vec3 darkBase = vec3(0.012, 0.016, 0.028);
          vec3 darkTeal = vec3(0.04, 0.42, 0.38);
          vec3 darkGold = vec3(0.62, 0.46, 0.16);
          vec3 colDark = darkBase + darkTeal * aurora * 0.24 + darkGold * goldBand * 0.12;

          // Light mode palette: Pearl Ivory + Mist Teal + Warm Gold
          vec3 lightBase = vec3(0.984, 0.984, 0.992);
          vec3 lightTeal = vec3(0.76, 0.91, 0.90);
          vec3 lightGold = vec3(0.96, 0.89, 0.74);
          vec3 colLight = mix(lightBase, lightTeal, aurora * 0.38);
          colLight = mix(colLight, lightGold, goldBand * 0.24);

          vec3 finalCol = mix(colDark, colLight, uTheme);
          gl_FragColor = vec4(finalCol, 0.92);
        }
      `
    });
    const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMat);
    bgQuad.frustumCulled = false;
    scene.add(bgQuad);

    /* 2. Sacred Islamic 8-Point Lattice Core (2 interlocked 3D wireframe octagram rings) */
    const latticeGroup = new THREE.Group();
    const ringGeoA = new THREE.TorusGeometry(3.2, 0.022, 8, 8);
    const ringGeoB = new THREE.TorusGeometry(3.2, 0.022, 8, 8);
    const innerGeo = new THREE.OctahedronGeometry(1.75, 1);

    const tealWireMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0.22 });
    const goldWireMat = new THREE.MeshBasicMaterial({ color: 0xeab348, wireframe: true, transparent: true, opacity: 0.18 });
    const coreWireMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.14 });

    const ringA = new THREE.Mesh(ringGeoA, tealWireMat);
    const ringB = new THREE.Mesh(ringGeoB, goldWireMat);
    ringB.rotation.z = Math.PI / 4;
    const coreMesh = new THREE.Mesh(innerGeo, coreWireMat);

    latticeGroup.add(ringA, ringB, coreMesh);
    latticeGroup.position.set(0, 0.2, -1.5);
    scene.add(latticeGroup);

    /* 3. 1,400-Particle 3D Starlight Galaxy */
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
      size: 0.065, vertexColors: true, transparent: true, opacity: 0.62, sizeAttenuation: true
    });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    /* Reactive mouse & scroll state */
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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (document.hidden) return;

      const t = clock.getElapsedTime();
      const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollNorm = Math.min(1, Math.max(0, window.scrollY / maxS));

      mx += (targetMx - mx) * 0.06;
      my += (targetMy - my) * 0.06;
      uniforms.uTime.value = t;
      uniforms.uScroll.value += (scrollNorm - uniforms.uScroll.value) * 0.08;
      uniforms.uMouse.value.set(mx, my);
      uniforms.uTheme.value += (targetTheme - uniforms.uTheme.value) * 0.08;

      // Adapt wireframe opacity subtly for Light vs Dark mode
      const isLight = uniforms.uTheme.value;
      tealWireMat.opacity = 0.22 - isLight * 0.08;
      goldWireMat.opacity = 0.18 - isLight * 0.04;
      coreWireMat.opacity = 0.14 - isLight * 0.05;
      pMat.opacity = 0.62 - isLight * 0.24;

      latticeGroup.rotation.x = 0.25 + (my - 0.5) * 0.35 + uniforms.uScroll.value * 1.4;
      latticeGroup.rotation.y = t * 0.09 + (mx - 0.5) * 0.45 + uniforms.uScroll.value * 2.2;
      latticeGroup.position.y = 0.2 - uniforms.uScroll.value * 1.6;
      coreMesh.rotation.y = -t * 0.16;

      stars.rotation.y = t * 0.02 + (mx - 0.5) * 0.12;
      stars.rotation.x = (my - 0.5) * 0.1 - uniforms.uScroll.value * 0.45;

      camera.position.x += ((mx - 0.5) * 0.7 - camera.position.x) * 0.04;
      camera.position.y += ((my - 0.5) * 0.5 - camera.position.y) * 0.04;

      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    // Graceful silent fallback if WebGL context is unavailable
  }
})();
