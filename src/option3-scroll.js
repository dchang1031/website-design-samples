import * as THREE from "three";

/**
 * Light-theme organic blob field (Three.js).
 * Static while idle; on scroll the shapes move, morph, and recolor.
 * Sections pop in with Apple product-page style reveals.
 */
(() => {
  const mount = document.querySelector("[data-glass-canvas]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!mount || reduceMotion) {
    initReveals();
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  mount.replaceChildren(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.72));

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xb8d4ff, 0.55);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd6f0, 0.4);
  rim.position.set(0, -4, -6);
  scene.add(rim);

  const noiseGLSL = /* glsl */ `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);
      const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));
      vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);
      vec3 l=1.0-g;
      vec3 i1=min(g.xyz,l.zxy);
      vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;
      vec3 x2=x0-i2+C.yyy;
      vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(
        i.z+vec4(0.0,i1.z,i2.z,1.0))
        +i.y+vec4(0.0,i1.y,i2.y,1.0))
        +i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;
      vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);
      vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;
      vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);
      vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;
      vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
      vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);
      vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z);
      vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
      m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
  `;

  function makeBlobMaterial(colorHex) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.32,
      metalness: 0.06,
      transparent: true,
      opacity: 0.92,
      depthWrite: true,
      flatShading: false,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uMorph = { value: 0.22 };
      material.userData.shader = shader;

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          uniform float uTime;
          uniform float uMorph;
          ${noiseGLSL}
          `
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
          float n = snoise(transformed * 0.55 + vec3(uTime * 0.18));
          float n2 = snoise(transformed * 1.1 - vec3(uTime * 0.12, uTime * 0.08, 0.0));
          transformed += normalize(transformed + 0.001) * (n * 0.55 + n2 * 0.28) * uMorph;
          `
        );
    };

    return material;
  }

  /** Soft light pastels — readable under frosted glass UI */
  const palettes = [
    { a: new THREE.Color("#9ec9ff"), b: new THREE.Color("#c5b8ff"), c: new THREE.Color("#f0c4e8") },
    { a: new THREE.Color("#7eb6ff"), b: new THREE.Color("#a78bfa"), c: new THREE.Color("#fda4d8") },
    { a: new THREE.Color("#67e8f9"), b: new THREE.Color("#818cf8"), c: new THREE.Color("#f0abfc") },
    { a: new THREE.Color("#93c5fd"), b: new THREE.Color("#c4b5fd"), c: new THREE.Color("#fecdd3") },
    { a: new THREE.Color("#bfdbfe"), b: new THREE.Color("#ddd6fe"), c: new THREE.Color("#fbcfe8") },
  ];

  const blobConfigs = [
    { r: 3.1, x: -2.2, y: 1.3, z: -1.4, color: "#9ec9ff", speed: 0.7 },
    { r: 3.6, x: 2.0, y: -0.2, z: -2.2, color: "#c5b8ff", speed: 0.55 },
    { r: 2.6, x: 0.1, y: 1.8, z: -0.8, color: "#f0c4e8", speed: 0.9 },
    { r: 2.9, x: -1.4, y: -1.7, z: -1.7, color: "#a8d4ff", speed: 0.65 },
    { r: 2.2, x: 2.8, y: 1.7, z: -0.5, color: "#d4bfff", speed: 1.05 },
    { r: 2.4, x: -2.9, y: -0.4, z: -1.0, color: "#ffc2e0", speed: 0.8 },
    { r: 2.0, x: 0.9, y: -2.2, z: -0.6, color: "#b8e0ff", speed: 1.15 },
    { r: 2.3, x: 1.4, y: 0.6, z: -2.8, color: "#c4b5fd", speed: 0.75 },
  ];

  const blobs = blobConfigs.map((cfg, i) => {
    const geometry = new THREE.IcosahedronGeometry(cfg.r, 32);
    const material = makeBlobMaterial(cfg.color);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.set(i * 0.4, i * 0.7, i * 0.2);
    scene.add(mesh);
    return {
      mesh,
      base: new THREE.Vector3(cfg.x, cfg.y, cfg.z),
      speed: cfg.speed,
      phase: i * 1.3,
      colorIndex: i % 3,
    };
  });

  let width = 0;
  let height = 0;
  let scrollY = window.scrollY;
  let lastScrollY = scrollY;
  let scrollVelocity = 0;
  let scrollProgress = 0;
  let animTime = 0;
  let needsRender = true;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    needsRender = true;
  }

  function onScroll() {
    scrollY = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  }

  function mixPalette(t) {
    const scaled = t * (palettes.length - 1);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const a = palettes[i];
    const b = palettes[Math.min(i + 1, palettes.length - 1)];
    return {
      a: a.a.clone().lerp(b.a, f),
      b: a.b.clone().lerp(b.b, f),
      c: a.c.clone().lerp(b.c, f),
    };
  }

  function updateBlobs(dt, intensity) {
    animTime += dt * (0.35 + intensity * 2.4);
    const palette = mixPalette(scrollProgress);
    const colors = [palette.a, palette.b, palette.c];
    const morph = 0.18 + intensity * 0.55 + scrollProgress * 0.2;

    blobs.forEach((blob, i) => {
      const shader = blob.mesh.material.userData.shader;
      if (shader) {
        shader.uniforms.uTime.value = animTime * blob.speed + blob.phase;
        shader.uniforms.uMorph.value = morph * (0.85 + (i % 3) * 0.08);
      }

      const drift = intensity * 1.35;
      blob.mesh.position.x =
        blob.base.x +
        Math.sin(animTime * 0.55 * blob.speed + blob.phase) * drift * 1.15 +
        Math.sin(scrollProgress * Math.PI * 2 + i) * 0.45 * intensity;
      blob.mesh.position.y =
        blob.base.y +
        Math.cos(animTime * 0.42 * blob.speed + blob.phase * 1.2) * drift -
        scrollProgress * 1.8 * intensity +
        Math.sin(scrollY * 0.0015 + i) * 0.3 * intensity;
      blob.mesh.position.z =
        blob.base.z + Math.sin(animTime * 0.3 + i) * drift * 0.55;

      blob.mesh.rotation.x += dt * (0.12 + intensity * 0.55) * blob.speed;
      blob.mesh.rotation.y += dt * (0.16 + intensity * 0.7) * blob.speed;

      const scalePulse = 1 + Math.sin(animTime * 0.5 + blob.phase) * 0.04 * intensity;
      blob.mesh.scale.setScalar(scalePulse);

      const target = colors[blob.colorIndex];
      const mixAmt = 0.04 + intensity * 0.12;
      blob.mesh.material.color.lerp(target, mixAmt);
      if (i % 3 === 1) blob.mesh.material.color.lerp(palette.b, mixAmt * 0.5);
      if (i % 3 === 2) blob.mesh.material.color.lerp(palette.c, mixAmt * 0.5);
    });

    camera.position.x = Math.sin(scrollProgress * Math.PI) * 0.35 * intensity;
    camera.position.y = scrollProgress * -0.55 * (0.3 + intensity);
    camera.lookAt(0, scrollProgress * -0.3, 0);
  }

  let lastTs = performance.now();

  function frame(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    const dy = scrollY - lastScrollY;
    lastScrollY = scrollY;
    scrollVelocity = scrollVelocity * 0.86 + Math.abs(dy) * 0.14;
    const intensity = Math.min(scrollVelocity / 28, 1);

    let dirty = needsRender;
    if (intensity > 0.012 || needsRender) {
      updateBlobs(dt, Math.max(intensity, needsRender ? 0.02 : intensity));
      needsRender = false;
      dirty = true;
    }

    if (dirty) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  onScroll();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  requestAnimationFrame(frame);
  initReveals();
})();

function initReveals() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${Math.min(index * 40, 160)}ms`);
    const children = el.querySelectorAll("[data-reveal-child]");
    children.forEach((child, childIndex) => {
      child.style.setProperty("--reveal-delay", `${120 + childIndex * 90}ms`);
    });
    io.observe(el);
  });
}
