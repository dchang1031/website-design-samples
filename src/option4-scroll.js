/**
 * Option 4 — scroll-scrubbed storytelling animations.
 * Progress follows scroll (forward/back). Values freeze when idle.
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
      <path class="o4-connector__path" fill="none" stroke="url(#o4-arrow-grad)" stroke-width="3" stroke-linecap="round" marker-end="url(#o4-arrowhead)"/>
      <circle class="o4-connector__ring" fill="none" stroke="#1a4dff" stroke-width="2.5"/>
    </svg>
    <div class="o4-emoji o4-emoji--key">
      <span class="o4-emoji__glyph">🔑</span>
    </div>
    <div class="o4-emoji o4-emoji--chart">
      <span class="o4-emoji__glyph">📊</span>
      <svg class="o4-chart-line" viewBox="0 0 120 80" aria-hidden="true">
        <path class="o4-chart-line__track" d="M8 68 C 28 66, 36 52, 48 40 S 78 18, 112 10" fill="none"/>
        <path class="o4-chart-line__draw" d="M8 68 C 28 66, 36 52, 48 40 S 78 18, 112 10" fill="none"/>
      </svg>
    </div>
  `;
  document.body.appendChild(layer);

  const svg = layer.querySelector(".o4-connector");
  const path = layer.querySelector(".o4-connector__path");
  const ring = layer.querySelector(".o4-connector__ring");
  const keyEl = layer.querySelector(".o4-emoji--key");
  const chartEl = layer.querySelector(".o4-emoji--chart");
  const chartDraw = layer.querySelector(".o4-chart-line__draw");

  let pathLength = 1;
  let ringLength = 1;
  let chartLength = 1;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;

  // Scrubbed progress values (0–1); only refresh while scrolling
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
    // 0 while Always-On still near mid-viewport; 1 when Trusted By is near center
    const startY = from.top + from.height * 0.5;
    const endY = to.top + to.height * 0.5;
    // Use how far we've scrolled the midpoint from start toward end relative to viewport
    const start = vh * 0.72;
    const end = vh * 0.38;
    // Blend: progress grows as `from` leaves and `to` arrives
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
    // approximate ellipse perimeter
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
      rotateY(${(-28 + keyT * 220).toFixed(2)}deg)
      rotateX(${(12 - keyT * 18).toFixed(2)}deg)
      scale(${(0.72 + keyT * 0.45).toFixed(3)})
    `;
    keyEl.classList.toggle("is-active", keyVisible);

    const chartT = state.chart;
    const chartVisible = chartT > 0.02 && chartT < 0.98;
    chartEl.style.opacity = chartVisible ? String(clamp(Math.sin(chartT * Math.PI) * 1.15, 0, 1)) : "0";
    chartEl.style.transform = `
      translate3d(-50%, -50%, 0)
      rotateY(${(18 - chartT * 36).toFixed(2)}deg)
      rotateX(${(8 + chartT * 10).toFixed(2)}deg)
      scale(${(0.78 + chartT * 0.35).toFixed(3)})
    `;
    chartEl.classList.toggle("is-active", chartVisible);
    chartDraw.style.strokeDashoffset = `${chartLength * (1 - chartT)}`;
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

    // Only advance scrubbed values while the user is actively scrolling
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

  // Keep velocity decay so idle freezes even without scroll events
  function idleLoop() {
    if (scrollVelocity > 0.01) {
      scrollVelocity *= 0.86;
      if (scrollVelocity <= 0.15) {
        // freeze — do not update state
      } else {
        requestTick();
      }
    }
    requestAnimationFrame(idleLoop);
  }

  measureChart();
  updateConnectorGeometry();
  // Seed initial (usually zeros at top)
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
