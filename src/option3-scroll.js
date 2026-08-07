/**
 * Option 3 — scroll theatre without 3D shapes.
 * Decorative blueprint grid stays fixed; a soft color wash
 * shifts hue as the user scrolls. Sections pop in Apple-style.
 */
(() => {
  const stage = document.querySelector(".scroll-stage");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const palettes = [
    { a: "140, 190, 255", b: "190, 170, 255", c: "255, 220, 170" }, // sky → violet → gold
    { a: "120, 175, 255", b: "180, 150, 255", c: "255, 200, 190" }, // blue → lilac → rose
    { a: "100, 210, 230", b: "150, 160, 255", c: "255, 210, 150" }, // cyan → indigo → amber
    { a: "160, 150, 255", b: "220, 160, 230", c: "255, 215, 180" }, // violet → pink → peach
    { a: "130, 200, 255", b: "170, 190, 255", c: "240, 220, 255" }, // soft blue → periwinkle
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
    if (!stage) return;
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

  if (!reduceMotion && stage) {
    applyGradient(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  } else if (stage) {
    applyGradient(0);
  }

  initReveals();
})();

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
