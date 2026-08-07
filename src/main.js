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
  const indicators = document.querySelector("[data-promo-indicators]");
  if (!slide || !indicators) return;

  let index = 0;

  const render = () => {
    const promo = PROMOS[index];
    if (badge) badge.textContent = promo.badgeLabel;
    slide.innerHTML = `${promo.message} <a href="#" class="promo__action">${promo.actionLabel} →</a>`;
    [...indicators.children].forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
    });
  };

  indicators.innerHTML = PROMOS.map(
    (p, i) =>
      `<button type="button" class="promo__dot${i === 0 ? " is-active" : ""}" aria-label="Show promotion ${i + 1}" data-promo-index="${i}"></button>`,
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
      if (label) label.textContent = "Copied";
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
        other.querySelector("[data-faq-trigger]")?.setAttribute("aria-expanded", "false");
        other.querySelector("[data-faq-panel]")?.classList.remove("is-open");
        other.querySelector("[data-faq-icon]")?.classList.remove("is-open");
      });
      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel?.classList.add("is-open");
        icon?.classList.add("is-open");
      }
    });
  });
}

function modelRow(model) {
  return `<div class="model-row">
    <span class="model-row__bullet" aria-hidden="true"></span>
    <div>
      <p class="model-row__name">${model.model_name}</p>
      <p class="model-row__desc">${model.vendor_desc}</p>
    </div>
    <span class="model-row__dot" aria-hidden="true"></span>
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
      track.innerHTML = sorted.map(modelRow).join("") + sorted.map(modelRow).join("");
    }
  } catch {
    // keep fallback rows
  }

  let offset = 0;
  const speed = 0.28;
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
