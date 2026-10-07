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

/* Quote mark: staggered flicker, short dim so most dots stay lit. */
document.querySelectorAll(".quote-mark circle").forEach((dot, i) => {
  dot.style.animationDelay = (i % 7) * 115 + "ms";
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
const yellow = document.querySelector("#summary .yellow-bg");
let yellowShown = 0;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(t) {
  return 0.5 - Math.cos(Math.PI * t) / 2;
}

function updateYellow() {
  const rect = yellow.getBoundingClientRect();
  const vh = window.innerHeight;
  const mid = vh / 2;
  const enter = easeInOut(clamp01((vh - rect.top) / (vh - mid)));
  const leave = easeInOut(clamp01((vh - rect.bottom) / (vh - NAV_H)));
  yellowShown = enter * (1 - leave);
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

const scrubs = [];
document.querySelectorAll("[data-scrub]").forEach((scrub) => {
  splitLetters(scrub);
  const chapter = scrub.closest(".chapter");
  const chars = [...scrub.querySelectorAll(".ch")];
  const state = { chapter, chars, done: chars.length === 0, started: false };
  scrubs.push(state);
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting) || state.started) return;
    state.started = true;
    io.disconnect();
    let index = 0;
    const step = () => {
      index += 1;
      state.chars.forEach((ch, i) => ch.classList.toggle("on", i < index));
      if (index < state.chars.length) window.setTimeout(step, 28);
      else state.done = true;
    };
    window.setTimeout(step, 120);
  }, { threshold: 0.45 });
  io.observe(scrub);
});

function highlightsDone(chapter) {
  return scrubs.filter((scrub) => scrub.chapter === chapter).every((scrub) => scrub.done);
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
      card.addEventListener("animationend", (event) => {
        if (event.animationName === "card-in") card.dataset.settled = "1";
      }, { once: true });
      cardIO.unobserve(card);
    });
  },
  { threshold: 0.45, rootMargin: "0px 0px -6% 0px" }
);
cards.forEach((card) => cardIO.observe(card));

let illustrationDone = false;

function card05BottomSeen() {
  const card = document.getElementById("point-05");
  return card.getBoundingClientRect().bottom <= window.innerHeight + 1;
}

function tryStartIllustration() {
  if (illustrationDone || heatPlayed || !card05BottomSeen()) return;
  maybeHeat();
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
  window.setTimeout(() => {
    illustrationDone = true;
  }, dimStart + above.length * 1.6 + 80);
}

let heatDots = null;
function maybeHeat() {
  if (heatDots && card05BottomSeen()) playHeat(heatDots);
}
fetch("assets/heat-dots.json")
  .then((res) => res.json())
  .then((dots) => {
    heatDots = dots;
    maybeHeat();
  })
  .catch(() => {
    illustrationDone = true;
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
const vlineDone = new WeakSet();
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
      const count = line.querySelectorAll("i").length;
      window.setTimeout(() => vlineDone.add(line), count * 14 + 180);
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

const beatDone = new WeakSet();
function updateBeats() {
  const mid = window.innerHeight / 2;
  document.querySelectorAll("[data-beat]").forEach((beat) => {
    if (beat.classList.contains("play")) return;
    const rect = beat.getBoundingClientRect();
    if (rect.top + rect.height / 2 > mid) return;
    const dots = [...beat.querySelectorAll("i")];
    dots.forEach((dot, i) => {
      dot.style.animationDelay = i * 16 + "ms";
    });
    beat.classList.add("play");
    window.setTimeout(() => beatDone.add(beat), dots.length * 16 + 160);
  });
}

/* ---------- Chapter transitions ---------- */
const chapters = [...document.querySelectorAll(".chapter")];
const storyBg = document.querySelector(".story-bg");

function chapterEnd(index) {
  const chapter = chapters[index];
  return chapter.offsetTop + chapter.offsetHeight - window.innerHeight;
}

let handoff = false;
let handoffGen = 0;

function syncStoryBg() {
  if (handoff) return;
  let bg = "#000000";
  const y = window.scrollY + 1;
  chapters.forEach((chapter) => {
    if (y >= chapter.offsetTop && y < chapter.offsetTop + chapter.offsetHeight) {
      bg = chapter.dataset.bg || bg;
    }
  });
  storyBg.style.transition = "none";
  storyBg.style.background = bg;
}

function chapterReady(chapter) {
  if (!highlightsDone(chapter)) return false;
  if (chapter.id === "s01") {
    if (!cards.every((card) => card.dataset.settled === "1")) return false;
    if (!illustrationDone) return false;
  }
  const line = chapter.querySelector("[data-vline]");
  if (line && !vlineDone.has(line)) return false;
  const beats = [...chapter.querySelectorAll("[data-beat]")];
  if (beats.length && !beats.every((beat) => beatDone.has(beat))) return false;
  return true;
}

function cancelHandoff() {
  if (!handoff) return;
  handoffGen += 1;
  chapters.forEach((chapter) => {
    chapter.style.transition = "none";
    chapter.style.transform = "";
    chapter.style.opacity = "";
    chapter.style.background = "";
    chapter.classList.remove("is-back", "is-front");
  });
  document.body.classList.remove("handoff-lock");
  handoff = false;
  syncStoryBg();
}

function playHandoff(fromIndex, dir) {
  if (handoff) return;
  const toIndex = fromIndex + dir;
  if (toIndex < 0 || toIndex >= chapters.length) return;
  const from = chapters[fromIndex];
  const to = chapters[toIndex];
  const vh = window.innerHeight;
  const lockY = dir > 0 ? Math.max(0, chapterEnd(fromIndex)) : from.offsetTop;
  const gen = ++handoffGen;
  handoff = true;
  document.body.classList.add("handoff-lock");
  window.scrollTo(0, lockY);
  from.classList.add("is-back");
  to.classList.add("is-front");
  storyBg.style.transition = "background-color 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
  storyBg.style.background = to.dataset.bg;
  from.style.background = "transparent";
  to.style.background = "transparent";

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
    if (gen !== handoffGen) return;
    const dest = dir > 0
      ? to.offsetTop
      : to.offsetTop + to.offsetHeight - window.innerHeight;
    from.style.transition = "none";
    to.style.transition = "none";
    from.style.transform = "";
    from.style.opacity = "";
    from.style.background = "";
    to.style.transform = "";
    to.style.opacity = "";
    to.style.background = "";
    from.classList.remove("is-back");
    to.classList.remove("is-front");
    document.body.classList.remove("handoff-lock");
    window.scrollTo(0, Math.max(0, dest));
    handoff = false;
    syncStoryBg();
  }, 860);
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
    const crosses = window.scrollY >= end - 1 || window.scrollY + event.deltaY > end;
    if (!crosses) return false;
    if (!chapterReady(chapters[index])) return false;
    event.preventDefault();
    playHandoff(index, 1);
    return true;
  }
  if (dir < 0 && index > 0) {
    const start = chapters[index].offsetTop;
    const crosses = window.scrollY <= start + 1 || window.scrollY + event.deltaY < start;
    if (!crosses) return false;
    if (!chapterReady(chapters[index])) return false;
    event.preventDefault();
    playHandoff(index, -1);
    return true;
  }
  return false;
}

function updateNavVisibility() {
  const footer = document.querySelector(".footer");
  const nav = document.getElementById("nav");
  const hide = footer.getBoundingClientRect().top < NAV_H;
  if (hide && !nav.classList.contains("is-hidden")) {
    document.querySelectorAll(".nav-item.open").forEach((item) => {
      item.classList.remove("open");
      item.querySelector(".pill").setAttribute("aria-expanded", "false");
      item.querySelector(".menu").hidden = true;
    });
  }
  nav.classList.toggle("is-hidden", hide);
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
    updateNavTone();
    updateNavVisibility();
    updateYellow();
    if (handoff) return;
    syncStoryBg();
    updateVLines();
    updateBeats();
    updatePhoto();
    tryStartIllustration();
  });
}
window.addEventListener("scroll", () => {
  if (!handoff) tryStartIllustration();
  onScroll();
}, { passive: true });
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
  handleChapterWheel(event);
}, { passive: false });

document.querySelector(".to-top").addEventListener("click", () => {
  closeMenus();
  closeLightbox();
  cancelHandoff();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

updateYellow();
syncStoryBg();
onScroll();
