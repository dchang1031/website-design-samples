(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = document.querySelector('.o3-stage');
  const headline = document.querySelector('.o3-headline');
  const letters = [...document.querySelectorAll('.o3-letter')];
  const card = document.querySelector('.o3-card-wrap');
  const copy = document.querySelector('.o3-copy');
  if (!stage || !headline) return;

  function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
  function smooth(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

  // Same visual cadence as the Option 2 Faster / Better / Cheaper rotation,
  // but kept entirely inside standalone Option 3.
  const rotating = [...document.querySelectorAll('.o3-rotating-tagline > span')];
  if (rotating.length && !reduce) {
    let index = 0;
    window.setInterval(() => {
      rotating[index].classList.remove('is-active');
      index = (index + 1) % rotating.length;
      rotating[index].classList.add('is-active');
    }, 2200);
  }

  function update(){
    if(reduce){
      letters.forEach(l=>l.classList.add('lit'));
      headline.style.opacity='1';
      headline.style.filter='none';
      if(card) card.style.opacity='1';
      if(copy) copy.style.opacity='1';
      return;
    }
    const rect=stage.getBoundingClientRect();
    const total=Math.max(1,stage.offsetHeight-window.innerHeight);
    const p=clamp(-rect.top/total,0,1);

    // Reveal each character, then fade the completed sentence in place.
    const revealEnd=.44;
    letters.forEach((el,i)=>{
      const start=(i/letters.length)*revealEnd;
      const end=((i+1)/letters.length)*revealEnd;
      el.classList.toggle('lit',smooth(start,end,p)>.5);
    });

    const fade=smooth(.48,.68,p);
    headline.style.opacity=String(1-fade);
    headline.style.filter=`blur(${(fade*8).toFixed(2)}px)`;

    // Card first, then the Option-2-inspired left-side hero content.
    if(card) card.style.opacity=String(smooth(.52,.70,p));
    if(copy) copy.style.opacity=String(smooth(.68,.86,p));
  }

  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;update();});};
  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});

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
  initReveals();

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
      return clamp(-rect.top / total, 0, 1);
    }

    function apply(block, p) {
      const frame = block.querySelector("[data-scale-frame]");
      if (!frame) return;
      const e = reduce ? 1 : p * p * (3 - 2 * p);
      frame.style.setProperty("--scale-inset", `${(1 - e) * 28}px`);
      frame.style.setProperty("--scale-radius", `${(1 - e) * 24}px`);
      frame.style.setProperty("--scale-border", String((1 - e) * 0.14));
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

  initScaleExpand();

})();
