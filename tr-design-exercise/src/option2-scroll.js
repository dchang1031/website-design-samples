/**
 * Option 2 — theme, wash, reveals, value story (letter-by-letter),
 * rotating tagline, One API stage (logos + growing rectangular hub → demo).
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
  initTaglineRotate();
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

  const imgWrap =
    oneapiSection.querySelector("img")?.parentElement || null;

  const stage = document.createElement("div");
  stage.className = "oneapi-stage";
  stage.setAttribute("data-oneapi-stage", "");
  stage.innerHTML = `
    <div class="oneapi-stage__sticky">
      <div class="oneapi-stage__canvas-wrap">
        <canvas class="oneapi-stage__canvas" data-oneapi-canvas></canvas>
        <div class="oneapi-stage__hub" data-oneapi-hub>
          <img class="oneapi-stage__hub-logo" src="/assets/logo-without-title-8.png" alt="" width="22" height="22" />
          <span class="oneapi-stage__hub-label">TokenRouter</span>
          <div class="oneapi-stage__demo" data-oneapi-demo aria-hidden="true">
            <div class="product-ui" data-product-ui>
              <div class="product-ui__bar">
                <span class="product-ui__dot"></span>
                <span class="product-ui__dot"></span>
                <span class="product-ui__dot"></span>
                <span class="product-ui__title">TokenRouter Console</span>
              </div>
              <div class="product-ui__body">
                <div class="product-ui__nav">
                  <div class="product-ui__nav-item is-active" data-nav="0">Models</div>
                  <div class="product-ui__nav-item" data-nav="1">API Keys</div>
                  <div class="product-ui__nav-item" data-nav="2">Usage</div>
                  <div class="product-ui__nav-item" data-nav="3">Billing</div>
                </div>
                <div class="product-ui__main">
                  <div class="product-ui__cursor" data-ui-cursor></div>
                  <div class="product-ui__row" data-row="0">
                    <strong style="font-size:13px">openai/gpt-5.6-sol</strong>
                    <span class="product-ui__badge">live</span>
                    <span class="product-ui__metric" data-metric>12.4k tok/min</span>
                  </div>
                  <div class="product-ui__row" data-row="1">
                    <strong style="font-size:13px">anthropic/claude-fable-5</strong>
                    <span class="product-ui__badge">live</span>
                    <span class="product-ui__metric" data-metric>8.1k tok/min</span>
                  </div>
                  <div class="product-ui__row" data-row="2">
                    <strong style="font-size:13px">x-ai/grok-4.5</strong>
                    <span class="product-ui__badge">live</span>
                    <span class="product-ui__metric" data-metric>6.7k tok/min</span>
                  </div>
                  <div class="product-ui__row" data-row="3">
                    <strong style="font-size:13px">google/gemini-3.5-flash</strong>
                    <span class="product-ui__badge">live</span>
                    <span class="product-ui__metric" data-metric>15.2k tok/min</span>
                  </div>
                  <div class="product-ui__stream" data-stream></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (imgWrap) {
    oneapiSection.querySelectorAll("img").forEach((img) => {
      if (!img.closest("[data-oneapi-stage]")) {
        img.setAttribute("data-oneapi-static", "");
        img.style.display = "none";
      }
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
    return clamp(-rect.top / total, 0, 1);
  }

  function apply(block, p) {
    const frame = block.querySelector("[data-scale-frame]");
    if (!frame) return;
    const e = reduce ? 1 : p * p * (3 - 2 * p);
    frame.style.setProperty("--scale-inset", `${(1 - e) * 28}px`);
    frame.style.setProperty("--scale-radius", `${(1 - e) * 24}px`);
    frame.style.setProperty("--scale-border", String((1 - e) * 0.14));
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

/** Letter-by-letter value story; unlit = transparent white; One/All accent when lit */
function initValueStory() {
  const root = document.querySelector("[data-value-story]");
  if (!root) return;

  const headline = root.querySelector("[data-story-headline]");
  if (headline) {
    const lines = [
      [
        { text: "One", accent: true },
        { text: "TokenRouter", accent: false },
      ],
      [
        { text: "All", accent: true },
        { text: "Models", accent: false },
      ],
    ];

    let letterIndex = 0;
    headline.innerHTML = lines
      .map(
        (line) =>
          `<span class="value-story__headline-line">` +
          line
            .map((word) => {
              const letters = [...word.text]
                .map((ch) => {
                  const i = letterIndex++;
                  const acc = word.accent ? " value-story__letter--accent" : "";
                  return `<span class="value-story__letter${acc}" data-letter="${i}">${ch}</span>`;
                })
                .join("");
              return `<span class="value-story__word">${letters}</span>`;
            })
            .join("") +
          `</span>`
      )
      .join("");
  }

  root.querySelectorAll(".value-story__panels, .value-story__scrub").forEach((el) => el.remove());

  const letters = [...root.querySelectorAll("[data-letter]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const letterCount = letters.length || 1;

  if (reduce) {
    letters.forEach((el) => el.classList.add("is-lit"));
    return;
  }

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function progressFor() {
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    return clamp(-rect.top / total, 0, 1);
  }

  function apply(p) {
    const letterEnd = 0.62;
    letters.forEach((el, i) => {
      const start = (i / letterCount) * letterEnd;
      const end = ((i + 0.85) / letterCount) * letterEnd;
      const lit = smoothstep(start, end, p) >= 0.45;
      el.classList.toggle("is-lit", lit);
      el.style.setProperty("--letter-lit", lit ? "1" : "0");
    });

    const hlOut = smoothstep(0.78, 0.95, p);
    root.style.setProperty("--hl-opacity", (1 - hlOut * 0.35).toFixed(4));
    root.style.setProperty("--hl-y", `${(hlOut * -24).toFixed(2)}px`);
    root.style.setProperty("--hl-scale", (1 - hlOut * 0.04).toFixed(4));
    root.style.setProperty("--hl-blur", `${(hlOut * 4).toFixed(2)}px`);
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

/** Faster → Better → Cheaper, one large word at a time */
function initTaglineRotate() {
  const tagline = document.querySelector(".tr-landing-hero-tagline");
  if (!tagline) return;

  const words = ["Faster", "Better", "Cheaper"];
  tagline.innerHTML = words
    .map(
      (w, i) =>
        `<span data-rotate-word="${i}"${i === 0 ? ' class="is-active"' : ""}>${w}</span>`
    )
    .join("");

  const els = [...tagline.querySelectorAll("[data-rotate-word]")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("is-active"));
    return;
  }

  let idx = 0;
  setInterval(() => {
    els[idx].classList.remove("is-active");
    idx = (idx + 1) % els.length;
    els[idx].classList.add("is-active");
  }, 2200);
}

/**
 * One API: dashed lines + logo+name nodes → rectangular hub grows to fill
 * wrap and reveals looping animated product console (not a static screenshot).
 */
function initOneApiStage() {
  const stage = document.querySelector("[data-oneapi-stage]");
  if (!stage) return;

  const canvas = stage.querySelector("[data-oneapi-canvas]");
  const hub = stage.querySelector("[data-oneapi-hub]");
  const demo = stage.querySelector("[data-oneapi-demo]");
  const wrap = stage.querySelector(".oneapi-stage__canvas-wrap");

  const apps = [
    { label: "OpenClaw", side: "left", y: 0.2, color: "#6366f1", icon: "/assets/clawith.png" },
    { label: "OpenCode", side: "left", y: 0.38, color: "#10a37f", icon: "/assets/models/openai.svg" },
    { label: "Codex", side: "left", y: 0.56, color: "#111111", icon: "/assets/models/openai.svg" },
    { label: "Claude Code", side: "left", y: 0.74, color: "#d97757", icon: "/assets/models/claude-color.svg" },
    { label: "Cherry Studio", side: "right", y: 0.2, color: "#ec4899", icon: "/assets/fellou.png" },
    { label: "Cursor", side: "right", y: 0.38, color: "#3b82f6", icon: "/assets/models/xai.svg" },
    { label: "Continue", side: "right", y: 0.56, color: "#8b5cf6", icon: "/assets/models/gemini-color.svg" },
    { label: "Your Apps", side: "right", y: 0.74, color: "#0ea5e9", icon: "/assets/logo-without-title-8.png" },
  ];

  const iconCache = {};
  apps.forEach((app) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = app.icon;
    img.onload = () => {
      iconCache[app.label] = img;
    };
  });

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
  let demoStarted = false;

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

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function draw(p, t) {
    const sized = sizeCanvas();
    if (!sized) return;
    const { ctx, w, h } = sized;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const accent = "0, 134, 255";
    const isDark =
      document.body.dataset.theme === "dark" ||
      document.body.classList.contains("theme-liquid--dark");
    const textRgb = isDark ? "232, 238, 248" : "18, 19, 23";

    const linePhase = smoothstep(0, 0.28, p);
    const fadeOthers = smoothstep(0.3, 0.55, p);
    const grow = smoothstep(0.48, 0.82, p);
    const showDemo = smoothstep(0.72, 0.9, p);
    const othersAlpha = 1 - fadeOthers;

    // Hub geometry for line endpoints (before full expand)
    const hubW = 160 + grow * (w - 160);
    const hubH = 56 + grow * (h - 56);
    const hubLeft = cx - hubW / 2;
    const hubTop = cy - hubH / 2;

    apps.forEach((app, i) => {
      const isLeft = app.side === "left";
      const x0 = isLeft ? w * 0.08 : w * 0.92;
      const y0 = h * app.y;
      const targetX = isLeft ? hubLeft : hubLeft + hubW;
      const targetY = cy;
      const dashOffset = (t * 48 + i * 14) % 20;

      ctx.save();
      ctx.globalAlpha = Math.max(0, othersAlpha * linePhase);

      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(isLeft ? x0 + 36 : x0 - 36, y0);
      ctx.quadraticCurveTo(isLeft ? w * 0.28 : w * 0.72, y0, targetX, targetY);
      ctx.strokeStyle = `rgba(${accent}, 0.55)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Logo chip + name
      const chip = 28;
      const chipX = isLeft ? x0 : x0 - chip;
      const chipY = y0 - chip / 2;
      drawRoundedRect(ctx, chipX, chipY, chip, chip, 7);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      if (isDark) ctx.fillStyle = "rgba(30,40,58,0.95)";
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent}, 0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const icon = iconCache[app.label];
      if (icon) {
        try {
          ctx.drawImage(icon, chipX + 5, chipY + 5, 18, 18);
        } catch (_) {
          /* tainted */
        }
      } else {
        ctx.fillStyle = app.color;
        ctx.beginPath();
        ctx.arc(chipX + chip / 2, chipY + chip / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = "500 12px 'PP Neue Montreal', system-ui, sans-serif";
      ctx.fillStyle = `rgba(${textRgb}, ${0.85 * othersAlpha})`;
      if (isLeft) {
        ctx.textAlign = "left";
        ctx.fillText(app.label, chipX + chip + 8, y0 + 4);
      } else {
        ctx.textAlign = "right";
        ctx.fillText(app.label, chipX - 8, y0 + 4);
      }
      ctx.textAlign = "left";
      ctx.restore();
    });

    // Drive DOM hub size — rectangular grow replaces canvas stage
    if (hub && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const baseW = 160;
      const baseH = 56;
      const targetW = wrapRect.width;
      const targetH = wrapRect.height;
      const curW = baseW + (targetW - baseW) * grow;
      const curH = baseH + (targetH - baseH) * grow;
      const radius = 12 + (20 - 12) * (1 - grow) + grow * 0; // stay slightly rounded then match wrap

      hub.style.width = `${curW}px`;
      hub.style.height = `${curH}px`;
      hub.style.borderRadius = `${12 * (1 - grow) + 20 * Math.min(grow, 0.15)}px`;
      if (grow > 0.98) {
        hub.style.width = "100%";
        hub.style.height = "100%";
        hub.style.left = "0";
        hub.style.top = "0";
        hub.style.transform = "none";
        hub.style.borderRadius = "20px";
      } else {
        hub.style.left = "50%";
        hub.style.top = "50%";
        hub.style.transform = "translate(-50%, -50%)";
      }

      hub.classList.toggle("is-expanded", grow > 0.55);
      hub.classList.toggle("is-demo", showDemo > 0.5);

      if (demo) {
        demo.setAttribute("aria-hidden", showDemo > 0.5 ? "false" : "true");
      }

      if (canvas) {
        canvas.style.opacity = String(Math.max(0, 1 - grow * 1.15));
      }

      if (showDemo > 0.55 && !demoStarted) {
        demoStarted = true;
        startProductDemo(stage);
      }
    }
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

/** Looping console demo: nav highlight, metric ticks, stream text, cursor */
function startProductDemo(stage) {
  const root = stage.querySelector("[data-product-ui]");
  if (!root || root.dataset.demoRunning) return;
  root.dataset.demoRunning = "1";

  const navItems = [...root.querySelectorAll("[data-nav]")];
  const rows = [...root.querySelectorAll("[data-row]")];
  const metrics = [...root.querySelectorAll("[data-metric]")];
  const stream = root.querySelector("[data-stream]");
  const cursor = root.querySelector("[data-ui-cursor]");

  const base = [12.4, 8.1, 6.7, 15.2];
  let navIdx = 0;
  let rowIdx = 0;
  let streamLines = [
    "> route openai/gpt-5.6-sol  latency 42ms",
    "> cache hit  63%   cost −18%",
    "> failover → anthropic/claude-fable-5",
  ];
  let streamPtr = 0;
  let streamChar = 0;

  function tickMetrics() {
    metrics.forEach((el, i) => {
      const n = base[i] + (Math.random() - 0.4) * 1.8;
      el.textContent = `${n.toFixed(1)}k tok/min`;
    });
  }

  function cycleNav() {
    navItems.forEach((el) => el.classList.remove("is-active"));
    navIdx = (navIdx + 1) % navItems.length;
    navItems[navIdx].classList.add("is-active");
  }

  function flashRow() {
    rows.forEach((el) => el.classList.remove("is-flash"));
    rowIdx = (rowIdx + 1) % rows.length;
    rows[rowIdx].classList.add("is-flash");
    if (cursor && rows[rowIdx]) {
      const r = rows[rowIdx].getBoundingClientRect();
      const parent = rows[rowIdx].offsetParent || root.querySelector(".product-ui__main");
      const pr = parent.getBoundingClientRect();
      cursor.style.left = `${r.left - pr.left + 24}px`;
      cursor.style.top = `${r.top - pr.top + r.height / 2 - 5}px`;
    }
  }

  function typeStream() {
    if (!stream) return;
    const line = streamLines[streamPtr % streamLines.length];
    streamChar += 1;
    const shown = line.slice(0, streamChar);
    const prev =
      streamPtr === 0
        ? ""
        : streamLines
            .slice(Math.max(0, streamPtr - 2), streamPtr)
            .map((l) => l)
            .join("\n") + (streamPtr > 0 ? "\n" : "");
    stream.innerHTML = (prev + shown)
      .replace(/>/g, '<span class="tok">></span>')
      .replace(/\n/g, "<br/>");
    if (streamChar >= line.length) {
      streamChar = 0;
      streamPtr += 1;
    }
  }

  setInterval(tickMetrics, 900);
  setInterval(cycleNav, 3200);
  setInterval(flashRow, 1600);
  setInterval(typeStream, 45);
  tickMetrics();
  flashRow();
}
