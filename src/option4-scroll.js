/**
 * Option 4 — scroll-scrubbed line drawings.
 * 1) Horizontal single-stroke key centered in the One API section
 * 2) Upward trend line behind enterprise cards
 * Progress freezes when idle; rewinds when scrolling back.
 */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const claim = document.querySelector('[data-scroll-anchor="claim"]');
  const cards = document.querySelector('[data-scroll-anchor="enterprise-cards"]');
  const oneapi = document.querySelector('[data-scroll-section="oneapi"]');
  const enterprise = document.querySelector('[data-scroll-section="enterprise"]');
  if (!claim || !cards || !oneapi || !enterprise) return;

  oneapi.classList.add("o4-draw-host");
  enterprise.classList.add("o4-draw-host");

  const keyWrap = document.createElement("div");
  keyWrap.className = "o4-draw-layer";
  keyWrap.setAttribute("aria-hidden", "true");
  keyWrap.innerHTML = `
    <svg class="o4-draw o4-draw--key" viewBox="0 0 1100 400" preserveAspectRatio="xMidYMid meet">
      <!-- Continuous stroke: outer bow → bottom shaft + teeth → tip → top shaft → inner bow -->
      <path class="o4-draw__path" data-key-path pathLength="1"
        d="M 248 130
           C 248 36, 52 36, 52 200
           C 52 364, 248 364, 248 270
           L 760 270
           L 760 340
           L 818 340
           L 818 270
           L 878 270
           L 878 364
           L 948 364
           L 948 270
           L 1005 270
           L 1068 200
           L 1005 130
           L 248 130
           L 248 160
           C 248 100, 108 100, 108 200
           C 108 300, 248 300, 248 240" />
    </svg>
  `;
  oneapi.appendChild(keyWrap);

  const trendWrap = document.createElement("div");
  trendWrap.className = "o4-draw-layer";
  trendWrap.setAttribute("aria-hidden", "true");
  trendWrap.innerHTML = `
    <svg class="o4-draw o4-draw--trend" viewBox="0 0 960 480" preserveAspectRatio="xMidYMid meet">
      <!-- Chart frame -->
      <path class="o4-draw__axis" d="M 70 40 V 420 H 900" />
      <path class="o4-draw__grid" d="M 70 340 H 900 M 70 260 H 900 M 70 180 H 900 M 70 100 H 900" />
      <!-- Rising line-chart series ending in an arrow tip -->
      <path class="o4-draw__path" data-trend-path pathLength="1"
        d="M 95 390
           L 210 350
           L 320 355
           L 430 275
           L 545 245
           L 655 155
           L 770 125
           L 860 55
           L 800 78
           M 860 55
           L 818 115" />
    </svg>
  `;
  enterprise.appendChild(trendWrap);

  const keySvg = keyWrap.querySelector(".o4-draw--key");
  const trendSvg = trendWrap.querySelector(".o4-draw--trend");
  const keyPath = keyWrap.querySelector("[data-key-path]");
  const trendPath = trendWrap.querySelector("[data-trend-path]");

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;

  const state = { key: 0, trend: 0 };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function mapRange(value, inMin, inMax) {
    if (inMax === inMin) return 0;
    return clamp((value - inMin) / (inMax - inMin), 0, 1);
  }

  function scrubEl(el, enter = 0.92, exit = 0.2) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    return mapRange(rect.top, vh * enter, vh * exit - rect.height * 0.15);
  }

  /** Draw while scrolling through the One API section (visible around section center). */
  function scrubOneApi() {
    const rect = oneapi.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // 0 when section top is near lower viewport; 1 when section is well into view
    const start = vh * 0.78;
    const end = vh * 0.12 - Math.min(rect.height, vh) * 0.35;
    return mapRange(rect.top, start, end);
  }

  function layout() {
    const oneRect = oneapi.getBoundingClientRect();
    keySvg.style.top = `${oneRect.height / 2}px`;
    keySvg.style.left = "50%";
    keySvg.style.width = "min(1360px, 96%)";
    keySvg.style.transform = "translate(-50%, -50%)";

    const entRect = enterprise.getBoundingClientRect();
    const cardsRect = cards.getBoundingClientRect();
    const trendTop = cardsRect.top - entRect.top + cardsRect.height * 0.42;
    const trendLeft = cardsRect.left - entRect.left + cardsRect.width / 2;
    trendSvg.style.top = `${trendTop}px`;
    trendSvg.style.left = `${trendLeft}px`;
    trendSvg.style.width = `${Math.min(cardsRect.width * 0.92, 1040)}px`;
    trendSvg.style.transform = "translate(-50%, -50%)";
  }

  function measure() {
    keyPath.style.strokeDasharray = "1";
    trendPath.style.strokeDasharray = "1";
    keyPath.style.strokeDashoffset = "1";
    trendPath.style.strokeDashoffset = "1";
  }

  function applyVisuals() {
    const keyT = state.key;
    const trendT = state.trend;
    keySvg.style.opacity = keyT > 0.01 ? "1" : "0";
    trendSvg.style.opacity = trendT > 0.01 ? "1" : "0";
    keyPath.style.strokeDashoffset = String(1 - keyT);
    trendPath.style.strokeDashoffset = String(1 - trendT);
  }

  function scrubTargets() {
    return {
      key: scrubOneApi(),
      trend: scrubEl(cards, 0.95, 0.16),
    };
  }

  function onFrame() {
    ticking = false;
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollVelocity = scrollVelocity * 0.78 + Math.abs(dy) * 0.22;

    if (scrollVelocity > 0.08) {
      layout();
      Object.assign(state, scrubTargets());
      applyVisuals();
    }
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onFrame);
    }
  }

  function idleLoop() {
    if (scrollVelocity > 0.01) {
      scrollVelocity *= 0.86;
      if (scrollVelocity > 0.08) requestTick();
    }
    requestAnimationFrame(idleLoop);
  }

  measure();
  layout();
  Object.assign(state, scrubTargets());
  applyVisuals();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      measure();
      layout();
      Object.assign(state, scrubTargets());
      applyVisuals();
    },
    { passive: true }
  );
  requestAnimationFrame(idleLoop);
})();

/**
 * Option 4 — multi-layer hero parallax on white background.
 * Each shape moves at a different rate as the page scrolls.
 */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stage = document.querySelector("[data-hero-parallax]");
  const hero = document.querySelector(".tr-landing-hero-section");
  if (!stage) return;

  const layers = [...stage.querySelectorAll("[data-parallax-speed]")].map((el) => ({
    el,
    speed: Number(el.dataset.parallaxSpeed) || 0.2,
    driftX: Number(el.dataset.parallaxX) || 0,
  }));
  if (!layers.length) return;

  let ticking = false;
  let latestY = window.scrollY;

  const paint = () => {
    ticking = false;
    const y = latestY;
    // Amplify motion while the hero is in view, then ease off.
    let boost = 1;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroTravel = Math.max(rect.height, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / heroTravel));
      boost = 1 + progress * 0.85;
    }
    for (const layer of layers) {
      const ty = y * layer.speed * boost;
      const tx = y * layer.driftX * boost;
      layer.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    }
  };

  const onScroll = () => {
    latestY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  };

  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
