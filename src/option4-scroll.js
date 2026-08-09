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
    <svg class="o4-draw o4-draw--key" viewBox="0 0 1100 480" preserveAspectRatio="xMidYMid meet">
      <!-- Continuous stroke: outer bow → bottom shaft + teeth → tip → top shaft → inner bow (vertically tall) -->
      <path class="o4-draw__path" data-key-path
        d="M 248 150
           C 248 28, 52 28, 52 240
           C 52 452, 248 452, 248 330
           L 760 330
           L 760 418
           L 818 418
           L 818 330
           L 878 330
           L 878 448
           L 948 448
           L 948 330
           L 1005 330
           L 1068 240
           L 1005 150
           L 248 150
           L 248 188
           C 248 110, 108 110, 108 240
           C 108 370, 248 370, 248 292" />
    </svg>
  `;
  oneapi.appendChild(keyWrap);

  const trendWrap = document.createElement("div");
  trendWrap.className = "o4-draw-layer";
  trendWrap.setAttribute("aria-hidden", "true");
  trendWrap.innerHTML = `
    <svg class="o4-draw o4-draw--trend" viewBox="0 0 900 420" preserveAspectRatio="xMidYMid meet">
      <path class="o4-draw__path" data-trend-path
        d="M 40 360
           C 120 350, 160 300, 220 270
           S 320 240, 380 200
           S 480 150, 540 130
           S 660 90, 740 70
           L 860 40" />
    </svg>
  `;
  enterprise.appendChild(trendWrap);

  const keySvg = keyWrap.querySelector(".o4-draw--key");
  const trendSvg = trendWrap.querySelector(".o4-draw--trend");
  const keyPath = keyWrap.querySelector("[data-key-path]");
  const trendPath = trendWrap.querySelector("[data-trend-path]");

  let keyLength = 1;
  let trendLength = 1;
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

  function layout() {
    // Key: centered in the full One API section, wide + tall
    const oneRect = oneapi.getBoundingClientRect();
    keySvg.style.top = `${oneRect.height / 2}px`;
    keySvg.style.left = "50%";
    keySvg.style.width = "min(1360px, 96%)";
    keySvg.style.transform = "translate(-50%, -50%)";

    // Trend: centered on the feature list
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
    keyLength = keyPath.getTotalLength() || 1;
    trendLength = trendPath.getTotalLength() || 1;
    keyPath.style.strokeDasharray = `${keyLength}`;
    trendPath.style.strokeDasharray = `${trendLength}`;
    keyPath.style.strokeDashoffset = `${keyLength}`;
    trendPath.style.strokeDashoffset = `${trendLength}`;
  }

  function applyVisuals() {
    const keyT = state.key;
    const trendT = state.trend;
    keySvg.style.opacity = keyT > 0.01 ? "1" : "0";
    trendSvg.style.opacity = trendT > 0.01 ? "1" : "0";
    keyPath.style.strokeDashoffset = `${keyLength * (1 - keyT)}`;
    trendPath.style.strokeDashoffset = `${trendLength * (1 - trendT)}`;
  }

  function scrubTargets() {
    return {
      key: scrubEl(oneapi, 0.88, 0.28),
      trend: scrubEl(cards, 0.95, 0.16),
    };
  }

  function onFrame() {
    ticking = false;
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollVelocity = scrollVelocity * 0.78 + Math.abs(dy) * 0.22;

    if (scrollVelocity > 0.15) {
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
      if (scrollVelocity > 0.15) requestTick();
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
