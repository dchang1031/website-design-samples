/**
 * Option 3 — intersecting optical-glass beam nexus.
 * Scroll rotates the assembly and shifts lighting/reflections on the glass.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(out, a, b, t) {
  out.r = lerp(a.r, b.r, t);
  out.g = lerp(a.g, b.g, t);
  out.b = lerp(a.b, b.b, t);
}

function createGlassMaterial(envMap) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 2.4,
    ior: 1.52,
    transparent: true,
    opacity: 1,
    envMap,
    envMapIntensity: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    specularIntensity: 1.2,
    specularColor: 0xffffff,
    attenuationColor: 0xffffff,
    attenuationDistance: 4.5,
    sheen: 0.15,
    sheenRoughness: 0.35,
    sheenColor: 0xffffff,
  });
}

function addBeam(parent, material, size, position, rotation) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function buildNexus(material) {
  const root = new THREE.Group();

  // Long intersecting square beams (optical rods)
  addBeam(root, material, [7.5, 0.42, 0.42], [0, 0, 0], [0, 0, 0]); // X
  addBeam(root, material, [0.42, 7.5, 0.42], [0, 0, 0], [0, 0, 0]); // Y
  addBeam(root, material, [0.42, 0.42, 7.5], [0, 0, 0], [0, 0, 0]); // Z

  // Diagonal rods through the hub
  addBeam(root, material, [6.2, 0.34, 0.34], [0, 0, 0], [0, 0, Math.PI / 4]);
  addBeam(root, material, [6.2, 0.34, 0.34], [0, 0, 0], [0, 0, -Math.PI / 4]);
  addBeam(root, material, [0.34, 0.34, 6.0], [0, 0, 0], [Math.PI / 5, Math.PI / 6, 0]);
  addBeam(root, material, [0.34, 0.34, 5.6], [0, 0, 0], [-Math.PI / 6, -Math.PI / 5, Math.PI / 8]);

  // Hollow-ish central cubic frame (12 edges)
  const frame = new THREE.Group();
  const edge = 1.55;
  const t = 0.16;
  const half = edge / 2;
  const edges = [
    // bottom square
    [[edge, t, t], [0, -half, -half]],
    [[edge, t, t], [0, -half, half]],
    [[t, t, edge], [-half, -half, 0]],
    [[t, t, edge], [half, -half, 0]],
    // top square
    [[edge, t, t], [0, half, -half]],
    [[edge, t, t], [0, half, half]],
    [[t, t, edge], [-half, half, 0]],
    [[t, t, edge], [half, half, 0]],
    // verticals
    [[t, edge, t], [-half, 0, -half]],
    [[t, edge, t], [half, 0, -half]],
    [[t, edge, t], [-half, 0, half]],
    [[t, edge, t], [half, 0, half]],
  ];
  edges.forEach(([size, pos]) => {
    addBeam(frame, material, size, pos, [0, 0, 0]);
  });
  root.add(frame);

  // Slightly thicker hub sleeves for density at the intersection
  addBeam(root, material, [1.8, 0.55, 0.55], [0, 0, 0], [0, 0, 0]);
  addBeam(root, material, [0.55, 1.8, 0.55], [0, 0, 0], [0, 0, 0]);
  addBeam(root, material, [0.55, 0.55, 1.8], [0, 0, 0], [0, 0, 0]);

  return root;
}

function createAccentEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);

  // Colored studio panels to produce spectral edge reflections on the glass
  const envScene = new THREE.Scene();
  const panels = [
    { color: 0xffffff, pos: [0, 5, 0], scale: [10, 0.25, 10] },
    { color: 0xf4f7fb, pos: [0, -5, 0], scale: [10, 0.25, 10] },
    { color: 0xff6b6b, pos: [-6, 1, 0], scale: [0.25, 6, 6] },
    { color: 0x4cc9ff, pos: [6, 1, 0], scale: [0.25, 6, 6] },
    { color: 0xb8f2e6, pos: [0, 1, -6], scale: [6, 6, 0.25] },
    { color: 0xffd166, pos: [0, 1, 6], scale: [6, 6, 0.25] },
    { color: 0xc77dff, pos: [4, 3.5, 4], scale: [2.4, 2.4, 0.25] },
    { color: 0xffffff, pos: [-3, 4, 3], scale: [2, 0.2, 2] },
  ];

  panels.forEach(({ color, pos, scale }) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    envScene.add(mesh);
  });

  // Soft room bounce
  const room = new RoomEnvironment();
  const roomTex = pmrem.fromScene(room, 0.04).texture;
  const colorTex = pmrem.fromScene(envScene, 0.04).texture;

  // Prefer colored studio map for chromatic highlights
  roomTex.dispose();
  return { texture: colorTex, pmrem };
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
  renderer.toneMappingExposure = 1.25;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(3.8, 2.4, 5.6);

  const { texture: envMap, pmrem } = createAccentEnvironment(renderer);
  scene.environment = envMap;

  const glassMat = createGlassMaterial(envMap);
  const nexus = buildNexus(glassMat);
  nexus.scale.setScalar(0.92);
  scene.add(nexus);

  // Key lights — colors/intensity driven by scroll
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(5, 7, 4);
  scene.add(key);

  const rimLight = new THREE.DirectionalLight(0x9ecbff, 1.35);
  rimLight.position.set(-6, 2, -4);
  scene.add(rimLight);

  const warmFill = new THREE.DirectionalLight(0xffd2a1, 0.85);
  warmFill.position.set(2, -3, 5);
  scene.add(warmFill);

  const coolFill = new THREE.PointLight(0xc9b6ff, 18, 20);
  coolFill.position.set(-2.5, 1.5, 2.5);
  scene.add(coolFill);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  // Lighting recipes per scroll phase
  const lightLooks = [
    {
      // cool daylight
      exposure: 1.2,
      env: 1.6,
      key: { color: 0xffffff, intensity: 2.1, pos: [5, 7, 4] },
      rim: { color: 0x9ecbff, intensity: 1.3, pos: [-6, 2, -4] },
      warm: { color: 0xffe0b8, intensity: 0.55, pos: [2, -3, 5] },
      cool: { color: 0xb7a6ff, intensity: 14, pos: [-2.5, 1.5, 2.5] },
      atten: 0xffffff,
      sheen: 0xffffff,
    },
    {
      // prism / spectral
      exposure: 1.35,
      env: 2.1,
      key: { color: 0xfff4e8, intensity: 2.4, pos: [4, 8, 2] },
      rim: { color: 0xff5d8f, intensity: 1.6, pos: [-5, 3, -2] },
      warm: { color: 0xffd166, intensity: 1.2, pos: [3, -2, 4] },
      cool: { color: 0x4cc9ff, intensity: 26, pos: [-1.5, 2.2, 3] },
      atten: 0xe8f4ff,
      sheen: 0xc9b6ff,
    },
    {
      // violet studio
      exposure: 1.15,
      env: 1.9,
      key: { color: 0xf3e9ff, intensity: 1.9, pos: [3, 6, 5] },
      rim: { color: 0x7b2cbf, intensity: 1.8, pos: [-4, 1, -5] },
      warm: { color: 0xffb703, intensity: 0.7, pos: [4, -1, 2] },
      cool: { color: 0x9b5de5, intensity: 30, pos: [0, 2, 2] },
      atten: 0xf0e6ff,
      sheen: 0xb5179e,
    },
    {
      // icy cyan
      exposure: 1.28,
      env: 1.75,
      key: { color: 0xf8fffe, intensity: 2.3, pos: [6, 5, 3] },
      rim: { color: 0x00f5d4, intensity: 1.5, pos: [-3, 4, -3] },
      warm: { color: 0xffffff, intensity: 0.4, pos: [1, -4, 3] },
      cool: { color: 0x00bbf9, intensity: 24, pos: [-2, 0.5, 3] },
      atten: 0xe6fbff,
      sheen: 0x90e0ef,
    },
    {
      // warm amber glass
      exposure: 1.22,
      env: 1.85,
      key: { color: 0xfff1d6, intensity: 2.0, pos: [4, 7, 4] },
      rim: { color: 0xff9f1c, intensity: 1.4, pos: [-5, 2, -2] },
      warm: { color: 0xffbf69, intensity: 1.5, pos: [2, -2, 5] },
      cool: { color: 0xffd6a5, intensity: 16, pos: [-1, 2, 2] },
      atten: 0xfff4e0,
      sheen: 0xffc971,
    },
    {
      // high-contrast exhibition
      exposure: 1.4,
      env: 2.2,
      key: { color: 0xffffff, intensity: 2.8, pos: [5, 8, 1] },
      rim: { color: 0x4ea8de, intensity: 1.7, pos: [-7, 1, -3] },
      warm: { color: 0xff6b6b, intensity: 1.0, pos: [3, -3, 4] },
      cool: { color: 0xc77dff, intensity: 28, pos: [-2, 3, 1] },
      atten: 0xffffff,
      sheen: 0xa0c4ff,
    },
  ];

  const tmpA = new THREE.Color();
  const tmpB = new THREE.Color();
  const tmpC = new THREE.Color();

  let scrollProgress = 0;
  let sectionFloat = 0;
  let targetSection = 0;

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

  const applyLighting = (look, t = 1) => {
    renderer.toneMappingExposure = lerp(renderer.toneMappingExposure, look.exposure, t);
    glassMat.envMapIntensity = lerp(glassMat.envMapIntensity, look.env, t);

    tmpA.set(look.key.color);
    lerpColor(key.color, key.color, tmpA, t);
    key.intensity = lerp(key.intensity, look.key.intensity, t);
    key.position.x = lerp(key.position.x, look.key.pos[0], t);
    key.position.y = lerp(key.position.y, look.key.pos[1], t);
    key.position.z = lerp(key.position.z, look.key.pos[2], t);

    tmpB.set(look.rim.color);
    lerpColor(rimLight.color, rimLight.color, tmpB, t);
    rimLight.intensity = lerp(rimLight.intensity, look.rim.intensity, t);
    rimLight.position.x = lerp(rimLight.position.x, look.rim.pos[0], t);
    rimLight.position.y = lerp(rimLight.position.y, look.rim.pos[1], t);
    rimLight.position.z = lerp(rimLight.position.z, look.rim.pos[2], t);

    tmpC.set(look.warm.color);
    lerpColor(warmFill.color, warmFill.color, tmpC, t);
    warmFill.intensity = lerp(warmFill.intensity, look.warm.intensity, t);
    warmFill.position.x = lerp(warmFill.position.x, look.warm.pos[0], t);
    warmFill.position.y = lerp(warmFill.position.y, look.warm.pos[1], t);
    warmFill.position.z = lerp(warmFill.position.z, look.warm.pos[2], t);

    tmpA.set(look.cool.color);
    lerpColor(coolFill.color, coolFill.color, tmpA, t);
    coolFill.intensity = lerp(coolFill.intensity, look.cool.intensity, t);
    coolFill.position.x = lerp(coolFill.position.x, look.cool.pos[0], t);
    coolFill.position.y = lerp(coolFill.position.y, look.cool.pos[1], t);
    coolFill.position.z = lerp(coolFill.position.z, look.cool.pos[2], t);

    tmpB.set(look.atten);
    lerpColor(glassMat.attenuationColor, glassMat.attenuationColor, tmpB, t);
    tmpC.set(look.sheen);
    lerpColor(glassMat.sheenColor, glassMat.sheenColor, tmpC, t);
  };

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);

    sectionFloat = lerp(sectionFloat, targetSection, reduced ? 1 : 0.07);
    const lookIndex = Math.min(lightLooks.length - 1, Math.round(sectionFloat));
    const nextIndex = Math.min(lightLooks.length - 1, lookIndex + (sectionFloat > lookIndex ? 1 : 0));
    const localT = clamp(Math.abs(sectionFloat - lookIndex), 0, 1);
    // Blend neighboring looks for smooth scroll lighting
    const a = lightLooks[lookIndex];
    const b = lightLooks[nextIndex];
    applyLighting(a, 0.12);
    // Softly pull toward blended target
    const blend = {
      exposure: lerp(a.exposure, b.exposure, localT),
      env: lerp(a.env, b.env, localT),
      key: {
        color: tmpA.set(a.key.color).lerp(tmpB.set(b.key.color), localT).getHex(),
        intensity: lerp(a.key.intensity, b.key.intensity, localT),
        pos: [
          lerp(a.key.pos[0], b.key.pos[0], localT),
          lerp(a.key.pos[1], b.key.pos[1], localT),
          lerp(a.key.pos[2], b.key.pos[2], localT),
        ],
      },
      rim: {
        color: tmpA.set(a.rim.color).lerp(tmpB.set(b.rim.color), localT).getHex(),
        intensity: lerp(a.rim.intensity, b.rim.intensity, localT),
        pos: [
          lerp(a.rim.pos[0], b.rim.pos[0], localT),
          lerp(a.rim.pos[1], b.rim.pos[1], localT),
          lerp(a.rim.pos[2], b.rim.pos[2], localT),
        ],
      },
      warm: {
        color: tmpA.set(a.warm.color).lerp(tmpB.set(b.warm.color), localT).getHex(),
        intensity: lerp(a.warm.intensity, b.warm.intensity, localT),
        pos: [
          lerp(a.warm.pos[0], b.warm.pos[0], localT),
          lerp(a.warm.pos[1], b.warm.pos[1], localT),
          lerp(a.warm.pos[2], b.warm.pos[2], localT),
        ],
      },
      cool: {
        color: tmpA.set(a.cool.color).lerp(tmpB.set(b.cool.color), localT).getHex(),
        intensity: lerp(a.cool.intensity, b.cool.intensity, localT),
        pos: [
          lerp(a.cool.pos[0], b.cool.pos[0], localT),
          lerp(a.cool.pos[1], b.cool.pos[1], localT),
          lerp(a.cool.pos[2], b.cool.pos[2], localT),
        ],
      },
      atten: tmpA.set(a.atten).lerp(tmpB.set(b.atten), localT).getHex(),
      sheen: tmpA.set(a.sheen).lerp(tmpB.set(b.sheen), localT).getHex(),
    };
    applyLighting(blend, reduced ? 1 : 0.14);

    // Scroll-driven orientation of the glass nexus
    const spinY = scrollProgress * Math.PI * 1.65 + sectionFloat * 0.22;
    const spinX = 0.35 + Math.sin(scrollProgress * Math.PI) * 0.45;
    const spinZ = Math.cos(scrollProgress * Math.PI * 1.1) * 0.18;
    nexus.rotation.y = lerp(nexus.rotation.y, spinY, reduced ? 1 : 0.08);
    nexus.rotation.x = lerp(nexus.rotation.x, spinX, reduced ? 1 : 0.08);
    nexus.rotation.z = lerp(nexus.rotation.z, spinZ, reduced ? 1 : 0.08);
    nexus.position.y = Math.sin(scrollProgress * Math.PI) * 0.15;

    // Orbit camera slightly with scroll for changing speculars
    const camAngle = scrollProgress * Math.PI * 0.7;
    camera.position.x = lerp(camera.position.x, 3.6 * Math.cos(camAngle) + 1.2, 0.06);
    camera.position.z = lerp(camera.position.z, 5.2 + Math.sin(camAngle) * 1.4, 0.06);
    camera.position.y = lerp(camera.position.y, 2.1 + scrollProgress * 0.8, 0.06);
    camera.lookAt(0, 0.05, 0);

    // Rotate environment mapping via light orbit feel (material env intensity already changes)
    if (!reduced) {
      const t = performance.now() * 0.00015;
      coolFill.position.x += Math.sin(t) * 0.01;
    }

    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    pmrem.dispose();
    envMap.dispose();
    glassMat.dispose();
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
