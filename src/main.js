const PROMOS = [
  {
    id: "kimi",
    badgeLabel: "ENDS AUG 12",
    message: "🎉  Kimi-K3 Models – Now Free to Use!",
    actionLabel: "Try Now",
  },
  {
    id: "credits",
    badgeLabel: "ENDS AUG 31",
    message: "🎉  Top up 8, get 2 free (20% off), plus claim $200 developer credits.",
    actionLabel: "Claim Now",
  },
];

function initPromoBanner() {
  const badge = document.querySelector("[data-promo-badge]");
  const slide = document.querySelector("[data-promo-slide]");
  const mobile = document.querySelector("[data-promo-mobile]");
  const indicators = document.querySelector("[data-promo-indicators]");
  if (!slide || !indicators) return;

  let index = 0;

  const renderAction = (promo) =>
    `<a href="#" class="flex items-center gap-2 text-white text-[16px] border-b border-white whitespace-nowrap cursor-pointer shrink-0 ml-6">${promo.actionLabel}<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`;

  const renderRow = (promo) =>
    `<div class="promo-banner-copy-row"><p class="m-0 min-w-0 text-white text-[16px] leading-[1.4] lg:whitespace-nowrap">${promo.message}</p>${renderAction(promo)}</div>`;

  const render = () => {
    const promo = PROMOS[index];
    if (badge) badge.textContent = promo.badgeLabel;
    slide.innerHTML = renderRow(promo);
    slide.style.animation = "none";
    // restart animation
    void slide.offsetWidth;
    slide.style.animation = "";
    if (mobile) {
      mobile.innerHTML = `${promo.message}<a href="#" class="inline-flex items-center gap-1 border-b border-white cursor-pointer ml-2 text-[14px] leading-[1.35]">${promo.actionLabel}<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`;
    }
    [...indicators.children].forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
      el.setAttribute("aria-current", i === index ? "true" : "false");
    });
  };

  indicators.innerHTML = PROMOS.map(
    (p, i) =>
      `<button type="button" class="promo-banner-indicator${i === 0 ? " is-active" : ""}" aria-label="Show promotion ${i + 1}" data-promo-index="${i}"></button>`,
  ).join("");

  indicators.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-promo-index]");
    if (!btn) return;
    index = Number(btn.dataset.promoIndex);
    render();
  });

  render();
  setInterval(() => {
    index = (index + 1) % PROMOS.length;
    render();
  }, 5000);
}

function initHeader() {
  const header = document.getElementById("site-header");
  const onScroll = () => {
    header?.classList.toggle("tr-landing-header--scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menu = document.getElementById("mobile-menu");
  const openBtn = document.getElementById("mobile-menu-btn");
  const closeBtn = document.getElementById("mobile-menu-close");
  const open = () => menu?.removeAttribute("hidden");
  const close = () => menu?.setAttribute("hidden", "");
  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
}

function initCopy() {
  const btn = document.getElementById("copy-btn");
  const label = btn?.querySelector("[data-copy-label]");
  const url = document.getElementById("api-url")?.textContent?.trim();
  if (!btn || !url) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (label) label.textContent = "Copied!";
      setTimeout(() => {
        if (label) label.textContent = "Copy";
      }, 1500);
    } catch {
      if (label) label.textContent = "Copy";
    }
  });
}

function initFaq() {
  const items = [...document.querySelectorAll("[data-faq-item]")];
  items.forEach((item) => {
    const trigger = item.querySelector("[data-faq-trigger]");
    const panel = item.querySelector("[data-faq-panel]");
    const icon = item.querySelector("[data-faq-icon]");
    trigger?.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      items.forEach((other) => {
        const t = other.querySelector("[data-faq-trigger]");
        const p = other.querySelector("[data-faq-panel]");
        const i = other.querySelector("[data-faq-icon]");
        t?.setAttribute("aria-expanded", "false");
        p?.classList.remove("is-open");
        p?.classList.add("is-closed");
        i?.classList.remove("tr-landing-faq-expand-icon-open");
        i?.classList.add("tr-landing-faq-expand-icon-closed");
      });
      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel?.classList.add("is-open");
        panel?.classList.remove("is-closed");
        icon?.classList.add("tr-landing-faq-expand-icon-open");
        icon?.classList.remove("tr-landing-faq-expand-icon-closed");
      }
    });
  });
}

function initModelMarquee() {
  const track = document.getElementById("model-track");
  if (!track) return;
  let offset = 0;
  const speed = 0.35;
  const step = () => {
    offset += speed;
    const half = track.scrollHeight / 2;
    if (offset >= half) offset = 0;
    track.style.transform = `translateY(-${offset}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

initPromoBanner();
initHeader();
initCopy();
initFaq();
initModelMarquee();
