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

const FALLBACK_MODELS = [
  { model_name: "x-ai/grok-4.5", icon: "XAI", sort: 11, vendor_desc: "XAI · reasoning model" },
  { model_name: "happyhorse-1.0-t2v", icon: "Qwen.Color", sort: 10, vendor_desc: "HappyHorse · AI video" },
  { model_name: "deepseek/deepseek-v4-pro", icon: "DeepSeek.Color", sort: 9, vendor_desc: "DeepSeek · reasoning model" },
  { model_name: "moonshotai/kimi-k3", icon: "Moonshot", sort: 8, vendor_desc: "Kimi · long-context model" },
  { model_name: "openai/gpt-5.6-sol", icon: "OpenAI", sort: 7, vendor_desc: "GPT · frontier model" },
  { model_name: "anthropic/claude-fable-5", icon: "Claude.Color", sort: 6, vendor_desc: "Claude · reasoning model" },
  { model_name: "google/gemini-3.5-flash", icon: "Gemini.Color", sort: 5, vendor_desc: "Gemini · foundation model" },
  { model_name: "z-ai/glm-5.2", icon: "ZAI", sort: 4, vendor_desc: "GLM · foundation model" },
  { model_name: "qwen/qwen3.7-plus", icon: "Qwen.Color", sort: 3, vendor_desc: "Qwen · open model" },
  { model_name: "MiniMax-M3", icon: "Minimax.Color", sort: 2, vendor_desc: "MiniMax · foundation model" },
  { model_name: "nvidia/nemotron-3-super-120b-a12b", icon: "Nvidia.Color", sort: 1, vendor_desc: "Nemotron · foundation model" },
];

const MODEL_ICON_MAP = {
  XAI: { src: "/assets/models/xai.svg", mono: true },
  "Qwen.Color": { src: "/assets/models/qwen-color.svg", mono: false },
  "DeepSeek.Color": { src: "/assets/models/deepseek-color.svg", mono: false },
  Moonshot: { src: "/assets/models/moonshot.svg", mono: true },
  OpenAI: { src: "/assets/models/openai.svg", mono: true },
  "Claude.Color": { src: "/assets/models/claude-color.svg", mono: false },
  "Gemini.Color": { src: "/assets/models/gemini-color.svg", mono: false },
  ZAI: { src: "/assets/models/zai.svg", mono: true },
  "Minimax.Color": { src: "/assets/models/minimax-color.svg", mono: false },
  "Nvidia.Color": { src: "/assets/models/nvidia-color.svg", mono: false },
};

function resolveModelIcon(icon) {
  return MODEL_ICON_MAP[icon] || { src: "/assets/models/openai.svg", mono: true };
}

function modelRow(model) {
  const icon = resolveModelIcon(model.icon);
  const monoClass = icon.mono ? " model-row__logo--mono" : "";
  return `<div class="model-row">
    <span class="model-row__logo${monoClass}" aria-hidden="true"><img src="${icon.src}" alt="" /></span>
    <div>
      <p class="model-row__name">${model.model_name}</p>
      <p class="model-row__desc">${model.vendor_desc}</p>
    </div>
    <span class="model-row__dot" aria-hidden="true"></span>
  </div>`;
}

function renderModelTrack(track, models) {
  const sorted = [...models].sort((a, b) => (b.sort || 0) - (a.sort || 0));
  const rows = sorted.map(modelRow).join("");
  track.innerHTML = rows + rows;
}

async function initModelMarquee() {
  const track = document.getElementById("model-track");
  if (!track) return;

  renderModelTrack(track, FALLBACK_MODELS);

  try {
    const res = await fetch("https://api.tokenrouter.com/api/landing-page-models");
    const json = await res.json();
    if (json?.success && Array.isArray(json.data) && json.data.length) {
      renderModelTrack(track, json.data);
    }
  } catch {
    // fallback rows already rendered
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

const TRUSTED_LOGOS = [
  { src: "/assets/higgsfield.png", alt: "Higgsfield" },
  { src: "/assets/epsilla.png", alt: "Epsilla" },
  { src: "/assets/clawith.png", alt: "Clawith" },
  { src: "/assets/topify.png", alt: "Topify" },
  { src: "/assets/bake-ai.png", alt: "Bake AI" },
  { src: "/assets/storyverse.png", alt: "Storyverse" },
  { src: "/assets/miromind.png", alt: "MiroMind" },
  { src: "/assets/fellou.png", alt: "Fellou AI" },
  { src: "/assets/flowgpt.png", alt: "FlowGPT" },
  { src: "/assets/wayo.png", alt: "WAYO" },
  { src: "/assets/stanford.png", alt: "Stanford" },
  { src: "/assets/botlearn.png", alt: "BotLearn.ai" },
];

function initTrustedLogoRotator() {
  const img = document.getElementById("trusted-logo");
  if (!img || TRUSTED_LOGOS.length < 2) return;

  let index = 0;
  const show = (nextIndex) => {
    img.classList.remove("is-active");
    img.classList.add("is-exit");
    window.setTimeout(() => {
      const logo = TRUSTED_LOGOS[nextIndex];
      img.src = logo.src;
      img.alt = logo.alt;
      img.classList.remove("is-exit");
      void img.offsetWidth;
      img.classList.add("is-active");
      index = nextIndex;
    }, 280);
  };

  window.setInterval(() => {
    show((index + 1) % TRUSTED_LOGOS.length);
  }, 2800);
}

initTrustedLogoRotator();

