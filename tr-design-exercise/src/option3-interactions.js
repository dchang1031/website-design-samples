(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function addCircles() {
    const grid = document.querySelector(".scroll-stage__grid");
    if (!grid || grid.querySelector(".option3-circle")) return;

    const circles = [
      [8, 12, 180, 6.8, -1.2], [23, 27, 320, 8.4, -4.1], [42, 14, 240, 7.2, -2.8],
      [67, 18, 420, 10.2, -5.6], [88, 10, 210, 6.1, -3.3], [13, 52, 360, 9.1, -6.4],
      [34, 62, 200, 6.6, -2.2], [55, 48, 460, 11.4, -7.5], [79, 56, 270, 7.8, -1.7],
      [96, 44, 350, 8.8, -5.2], [7, 82, 290, 7.5, -4.8], [27, 91, 430, 10.6, -2.6],
      [49, 80, 170, 5.9, -1.1], [72, 88, 310, 8.2, -6.1], [91, 78, 230, 6.9, -3.7],
      [18, 36, 140, 5.8, -2.9], [61, 33, 150, 6.3, -4.6], [84, 34, 130, 5.6, -1.9],
    ];

    circles.forEach(([x, y, size, duration, delay]) => {
      const el = document.createElement("span");
      el.className = "option3-circle";
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.setProperty("--circle-duration", `${duration}s`);
      el.style.setProperty("--circle-delay", `${delay}s`);
      if (reduce) el.style.animation = "none";
      grid.appendChild(el);
    });
  }

  function initHeadline() {
    const root = document.querySelector("[data-value-story]");
    if (!root) return;

    const apply = () => {
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / total, 0, 1);

      const letters = root.querySelectorAll("[data-letter]");
      const count = Math.max(letters.length, 1);
      const litEnd = 0.56;
      letters.forEach((el, i) => {
        const start = (i / count) * litEnd;
        const end = ((i + 0.8) / count) * litEnd;
        const lit = reduce || smoothstep(start, end, p) >= 0.45;
        el.classList.toggle("is-lit", lit);
      });

      // Keep the headline fully opaque while it is being revealed/lit.
      // Only fade the entire sentence after the reveal is complete.
      const fade = smoothstep(0.58, 0.96, p);
      root.style.setProperty("--o3-headline-opacity", (1 - fade).toFixed(4));
      root.style.setProperty("--hl-blur", `${(fade * 7).toFixed(2)}px`);
    };

    apply();
    if (!reduce) {
      let ticking = false;
      const update = () => {
        ticking = false;
        apply();
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener("resize", update, { passive: true });
    }
  }

  function initHeroSequence() {
    const hero = document.querySelector("[data-section=\"hero\"]");
    if (!hero) return;

    const apply = () => {
      const rect = hero.getBoundingClientRect();
      const total = Math.max(1, hero.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / total, 0, 1);

      const model = smoothstep(0.03, 0.32, p);
      const copy = smoothstep(0.30, 0.62, p);
      hero.style.setProperty("--o3-model-opacity", model.toFixed(4));
      hero.style.setProperty("--o3-hero-copy-opacity", copy.toFixed(4));
    };

    apply();
    if (!reduce) {
      let ticking = false;
      const update = () => {
        ticking = false;
        apply();
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener("resize", update, { passive: true });
    }
  }

  function init() {
    addCircles();
    initHeadline();
    initHeroSequence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
