/**
 * Option 3 — Global Route
 * World-map hero, sticky chapters, policy playground.
 */

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Equirectangular project lon/lat → canvas */
function project(lon, lat, w, h, pad = 0.08) {
  const x = ((lon + 180) / 360) * w * (1 - pad * 2) + w * pad;
  const y = ((90 - lat) / 180) * h * (1 - pad * 2) + h * pad * 0.6;
  return { x, y };
}

const CITIES = [
  { name: "San Francisco", lon: -122.4, lat: 37.8, rpm: "18.2k", model: "GPT-4o" },
  { name: "New York", lon: -74.0, lat: 40.7, rpm: "22.1k", model: "Claude 3.5" },
  { name: "São Paulo", lon: -46.6, lat: -23.5, rpm: "6.4k", model: "Gemini 1.5" },
  { name: "London", lon: -0.1, lat: 51.5, rpm: "14.8k", model: "GPT-4o" },
  { name: "Frankfurt", lon: 8.7, lat: 50.1, rpm: "11.3k", model: "Claude 3.5" },
  { name: "Dubai", lon: 55.3, lat: 25.2, rpm: "5.1k", model: "DeepSeek" },
  { name: "Mumbai", lon: 72.9, lat: 19.1, rpm: "9.7k", model: "Gemini 1.5" },
  { name: "Singapore", lon: 103.8, lat: 1.3, rpm: "12.6k", model: "GPT-4o" },
  { name: "Tokyo", lon: 139.7, lat: 35.7, rpm: "16.4k", model: "Claude 3.5" },
  { name: "Seoul", lon: 126.9, lat: 37.5, rpm: "8.9k", model: "GPT-4o" },
  { name: "Sydney", lon: 151.2, lat: -33.9, rpm: "4.8k", model: "Gemini 1.5" },
  { name: "Toronto", lon: -79.4, lat: 43.7, rpm: "7.2k", model: "GPT-4o" },
];

/* Simplified continent outlines (lon/lat rings) — stylized, not geographic-accurate */
const CONTINENTS = [
  // North America
  [
    [-168, 71], [-140, 69], [-130, 55], [-124, 48], [-120, 34], [-110, 24],
    [-97, 16], [-87, 21], [-80, 25], [-74, 40], [-70, 45], [-60, 47],
    [-55, 53], [-60, 60], [-80, 72], [-120, 72], [-150, 70], [-168, 71],
  ],
  // South America
  [
    [-81, 12], [-70, 12], [-60, 5], [-50, -5], [-40, -10], [-35, -20],
    [-40, -30], [-55, -40], [-70, -50], [-75, -40], [-72, -20], [-78, -5], [-81, 12],
  ],
  // Europe
  [
    [-10, 36], [-9, 44], [-5, 48], [0, 51], [5, 53], [10, 55], [20, 55],
    [30, 60], [30, 70], [20, 70], [5, 62], [-5, 58], [-10, 52], [-10, 43], [-10, 36],
  ],
  // Africa
  [
    [-17, 32], [-10, 32], [0, 30], [10, 32], [25, 32], [35, 28], [40, 15],
    [42, 0], [40, -10], [35, -25], [20, -35], [15, -30], [10, -15], [0, 5],
    [-10, 5], [-15, 15], [-17, 25], [-17, 32],
  ],
  // Asia
  [
    [30, 70], [40, 65], [50, 55], [60, 45], [70, 40], [80, 30], [90, 25],
    [100, 20], [110, 25], [120, 35], [130, 45], [140, 50], [145, 60],
    [140, 70], [100, 75], [70, 72], [45, 70], [30, 70],
  ],
  // SE Asia / Australia
  [
    [110, 5], [120, 5], [130, -10], [140, -15], [150, -20], [153, -30],
    [145, -38], [135, -35], [120, -30], [115, -20], [110, -5], [110, 5],
  ],
];

function initReveals() {
  const nodes = document.querySelectorAll(".sig-reveal");
  if (!nodes.length) return;
  if (prefersReducedMotion()) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

/* ── World map hero ─────────────────────────────────────────── */
function initWorldMap() {
  const canvas = document.getElementById("globe-canvas");
  const tip = document.getElementById("globe-tip");
  const tipName = tip?.querySelector("[data-tip-name]");
  const tipMeta = tip?.querySelector("[data-tip-meta]");
  const feed = document.querySelector("[data-live-feed]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const mono = document.body.classList.contains("theme-mono");
  const palette = mono
    ? {
        grid: "rgba(10,10,10,0.08)",
        landFill: "rgba(10,10,10,0.04)",
        landStroke: "rgba(10,10,10,0.22)",
        atmosphere: "rgba(0,134,255,0.06)",
        hub: "rgba(0,134,255,0.14)",
        arc: "0, 134, 255",
        packetA: "0, 134, 255",
        packetB: "0, 102, 204",
        city: "#0086ff",
        cityGlow: "rgba(0,134,255,",
        clear: "#ffffff",
      }
    : {
        grid: "rgba(255,255,255,0.035)",
        landFill: "rgba(77, 124, 255, 0.06)",
        landStroke: "rgba(92, 239, 255, 0.12)",
        atmosphere: "rgba(77, 124, 255, 0.12)",
        hub: "rgba(92, 239, 255, 0.2)",
        arc: "92, 239, 255",
        packetA: "92, 239, 255",
        packetB: "77, 124, 255",
        city: "#5cefff",
        cityGlow: "rgba(92, 239, 255,",
        clear: null,
      };

  let w = 0;
  let h = 0;
  let raf = 0;
  let hover = -1;
  let packets = [];
  let pulseT = 0;
  let lastFeed = 0;
  let feedIdx = 0;
  const hub = { lon: -40, lat: 25 }; // Atlantic “control plane” bias — abstract

  const routes = CITIES.map((c, i) => ({
    from: c,
    to: CITIES[(i + 3) % CITIES.length],
    phase: Math.random(),
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawContinents() {
    ctx.save();
    CONTINENTS.forEach((ring) => {
      ctx.beginPath();
      ring.forEach(([lon, lat], i) => {
        const p = project(lon, lat, w, h);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = palette.landFill;
      ctx.fill();
      ctx.strokeStyle = palette.landStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 30) {
      const a = project(lon, 80, w, h);
      const b = project(lon, -60, w, h);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 80; lat += 20) {
      const a = project(-170, lat, w, h);
      const b = project(170, lat, w, h);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function arcPoints(a, b, steps = 48) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lon = a.lon + (b.lon - a.lon) * t;
      const lat = a.lat + (b.lat - a.lat) * t;
      const lift = Math.sin(Math.PI * t) * (8 + Math.hypot(b.lon - a.lon, b.lat - a.lat) * 0.08);
      const p = project(lon, lat + lift * 0.15, w, h);
      p.y -= Math.sin(Math.PI * t) * 28;
      pts.push(p);
    }
    return pts;
  }

  function drawArc(pts, alpha = 0.25, width = 1.2) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = `rgba(${palette.arc}, ${alpha})`;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function spawnPacket() {
    const r = routes[Math.floor(Math.random() * routes.length)];
    packets.push({
      pts: arcPoints(r.from, r.to),
      t: 0,
      speed: 0.006 + Math.random() * 0.008,
      hue: Math.random() > 0.5 ? "cyan" : "blue",
    });
  }

  function nearestCity(mx, my) {
    let best = -1;
    let bestD = 28;
    CITIES.forEach((c, i) => {
      const p = project(c.lon, c.lat, w, h);
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  function tick(ts) {
    pulseT = ts;
    if (palette.clear) {
      ctx.fillStyle = palette.clear;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    const g = ctx.createRadialGradient(w * 0.62, h * 0.42, 0, w * 0.62, h * 0.42, w * 0.55);
    g.addColorStop(0, palette.atmosphere);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    drawGrid();
    drawContinents();

    const hubPt = project(hub.lon, hub.lat, w, h);
    const hg = ctx.createRadialGradient(hubPt.x, hubPt.y, 0, hubPt.x, hubPt.y, 90);
    hg.addColorStop(0, palette.hub);
    hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(hubPt.x - 90, hubPt.y - 90, 180, 180);

    CITIES.forEach((c, i) => {
      const pts = arcPoints(c, hub);
      const active = i === hover;
      drawArc(pts, active ? 0.7 : 0.12, active ? 2 : 1);
    });

    routes.forEach((r) => {
      drawArc(arcPoints(r.from, r.to), 0.08, 1);
    });

    if (!prefersReducedMotion() && packets.length < 18 && Math.random() < 0.08) {
      spawnPacket();
    }
    packets = packets.filter((p) => {
      p.t += p.speed;
      if (p.t >= 1) return false;
      const idx = Math.min(p.pts.length - 1, Math.floor(p.t * (p.pts.length - 1)));
      const pt = p.pts[idx];
      const color = p.hue === "cyan" ? palette.packetA : palette.packetB;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.95)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.12)`;
      ctx.fill();
      return true;
    });

    CITIES.forEach((c, i) => {
      const p = project(c.lon, c.lat, w, h);
      const beat = 0.55 + Math.sin(ts * 0.004 + i) * 0.35;
      const on = i === hover;
      ctx.beginPath();
      ctx.arc(p.x, p.y, on ? 18 : 10 + beat * 4, 0, Math.PI * 2);
      ctx.fillStyle = on ? `${palette.cityGlow}0.22)` : `${palette.cityGlow}${0.08 + beat * 0.06})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, on ? 4.5 : 2.8, 0, Math.PI * 2);
      ctx.fillStyle = on ? (mono ? "#0a0a0a" : "#fff") : palette.city;
      ctx.fill();
    });

    if (feed && ts - lastFeed > 2400) {
      const c = CITIES[feedIdx % CITIES.length];
      feed.innerHTML = `<strong>${c.name}</strong> · ${c.rpm} req/min · via ${c.model}`;
      feed.classList.remove("is-swap");
      void feed.offsetWidth;
      feed.classList.add("is-swap");
      feedIdx += 1;
      lastFeed = ts;
    }

    raf = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hover = nearestCity(mx, my);
    if (hover >= 0 && tip && tipName && tipMeta) {
      const c = CITIES[hover];
      const p = project(c.lon, c.lat, w, h);
      tip.style.left = `${p.x}px`;
      tip.style.top = `${p.y}px`;
      tipName.textContent = c.name;
      tipMeta.innerHTML = `<span>${c.rpm}</span> req/min · routed via ${c.model}`;
      tip.classList.add("is-on");
    } else {
      tip?.classList.remove("is-on");
    }
  }

  function onLeave() {
    hover = -1;
    tip?.classList.remove("is-on");
  }

  resize();
  for (let i = 0; i < 8; i++) spawnPacket();
  raf = requestAnimationFrame(tick);

  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(tick);
  });
}

/* ── Sticky chapter sync ────────────────────────────────────── */
function initChapters() {
  const stickyTitle = document.querySelector("[data-chapter-title]");
  const stickyText = document.querySelector("[data-chapter-text]");
  const stickyIndex = document.querySelector("[data-chapter-index]");
  const cards = [...document.querySelectorAll("[data-chapter]")];
  const mini = document.getElementById("chapter-canvas");
  if (!cards.length || !stickyTitle) return;

  let active = 0;

  function paintMini(idx) {
    if (!mini) return;
    const ctx = mini.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = mini.clientWidth;
    const h = mini.clientHeight;
    mini.width = w * dpr;
    mini.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const modes = ["token", "route", "connect"];
    const mode = modes[idx] || "token";
    const t = performance.now() * 0.001;

    if (mode === "token") {
      for (let i = 0; i < 18; i++) {
        const x = 30 + i * 14;
        const y = h / 2 + Math.sin(t * 2 + i * 0.4) * 28;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 87, ${0.4 + (i % 3) * 0.2})`;
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,200,87,0.25)";
      ctx.beginPath();
      ctx.moveTo(24, h / 2);
      for (let i = 0; i < 18; i++) {
        ctx.lineTo(30 + i * 14, h / 2 + Math.sin(t * 2 + i * 0.4) * 28);
      }
      ctx.stroke();
    } else if (mode === "route") {
      const nodes = [
        { x: 40, y: h * 0.3 },
        { x: 40, y: h * 0.7 },
        { x: w * 0.5, y: h * 0.5 },
        { x: w - 40, y: h * 0.25 },
        { x: w - 40, y: h * 0.55 },
        { x: w - 40, y: h * 0.8 },
      ];
      const activePath = Math.floor(t) % 3;
      [[0, 2, 3], [1, 2, 4], [0, 2, 5]].forEach((path, pi) => {
        ctx.beginPath();
        path.forEach((ni, i) => {
          const n = nodes[ni];
          if (i === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        });
        ctx.strokeStyle = pi === activePath ? "rgba(92,239,255,0.85)" : "rgba(255,255,255,0.12)";
        ctx.lineWidth = pi === activePath ? 2 : 1;
        ctx.stroke();
      });
      nodes.forEach((n, i) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, i === 2 ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 2 ? "#5cefff" : "#4d7cff";
        ctx.fill();
      });
      const path = [[0, 2, 3], [1, 2, 4], [0, 2, 5]][activePath];
      const u = t % 1;
      const segs = path.length - 1;
      const seg = Math.min(segs - 1, Math.floor(u * segs));
      const local = u * segs - seg;
      const a = nodes[path[seg]];
      const b = nodes[path[seg + 1]];
      const px = a.x + (b.x - a.x) * local;
      const py = a.y + (b.y - a.y) * local;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    } else {
      for (let i = 0; i < 7; i++) {
        const x = 40 + i * ((w - 80) / 6);
        ctx.beginPath();
        ctx.moveTo(x, 24);
        ctx.lineTo(x, h - 24);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, h / 2 + Math.sin(t + i) * 20, 5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? "#5cefff" : "#4d7cff";
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(92,239,255,0.35)";
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const x = 40 + i * ((w - 80) / 6);
        const y = h / 2 + Math.sin(t + i) * 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (!prefersReducedMotion()) requestAnimationFrame(() => paintMini(active));
  }

  function setActive(i) {
    active = i;
    cards.forEach((c, n) => c.classList.toggle("is-active", n === i));
    const card = cards[i];
    stickyIndex.textContent = card.dataset.index || `0${i + 1}`;
    stickyTitle.textContent = card.dataset.title || "";
    stickyText.textContent = card.dataset.blurb || "";
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx = cards.indexOf(e.target);
        if (idx >= 0) setActive(idx);
      });
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0.1 }
  );
  cards.forEach((c) => io.observe(c));
  setActive(0);
  paintMini(0);
  window.addEventListener("resize", () => paintMini(active));
}

/* ── Policy playground ──────────────────────────────────────── */
function initPolicy() {
  const root = document.querySelector("[data-policy]");
  if (!root) return;
  const canvas = root.querySelector("canvas");
  const buttons = [...root.querySelectorAll("[data-policy-btn]")];
  const mLat = root.querySelector("[data-m-lat]");
  const mCost = root.querySelector("[data-m-cost]");
  const mModel = root.querySelector("[data-m-model]");
  if (!canvas || !buttons.length) return;

  const policies = [
    { id: "speed", lat: "96ms", cost: "$0.0018", model: "Gemini 1.5", color: "#5cefff" },
    { id: "quality", lat: "142ms", cost: "$0.0042", model: "Claude 3.5", color: "#4d7cff" },
    { id: "budget", lat: "118ms", cost: "$0.0011", model: "DeepSeek", color: "#ffc857" },
  ];
  let active = 0;
  let packets = [];
  let raf = 0;
  let w = 0;
  let h = 0;

  const ctx = canvas.getContext("2d");

  function size() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function apply(i) {
    active = i;
    buttons.forEach((b, n) => b.classList.toggle("is-active", n === i));
    const p = policies[i];
    if (mLat) mLat.textContent = p.lat;
    if (mCost) mCost.textContent = p.cost;
    if (mModel) mModel.textContent = p.model;
    packets = [];
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const p = policies[active];
    const left = [
      { x: 70, y: h * 0.28, label: "App" },
      { x: 70, y: h * 0.5, label: "SDK" },
      { x: 70, y: h * 0.72, label: "Worker" },
    ];
    const hub = { x: w * 0.42, y: h * 0.48 };
    const right = [
      { x: w - 90, y: h * 0.25, label: "Gemini" },
      { x: w - 90, y: h * 0.48, label: "Claude" },
      { x: w - 90, y: h * 0.71, label: "DeepSeek" },
    ];
    const target = active;

    left.forEach((n) => {
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.quadraticCurveTo((n.x + hub.x) / 2, n.y - 20, hub.x, hub.y);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.stroke();
    });
    right.forEach((n, i) => {
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.quadraticCurveTo((hub.x + n.x) / 2, n.y + 10, n.x, n.y);
      ctx.strokeStyle = i === target ? p.color : "rgba(255,255,255,0.1)";
      ctx.lineWidth = i === target ? 2 : 1;
      ctx.stroke();
    });

    const drawNode = (n, fill, big = false) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, big ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.fillStyle = "rgba(243,246,251,0.85)";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText(n.label, n.x - 18, n.y + 28);
    };
    left.forEach((n) => drawNode(n, "#4d7cff"));
    drawNode({ ...hub, label: "TokenRouter" }, p.color, true);
    right.forEach((n, i) => drawNode(n, i === target ? p.color : "rgba(255,255,255,0.25)"));

    if (!prefersReducedMotion() && Math.random() < 0.12) {
      const src = left[Math.floor(Math.random() * left.length)];
      packets.push({ stage: 0, t: 0, src, speed: 0.02 + Math.random() * 0.015 });
    }
    packets = packets.filter((pk) => {
      pk.t += pk.speed;
      let x;
      let y;
      if (pk.stage === 0) {
        const t = Math.min(1, pk.t);
        x = pk.src.x + (hub.x - pk.src.x) * t;
        y = pk.src.y + (hub.y - pk.src.y) * t - Math.sin(Math.PI * t) * 24;
        if (pk.t >= 1) {
          pk.stage = 1;
          pk.t = 0;
        }
      } else {
        const dest = right[target];
        const t = Math.min(1, pk.t);
        x = hub.x + (dest.x - hub.x) * t;
        y = hub.y + (dest.y - hub.y) * t - Math.sin(Math.PI * t) * 20;
        if (pk.t >= 1) return false;
      }
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      return true;
    });

    raf = requestAnimationFrame(frame);
  }

  buttons.forEach((b, i) => b.addEventListener("click", () => apply(i)));
  size();
  apply(0);
  raf = requestAnimationFrame(frame);
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(frame);
  });
}

function initCounters() {
  const nodes = document.querySelectorAll("[data-count]");
  if (!nodes.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = el.getAttribute("data-count") || "0";
        const numeric = parseFloat(target.replace(/[^0-9.]/g, "")) || 0;
        const isPct = target.includes("%");
        const suffix = el.getAttribute("data-suffix") || (isPct ? "%" : "");
        if (prefersReducedMotion()) {
          el.textContent = target;
          io.unobserve(el);
          return;
        }
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1100);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = numeric * eased;
          el.textContent = Number.isInteger(numeric)
            ? `${Math.round(val).toLocaleString()}${suffix}`
            : `${val.toFixed(1)}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  nodes.forEach((n) => io.observe(n));
}

document.addEventListener("DOMContentLoaded", () => {
  initReveals();
  initWorldMap();
  initChapters();
  initPolicy();
  initCounters();
});
