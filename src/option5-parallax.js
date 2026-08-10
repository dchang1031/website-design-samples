/**
 * Option 5 — multi-layer hero parallax.
 * Each shape moves at a different rate as the page scrolls.
 */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initHeroParallax() {
  const stage = document.querySelector("[data-hero-parallax]");
  if (!stage || REDUCED) return;

  const layers = [...stage.querySelectorAll("[data-parallax-speed]")].map((el) => ({
    el,
    speed: Number(el.dataset.parallaxSpeed) || 0.2,
    driftX: Number(el.dataset.parallaxX) || 0,
  }));
  if (!layers.length) return;

  let ticking = false;
  let latestY = window.scrollY;

  const paint = () => {
    ticking = false;
    const y = latestY;
    for (const layer of layers) {
      const ty = y * layer.speed;
      const tx = y * layer.driftX;
      layer.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    }
  };

  const onScroll = () => {
    latestY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  };

  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

initHeroParallax();
