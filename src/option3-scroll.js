/**
 * Option 3 scroll theatre:
 * - morphing glass background follows scroll
 * - sections unfold/reveal like product-page storytelling
 */

const MORPH_COUNT = 3;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function initScrollStage() {
  const root = document.documentElement;
  const stage = document.querySelector(".scroll-stage");
  const morphImgs = [...document.querySelectorAll("[data-morph]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  if (!stage || !sections.length) return;

  let active = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / maxScroll, 0, 1);

    // Find nearest section in view
    let bestIdx = 0;
    let bestScore = -Infinity;
    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const mid = rect.top + rect.height * 0.35;
      const score = 1 - Math.abs(mid - window.innerHeight * 0.38) / window.innerHeight;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });
    active = bestIdx;

    morphImgs.forEach((img, i) => {
      img.classList.toggle("is-active", i === active % MORPH_COUNT);
    });

    // Parallax / morph transforms driven by scroll + section
    const x = Math.sin(progress * Math.PI * 2) * 48 + (active - 1) * 18;
    const y = progress * -120 + Math.cos(progress * Math.PI) * 24;
    const rot = (progress * 12 - active * 2.5).toFixed(2);
    const scale = (1.02 + progress * 0.12 + (active % 2 === 0 ? 0.03 : 0)).toFixed(3);

    root.style.setProperty("--stage-shift-x", `${x.toFixed(1)}px`);
    root.style.setProperty("--stage-shift-y", `${y.toFixed(1)}px`);
    root.style.setProperty("--stage-rotate", `${rot}deg`);
    root.style.setProperty("--stage-scale", scale);
    stage.dataset.activeSection = String(active);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

function initSectionReveals() {
  const nodes = [...document.querySelectorAll("[data-reveal]")];
  if (!nodes.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    nodes.forEach((n) => n.classList.add("is-revealed"));
    return;
  }

  // Stagger children
  nodes.forEach((section) => {
    [...section.querySelectorAll("[data-reveal-child]")].forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${80 + i * 70}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  nodes.forEach((n) => io.observe(n));

  // Hero should be visible on load
  const hero = document.querySelector('[data-section="hero"]');
  hero?.classList.add("is-revealed");
}

initScrollStage();
initSectionReveals();
