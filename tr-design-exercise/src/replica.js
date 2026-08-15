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

function modelRow(model) {
  const colors = {
    XAI: "#111111",
    "Qwen.Color": "#6366f1",
    "DeepSeek.Color": "#4d6bfe",
    Moonshot: "#1a1a1a",
    OpenAI: "#10a37f",
    "Claude.Color": "#d97757",
    "Gemini.Color": "#4285f4",
    ZAI: "#3b82f6",
    "Minimax.Color": "#111827",
    "Nvidia.Color": "#76b900",
  };
  const letters = {
    XAI: "X",
    "Qwen.Color": "Q",
    "DeepSeek.Color": "D",
    Moonshot: "K",
    OpenAI: "O",
    "Claude.Color": "A",
    "Gemini.Color": "G",
    ZAI: "Z",
    "Minimax.Color": "M",
    "Nvidia.Color": "N",
  };
  const color = colors[model.icon] || "#64748b";
  const letter = letters[model.icon] || (model.model_name?.[0] || "?").toUpperCase();
  return `<div class="tr-landing-model-access-row flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-transparent px-[16px] py-[12px] text-left transition hover:border-sky-200 lg:rounded-2xl lg:px-4 lg:py-3">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <span class="tr-landing-model-access-icon h-6 w-6 flex items-center justify-center shrink-0 opacity-40 rounded-full text-[10px] font-medium text-white" style="background:${color}">${letter}</span>
      <div class="min-w-0 flex-1">
        <div class="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden">
          <span class="tr-landing-model-access-model-name block min-w-0 flex-1 truncate" style="color:#121317;font-family:'PP Neue Montreal',sans-serif;font-size:16px;font-weight:500;line-height:140%">${model.model_name}</span>
        </div>
        <p class="tr-landing-model-access-model-desc mt-1 truncate text-[12px] text-slate-500 lg:text-sm m-0">${model.vendor_desc}</p>
      </div>
    </div>
    <span class="tr-landing-model-access-dot ml-3 h-[6px] w-[6px] rounded-full bg-[#0086FF] shrink-0"></span>
  </div>`;
}

async function initModelMarquee() {
  const track = document.getElementById("model-track");
  if (!track) return;

  try {
    const res = await fetch("https://api.tokenrouter.com/api/landing-page-models");
    const json = await res.json();
    if (json?.success && Array.isArray(json.data) && json.data.length) {
      const sorted = [...json.data].sort((a, b) => (b.sort || 0) - (a.sort || 0));
      const html = sorted.map(modelRow).join("") + sorted.map(modelRow).join("");
      track.innerHTML = html;
    }
  } catch {
    // keep hardcoded fallback rows
  }

  let offset = 0;
  const speed = 0.32;
  const step = () => {
    offset += speed;
    const half = track.scrollHeight / 2;
    if (half > 0 && offset >= half) offset = 0;
    track.style.transform = `translate3d(0, ${-offset}px, 0)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

initPromoBanner();
initHeader();
initCopy();
initFaq();
initModelMarquee();
