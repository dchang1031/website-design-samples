/**
 * Option 4 — scroll-scrubbed storytelling animations.
 * Progress follows scroll (forward/back). Values freeze when idle.
 * Key + chart props use iridescent glass geometry (not emoji).
 */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const routing = document.querySelector('[data-scroll-anchor="routing"]');
  const trusted = document.querySelector('[data-scroll-anchor="trusted"]');
  const oneapi = document.querySelector('[data-scroll-section="oneapi"]');
  const enterprise = document.querySelector('[data-scroll-section="enterprise"]');
  if (!routing || !trusted || !oneapi || !enterprise) return;

  const layer = document.createElement("div");
  layer.className = "o4-stage";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <svg class="o4-connector" viewBox="0 0 1 1" preserveAspectRatio="none">
      <defs>
        <linearGradient id="o4-arrow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a4dff"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
        <marker id="o4-arrowhead" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#1a4dff"/>
        </marker>
      </defs>
      <path class="o4-connector__path" fill="none" stroke="url(#o4-arrow-grad)" stroke-width="3" stroke-linecap="round"/>
      <ellipse class="o4-connector__ring" fill="none" stroke="#1a4dff" stroke-width="2.5"/>
    </svg>

    <div class="o4-prop o4-prop--key">
      <div class="o4-prop__scene">
        <div class="o4-key">
          <div class="o4-key__ring"></div>
          <div class="o4-key__bow o4-glass">
            <div class="o4-key__bow-hole"></div>
          </div>
          <div class="o4-key__shaft o4-glass">
            <div class="o4-key__core"></div>
          </div>
          <div class="o4-key__tooth o4-key__tooth--1 o4-glass"></div>
          <div class="o4-key__tooth o4-key__tooth--2 o4-glass"></div>
          <div class="o4-key__flake o4-key__flake--a o4-glass"></div>
          <div class="o4-key__flake o4-key__flake--b o4-glass"></div>
        </div>
      </div>
    </div>

    <div class="o4-prop o4-prop--chart">
      <div class="o4-prop__scene">
        <div class="o4-chart">
          <div class="o4-chart__base"></div>
          <div class="o4-chart__slab o4-glass"></div>
          <div class="o4-chart__bars">
            <div class="o4-chart__bar o4-chart__bar--1 o4-glass"></div>
            <div class="o4-chart__bar o4-chart__bar--2 o4-glass"></div>
            <div class="o4-chart__bar o4-chart__bar--3 o4-glass"></div>
          </div>
          <svg class="o4-chart__line" viewBox="0 0 120 80" aria-hidden="true">
            <defs>
              <linearGradient id="o4-chart-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#8b7cff"/>
                <stop offset="55%" stop-color="#5ec8ff"/>
                <stop offset="100%" stop-color="#ffd27a"/>
              </linearGradient>
            </defs>
            <path class="o4-chart__line-track" d="M8 68 C 28 66, 36 52, 48 40 S 78 18, 112 10"/>
            <path class="o4-chart__line-draw" d="M8 68 C 28 66, 36 52, 48 40 S 78 18, 112 10"/>
          </svg>
          <div class="o4-chart__orb"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(layer);

  const svg = layer.querySelector(".o4-connector");
  const path = layer.querySelector(".o4-connector__path");
  const ring = layer.querySelector(".o4-connector__ring");
  const keyEl = layer.querySelector(".o4-prop--key");
  const chartEl = layer.querySelector(".o4-prop--chart");
  const chartDraw = layer.querySelector(".o4-chart__line-draw");
  const bars = [...layer.querySelectorAll(".o4-chart__bar")];

  let pathLength = 1;
  let ringLength = 1;
  let chartLength = 1;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;

  const state = {
    arrow: 0,
    key: 0,
    chart: 0,
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function mapRange(value, inMin, inMax) {
    if (inMax === inMin) return 0;
    return clamp((value - inMin) / (inMax - inMin), 0, 1);
  }

  function sectionScrub(el, enter = 0.85, exit = 0.15) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const start = vh * enter;
    const end = vh * exit - rect.height * 0.2;
    return mapRange(rect.top, start, end);
  }

  function arrowProgress() {
    const from = routing.getBoundingClientRect();
    const to = trusted.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const startY = from.top + from.height * 0.5;
    const endY = to.top + to.height * 0.5;
    const start = vh * 0.72;
    const end = vh * 0.38;
    const leave = mapRange(startY, start, vh * 0.18);
    const arrive = mapRange(endY, vh * 0.92, end);
    return clamp(leave * 0.45 + arrive * 0.55, 0, 1);
  }

  function updateConnectorGeometry() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));

    const a = routing.getBoundingClientRect();
    const b = trusted.getBoundingClientRect();
    const x1 = a.left + a.width * 0.5;
    const y1 = a.top + a.height * 0.5;
    const x2 = b.left + b.width * 0.5;
    const y2 = b.top + b.height * 0.5;
    const midY = (y1 + y2) / 2;
    const curve = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    path.setAttribute("d", curve);
    pathLength = path.getTotalLength() || 1;
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const rx = Math.max(b.width * 0.72, 70);
    const ry = Math.max(b.height * 1.35, 36);
    ring.setAttribute("cx", String(x2));
    ring.setAttribute("cy", String(y2));
    ring.setAttribute("rx", String(rx));
    ring.setAttribute("ry", String(ry));
    ringLength = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    ring.style.strokeDasharray = `${ringLength}`;
    ring.style.strokeDashoffset = `${ringLength}`;
  }

  function applyVisuals() {
    const arrowT = state.arrow;
    const drawT = clamp(arrowT / 0.72, 0, 1);
    const ringT = clamp((arrowT - 0.55) / 0.45, 0, 1);

    path.style.strokeDashoffset = `${pathLength * (1 - drawT)}`;
    ring.style.strokeDashoffset = `${ringLength * (1 - ringT)}`;
    path.style.opacity = drawT > 0.02 ? "1" : "0";
    if (drawT > 0.08) path.setAttribute("marker-end", "url(#o4-arrowhead)");
    else path.removeAttribute("marker-end");
    layer.style.setProperty("--o4-arrow-opacity", arrowT > 0.02 ? "1" : "0");
    trusted.classList.toggle("o4-trusted-hot", ringT > 0.55);

    const keyT = state.key;
    const keyVisible = keyT > 0.02 && keyT < 0.98;
    keyEl.style.opacity = keyVisible ? String(clamp(Math.sin(keyT * Math.PI) * 1.15, 0, 1)) : "0";
    keyEl.style.transform = `
      translate3d(-50%, -50%, 0)
      rotateY(${(-32 + keyT * 240).toFixed(2)}deg)
      rotateX(${(14 - keyT * 20).toFixed(2)}deg)
      rotateZ(${(-8 + keyT * 12).toFixed(2)}deg)
      scale(${(0.7 + keyT * 0.48).toFixed(3)})
    `;
    keyEl.classList.toggle("is-active", keyVisible);

    const chartT = state.chart;
    const chartVisible = chartT > 0.02 && chartT < 0.98;
    chartEl.style.opacity = chartVisible ? String(clamp(Math.sin(chartT * Math.PI) * 1.15, 0, 1)) : "0";
    chartEl.style.transform = `
      translate3d(-50%, -50%, 0)
      rotateY(${(22 - chartT * 40).toFixed(2)}deg)
      rotateX(${(6 + chartT * 12).toFixed(2)}deg)
      scale(${(0.76 + chartT * 0.38).toFixed(3)})
    `;
    chartEl.classList.toggle("is-active", chartVisible);
    chartDraw.style.strokeDashoffset = `${chartLength * (1 - chartT)}`;

    // Bars rise with scroll progress (staggered)
    bars.forEach((bar, i) => {
      const local = clamp((chartT - i * 0.12) / 0.75, 0, 1);
      bar.style.setProperty("--bar-scale", (0.12 + local * 0.88).toFixed(3));
    });
  }

  function measureChart() {
    chartLength = chartDraw.getTotalLength() || 1;
    chartDraw.style.strokeDasharray = `${chartLength}`;
    chartDraw.style.strokeDashoffset = `${chartLength}`;
  }

  function scrubTargets() {
    return {
      arrow: arrowProgress(),
      key: sectionScrub(oneapi, 0.9, 0.12),
      chart: sectionScrub(enterprise, 0.9, 0.12),
    };
  }

  function onFrame() {
    ticking = false;
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollVelocity = scrollVelocity * 0.78 + Math.abs(dy) * 0.22;

    if (scrollVelocity > 0.15) {
      updateConnectorGeometry();
      const next = scrubTargets();
      state.arrow = next.arrow;
      state.key = next.key;
      state.chart = next.chart;
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

  measureChart();
  updateConnectorGeometry();
  Object.assign(state, scrubTargets());
  applyVisuals();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      updateConnectorGeometry();
      measureChart();
      Object.assign(state, scrubTargets());
      applyVisuals();
    },
    { passive: true }
  );
  requestAnimationFrame(idleLoop);
})();
