/**
 * Option 2 — theme toggle + scroll wash + Apple-style reveals.
 */
(() => {
  initThemeToggle();
  initScrollWash();
  initReveals();
  initScaleExpand();
  initValueStory();
})();

function initThemeToggle() {
  const root = document.body;
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  if (!root.classList.contains("theme-liquid") || !toggles.length) return;

  const storageKey = "option2-theme";
  const saved = localStorage.getItem(storageKey);
  // Default dark for readability against the liquid stage
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
    const raw = -rect.top / total;
    return clamp(raw, 0, 1);
  }

  function apply(block, p) {
    const frame = block.querySelector("[data-scale-frame]");
    if (!frame) return;
    const e = reduce ? 1 : p * p * (3 - 2 * p);
    const inset = (1 - e) * 28;
    const radius = (1 - e) * 24;
    const border = (1 - e) * 0.14;
    frame.style.setProperty("--scale-inset", `${inset}px`);
    frame.style.setProperty("--scale-radius", `${radius}px`);
    frame.style.setProperty("--scale-border", String(border));
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

/**
 * Scroll storytelling before hero:
 * step 0 = headline only
 * steps 1..N = one benefit at a time
 */
function initValueStory() {
  const root = document.querySelector("[data-value-story]");
  if (!root) return;

  const benefits = [...root.querySelectorAll(".value-story__benefit")];
  const dots = [...root.querySelectorAll("[data-story-dot]")];
  const fill = root.querySelector("[data-story-progress]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const totalSteps = benefits.length + 1; // +1 for headline-only beat
  let active = -1;

  if (reduce) {
    root.classList.add("is-benefits");
    benefits.forEach((b) => {
      b.hidden = false;
      b.classList.add("is-active");
      b.removeAttribute("hidden");
    });
    if (fill) fill.style.width = "100%";
    return;
  }

  function setStep(step) {
    const next = Math.max(0, Math.min(totalSteps - 1, step));
    if (next === active) {
      if (fill) fill.style.width = `${((next + 1) / totalSteps) * 100}%`;
      return;
    }
    active = next;

    const showingBenefits = active > 0;
    root.classList.toggle("is-benefits", showingBenefits);

    benefits.forEach((el, i) => {
      const benefitStep = i + 1;
      const on = showingBenefits && benefitStep === active;
      el.classList.toggle("is-active", on);
      el.classList.toggle("is-exit", showingBenefits && benefitStep < active);
      if (!on) el.setAttribute("aria-hidden", "true");
      else el.removeAttribute("aria-hidden");
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
    });

    if (fill) fill.style.width = `${((active + 1) / totalSteps) * 100}%`;
  }

  function progressFor() {
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(1, rect.height - vh);
    const raw = -rect.top / total;
    return Math.min(1, Math.max(0, raw));
  }

  function update() {
    const p = progressFor();
    // Hold headline a bit longer at the start
    const eased = p < 0.12 ? 0 : (p - 0.12) / 0.88;
    const step = Math.min(totalSteps - 1, Math.floor(eased * totalSteps));
    setStep(step);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-story-dot") || "0");
      const rect = root.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      // Map step index back into scroll range (accounting for headline hold)
      const t = idx === 0 ? 0 : 0.12 + (idx / totalSteps) * 0.88;
      window.scrollTo({ top: absoluteTop + t * scrollable, behavior: "smooth" });
    });
  });

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
