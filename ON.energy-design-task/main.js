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

/* Quote mark: pairs appear together, then dots go out one at a time. */
(function playQuote() {
  const circles = [...document.querySelectorAll(".quote-mark circle")];
  const byPlace = (a, b) => {
    const dy = parseFloat(b.getAttribute("cy")) - parseFloat(a.getAttribute("cy"));
    return dy || parseFloat(a.getAttribute("cx")) - parseFloat(b.getAttribute("cx"));
  };
  const left = circles.filter((c) => parseFloat(c.getAttribute("cx")) < 70).sort(byPlace);
  const right = circles.filter((c) => parseFloat(c.getAttribute("cx")) >= 70).sort(byPlace);
  const pairs = left.map((dot, i) => [dot, right[i]].filter(Boolean));
  const flat = pairs.flat();
  const dim = "0.12";
  flat.forEach((dot) => { dot.style.opacity = dim; });
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  async function loop() {
    for (const pair of pairs) {
      pair.forEach((dot) => { dot.style.opacity = "1"; });
      await wait(280);
    }
    await wait(640);
    for (const dot of flat) {
      dot.style.opacity = dim;
      await wait(240);
    }
    await wait(520);
    loop();
  }
  loop();
})();

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
let yellowTarget = 0;
let yellowShown = 0;

function updateYellow() {
  const rect = summary.getBoundingClientRect();
  const center = rect.top + rect.height / 2;
  const dist = Math.abs(center - window.innerHeight / 2);
  const range = window.innerHeight * 1.05;
  let t = 1 - Math.min(dist / range, 1);
  t = t * t * (3 - 2 * t);
  yellowTarget = t;
}

function paintYellow() {
  yellowShown += (yellowTarget - yellowShown) * 0.055;
  if (Math.abs(yellowTarget - yellowShown) < 0.001) yellowShown = yellowTarget;
  const inset = -140 + (16 + 140) * yellowShown;
  yellow.style.left = inset + "px";
  yellow.style.right = inset + "px";
  yellow.style.borderRadius = 24 * yellowShown + "px";
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

const STICK = 96;
const scrubs = [];
document.querySelectorAll("[data-scrub]").forEach((scrub) => {
  splitLetters(scrub);
  const inner = scrub.querySelector(".scrub-inner");
  const chars = [...scrub.querySelectorAll(".ch")];
  scrubs.push({
    inner,
    chars,
    progress: 0,
    lockY: 0,
    runway: Math.min(520, Math.max(300, chars.length * 6)),
  });
});
let scrubActive = null;

function applyScrub(scrub) {
  const count = scrub.progress >= 0.995 ? scrub.chars.length : Math.floor(scrub.progress * scrub.chars.length);
  scrub.chars.forEach((ch, i) => ch.classList.toggle("on", i < count));
}

function engageScrub(scrub, event) {
  const top = scrub.inner.getBoundingClientRect().top;
  scrub.lockY = window.scrollY + (top - STICK);
  window.scrollTo(0, scrub.lockY);
  scrubActive = scrub;
  const delta = event ? event.deltaY : 0;
  scrub.progress = Math.min(1, Math.max(0, scrub.progress + delta / scrub.runway));
  applyScrub(scrub);
}

function handleScrubWheel(event) {
  const dir = Math.sign(event.deltaY);
  if (!dir) return false;
  if (scrubActive) {
    const scrub = scrubActive;
    if (dir > 0 && scrub.progress >= 1) {
      scrubActive = null;
      return false;
    }
    if (dir < 0 && scrub.progress <= 0) {
      scrubActive = null;
      return false;
    }
    event.preventDefault();
    scrub.progress = Math.min(1, Math.max(0, scrub.progress + event.deltaY / scrub.runway));
    applyScrub(scrub);
    window.scrollTo(0, scrub.lockY);
    return true;
  }
  for (const scrub of scrubs) {
    const top = scrub.inner.getBoundingClientRect().top;
    if (dir > 0 && scrub.progress < 1 && top <= STICK + 30 && top >= STICK - 160) {
      event.preventDefault();
      engageScrub(scrub, event);
      return true;
    }
    if (dir < 0 && scrub.progress > 0 && top <= STICK + 48 && top >= STICK - 80) {
      event.preventDefault();
      engageScrub(scrub, event);
      return true;
    }
  }
  return false;
}

function catchScrub() {
  if (scrubActive) {
    window.scrollTo(0, scrubActive.lockY);
    return true;
  }
  for (const scrub of scrubs) {
    const top = scrub.inner.getBoundingClientRect().top;
    if (scrub.progress < 1 && top < STICK - 1) {
      engageScrub(scrub, null);
      return true;
    }
  }
  return false;
}

/* ---------- Cards ---------- */
const points = document.getElementById("points");
const cards = [...points.querySelectorAll(".point")];
const cardIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      if (card.classList.contains("in")) return;
      const index = cards.indexOf(card);
      card.style.animationDelay = (index % 2) * 70 + "ms";
      card.classList.add("in");
      cardIO.unobserve(card);
    });
  },
  { threshold: 0.45, rootMargin: "0px 0px -6% 0px" }
);
cards.forEach((card) => cardIO.observe(card));

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

let heatDots = null;
let card05Done = false;
function maybeHeat() {
  if (heatDots && card05Done) playHeat(heatDots);
}
document.getElementById("point-05").addEventListener("animationend", (event) => {
  if (event.animationName !== "card-in") return;
  card05Done = true;
  maybeHeat();
});
fetch("assets/heat-dots.json")
  .then((res) => res.json())
  .then((dots) => {
    heatDots = dots;
    maybeHeat();
  });

/* ---------- Vertical dividers ---------- */
function buildVLine(line) {
  const host = line.parentElement;
  const hostTop = host.getBoundingClientRect().top;
  const height = host.getBoundingClientRect().height || 896;
  const centers = [...host.querySelectorAll(".col-left .props li")].map((li) => {
    const rect = li.getBoundingClientRect();
    return rect.top - hostTop + rect.height / 2;
  });
  line.replaceChildren();
  const place = (y, size, index) => {
    const dot = document.createElement("i");
    dot.style.top = y - size / 2 + "px";
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.animationDelay = index * 14 + "ms";
    line.appendChild(dot);
  };
  let index = 0;
  centers.forEach((y) => {
    place(y, 8, index);
    index += 1;
  });
  for (let y = 4; y < height - 2; y += 12) {
    if (centers.some((center) => Math.abs(center - y) < 11)) continue;
    place(y, 4, index);
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
    if (beat.classList.contains("play")) return;
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

const beatIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const beat = entry.target;
      [...beat.querySelectorAll("i")].forEach((dot, i) => {
        dot.style.animationDelay = i * 16 + "ms";
      });
      beat.classList.add("play");
      beatIO.unobserve(beat);
    });
  },
  { threshold: 0.85 }
);
document.querySelectorAll("[data-beat]").forEach((beat) => beatIO.observe(beat));

/* ---------- Chapter transitions ---------- */
const chapters = [...document.querySelectorAll(".chapter")];
const storyBg = document.querySelector(".story-bg");

function chapterEnd(index) {
  const chapter = chapters[index];
  return chapter.offsetTop + chapter.offsetHeight - window.innerHeight;
}

let handoff = false;

function playHandoff(fromIndex, dir) {
  if (handoff) return;
  const toIndex = fromIndex + dir;
  if (toIndex < 0 || toIndex >= chapters.length) return;
  const from = chapters[fromIndex];
  const to = chapters[toIndex];
  const vh = window.innerHeight;
  const lockY = dir > 0 ? Math.max(0, chapterEnd(fromIndex)) : from.offsetTop;
  handoff = true;
  document.body.classList.add("handoff-lock");
  window.scrollTo(0, lockY);
  from.classList.add("is-back");
  to.classList.add("is-front");
  storyBg.style.transition = "background-color 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
  storyBg.style.background = to.dataset.bg;

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const dur = "700ms";
  const fromEnd = dir > 0 ? `translate3d(0, ${-vh * 0.4}px, 0)` : `translate3d(0, ${vh * 0.4}px, 0)`;
  const toStart = dir > 0 ? `translate3d(0, ${-vh * 0.5}px, 0)` : `translate3d(0, ${vh * 0.5}px, 0)`;
  const toEnd = dir > 0 ? `translate3d(0, ${-vh}px, 0)` : `translate3d(0, ${vh}px, 0)`;
  from.style.transition = "none";
  to.style.transition = "none";
  from.style.transform = "translate3d(0,0,0)";
  from.style.opacity = "1";
  to.style.opacity = "0";
  to.style.transform = toStart;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!handoff) return;
      from.style.transition = `transform ${dur} ${ease}, opacity ${dur} ${ease}`;
      to.style.transition = `transform ${dur} ${ease}, opacity ${dur} ${ease}`;
      from.style.transform = fromEnd;
      from.style.opacity = "0";
      to.style.transform = toEnd;
      to.style.opacity = "1";
    });
  });

  window.setTimeout(() => {
    const dest = dir > 0
      ? to.offsetTop
      : to.offsetTop + to.offsetHeight - window.innerHeight;
    from.style.transition = "none";
    to.style.transition = "none";
    from.style.transform = "";
    from.style.opacity = "";
    to.style.transform = "";
    to.style.opacity = "";
    from.classList.remove("is-back");
    to.classList.remove("is-front");
    document.body.classList.remove("handoff-lock");
    window.scrollTo(0, Math.max(0, dest));
    handoff = false;
  }, 860);
}

function guardChapterEdges() {
  if (handoff || scrubActive) return;
  const y = window.scrollY;
  for (let i = 0; i < chapters.length - 1; i += 1) {
    const end = chapterEnd(i);
    if (y > end + 2 && y < chapters[i + 1].offsetTop - 2) {
      window.scrollTo(0, Math.max(0, end));
      playHandoff(i, 1);
      return;
    }
  }
}

function chapterIndexAt(y) {
  let index = -1;
  chapters.forEach((chapter, i) => {
    if (y >= chapter.offsetTop - 1) index = i;
  });
  return index;
}

function handleChapterWheel(event) {
  if (handoff) {
    event.preventDefault();
    return true;
  }
  const dir = Math.sign(event.deltaY);
  if (!dir) return false;
  const index = chapterIndexAt(window.scrollY);
  if (index < 0) return false;
  if (dir > 0 && index < chapters.length - 1) {
    const end = chapterEnd(index);
    if (window.scrollY + event.deltaY > end) {
      event.preventDefault();
      window.scrollTo(0, Math.max(0, end));
      playHandoff(index, 1);
      return true;
    }
  }
  if (dir < 0 && index > 0) {
    const start = chapters[index].offsetTop;
    if (window.scrollY + event.deltaY < start) {
      event.preventDefault();
      window.scrollTo(0, start);
      playHandoff(index, -1);
      return true;
    }
  }
  return false;
}

/* ---------- Facility photo ---------- */
const photo = document.querySelector(".photo");
const photoImg = photo.querySelector("img");

function updatePhoto() {
  const rect = photo.getBoundingClientRect();
  const span = window.innerHeight + rect.height;
  const travel = span === 0 ? 0.5 : (window.innerHeight - rect.top) / span;
  const clamped = Math.max(0, Math.min(1, travel));
  const shift = (clamped - 0.5) * 140;
  photoImg.style.transform = `translate3d(0, ${shift}px, 0)`;
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
    if (handoff) return;
    if (catchScrub()) {
      updateNavTone();
      updateYellow();
      return;
    }
    guardChapterEdges();
    updateNavTone();
    updateYellow();
    updateVLines();
    updatePhoto();
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  document.querySelectorAll("[data-vline]").forEach(buildVLine);
  buildBeats();
  onScroll();
});
window.addEventListener("load", () => {
  document.querySelectorAll("[data-vline]").forEach(buildVLine);
});
window.addEventListener("wheel", (event) => {
  if (document.body.classList.contains("lightbox-open")) return;
  if (handoff) {
    event.preventDefault();
    return;
  }
  if (handleScrubWheel(event)) return;
  handleChapterWheel(event);
}, { passive: false });

function tick() {
  paintYellow();
  requestAnimationFrame(tick);
}
tick();
onScroll();
