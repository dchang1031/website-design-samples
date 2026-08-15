/**
 * Option (Scale-inspired) — section cards expand to full-bleed on scroll.
 * Each [data-scale-expand] track is taller than the viewport; as the user
 * scrolls through it, the sticky frame's inset + radius animate from card
 * → edge-to-edge section.
 */
(() => {
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
    // 0 when track top hits viewport top; 1 when track bottom hits viewport bottom
    const raw = -rect.top / total;
    return clamp(raw, 0, 1);
  }

  function apply(block, p) {
    const frame = block.querySelector("[data-scale-frame]");
    if (!frame) return;
    // Ease slightly for a more cinematic feel
    const e = reduce ? 1 : p * p * (3 - 2 * p);
    const inset = (1 - e) * 28; // px
    const radius = (1 - e) * 24; // px
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
})();
