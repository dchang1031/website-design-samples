/**
 * Option 2 — theme toggle + scroll wash + Apple-style reveals + value story + oneapi stage.
 */
(() => {
  ensureStylesheet("/src/option2-value-story.css");
  ensureStylesheet("/src/option2-hero-tweaks.css");
  injectOneApiStageMarkup();
  initThemeToggle();
  initScrollWash();
  initReveals();
  initScaleExpand();
  initValueStory();
  initOneApiStage();
})();

function ensureStylesheet(href) {
  if (document.querySelector(`link[href*="${href.split("/").pop()}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectOneApiStageMarkup() {
  if (document.querySelector("[data-oneapi-stage]")) return;

  const oneapiSection = document.querySelector('[data-section="oneapi"]');
  if (!oneapiSection) return;

  // Prefer replacing the static image area inside the section
  const imgWrap = oneapiSection.querySelector(".mt-\\[30px\\], [class*=\"mt-[30px]\"], .lg\\:mt-\\[72px\\]")
    || oneapiSection.querySelector("img")?.parentElement;

  const stage = document.createElement("div");
  stage.className = "oneapi-stage";
  stage.setAttribute("data-oneapi-stage", "");
  stage.innerHTML = `
    <div class="oneapi-stage__sticky">
      <div class="oneapi-stage__canvas-wrap">
        <canvas class="oneapi-stage__canvas" data-oneapi-canvas></canvas>
        <div class="oneapi-stage__video" data-oneapi-video aria-hidden="true">
          <div class="product-ui" data-product-ui>
            <div class="product-ui__bar">
              <span class="product-ui__dot"></span>
              <span class="product-ui__dot"></span>
              <span class="product-ui__dot"></span>
              <span class="product-ui__title">TokenRouter Console</span>
            </div>
            <div class="product-ui__body">
              <div class="product-ui__nav">
                <div class="product-ui__nav-item is-active">Models</div>
                <div class="product-ui__nav-item">API Keys</div>
                <div class="product-ui__nav-item">Usage</div>
                <div class="product-ui__nav-item">Billing</div>
              </div>
              <div class="product-ui__main">
                <div class="product-ui__row">
                  <strong style="font-size:13px">openai/gpt-5.6-sol</strong>
                  <span class="product-ui__badge">live</span>
                  <span class="product-ui__metric">12.4k tok/min</span>
                </div>
                <div class="product-ui__row">
                  <strong style="font-size:13px">anthropic/claude-fable-5</strong>
                  <span class="product-ui__badge">live</span>
                  <span class="product-ui__metric">8.1k tok/min</span>
                </div>
                <div class="product-ui__row">
                  <strong style="font-size:13px">x-ai/grok-4.5</strong>
                  <span class="product-ui__badge">live</span>
                  <span class="product-ui__metric">6.7k tok/min</span>
                </div>
                <div class="product-ui__row">
                  <strong style="font-size:13px">google/gemini-3.5-flash</strong>
                  <span class="product-ui__badge">live</span>
                  <span class="product-ui__metric">15.2k tok/min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (imgWrap) {
    // Hide original images, insert stage after the text block
    oneapiSection.querySelectorAll("img").forEach((img) => {
      img.setAttribute("data-oneapi-static", "");
      img.style.display = "none";
    });
    imgWrap.parentElement?.insertBefore(stage, imgWrap);
    imgWrap.style.display = "none";
  } else {
    oneapiSection.appendChild(stage);
  }
}

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

function initValueStory() {
  const root = document.querySelector("[data-value-story]");
  if (!root) return;

  let headline = root.querySelector("[data-story-headline]");
  if (headline) {
    headline.innerHTML = `
      <span class="value-story__headline-line">
        <span class="value-story__word value-story__word--accent" data-word="0">One</span>
        <span class="value-story__word" data-word="1">TokenRouter</span>
      </span>
      <span class="value-story__headline-line">
        <span class="value-story__word value-story__word--accent" data-word="2">All</span>
        <span class="value-story__word" data-word="3">Models</span>
      </span>
    `;
  }

  root.querySelectorAll(".value-story__panels").forEach((el) => el.remove());

  const words = [...root.querySelectorAll("[data-word]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wordCount = words.length || 4;

  if (reduce) {
    root.style.setProperty("--hl-opacity", "1");
    words.forEach((w) => w.style.setProperty("--word-lit", "1"));
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

  function progressFor() {
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    return clamp(-rect.top / total, 0, 1);
  }

  function apply(p) {
    const wordEnd = 0.55;
    words.forEach((el, i) => {
      const start = (i / wordCount) * wordEnd;
      const end = ((i + 1) / wordCount) * wordEnd;
      const lit = segment(p, start, end) >= 0.5 ? 1 : 0;
      el.style.setProperty("--word-lit", String(lit));
    });

    const hlOut = segment(p, 0.72, 0.92);
    root.style.setProperty("--hl-opacity", (1 - hlOut).toFixed(4));
    root.style.setProperty("--hl-y", `${(hlOut * -36).toFixed(2)}px`);
    root.style.setProperty("--hl-scale", (1 - hlOut * 0.06).toFixed(4));
    root.style.setProperty("--hl-blur", `${(hlOut * 6).toFixed(2)}px`);
    root.style.setProperty("--scrub", `${(p * 100).toFixed(2)}%`);
  }

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

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function initOneApiStage() {
  const stage = document.querySelector("[data-oneapi-stage]");
  if (!stage) return;

  const canvas = stage.querySelector("[data-oneapi-canvas]");
  const videoFrame = stage.querySelector("[data-oneapi-video]");

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function progressFor() {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    return clamp(-rect.top / total, 0, 1);
  }

  let animT = 0;
  let scrolling = false;
  let scrollTimeout = null;

  function markScroll() {
    scrolling = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrolling = false;
    }, 140);
  }

  function sizeCanvas() {
    if (!canvas) return null;
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

  function draw(p, t) {
    const sized = sizeCanvas();
    if (!sized) return;
    const { ctx, w, h } = sized;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const accent = "0, 134, 255";
    const isDark = document.body.dataset.theme === "dark" || document.body.classList.contains("theme-liquid--dark");
    const textRgb = isDark ? "232, 238, 248" : "18, 19, 23";

    const linePhase = smoothstep(0, 0.32, p);
    const fadeOthers = smoothstep(0.32, 0.58, p);
    const zoomPhase = smoothstep(0.5, 0.88, p);
    const showVideo = smoothstep(0.72, 0.94, p);

    const leftApps = [
      { label: "OpenClaw", y: 0.2 },
      { label: "OpenCode", y: 0.38 },
      { label: "Codex", y: 0.56 },
      { label: "Claude Code", y: 0.74 },
    ];
    const rightApps = [
      { label: "Cherry Studio", y: 0.2 },
      { label: "Cursor", y: 0.38 },
      { label: "Continue", y: 0.56 },
      { label: "Your Apps", y: 0.74 },
    ];

    const othersAlpha = 1 - fadeOthers;
    const hubR = 30;

    leftApps.forEach((app, i) => {
      const x0 = w * 0.1;
      const y0 = h * app.y;
      const dashOffset = (t * 48 + i * 14) % 20;
      ctx.save();
      ctx.globalAlpha = Math.max(0, othersAlpha * linePhase);
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(x0 + 10, y0);
      ctx.quadraticCurveTo(w * 0.3, y0, cx - hubR - 6, cy);
      ctx.strokeStyle = `rgba(${accent}, 0.6)`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(x0, y0, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent}, 0.18)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent}, 0.75)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.font = "500 12px 'PP Neue Montreal', system-ui, sans-serif";
      ctx.fillStyle = `rgba(${textRgb}, ${0.8 * othersAlpha})`;
      ctx.fillText(app.label, x0 + 14, y0 + 4);
      ctx.restore();
    });

    rightApps.forEach((app, i) => {
      const x1 = w * 0.9;
      const y1 = h * app.y;
      const dashOffset = (t * 48 + i * 14) % 20;
      ctx.save();
      ctx.globalAlpha = Math.max(0, othersAlpha * linePhase);
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(cx + hubR + 6, cy);
      ctx.quadraticCurveTo(w * 0.7, y1, x1 - 10, y1);
      ctx.strokeStyle = `rgba(${accent}, 0.6)`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(x1, y1, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent}, 0.18)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent}, 0.75)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.font = "500 12px 'PP Neue Montreal', system-ui, sans-serif";
      ctx.fillStyle = `rgba(${textRgb}, ${0.8 * othersAlpha})`;
      ctx.textAlign = "right";
      ctx.fillText(app.label, x1 - 14, y1 + 4);
      ctx.textAlign = "left";
      ctx.restore();
    });

    // Hub zoom
    ctx.save();
    const scale = 1 + zoomPhase * 2.2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent}, ${0.12 + zoomPhase * 0.3})`;
    ctx.fill();
    ctx.strokeStyle = "#0086ff";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.font = "600 12px 'PP Neue Montreal', system-ui, sans-serif";
    ctx.fillStyle = "#0086ff";
    ctx.textAlign = "center";
    ctx.fillText("TokenRouter", cx, cy + 4);
    ctx.textAlign = "left";
    ctx.restore();

    if (videoFrame) {
      videoFrame.style.opacity = String(showVideo);
      videoFrame.style.pointerEvents = showVideo > 0.5 ? "auto" : "none";
      videoFrame.style.transform = `scale(${0.88 + showVideo * 0.12})`;
      if (showVideo > 0.55) videoFrame.classList.add("is-playing");
      else videoFrame.classList.remove("is-playing");
    }

    if (canvas) canvas.style.opacity = String(Math.max(0, 1 - showVideo));
  }

  function loop(ts) {
    animT = ts * 0.001;
    draw(progressFor(), scrolling ? animT : animT * 0.12);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
  window.addEventListener("scroll", markScroll, { passive: true });
  window.addEventListener("resize", markScroll, { passive: true });
}
