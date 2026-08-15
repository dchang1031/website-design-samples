/**
 * Option 2 — theme toggle + scroll wash + Apple-style reveals + value story.
 */
(() => {
  // Ensure value-story upgrade stylesheet is present
  if (!document.querySelector('link[href*="option2-value-story.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/src/option2-value-story.css";
    document.head.appendChild(link);
  }
  initThemeToggle();
  initScrollWash();
  initReveals();
  initScaleExpand();
  initValueStory();
})();

function initThemeToggle() {
  const root = document.body;
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  if (!root.classList.contains("theme-liquid") || !toggles.length) return;

  const storageKey = "option2-theme";
  const saved = localStorage.getItem(storageKey);
  const initial = saved === "light" ? "light" : "dark";

  const apply = (mode) => {
    root.dataset.theme = mode;
    root.classList.toggle("theme-liquid--dark", mode === "dark");
    localStorage.setItem(storageKey, mode);
    const nextLabel = mode === "dark" ? "Light" : "Dark";
    const nextAria = mode === "dark" ? "Switch to light theme" : "Switch to dark theme";
    toggles.forEach((btn) => {
      btn.setAttribute("aria-label", nextAria);
      btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
      const label = btn.querySelector("[data-theme-label]");
      if (label) label.textContent = nextLabel;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#0d121b" : "#d8dee8");
  };

  apply(initial);
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      apply(root.dataset.theme === "dark" ? "light" : "dark");
    });
  });
}

function initScrollWash() {
  const stage = document.querySelector(".scroll-stage");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!stage) return;

  const lightPalettes = [
    { a: "140, 190, 255", b: "190, 170, 255", c: "255, 220, 170" },
    { a: "120, 175, 255", b: "180, 150, 255", c: "255, 200, 190" },
    { a: "100, 210, 230", b: "150, 160, 255", c: "255, 210, 150" },
    { a: "160, 150, 255", b: "220, 160, 230", c: "255, 215, 180" },
    { a: "130, 200, 255", b: "170, 190, 255", c: "240, 220, 255" },
  ];

  const darkPalettes = [
    { a: "40, 90, 180", b: "90, 70, 170", c: "160, 110, 60" },
    { a: "30, 100, 170", b: "80, 60, 160", c: "150, 80, 100" },
    { a: "20, 120, 150", b: "70, 80, 180", c: "150, 110, 50" },
    { a: "70, 60, 160", b: "120, 70, 150", c: "150, 100, 70" },
    { a: "40, 110, 170", b: "70, 90, 170", c: "100, 80, 140" },
  ];

  function mixChannel(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function mixRgb(from, to, t) {
    const fa = from.split(",").map((n) => Number(n.trim()));
    const ta = to.split(",").map((n) => Number(n.trim()));
    return `${mixChannel(fa[0], ta[0], t)}, ${mixChannel(fa[1], ta[1], t)}, ${mixChannel(fa[2], ta[2], t)}`;
  }

  function paletteAt(progress) {
    const palettes = document.body.dataset.theme === "dark" ? darkPalettes : lightPalettes;
    const scaled = progress * (palettes.length - 1);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const a = palettes[i];
    const b = palettes[Math.min(i + 1, palettes.length - 1)];
    return {
      a: mixRgb(a.a, b.a, f),
      b: mixRgb(a.b, b.b, f),
      c: mixRgb(a.c, b.c, f),
      shiftX: `${(progress * 28 - 8).toFixed(2)}%`,
      shiftY: `${(8 + progress * 22).toFixed(2)}%`,
      angle: `${(135 + progress * 50).toFixed(1)}deg`,
    };
  }

  function applyGradient(progress) {
    const p = paletteAt(progress);
    stage.style.setProperty("--wash-a", p.a);
    stage.style.setProperty("--wash-b", p.b);
    stage.style.setProperty("--wash-c", p.c);
    stage.style.setProperty("--wash-x", p.shiftX);
    stage.style.setProperty("--wash-y", p.shiftY);
    stage.style.setProperty("--wash-angle", p.angle);
    stage.style.setProperty("--scroll-progress", progress.toFixed(4));
  }

  function onScroll() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    applyGradient(progress);
  }

  applyGradient(0);
  if (!reduceMotion) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  const observer = new MutationObserver(onScroll);
  observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
}

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

  els.forEach((el) => {
    const children = el.querySelectorAll("[data-reveal-child]");
    children.forEach((child, childIndex) => {
      child.style.setProperty("--reveal-delay", `${120 + childIndex * 90}ms`);
    });
    io.observe(el);
  });
}

function initScaleExpand() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blocks = [...document.querySelectorAll("[data-scale-expand]")];
  if (!blocks.length) return;

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function progressFor(track) {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    const raw = -rect.top / total;
    return clamp(raw, 0, 1);
  }

  function apply(block, p) {
    const frame = block.querySelector("[data-scale-frame]");
    if (!frame) return;
    const e = reduce ? 1 : p * p * (3 - 2 * p);
    const inset = (1 - e) * 28;
    const radius = (1 - e) * 24;
    const border = (1 - e) * 0.14;
    frame.style.setProperty("--scale-inset", `${inset}px`);
    frame.style.setProperty("--scale-radius", `${radius}px`);
    frame.style.setProperty("--scale-border", String(border));
    frame.dataset.expanded = e > 0.92 ? "true" : "false";
  }

  let ticking = false;
  function update() {
    ticking = false;
    blocks.forEach((b) => apply(b, progressFor(b)));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

/**
 * Apple / Scale-style scroll-scrub value story.
 * - Centered headline lights word-by-word as you scroll
 * - Stop → holds; reverse → reverses
 * - Headline fades; three benefits enter one at a time with technical canvas viz
 */
function initValueStory() {
  const root = document.querySelector("[data-value-story]");
  if (!root) return;

  // Upgrade headline to word-by-word spans if needed (main-branch HTML)
  let headline = root.querySelector("[data-story-headline]");
  if (headline && !root.querySelector("[data-word]")) {
    headline.innerHTML = [
      '<span class="value-story__word value-story__word--accent" data-word="0">One</span>',
      '<span class="value-story__word" data-word="1">TokenRouter,</span>',
      '<span class="value-story__word value-story__word--accent" data-word="2">all</span>',
      '<span class="value-story__word" data-word="3">models</span>',
    ].join("\n                ");
  }
  // Hide legacy index numbers
  root.querySelectorAll(".value-story__index").forEach((el) => {
    el.style.display = "none";
  });

  const words = [...root.querySelectorAll("[data-word]")];
  const panels = [...root.querySelectorAll("[data-benefit]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wordCount = words.length || 4;
  const vizState = { key: 0, teams: 0, security: 0, t: 0 };

  if (reduce) {
    root.style.setProperty("--hl-opacity", "1");
    root.style.setProperty("--b0", "1");
    root.style.setProperty("--b1", "1");
    root.style.setProperty("--b2", "1");
    root.style.setProperty("--b0-x", "0px");
    root.style.setProperty("--b1-x", "0px");
    root.style.setProperty("--b2-x", "0px");
    words.forEach((w) => {
      w.style.setProperty("--word-lit", "1");
    });
    panels.forEach((p) => p.removeAttribute("aria-hidden"));
    return;
  }

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function segment(p, a, b) {
    return smoothstep(a, b, p);
  }

  function crossfade(p, enterStart, enterEnd, exitStart, exitEnd) {
    const enter = segment(p, enterStart, enterEnd);
    const exit = segment(p, exitStart, exitEnd);
    return clamp(enter * (1 - exit), 0, 1);
  }

  function progressFor() {
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    return clamp(-rect.top / total, 0, 1);
  }

  function apply(p) {
    const wordEnd = 0.28;
    words.forEach((el, i) => {
      const start = (i / wordCount) * wordEnd;
      const end = ((i + 1) / wordCount) * wordEnd;
      const lit = segment(p, start, end);
      el.style.setProperty("--word-lit", lit.toFixed(4));
    });

    const hlOut = segment(p, 0.4, 0.52);
    const hlOpacity = 1 - hlOut;
    const hlY = hlOut * -48;
    const hlScale = 1 - hlOut * 0.08;
    const hlBlur = hlOut * 8;

    const b0 = crossfade(p, 0.42, 0.54, 0.64, 0.74);
    const b1 = crossfade(p, 0.66, 0.76, 0.84, 0.94);
    const b2 = segment(p, 0.86, 0.96);

    const b0x = (1 - b0) * 40;
    const b1x = (1 - b1) * 40;
    const b2x = (1 - b2) * 40;
    const b0s = 0.96 + b0 * 0.04;
    const b1s = 0.96 + b1 * 0.04;
    const b2s = 0.96 + b2 * 0.04;

    root.style.setProperty("--hl-opacity", hlOpacity.toFixed(4));
    root.style.setProperty("--hl-y", `${hlY.toFixed(2)}px`);
    root.style.setProperty("--hl-scale", hlScale.toFixed(4));
    root.style.setProperty("--hl-blur", `${hlBlur.toFixed(2)}px`);
    root.style.setProperty("--b0", b0.toFixed(4));
    root.style.setProperty("--b1", b1.toFixed(4));
    root.style.setProperty("--b2", b2.toFixed(4));
    root.style.setProperty("--b0-x", `${b0x.toFixed(2)}px`);
    root.style.setProperty("--b1-x", `${b1x.toFixed(2)}px`);
    root.style.setProperty("--b2-x", `${b2x.toFixed(2)}px`);
    root.style.setProperty("--b0-s", b0s.toFixed(4));
    root.style.setProperty("--b1-s", b1s.toFixed(4));
    root.style.setProperty("--b2-s", b2s.toFixed(4));
    root.style.setProperty("--scrub", `${(p * 100).toFixed(2)}%`);

    vizState.key = b0;
    vizState.teams = b1;
    vizState.security = b2;

    panels.forEach((panel, i) => {
      const op = i === 0 ? b0 : i === 1 ? b1 : b2;
      if (op > 0.18) panel.removeAttribute("aria-hidden");
      else panel.setAttribute("aria-hidden", "true");
    });
  }

  function sizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function drawKey(canvas, intensity, t) {
    if (!canvas || intensity < 0.01) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.32;
    const cy = h * 0.5;
    const models = 8;
    const accent = "0, 134, 255";

    ctx.strokeStyle = `rgba(${accent}, ${0.06 * intensity})`;
    ctx.lineWidth = 1;
    for (let g = 0; g < 6; g++) {
      const y = h * (0.15 + g * 0.14);
      ctx.beginPath();
      ctx.moveTo(w * 0.08, y);
      ctx.lineTo(w * 0.92, y);
      ctx.stroke();
    }

    for (let i = 0; i < models; i++) {
      const a = -0.95 + (i / (models - 1)) * 1.9;
      const reach = (70 + i * 14) * intensity;
      const x = cx + Math.cos(a) * reach;
      const y = cy + Math.sin(a) * reach * 0.58;
      const pulse = 0.55 + Math.sin(t * 2.4 + i * 0.7) * 0.45;

      ctx.beginPath();
      ctx.moveTo(cx + 14, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(${accent}, ${0.12 + intensity * 0.4 * pulse})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      const pkt = (t * 0.35 + i * 0.11) % 1;
      const px = cx + 14 + (x - cx - 14) * pkt;
      const py = cy + (y - cy) * pkt;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent}, ${intensity * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 4.5 + Math.sin(t * 2 + i) * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent}, ${0.3 + intensity * 0.55})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent}, ${0.5 + intensity * 0.4})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent}, ${0.18 + intensity * 0.45})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${accent}, 0.85)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 14, cy);
    ctx.lineTo(cx + 48 * intensity, cy);
    ctx.lineTo(cx + 48 * intensity, cy + 9);
    ctx.moveTo(cx + 36 * intensity, cy);
    ctx.lineTo(cx + 36 * intensity, cy + 7);
    ctx.stroke();
  }

  function drawTeams(canvas, intensity, t) {
    if (!canvas || intensity < 0.01) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const accent = "0, 134, 255";
    const hub = { x: w * 0.55, y: h * 0.5 };
    const nodes = [
      { x: w * 0.16, y: h * 0.22 },
      { x: w * 0.18, y: h * 0.5 },
      { x: w * 0.16, y: h * 0.78 },
      { x: w * 0.8, y: h * 0.26 },
      { x: w * 0.84, y: h * 0.5 },
      { x: w * 0.8, y: h * 0.76 },
    ];

    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.ellipse(hub.x, hub.y, 55 + r * 38, 32 + r * 22, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${accent}, ${0.06 + intensity * 0.08})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(hub.x, hub.y);
      ctx.strokeStyle = `rgba(${accent}, ${0.1 + intensity * 0.35})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      const pulse = 0.5 + Math.sin(t * 2.1 + i) * 0.5;
      const pkt = (t * 0.28 + i * 0.13) % 1;
      const px = n.x + (hub.x - n.x) * pkt;
      const py = n.y + (hub.y - n.y) * pkt;
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent}, ${intensity * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(90, 168, 255, ${0.22 + intensity * 0.5})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent}, ${0.45 + intensity * 0.4})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent}, ${0.22 + intensity * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = "#0086ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    const scan = t * 1.1;
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 42, scan, scan + 0.9);
    ctx.strokeStyle = `rgba(${accent}, ${0.35 * intensity})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawSecurity(canvas, intensity, t) {
    if (!canvas || intensity < 0.01) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const accent = "0, 134, 255";
    const cx = w * 0.5;
    const cy = h * 0.48;

    for (let r = 0; r < 4; r++) {
      const rad = (48 + r * 22) * intensity;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${accent}, ${0.05 + intensity * 0.07 * (1 - r * 0.15)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const s = intensity;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 68 * s);
    ctx.lineTo(cx + 54 * s, cy - 38 * s);
    ctx.lineTo(cx + 46 * s, cy + 28 * s);
    ctx.quadraticCurveTo(cx, cy + 72 * s, cx - 46 * s, cy + 28 * s);
    ctx.lineTo(cx - 54 * s, cy - 38 * s);
    ctx.closePath();
    ctx.fillStyle = `rgba(${accent}, ${0.07 + intensity * 0.16})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${accent}, ${0.35 + intensity * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 10, 9 * s, Math.PI, 0);
    ctx.strokeStyle = `rgba(${accent}, ${0.7})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `rgba(${accent}, ${0.2 + intensity * 0.45})`;
    ctx.fillRect(cx - 12 * s, cy - 10, 24 * s, 20 * s);

    for (let i = 0; i < 6; i++) {
      const ang = t * 0.65 + i * ((Math.PI * 2) / 6);
      const r0 = 110 + Math.sin(t + i) * 8;
      const x = cx + Math.cos(ang) * r0;
      const y = cy + Math.sin(ang) * r0 * 0.55;
      const hitR = 58 * intensity;
      const hx = cx + Math.cos(ang) * hitR;
      const hy = cy + Math.sin(ang) * hitR * 0.55;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = `rgba(255, 110, 110, ${0.18 * intensity})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 110, 110, ${0.3 + (1 - intensity) * 0.15})`;
      ctx.fill();
    }

    const pulse = 0.5 + Math.sin(t * 2.2) * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 28 * intensity, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${accent}, ${0.15 * pulse * intensity})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const canvases = {
    key: root.querySelector('[data-viz="key"]'),
    teams: root.querySelector('[data-viz="teams"]'),
    security: root.querySelector('[data-viz="security"]'),
  };

  let ticking = false;
  function update() {
    ticking = false;
    apply(progressFor());
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function loop(ts) {
    vizState.t = ts * 0.001;
    drawKey(canvases.key, vizState.key, vizState.t);
    drawTeams(canvases.teams, vizState.teams, vizState.t);
    drawSecurity(canvases.security, vizState.security, vizState.t);
    requestAnimationFrame(loop);
  }

  update();
  requestAnimationFrame(loop);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
