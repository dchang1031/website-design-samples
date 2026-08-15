/**
 * Option 2 — theme toggle + scroll wash + Apple-style reveals.
 */
(() => {
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
  // Default dark for readability against the liquid stage
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
 * Scroll-scrub storytelling before hero.
 * Scroll progress continuously drives fades / slides.
 * Stop scrolling → animation holds. Scroll back → reverses.
 */
function initValueStory() {
  const root = document.querySelector("[data-value-story]");
  if (!root) return;

  const panels = [...root.querySelectorAll("[data-benefit]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vizState = { key: 0, teams: 0, security: 0, t: 0 };

  if (reduce) {
    root.style.setProperty("--hl-opacity", "1");
    root.style.setProperty("--b0", "1");
    root.style.setProperty("--b1", "1");
    root.style.setProperty("--b2", "1");
    root.style.setProperty("--b0-x", "0px");
    root.style.setProperty("--b1-x", "0px");
    root.style.setProperty("--b2-x", "0px");
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
    // Timeline (scrubbed, reversible):
    // 0.00–0.16 headline hold
    // 0.16–0.32 headline out / benefit 0 in
    // 0.32–0.46 benefit 0 hold
    // 0.46–0.60 benefit 0 out / benefit 1 in
    // 0.60–0.74 benefit 1 hold
    // 0.74–0.88 benefit 1 out / benefit 2 in
    // 0.88–1.00 benefit 2 hold

    const hlOut = segment(p, 0.16, 0.32);
    const hlOpacity = 1 - hlOut;
    const hlY = hlOut * -36;
    const hlScale = 1 - hlOut * 0.12;

    const b0 = crossfade(p, 0.18, 0.34, 0.46, 0.6);
    const b1 = crossfade(p, 0.48, 0.62, 0.74, 0.88);
    const b2 = segment(p, 0.76, 0.9);

    const b0x = (1 - b0) * 56;
    const b1x = (1 - b1) * 56;
    const b2x = (1 - b2) * 56;

    root.style.setProperty("--hl-opacity", hlOpacity.toFixed(4));
    root.style.setProperty("--hl-y", `${hlY.toFixed(2)}px`);
    root.style.setProperty("--hl-scale", hlScale.toFixed(4));
    root.style.setProperty("--b0", b0.toFixed(4));
    root.style.setProperty("--b1", b1.toFixed(4));
    root.style.setProperty("--b2", b2.toFixed(4));
    root.style.setProperty("--b0-x", `${b0x.toFixed(2)}px`);
    root.style.setProperty("--b1-x", `${b1x.toFixed(2)}px`);
    root.style.setProperty("--b2-x", `${b2x.toFixed(2)}px`);
    root.style.setProperty("--scrub", `${(p * 100).toFixed(2)}%`);

    vizState.key = b0;
    vizState.teams = b1;
    vizState.security = b2;

    panels.forEach((panel, i) => {
      const op = i === 0 ? b0 : i === 1 ? b1 : b2;
      if (op > 0.2) panel.removeAttribute("aria-hidden");
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
    const cx = w * 0.28;
    const cy = h * 0.5;
    const models = 7;
    for (let i = 0; i < models; i++) {
      const a = -0.9 + (i / (models - 1)) * 1.8;
      const reach = 90 + i * 12;
      const x = cx + Math.cos(a) * reach * intensity;
      const y = cy + Math.sin(a) * reach * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx + 18, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(0, 134, 255, ${0.15 + intensity * 0.45})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 5 + Math.sin(t * 2 + i) * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 134, 255, ${0.35 + intensity * 0.55})`;
      ctx.fill();
    }
    // key body
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 134, 255, ${0.2 + intensity * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(0, 134, 255, ${0.7})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy);
    ctx.lineTo(cx + 52 * intensity, cy);
    ctx.lineTo(cx + 52 * intensity, cy + 10);
    ctx.moveTo(cx + 40 * intensity, cy);
    ctx.lineTo(cx + 40 * intensity, cy + 8);
    ctx.stroke();
  }

  function drawTeams(canvas, intensity, t) {
    if (!canvas || intensity < 0.01) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const hub = { x: w * 0.55, y: h * 0.5 };
    const nodes = [
      { x: w * 0.18, y: h * 0.25 },
      { x: w * 0.2, y: h * 0.5 },
      { x: w * 0.18, y: h * 0.75 },
      { x: w * 0.78, y: h * 0.28 },
      { x: w * 0.82, y: h * 0.52 },
      { x: w * 0.78, y: h * 0.76 },
    ];
    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(hub.x, hub.y);
      ctx.strokeStyle = `rgba(0, 134, 255, ${0.12 + intensity * 0.4})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const pulse = 0.5 + Math.sin(t * 2.2 + i) * 0.5;
      const px = n.x + (hub.x - n.x) * ((t * 0.25 + i * 0.12) % 1);
      const py = n.y + (hub.y - n.y) * ((t * 0.25 + i * 0.12) % 1);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 134, 255, ${intensity * pulse})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(90, 168, 255, ${0.25 + intensity * 0.5})`;
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 134, 255, ${0.25 + intensity * 0.55})`;
    ctx.fill();
    ctx.strokeStyle = "#0086ff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawSecurity(canvas, intensity, t) {
    if (!canvas || intensity < 0.01) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.48;
    // shield
    ctx.beginPath();
    ctx.moveTo(cx, cy - 70 * intensity);
    ctx.lineTo(cx + 58 * intensity, cy - 40 * intensity);
    ctx.lineTo(cx + 50 * intensity, cy + 30 * intensity);
    ctx.quadraticCurveTo(cx, cy + 78 * intensity, cx - 50 * intensity, cy + 30 * intensity);
    ctx.lineTo(cx - 58 * intensity, cy - 40 * intensity);
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 134, 255, ${0.08 + intensity * 0.18})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(0, 134, 255, ${0.35 + intensity * 0.55})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    // lock
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 10 * intensity, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = `rgba(0, 134, 255, ${0.2 + intensity * 0.5})`;
    ctx.fillRect(cx - 14 * intensity, cy - 8, 28 * intensity, 24 * intensity);
    // sealed packets bouncing off
    for (let i = 0; i < 5; i++) {
      const ang = t * 0.7 + i * 1.2;
      const r = 100 + i * 8;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 100, ${0.25 + (1 - intensity) * 0.2})`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cx + Math.cos(ang) * 62 * intensity, cy + Math.sin(ang) * 40 * intensity);
      ctx.strokeStyle = `rgba(255, 120, 120, ${0.2 * intensity})`;
      ctx.stroke();
    }
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
