/**
 * Option 3 — Signal Lattice motion system
 * Hero mesh, live routing board, scroll reveals, step cycling.
 */

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  const nodes = document.querySelectorAll(".sig-reveal");
  if (!nodes.length) return;

  if (prefersReducedMotion()) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((n) => io.observe(n));
}

/* ── Hero canvas mesh ───────────────────────────────────────── */
function initHeroMesh() {
  const canvas = document.getElementById("sig-hero-canvas");
  if (!canvas || prefersReducedMotion()) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let raf = 0;
  let nodes = [];
  let packets = [];
  let mouse = { x: -9999, y: -9999 };
  const statusEl = document.querySelector("[data-hero-route]");

  const NODE_COUNT = 52;
  const LINK_DIST = 150;
  const routeLabels = [
    "GPT-4o · US-East",
    "Claude 3.5 · US-West",
    "Gemini 1.5 · EU",
    "DeepSeek · APAC",
  ];
  let routeIdx = 0;
  let lastRouteSwap = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.2 + Math.random() * 1.8,
      pulse: Math.random() * Math.PI * 2,
    }));
    packets = Array.from({ length: 12 }, () => makePacket());
  }

  function makePacket() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    return {
      from: a,
      to: b,
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.009,
      hue: Math.random() > 0.45 ? "cyan" : "blue",
    };
  }

  function tick(ts) {
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createRadialGradient(w * 0.55, h * 0.38, 0, w * 0.55, h * 0.38, w * 0.72);
    g.addColorStop(0, "rgba(92, 225, 255, 0.05)");
    g.addColorStop(0.55, "rgba(79, 124, 255, 0.03)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.022;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 18000) {
        n.vx += dx * 0.000025;
        n.vy += dy * 0.000025;
      }
      n.vx *= 0.994;
      n.vy *= 0.994;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.38;
          ctx.strokeStyle = `rgba(92, 225, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const glow = 0.45 + Math.sin(n.pulse) * 0.25;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 247, 251, ${0.55 + glow * 0.25})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(92, 225, 255, ${0.05 + glow * 0.07})`;
      ctx.fill();
    }

    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      if (!p.from || !p.to) {
        packets[i] = makePacket();
        continue;
      }
      p.t += p.speed;
      if (p.t >= 1) {
        packets[i] = makePacket();
        continue;
      }
      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;
      const color = p.hue === "cyan" ? "92, 225, 255" : "79, 124, 255";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.95)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.12)`;
      ctx.fill();
    }

    if (statusEl && ts - lastRouteSwap > 2800) {
      routeIdx = (routeIdx + 1) % routeLabels.length;
      statusEl.textContent = routeLabels[routeIdx];
      lastRouteSwap = ts;
    }

    raf = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  resize();
  seed();
  raf = requestAnimationFrame(tick);

  window.addEventListener("resize", () => {
    resize();
    seed();
  });
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(tick);
  });
}

/* ── Live routing board ─────────────────────────────────────── */
function initRoutingBoard() {
  const board = document.querySelector("[data-route-board]");
  if (!board) return;

  const svg = board.querySelector(".sig-route__svg");
  const packetLayer = board.querySelector("[data-route-packets]");
  const log = board.querySelector("[data-route-log]");
  const latencyEl = document.querySelector("[data-metric-latency]");
  const costEl = document.querySelector("[data-metric-cost]");
  const routeEl = document.querySelector("[data-metric-route]");
  const hub = board.querySelector(".sig-route__node--hub");
  const models = [...board.querySelectorAll("[data-model-node]")];
  const apps = [...board.querySelectorAll("[data-app-node]")];

  if (!svg || !packetLayer || !hub || models.length < 3 || apps.length < 3) return;

  const routes = [
    { model: 0, app: 0, name: "GPT-4o", latency: "142ms", cost: "$0.0042", label: "Balanced · US-East" },
    { model: 1, app: 1, name: "Claude 3.5", latency: "118ms", cost: "$0.0031", label: "Quality · US-West" },
    { model: 2, app: 2, name: "Gemini 1.5", latency: "96ms", cost: "$0.0018", label: "Speed · EU-Central" },
  ];

  function centerOf(el) {
    const br = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - br.left + r.width / 2,
      y: r.top - br.top + r.height / 2,
    };
  }

  function curve(a, b, bend) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 + bend;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  let pathEls = [];
  let active = 0;
  let packets = [];
  let lastSpawn = 0;
  let lastSwitch = 0;
  let boardW = 0;
  let boardH = 0;

  function rebuildPaths() {
    const rect = board.getBoundingClientRect();
    boardW = rect.width;
    boardH = rect.height;
    svg.setAttribute("viewBox", `0 0 ${boardW} ${boardH}`);
    svg.innerHTML = "";
    pathEls = [];

    const hubPt = centerOf(hub);
    routes.forEach((r, i) => {
      const m = centerOf(models[r.model]);
      const a = centerOf(apps[r.app]);
      const d = `${curve(m, hubPt, (i - 1) * 18)} ${curve(hubPt, a, (i - 1) * -14).replace("M", "L")}`;
      // Better: two path segments
      const dIn = curve(m, hubPt, (i - 1) * 22);
      const dOut = curve(hubPt, a, (i - 1) * -18);

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.dataset.route = String(i);

      [dIn, dOut].forEach((pathD) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("class", "sig-route-path");
        if (i === active) path.classList.add("is-active");
        g.appendChild(path);
      });

      svg.appendChild(g);
      pathEls.push({
        group: g,
        paths: [...g.querySelectorAll("path")],
        lengths: [...g.querySelectorAll("path")].map((p) => p.getTotalLength()),
        route: r,
      });
    });
  }

  function setActive(index) {
    active = index;
    pathEls.forEach((item, i) => {
      item.paths.forEach((p) => p.classList.toggle("is-active", i === active));
    });
    models.forEach((n, i) => n.classList.toggle("is-lit", i === routes[active].model));
    apps.forEach((n, i) => n.classList.toggle("is-lit", i === routes[active].app));
    hub.classList.add("is-lit");

    const r = routes[active];
    if (latencyEl) latencyEl.textContent = r.latency;
    if (costEl) costEl.textContent = r.cost;
    if (routeEl) routeEl.textContent = r.label;
    if (log) {
      const line = document.createElement("div");
      line.className = "sig-route-log__line is-new";
      line.innerHTML = `<span>→</span> Routed to <strong>${r.name}</strong> · ${r.latency} · ${r.cost}`;
      log.prepend(line);
      while (log.children.length > 4) log.lastElementChild?.remove();
    }
  }

  function spawnPacket() {
    const item = pathEls[active];
    if (!item) return;
    // travel along both segments sequentially
    const el = document.createElement("div");
    el.className = "sig-packet";
    packetLayer.appendChild(el);
    packets.push({
      el,
      item,
      seg: 0,
      t: 0,
      speed: 0.012 + Math.random() * 0.008,
    });
  }

  function frame(ts) {
    if (!lastSpawn) lastSpawn = ts;
    if (!lastSwitch) lastSwitch = ts;

    if (!prefersReducedMotion()) {
      if (ts - lastSpawn > 480) {
        spawnPacket();
        lastSpawn = ts;
      }
      if (ts - lastSwitch > 3400) {
        setActive((active + 1) % routes.length);
        lastSwitch = ts;
      }
    }

    packets = packets.filter((p) => {
      p.t += p.speed;
      const path = p.item.paths[p.seg];
      const len = p.item.lengths[p.seg];
      if (!path || !len) {
        p.el.remove();
        return false;
      }
      if (p.t >= 1) {
        if (p.seg < p.item.paths.length - 1) {
          p.seg += 1;
          p.t = 0;
        } else {
          p.el.remove();
          return false;
        }
      }
      const pt = path.getPointAtLength(len * Math.min(p.t, 1));
      p.el.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
      return true;
    });

    requestAnimationFrame(frame);
  }

  rebuildPaths();
  setActive(0);

  window.addEventListener("resize", () => {
    rebuildPaths();
    setActive(active);
  });

  models.forEach((node, i) => {
    node.style.cursor = "pointer";
    node.addEventListener("click", () => {
      const idx = routes.findIndex((r) => r.model === i);
      if (idx >= 0) {
        setActive(idx);
        lastSwitch = performance.now();
      }
    });
  });

  if (!prefersReducedMotion()) requestAnimationFrame(frame);
}

/* ── Step cycling ───────────────────────────────────────────── */
function initSteps() {
  const root = document.querySelector("[data-sig-steps]");
  if (!root) return;

  const steps = [...root.querySelectorAll("[data-step]")];
  if (!steps.length) return;

  let index = 0;
  let timer = null;

  function show(i) {
    index = i;
    steps.forEach((s, n) => s.classList.toggle("is-active", n === index));
  }

  function next() {
    show((index + 1) % steps.length);
  }

  steps.forEach((s, i) => {
    s.addEventListener("click", () => {
      show(i);
      restart();
    });
  });

  function restart() {
    if (timer) clearInterval(timer);
    if (!prefersReducedMotion()) timer = setInterval(next, 3800);
  }

  show(0);
  restart();
}

/* ── Card mouse glow ────────────────────────────────────────── */
function initCardGlow() {
  document.querySelectorAll("[data-glow]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ── Counter ticks ──────────────────────────────────────────── */
function initCounters() {
  const nodes = document.querySelectorAll("[data-count]");
  if (!nodes.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = el.getAttribute("data-count") || "0";
        const isMoney = target.includes("$");
        const isPct = target.includes("%");
        const numeric = parseFloat(target.replace(/[^0-9.]/g, "")) || 0;
        const suffix = el.getAttribute("data-suffix") || "";
        const prefix = isMoney ? "$" : "";
        const endSuffix = isPct ? "%" : suffix;

        if (prefersReducedMotion()) {
          el.textContent = target;
          io.unobserve(el);
          return;
        }

        const start = performance.now();
        const dur = 1200;
        function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = numeric * eased;
          if (isMoney) el.textContent = `${prefix}${val.toFixed(4)}${endSuffix}`;
          else if (Number.isInteger(numeric)) el.textContent = `${prefix}${Math.round(val).toLocaleString()}${endSuffix}`;
          else el.textContent = `${prefix}${val.toFixed(1)}${endSuffix}`;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
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
  initHeroMesh();
  initRoutingBoard();
  initSteps();
  initCardGlow();
  initCounters();
});
