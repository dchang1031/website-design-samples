/**
 * Option 3 — live 3D glass models that rotate + morph with scroll.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(out, a, b, t) {
  out.x = lerp(a.x, b.x, t);
  out.y = lerp(a.y, b.y, t);
  out.z = lerp(a.z, b.z, t);
}

function createGlassMaterial(envMap, tint = 0xffffff, extras = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.05,
    roughness: 0.08,
    transmission: 0.92,
    thickness: 1.4,
    ior: 1.45,
    transparent: true,
    opacity: 1,
    envMap,
    envMapIntensity: 1.35,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    specularIntensity: 1,
    ...extras,
  });
}

/** Per-section pose keyframes for each mesh */
function buildPoses() {
  // 6 sections: hero, trusted, oneapi, enterprise, faq, cta
  return [
    // 0 hero — open constellation
    [
      { p: [0, 0.2, 0], r: [0.3, 0.8, 0.1], s: [1.1, 1.1, 1.1] },
      { p: [-2.2, 1.1, -0.4], r: [0.2, 0.4, 0.6], s: [0.9, 0.9, 0.9] },
      { p: [2.0, -0.6, 0.3], r: [0.5, -0.3, 0.2], s: [1.2, 0.35, 0.7] },
      { p: [-1.4, -1.2, 0.8], r: [0.1, 0.9, 0.2], s: [0.55, 0.55, 0.55] },
      { p: [1.5, 1.4, -0.8], r: [0.8, 0.2, -0.4], s: [0.45, 0.45, 0.45] },
      { p: [0.2, -1.6, -1.2], r: [0.2, 0.1, 0.9], s: [1.6, 0.12, 1.0] },
    ],
    // 1 trusted — ring assembly
    [
      { p: [0, 0, 0], r: [1.4, 0.2, 0], s: [1.35, 1.35, 1.35] },
      { p: [0, 0, 0], r: [0.2, 1.6, 0.3], s: [1.0, 1.0, 1.0] },
      { p: [0, 0.1, 0], r: [0.1, 0.4, 1.2], s: [0.9, 0.25, 0.9] },
      { p: [-1.8, 0.4, 0.2], r: [0.4, 0.2, 0.1], s: [0.5, 0.5, 0.5] },
      { p: [1.8, -0.3, 0.2], r: [0.3, 0.5, 0.2], s: [0.5, 0.5, 0.5] },
      { p: [0, -1.8, 0], r: [0, 0, 0], s: [1.8, 0.1, 1.2] },
    ],
    // 2 oneapi — intersecting beams
    [
      { p: [0, 0, 0], r: [0.2, 0.3, 0.1], s: [0.7, 0.7, 0.7] },
      { p: [0, 0, 0], r: [0.1, 0.2, 1.2], s: [2.4, 0.22, 0.35] },
      { p: [0, 0, 0], r: [1.1, 0.1, 0.2], s: [0.28, 2.3, 0.35] },
      { p: [0, 0, 0], r: [0.2, 1.1, 0.1], s: [0.3, 0.3, 2.2] },
      { p: [1.2, 1.0, 0.6], r: [0.5, 0.5, 0.2], s: [0.4, 0.4, 0.4] },
      { p: [-1.1, -0.9, 0.5], r: [0.3, 0.6, 0.4], s: [0.9, 0.18, 0.6] },
    ],
    // 3 enterprise — dense crystal cluster
    [
      { p: [0, 0.1, 0], r: [0.6, 1.0, 0.3], s: [1.0, 1.0, 1.0] },
      { p: [0.8, 0.6, 0.4], r: [0.4, 0.8, 0.5], s: [0.85, 0.85, 0.85] },
      { p: [-0.9, 0.5, 0.3], r: [0.7, 0.3, 0.6], s: [1.1, 0.4, 0.5] },
      { p: [0.3, -0.8, 0.5], r: [0.2, 0.9, 0.3], s: [0.6, 0.6, 0.6] },
      { p: [-0.5, -0.5, -0.6], r: [0.9, 0.2, 0.4], s: [0.55, 0.55, 0.55] },
      { p: [0.1, 1.2, -0.4], r: [0.1, 0.3, 0.2], s: [1.3, 0.15, 0.8] },
    ],
    // 4 faq — layered slabs
    [
      { p: [0, 0.6, 0], r: [1.2, 0.1, 0.1], s: [1.8, 0.14, 1.1] },
      { p: [0, 0.1, 0.2], r: [1.15, 0.15, -0.1], s: [1.5, 0.12, 1.0] },
      { p: [0, -0.4, 0.4], r: [1.1, 0.2, 0.15], s: [1.2, 0.12, 0.9] },
      { p: [1.6, 0.2, -0.3], r: [0.3, 0.8, 0.2], s: [0.45, 0.45, 0.45] },
      { p: [-1.5, -0.1, -0.2], r: [0.4, 0.5, 0.3], s: [0.4, 0.4, 0.4] },
      { p: [0, -1.1, 0], r: [0.1, 0.2, 0], s: [2.0, 0.1, 1.2] },
    ],
    // 5 cta — expansive open frame
    [
      { p: [0, 0, 0], r: [0.4, 1.2, 0.2], s: [1.5, 1.5, 1.5] },
      { p: [0, 0, 0], r: [1.2, 0.3, 0.4], s: [1.2, 1.2, 1.2] },
      { p: [2.2, 0.4, -0.5], r: [0.2, 0.5, 0.8], s: [1.4, 0.3, 0.5] },
      { p: [-2.1, -0.3, 0.4], r: [0.5, 0.3, 0.2], s: [0.7, 0.7, 0.7] },
      { p: [0.8, 1.6, 0.2], r: [0.3, 0.7, 0.1], s: [0.5, 0.5, 0.5] },
      { p: [-0.6, -1.5, -0.3], r: [0.2, 0.2, 0.5], s: [1.7, 0.12, 1.1] },
    ],
  ];
}

function initGlassScene() {
  const mount = document.querySelector("[data-glass-canvas]");
  const sections = [...document.querySelectorAll("[data-section]")];
  if (!mount) return null;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.35, 7.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const group = new THREE.Group();
  scene.add(group);

  const clear = createGlassMaterial(env, 0xffffff);
  const violet = createGlassMaterial(env, 0xb8a6ff, { attenuationColor: 0x6a5cff, attenuationDistance: 2.5 });
  const teal = createGlassMaterial(env, 0xa8e7ff, { attenuationColor: 0x4cc9ff, attenuationDistance: 2.2 });
  const amber = createGlassMaterial(env, 0xffe2b0, { attenuationColor: 0xffb347, attenuationDistance: 1.8 });

  const meshes = [
    new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.16, 48, 120), violet),
    new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 32, 100), teal),
    new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), amber),
    new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), clear),
    new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), teal),
    new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), clear),
  ];
  meshes.forEach((m) => {
    m.castShadow = false;
    m.receiveShadow = false;
    group.add(m);
  });

  // Soft fill lights for glass edge definition
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb7c9ff, 0.7);
  fill.position.set(-5, 1, -3);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const poses = buildPoses();
  const from = poses[0].map((pose) => ({
    p: new THREE.Vector3(...pose.p),
    r: new THREE.Euler(...pose.r),
    s: new THREE.Vector3(...pose.s),
  }));
  const to = poses[0].map((pose) => ({
    p: new THREE.Vector3(...pose.p),
    r: new THREE.Euler(...pose.r),
    s: new THREE.Vector3(...pose.s),
  }));
  const current = poses[0].map((pose) => ({
    p: new THREE.Vector3(...pose.p),
    r: new THREE.Euler(...pose.r),
    s: new THREE.Vector3(...pose.s),
  }));

  let scrollProgress = 0;
  let sectionFloat = 0;
  let targetSection = 0;
  let morphT = 1;
  let prevSection = 0;

  const applyPoseArrays = (targetArr, poseSet) => {
    poseSet.forEach((pose, i) => {
      targetArr[i].p.set(...pose.p);
      targetArr[i].r.set(...pose.r);
      targetArr[i].s.set(...pose.s);
    });
  };

  const readScroll = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);

    let bestIdx = 0;
    let bestScore = -Infinity;
    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const mid = rect.top + rect.height * 0.35;
      const score = 1 - Math.abs(mid - window.innerHeight * 0.4) / window.innerHeight;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });
    targetSection = bestIdx;
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  readScroll();

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);

    if (targetSection !== prevSection) {
      applyPoseArrays(from, poses[prevSection] || poses[0]);
      applyPoseArrays(to, poses[targetSection] || poses[0]);
      morphT = 0;
      prevSection = targetSection;
    }

    morphT = clamp(morphT + (reduced ? 1 : 0.045), 0, 1);
    const ease = morphT * morphT * (3 - 2 * morphT);

    sectionFloat = lerp(sectionFloat, targetSection, reduced ? 1 : 0.08);

    meshes.forEach((mesh, i) => {
      lerpVec3(current[i].p, from[i].p, to[i].p, ease);
      current[i].r.x = lerp(from[i].r.x, to[i].r.x, ease);
      current[i].r.y = lerp(from[i].r.y, to[i].r.y, ease);
      current[i].r.z = lerp(from[i].r.z, to[i].r.z, ease);
      lerpVec3(current[i].s, from[i].s, to[i].s, ease);

      mesh.position.copy(current[i].p);
      mesh.rotation.set(current[i].r.x, current[i].r.y, current[i].r.z);
      mesh.scale.copy(current[i].s);
    });

    // Continuous scroll-linked rotation / drift
    const spin = reduced ? 0 : scrollProgress * Math.PI * 2.2;
    group.rotation.y = spin + sectionFloat * 0.35;
    group.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.35 + sectionFloat * 0.05;
    group.rotation.z = Math.cos(scrollProgress * Math.PI * 1.2) * 0.12;
    group.position.y = Math.sin(scrollProgress * Math.PI) * 0.25;
    group.scale.setScalar(1 + scrollProgress * 0.12);

    // Subtle idle shimmer when not reducing motion
    if (!reduced) {
      const t = performance.now() * 0.00035;
      meshes[0].rotation.z += 0.002;
      meshes[1].rotation.x += 0.0015;
      group.position.x = Math.sin(t) * 0.08;
    }

    camera.position.x = lerp(camera.position.x, Math.sin(scrollProgress * Math.PI) * 0.45, 0.06);
    camera.lookAt(0, 0.1, 0);

    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    pmrem.dispose();
    env.dispose();
  };
}

function initSectionReveals() {
  const nodes = [...document.querySelectorAll("[data-reveal]")];
  if (!nodes.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    nodes.forEach((n) => n.classList.add("is-revealed"));
    return;
  }

  nodes.forEach((section) => {
    [...section.querySelectorAll("[data-reveal-child]")].forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${80 + i * 70}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-revealed");
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  nodes.forEach((n) => io.observe(n));
  document.querySelector('[data-section="hero"]')?.classList.add("is-revealed");
}

initGlassScene();
initSectionReveals();
