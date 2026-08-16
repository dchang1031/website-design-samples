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

  // Option 3 keeps its own implementation, but the lower cards follow the
  // same expanding-card choreography used by Option 2.
  initTrustedExpand();

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

    const revealEnd=.44;
    letters.forEach((el,i)=>{
      const start=(i/letters.length)*revealEnd;
      const end=((i+1)/letters.length)*revealEnd;
      el.classList.toggle('lit',smooth(start,end,p)>.5);
    });

    const fade=smooth(.48,.68,p);
    headline.style.opacity=String(1-fade);
    headline.style.filter=`blur(${(fade*8).toFixed(2)}px)`;

    if(card) card.style.opacity=String(smooth(.52,.70,p));
    if(copy) copy.style.opacity=String(smooth(.68,.86,p));
  }

  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;update();});};
  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});

  function createExpandTrack(section, label, className = '') {
    const track = document.createElement('section');
    track.className = `o3-trusted-expand ${className}`.trim();
    track.setAttribute('aria-label', label);

    const sticky = document.createElement('div');
    sticky.className = 'o3-trusted-expand__sticky';

    const frame = document.createElement('div');
    frame.className = 'o3-trusted-expand__frame';
    frame.setAttribute('data-o3-trusted-frame', '');

    const content = document.createElement('div');
    content.className = 'o3-trusted-expand__content';

    track.appendChild(sticky);
    sticky.appendChild(frame);
    frame.appendChild(content);
    content.appendChild(section);

    function apply(progress) {
      const easing = reduce ? 1 : smooth(0.04, 0.88, progress);
      const inset = 28 * (1 - easing);
      const radius = 24 * (1 - easing);
      const borderAlpha = 0.10 * (1 - easing);
      const shadowAlpha = 0.08 * (1 - easing);
      const lift = 14 * (1 - easing);

      frame.style.inset = `${inset}px`;
      frame.style.borderRadius = `${radius}px`;
      frame.style.borderColor = `rgba(0,0,0,${borderAlpha})`;
      frame.style.boxShadow = `0 20px 60px rgba(0,0,0,${shadowAlpha}), 0 4px 16px rgba(0,0,0,${shadowAlpha * 0.5})`;
      frame.style.transform = `translate3d(0, ${lift}vh, 0)`;
    }

    function progressFor() {
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      return clamp(-rect.top / total, 0, 1);
    }

    let frameTicking = false;
    const updateExpand = () => {
      if (frameTicking) return;
      frameTicking = true;
      requestAnimationFrame(() => {
        frameTicking = false;
        apply(progressFor());
      });
    };

    apply(0);
    if (!reduce) {
      window.addEventListener('scroll', updateExpand, { passive: true });
      window.addEventListener('resize', updateExpand, { passive: true });
    }
    return track;
  }

  function initTrustedExpand() {
    const trusted = document.querySelector('[data-section="trusted"]');
    if (!trusted || trusted.closest('.o3-trusted-expand')) return;

    if (!document.querySelector('link[href*="option3-trusted-expand.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/src/option3-trusted-expand.css';
      document.head.appendChild(stylesheet);
    }

    const trustedTrack = createExpandTrack(trusted, 'Trusted By');
    trusted.parentNode.insertBefore(trustedTrack, trusted);

    const oneApi = document.createElement('section');
    oneApi.className = 'o3-oneapi-section';
    oneApi.setAttribute('data-section', 'oneapi');
    oneApi.innerHTML = `
      <div class="o3-oneapi-inner">
        <div class="o3-oneapi-stage" aria-hidden="true">
          <img src="/assets/oneapi.png" alt="" class="o3-oneapi-diagram" loading="lazy" />
        </div>
        <div class="o3-oneapi-copy">
          <h2>One API for Any AI App</h2>
          <p>Fully OpenAI-compatible, with one base URL and one API key to power OpenClaw, OpenCode, Codex, Claude Code, Cherry Studio, and more — while managing all your token usage in one place.</p>
          <div class="o3-oneapi-button">Claim Free Credits <span aria-hidden="true">↗</span></div>
        </div>
      </div>
    `;

    const oneApiTrack = createExpandTrack(oneApi, 'One API for Any AI App', 'o3-trusted-expand--oneapi');
    trustedTrack.after(oneApiTrack);
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
  initReveals();

})();
