(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function wrapCard(selector, label) {
    const card = document.querySelector(selector);
    if (!card || card.parentElement.classList.contains('o3-expand-track')) return;

    const track = document.createElement('section');
    track.className = 'o3-expand-track';
    track.setAttribute('aria-label', label);

    const sticky = document.createElement('div');
    sticky.className = 'o3-expand-sticky';

    const frame = document.createElement('div');
    frame.className = 'o3-expand-frame';

    card.parentNode.insertBefore(track, card);
    track.appendChild(sticky);
    sticky.appendChild(frame);
    frame.appendChild(card);

    const apply = (progress) => {
      const easing = reduce ? 1 : smooth(0.03, 0.88, progress);
      const inset = 28 * (1 - easing);
      const radius = 24 * (1 - easing);
      const borderAlpha = 0.10 * (1 - easing);
      const shadowAlpha = 0.08 * (1 - easing);
      const lift = 16 * (1 - easing);
      frame.style.inset = `${inset}px`;
      frame.style.borderRadius = `${radius}px`;
      frame.style.borderColor = `rgba(0,0,0,${borderAlpha})`;
      frame.style.boxShadow = `0 20px 60px rgba(0,0,0,${shadowAlpha}), 0 4px 16px rgba(0,0,0,${shadowAlpha * 0.5})`;
      frame.style.transform = `translate3d(0, ${lift}vh, 0)`;
    };

    const update = () => {
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      apply(clamp(-rect.top / total, 0, 1));
    };

    apply(0);
    if (!reduce) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
    }
  }

  const start = () => {
    wrapCard('.o3-enterprise-card', 'Enterprise');
    wrapCard('.o3-faq-card', 'Frequently Asked Questions');
  };

  if (document.querySelector('.o3-enterprise-card')) start();
  else {
    const observer = new MutationObserver(() => {
      if (document.querySelector('.o3-enterprise-card')) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
