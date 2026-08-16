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

  initTrustedExpand();

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

  function initTrustedExpand() {
    const trusted = document.querySelector('[data-section="trusted"]');
    if (!trusted || trusted.closest('.o3-trusted-expand')) return;
    if (!document.querySelector('link[href*="option3-trusted-expand.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/src/option3-trusted-expand.css';
      document.head.appendChild(stylesheet);
    }
    const track = document.createElement('section');
    track.className = 'o3-trusted-expand';
    track.setAttribute('aria-label', 'Trusted By');
    const sticky = document.createElement('div');
    sticky.className = 'o3-trusted-expand__sticky';
    const frame = document.createElement('div');
    frame.className = 'o3-trusted-expand__frame';
    frame.setAttribute('data-o3-trusted-frame', '');
    const content = document.createElement('div');
    content.className = 'o3-trusted-expand__content';
    trusted.parentNode.insertBefore(track, trusted);
    track.appendChild(sticky);
    sticky.appendChild(frame);
    frame.appendChild(content);
    content.appendChild(trusted);
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
    initOneApiCard(track);
  }

  function initOneApiCard(afterTrack) {
    const oneApiTrack = document.createElement('section');
    oneApiTrack.className = 'o3-oneapi-expand';
    oneApiTrack.setAttribute('aria-label', 'One API for Any AI App');
    const sticky = document.createElement('div');
    sticky.className = 'o3-oneapi-expand__sticky';
    const frame = document.createElement('div');
    frame.className = 'o3-oneapi-expand__frame';
    const content = document.createElement('section');
    content.className = 'o3-oneapi-section';
    content.innerHTML = `
      <div class="o3-oneapi-inner">
        <div class="o3-oneapi-copy">
          <h2>One API for Any AI App</h2>
          <p>Fully OpenAI-compatible, with one base URL and one API key to power OpenClaw, OpenCode, Codex, Claude Code, Cherry Studio, and more — while managing all your token usage in one place.</p>
          <div class="o3-oneapi-button">Claim Free Credits <span aria-hidden="true">↗</span></div>
        </div>
        <div class="o3-oneapi-stage" aria-hidden="true"><img src="/assets/oneapi.png" alt="" class="o3-oneapi-diagram" loading="lazy" /></div>
      </div>`;
    oneApiTrack.appendChild(sticky);
    sticky.appendChild(frame);
    frame.appendChild(content);
    afterTrack.after(oneApiTrack);
    const apply = (progress) => {
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
    };
    const updateOneApi = () => {
      const rect = oneApiTrack.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      apply(clamp(-rect.top / total, 0, 1));
    };
    apply(0);
    if (!reduce) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { ticking = false; updateOneApi(); });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }
    initRemainingSections(oneApiTrack);
  }

  function initRemainingSections(afterOneApi) {
    if (document.querySelector('.o3-remaining-sections')) return;
    if (!document.querySelector('link[href*="option3-remaining-sections.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/src/option3-remaining-sections.css';
      document.head.appendChild(stylesheet);
    }

    const stack = document.createElement('div');
    stack.className = 'o3-remaining-sections';
    stack.innerHTML = `
      <section class="o3-remaining-card o3-enterprise-card" aria-label="Enterprise">
        <div class="o3-remaining-inner">
          <div class="o3-section-kicker">ENTERPRISE-READY</div>
          <h2>Simple to Start, Powerful at<br class="o3-desktop-break" /> Enterprise Scale</h2>
          <p>Start with simple model access. Add centralized billing, granular quota controls, audit-ready logs, and organization-wide visibility as your usage grows.</p>
          <p>Already at scale? <span class="o3-static-link">Talk to sales.</span></p>
          <div class="o3-enterprise-grid">
            <article><img src="/assets/icons/billing.svg" alt="" /><h3>Centralized Billing and Admin Control</h3><p>Run all company usage under one organization account with unified billing, unified permissions, and no more individual recharge or reimbursement workflows.</p><div><span>Unified Billing</span><span>Org Admin</span><span>No Reimbursement</span></div></article>
            <article><img src="/assets/icons/users.svg" alt="" /><h3>Granular Quota by Member or Department</h3><p>Set, adjust, and monitor quota at different levels. Allocate usage budgets in real time by user, by team, or by department as business needs change.</p><div><span>Quota Control</span><span>Per Team</span><span>Real-Time Allocation</span></div></article>
            <article><img src="/assets/icons/routing.svg" alt="" /><h3>Always-On Routing with Multi-Channel Failover</h3><p>TokenRouter combines multiple upstream providers with owned inference cloud capacity, enabling automatic failover when one route degrades or becomes unavailable.</p><div><span>Failover</span><span>Multi-Upstream</span><span>High Availability</span></div></article>
            <article><img src="/assets/icons/analytics.svg" alt="" /><h3>Organization-Wide Analytics and Usage Insights</h3><p>Track activity, cost, and usage trends across the company. Analyze adoption by model, by member, and by time period with clear multi-dimensional dashboards.</p><div><span>Usage Trends</span><span>Model Analytics</span><span>Team Activity</span></div></article>
            <article><img src="/assets/icons/audit.svg" alt="" /><h3>Audit-Ready Logs and Full Traceability</h3><p>Every request, token spend, and access record can be traced back to the user and model involved, supporting internal governance, review, and operational auditing.</p><div><span>Audit Logs</span><span>Cost Traceability</span><span>Access Records</span></div></article>
            <article><img src="/assets/icons/globe.svg" alt="" /><h3>Global Delivery for High Concurrency and Low Latency</h3><p>Global service nodes and close collaboration with model providers help deliver stable capacity, better concurrency handling, and lower-latency access across regions.</p><div><span>Global Nodes</span><span>Low Latency</span><span>High Concurrency</span></div></article>
          </div>
        </div>
      </section>

      <section class="o3-remaining-card o3-faq-card" aria-label="Frequently Asked Questions">
        <div class="o3-remaining-inner">
          <div class="o3-section-kicker">FAQ</div>
          <h2>Frequently Asked Questions</h2>
          <p class="o3-faq-intro">Quick answers to the questions developers ask most. Don't see yours? The full documentation has deeper guides, references.</p>
          <div class="o3-faq-list">
            <article><h3>1. What is TokenRouter?</h3><p>TokenRouter is a unified API gateway for accessing leading AI models across text, image, video, and audio. Instead of integrating with multiple model providers one by one, developers and enterprises can connect through TokenRouter and manage model access through a single interface.</p></article>
            <article><h3>2. Why should I choose TokenRouter?</h3><p>TokenRouter helps teams reduce integration complexity by providing one unified API for multiple AI models and providers. It also centralizes billing, usage tracking, and cost visibility while supporting multi-provider routing and fallback.</p></article>
            <article><h3>3. Is my team's data secure?</h3><p>TokenRouter is designed for controlled AI access with centralized management, usage visibility, and enterprise-oriented governance.</p></article>
            <article><h3>4. How do I get support or report a bug?</h3><p>You can join the TokenRouter Discord community to ask questions, share feedback, or report technical issues. You can also contact the team directly through the Contact Us form.</p></article>
            <article><h3>5. How is usage billed on TokenRouter?</h3><p>TokenRouter displays pricing for each model. Usage is billed according to the selected model, provider, and actual consumption, with usage and cost details available in Usage Logs.</p></article>
            <article><h3>6. How often does TokenRouter add new models?</h3><p>TokenRouter continuously updates its model catalog to support newly released and widely used AI models across text, image, video, and audio.</p></article>
            <article><h3>7. Does TokenRouter charge a platform fee?</h3><p>No, TokenRouter currently does not charge platform fees for Personal or Enterprise software features. Model usage is still charged based on the selected model, provider, and actual consumption.</p></article>
            <article><h3>8. Can I request higher RPM or TPM limits?</h3><p>Yes. TokenRouter can support custom RPM and TPM limits for enterprise customers and high-volume use cases, subject to model, provider capacity, usage patterns, and technical feasibility.</p></article>
            <article><h3>9. What happens if a model provider goes down?</h3><p>TokenRouter is designed to support automatic fallback across available providers where applicable, helping improve reliability for production applications.</p></article>
            <article><h3>10. What payment and currency options does TokenRouter support?</h3><p>TokenRouter primarily uses Stripe as its payment channel and uses US dollars as the base billing currency. Prices are generally denominated in USD.</p></article>
          </div>
          <div class="o3-faq-help"><strong>Still Have Questions?</strong><span>Browse the full documentation for guides, references and end-to-end code samples.</span><span class="o3-static-button">Open Docs ↗</span></div>
        </div>
      </section>

      <section class="o3-remaining-card o3-cta-card" aria-label="Call to action">
        <div class="o3-remaining-inner"><h2>Ready to Roll TokenRouter Out Across Your Org?</h2><div class="o3-cta-buttons"><span class="o3-static-button o3-static-button--primary">Talk to Sales ↗</span><span class="o3-static-button">Start Free</span></div></div>
      </section>

      <footer class="o3-footer"><div class="o3-footer-inner"><div class="o3-footer-brand"><img src="/assets/logo-without-title-8.png" alt="" /><strong>TokenRouter</strong></div><div class="o3-footer-links"><div><b>QUICK LINKS</b><span>Console</span><span>Models</span><span>Docs</span><span>Blog</span></div><div><b>COMPANY</b><span>About</span><span>Contact</span><span>Careers</span></div><div><b>LEGAL</b><span>Privacy</span><span>Terms</span><span>Security</span></div></div></div></footer>
    `;
    afterOneApi.after(stack);
  }

  function initReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    els.forEach((el) => {
      const children = el.querySelectorAll("[data-reveal-child]");
      children.forEach((child, childIndex) => child.style.setProperty("--reveal-delay", `${120 + childIndex * 90}ms`));
      io.observe(el);
    });
  }
  initReveals();
})();
