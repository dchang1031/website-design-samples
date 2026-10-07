const NAV_H = 60;

const PLUS = [
  [6.7, 0], [6.7, 3.35], [6.7, 6.7], [6.7, 10.05], [6.7, 13.4],
  [0, 6.7], [3.35, 6.7], [10.05, 6.7], [13.4, 6.7],
];
const CROSS = [
  [0, 0], [13.4, 0],
  [3.35, 3.35], [10.05, 3.35],
  [6.7, 6.7],
  [3.35, 10.05], [10.05, 10.05],
  [0, 13.4], [13.4, 13.4],
];

function glyph(points) {
  const el = document.createElement("span");
  el.className = "glyph";
  el.setAttribute("aria-hidden", "true");
  points.forEach(([x, y], i) => {
    const dot = document.createElement("i");
    dot.style.setProperty("--x", x + "px");
    dot.style.setProperty("--y", y + "px");
    dot.style.setProperty("--i", String(i));
    el.appendChild(dot);
  });
  return el;
}

document.querySelectorAll(".dot-btn").forEach((btn) => {
  btn.appendChild(glyph(btn.hasAttribute("data-close") ? CROSS : PLUS));
});

document.querySelectorAll(".quote-mark circle").forEach((dot, i) => {
  dot.style.animationDelay = (i % 7) * 90 + "ms";
});

/* ---------- Menus ---------- */
function closeMenus(except) {
  document.querySelectorAll(".nav-item.open").forEach((item) => {
    if (item === except) return;
    item.classList.remove("open");
    item.querySelector(".pill").setAttribute("aria-expanded", "false");
    item.querySelector(".menu").hidden = true;
  });
  document.querySelectorAll(".f-acc.open").forEach((item) => {
    if (item === except) return;
    item.classList.remove("open");
    item.querySelector(".f-row").setAttribute("aria-expanded", "false");
    item.querySelector(".f-panel").hidden = true;
  });
}

document.querySelectorAll(".nav-item").forEach((item) => {
  const trigger = item.querySelector(".pill");
  const menu = item.querySelector(".menu");
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = item.classList.contains("open");
    closeMenus();
    if (!open) {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    }
  });
});

document.querySelectorAll(".f-acc").forEach((item) => {
  const trigger = item.querySelector(".f-row");
  const panel = item.querySelector(".f-panel");
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = item.classList.contains("open");
    closeMenus();
    if (!open) {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
  });
});

document.addEventListener("click", () => closeMenus());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenus();
    closeLightbox();
  }
});

/* ---------- Nav tone ---------- */
function updateNavTone() {
  const x = window.innerWidth / 2;
  const y = 28;
  const light = [...document.querySelectorAll('[data-tone="light"]')].some((el) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });
  document.getElementById("nav").classList.toggle("is-light", light);
}

/* ---------- Yellow shape ---------- */
const summary = document.getElementById("summary");
const yellow = summary.querySelector(".yellow-bg");

function updateYellow() {
  const rect = summary.getBoundingClientRect();
  const center = rect.top + rect.height / 2;
  const dist = Math.abs(center - window.innerHeight / 2);
  const range = window.innerHeight * 0.48;
  let t = 1 - Math.min(dist / range, 1);
  t = t * t * (3 - 2 * t);
  const inset = -140 + (16 + 140) * t;
  yellow.style.left = inset + "px";
  yellow.style.right = inset + "px";
  yellow.style.borderRadius = 24 * t + "px";
}

/* ---------- Letter highlight ---------- */
function splitLetters(root) {
  root.querySelectorAll(".hl").forEach((span) => {
    const text = span.textContent;
    span.textContent = "";
    [...text].forEach((ch) => {
      const node = document.createElement("span");
      node.className = "ch";
      node.textContent = ch;
      span.appendChild(node);
    });
  });
}

const scrubUpdates = [];
document.querySelectorAll("[data-scrub]").forEach((scrub) => {
  splitLetters(scrub);
  const inner = scrub.querySelector(".scrub-inner");
  const chars = [...scrub.querySelectorAll(".ch")];
  const runway = Math.min(460, Math.max(260, chars.length * 8));
  const stickTop = 96;
  const resize = () => {
    scrub.style.height = inner.offsetHeight + runway + "px";
  };
  resize();
  window.addEventListener("resize", resize);
  scrubUpdates.push(() => {
    const top = scrub.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (stickTop - top) / runway));
    const count = p >= 0.995 ? chars.length : Math.floor(p * chars.length);
    chars.forEach((ch, i) => ch.classList.toggle("on", i < count));
  });
});

/* ---------- Cards ---------- */
const points = document.getElementById("points");
let cardsPlayed = false;
function playCards() {
  if (cardsPlayed) return;
  cardsPlayed = true;
  [...points.querySelectorAll(".point")].forEach((card, i) => {
    card.style.animationDelay = i * 70 + "ms";
    card.classList.add("in");
  });
}

/* ---------- Heat field ---------- */
const heat = document.getElementById("heat-field");
let heatPlayed = false;

function playHeat(dots) {
  if (heatPlayed) return;
  heatPlayed = true;
  const yellowY = 302;
  const rest = dots.filter((d) => d.fill !== "#FFF313");
  const yellow = dots.filter((d) => d.fill === "#FFF313");
  rest.sort((a, b) => b.y - a.y || a.x - b.x);
  yellow.sort((a, b) => a.x - b.x);
  const order = rest.concat(yellow);
  const nodes = order.map((d) => {
    const node = document.createElement("i");
    node.style.left = d.x + "px";
    node.style.top = d.y + "px";
    node.style.width = d.r * 2 + "px";
    node.style.height = d.r * 2 + "px";
    node.style.background = d.fill;
    heat.appendChild(node);
    return { node, above: d.y < yellowY - 2 };
  });
  const step = 2.2;
  nodes.forEach((item, i) => {
    window.setTimeout(() => {
      item.node.style.opacity = "1";
    }, i * step);
  });
  const above = nodes.filter((item) => item.above);
  above.sort((a, b) => {
    const ay = parseFloat(a.node.style.top);
    const by = parseFloat(b.node.style.top);
    const ax = parseFloat(a.node.style.left);
    const bx = parseFloat(b.node.style.left);
    return ay - by || ax - bx;
  });
  const dimStart = nodes.length * step + 40;
  above.forEach((item, i) => {
    window.setTimeout(() => {
      item.node.style.opacity = "0.2";
    }, dimStart + i * 1.6);
  });
}

fetch("assets/heat-dots.json")
  .then((res) => res.json())
  .then((dots) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          playHeat(dots);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(document.getElementById("point-05"));
  });

const cardIO = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      playCards();
      cardIO.disconnect();
    }
  },
  { threshold: 0.12 }
);
cardIO.observe(points);

/* ---------- Vertical dividers ---------- */
function buildVLine(line) {
  line.replaceChildren();
  const height = line.parentElement.getBoundingClientRect().height || 896;
  let y = 0;
  let index = 0;
  while (y < height - 2) {
    const big = index === 0;
    const size = big ? 8 : 4;
    const dot = document.createElement("i");
    dot.style.top = (big ? y : y + 2) + "px";
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.animationDelay = index * 14 + "ms";
    line.appendChild(dot);
    y += big ? 16 : 12;
    index += 1;
  }
}

document.querySelectorAll("[data-vline]").forEach(buildVLine);

const vlineArmed = new WeakSet();
function updateVLines() {
  [
    ["title-central", "#compare-02"],
    ["title-loop", "#compare-08"],
  ].forEach(([titleId, hostId]) => {
    const title = document.getElementById(titleId);
    const host = document.querySelector(hostId);
    const line = host.querySelector("[data-vline]");
    if (vlineArmed.has(line)) return;
    if (title.getBoundingClientRect().top < NAV_H + 28) {
      vlineArmed.add(line);
      line.classList.add("play");
    }
  });
}

/* ---------- Section 04 dotted lines ---------- */
function buildBeats() {
  document.querySelectorAll("[data-beat]").forEach((beat) => {
    beat.replaceChildren();
    const width = beat.clientWidth || 180;
    let x = 0;
    let i = 0;
    while (x < width - 2) {
      const dot = document.createElement("i");
      if (i === 0) {
        dot.classList.add("big");
        dot.style.left = "0px";
        x = 14;
      } else {
        dot.style.left = x + "px";
        x += 10;
      }
      beat.appendChild(dot);
      i += 1;
    }
  });
}
buildBeats();

let beatsPlayed = false;
function playBeats() {
  if (beatsPlayed) return;
  beatsPlayed = true;
  document.querySelectorAll(".timeline").forEach((timeline) => {
    const dots = [...timeline.querySelectorAll(".beat i")];
    dots.forEach((dot, i) => {
      dot.style.animationDelay = i * 16 + "ms";
    });
  });
  document.getElementById("configs").classList.add("beats-on");
}

const beatIO = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      playBeats();
      beatIO.disconnect();
    }
  },
  { threshold: 0.6 }
);
beatIO.observe(document.getElementById("hot-spot"));

/* ---------- Chapter transitions ---------- */
const chapters = [...document.querySelectorAll(".chapter")];
const storyBg = document.querySelector(".story-bg");

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function updateChapters() {
  chapters.forEach((ch) => {
    ch.style.transform = "";
    ch.style.opacity = "";
  });
  const vh = window.innerHeight;
  const mid = vh * 0.5;
  let color = chapters[0].dataset.bg;
  for (const ch of chapters) {
    const r = ch.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) color = ch.dataset.bg;
  }
  for (let i = 0; i < chapters.length - 1; i += 1) {
    const current = chapters[i];
    const next = chapters[i + 1];
    const top = next.getBoundingClientRect().top;
    if (top < vh && top > 0) {
      const p = 1 - top / vh;
      current.style.transform = `translate3d(0, ${-p * 10}vh, 0)`;
      current.style.opacity = String(1 - p);
      next.style.transform = `translate3d(0, ${(1 - p) * 18}vh, 0)`;
      next.style.opacity = String(p);
      color = mix(current.dataset.bg, next.dataset.bg, p);
      break;
    }
  }
  storyBg.style.background = color;
}

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const slot = document.getElementById("lightbox-slot");

function openLightbox(card) {
  slot.replaceChildren();
  const clone = card.cloneNode(true);
  clone.querySelectorAll("[data-expand]").forEach((btn) => btn.remove());
  clone.style.transform = "";
  clone.style.transformOrigin = "top left";
  slot.appendChild(clone);
  const fit = () => {
    const scale = Math.min((window.innerWidth * 0.85) / 672, (window.innerHeight * 0.85) / 350);
    clone.style.transform = `scale(${scale})`;
    const stage = lightbox.querySelector(".lightbox-stage");
    stage.style.width = 672 * scale + "px";
    stage.style.height = 350 * scale + "px";
  };
  fit();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox._fit = fit;
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  slot.replaceChildren();
  document.body.classList.remove("lightbox-open");
}

document.querySelectorAll("[data-expand]").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    openLightbox(btn.closest(".diagram-card"));
  });
});
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.querySelector("[data-close]").addEventListener("click", (event) => {
  event.stopPropagation();
  closeLightbox();
});
window.addEventListener("resize", () => {
  if (!lightbox.hidden && lightbox._fit) lightbox._fit();
});

/* ---------- Scroll ---------- */
let frame = 0;
function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    updateNavTone();
    updateYellow();
    scrubUpdates.forEach((fn) => fn());
    updateVLines();
    updateChapters();
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();
