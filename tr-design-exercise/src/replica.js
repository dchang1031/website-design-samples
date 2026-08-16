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

/** Canonical design-exercise nav after remap */
const NAV_ITEMS = [
  { href: "/current.html", label: "Current" },
  { href: "/option-1.html", label: "Option 1" },
  { href: "/option-2.html", label: "Option 2" },
  { href: "/option-3.html", label: "Option 3" },
  { href: "/option-4.html", label: "Option 4" },
];

function currentNavKey() {
  const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  if (path.endsWith("/current.html") || path.endsWith("/current")) return "/current.html";
  if (path.endsWith("/option-1.html") || path.endsWith("/option-1")) return "/option-1.html";
  if (path.endsWith("/option-2.html") || path.endsWith("/option-2")) return "/option-2.html";
  if (path.endsWith("/option-3.html") || path.endsWith("/option-3")) return "/option-3.html";
  if (path.endsWith("/option-4.html") || path.endsWith("/option-4")) return "/option-4.html";
  if (path === "/" || path.endsWith("/index.html")) return "/current.html";
  return path;
}

function initSharedNav() {
  const active = currentNavKey();

  const nav = document.querySelector(".tr-nav-links");
  if (nav) {
    const brief = nav.querySelector("[data-design-brief-open], .tr-nav-brief");
    nav.querySelectorAll(".tr-landing-header-nav-link").forEach((el) => el.remove());
    const frag = document.createDocumentFragment();
    NAV_ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.className = `tr-landing-header-nav-link${item.href === active ? " is-active" : ""}`;
      a.textContent = item.label;
      frag.appendChild(a);
    });
    if (brief) nav.insertBefore(frag, brief);
    else nav.appendChild(frag);
  }

  const drawer = document.querySelector(".tr-landing-mobile-menu__drawer");
  if (drawer) {
    const brand = drawer.querySelector(".tr-landing-mobile-menu__brand");
    const theme = drawer.querySelector("[data-theme-toggle]");
    const brief = drawer.querySelector("[data-design-brief-open], .tr-landing-mobile-menu__brief");
    drawer.querySelectorAll("a.tr-landing-mobile-menu__item").forEach((a) => a.remove());
    const frag = document.createDocumentFragment();
    NAV_ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.className = `tr-landing-mobile-menu__item${item.href === active ? " is-active" : ""}`;
      a.textContent = item.label;
      frag.appendChild(a);
    });
    const anchor = theme || brand;
    if (anchor && anchor.nextSibling) drawer.insertBefore(frag, anchor.nextSibling);
    else if (brief) drawer.insertBefore(frag, brief);
    else drawer.appendChild(frag);
  }

  document.querySelectorAll('a[href="/"]').forEach((a) => {
    const t = (a.textContent || "").trim().toLowerCase();
    if (t.includes("option 1")) a.setAttribute("href", "/option-1.html");
  });
}

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
    void slide.offsetWidth;
    slide.style.animation = "";
    if (mobile) mobile.innerHTML = `${promo.message}<a href="#" class="inline-flex items-center gap-1 border-b border-white cursor-pointer ml-2 text-[14px] leading-[1.35]">${promo.actionLabel}<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`;
    [...indicators.children].forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
      el.setAttribute("aria-current", i === index ? "true" : "false");
    });
  };

  indicators.innerHTML = PROMOS.map((p, i) => `<button type="button" class="promo-banner-indicator${i === 0 ? " is-active" : ""}" aria-label="Show promotion ${i + 1}" data-promo-index="${i}"></button>`).join("");
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
  const onScroll = () => header?.classList.toggle("tr-landing-header--scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.getElementById("mobile-menu-btn");
  const closeBtn = document.getElementById("mobile-menu-close");
  openBtn?.addEventListener("click", () => menu?.removeAttribute("hidden"));
  closeBtn?.addEventListener("click", () => menu?.setAttribute("hidden", ""));
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
      setTimeout(() => { if (label) label.textContent = "Copy"; }, 1500);
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
  const colors = { XAI: "#111111", "Qwen.Color": "#6366f1", "DeepSeek.Color": "#4d6bfe", Moonshot: "#1a1a1a", OpenAI: "#10a37f", "Claude.Color": "#d97757", "Gemini.Color": "#4285f4", ZAI: "#3b82f6", "Minimax.Color": "#111827", "Nvidia.Color": "#76b900" };
  const letters = { XAI: "X", "Qwen.Color": "Q", "DeepSeek.Color": "D", Moonshot: "K", OpenAI: "O", "Claude.Color": "A", "Gemini.Color": "G", ZAI: "Z", "Minimax.Color": "M", "Nvidia.Color": "N" };
  const color = colors[model.icon] || "#64748b";
  const letter = letters[model.icon] || (model.model_name?.[0] || "?").toUpperCase();
  return `<div class="tr-landing-model-access-row flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-transparent px-[16px] py-[12px] text-left transition hover:border-sky-200 lg:rounded-2xl lg:px-4 lg:py-3"><div class="flex min-w-0 flex-1 items-center gap-3"><span class="tr-landing-model-access-icon h-6 w-6 flex items-center justify-center shrink-0 opacity-40 rounded-full text-[10px] font-medium text-white" style="background:${color}">${letter}</span><div class="min-w-0 flex-1"><div class="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden"><span class="tr-landing-model-access-model-name block min-w-0 flex-1 truncate" style="color:#121317;font-family:'PP Neue Montreal',sans-serif;font-size:16px;font-weight:500;line-height:140%">${model.model_name}</span></div><p class="tr-landing-model-access-model-desc mt-1 truncate text-[12px] text-slate-500 lg:text-sm m-0">${model.vendor_desc}</p></div></div><span class="tr-landing-model-access-dot ml-3 h-[6px] w-[6px] rounded-full bg-[#0086FF] shrink-0"></span></div>`;
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

initSharedNav();
initPromoBanner();
initHeader();
initCopy();
initFaq();
initModelMarquee();

// Every entry point loads replica.js. Load the Design Exercise module here so
// the modal works consistently even on pages that do not explicitly import it.
import("./design-brief.js");
