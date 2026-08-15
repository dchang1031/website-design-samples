import "./design-brief.css";

const BRIEF_HTML = `
  <div class="design-brief" id="design-brief" hidden role="dialog" aria-modal="true" aria-labelledby="design-brief-title">
    <button type="button" class="design-brief__backdrop" data-design-brief-close aria-label="Close design exercise"></button>
    <div class="design-brief__card">
      <header class="design-brief__header">
        <div>
          <p class="design-brief__eyebrow">Hiring brief</p>
          <h2 class="design-brief__title" id="design-brief-title">TokenRouter UI/UX Design Exercise</h2>
        </div>
        <button type="button" class="design-brief__close" data-design-brief-close aria-label="Close">&times;</button>
      </header>

      <div class="design-brief__body">
        <section class="design-brief__section">
          <h3 class="design-brief__section-title">项目背景</h3>
          <p class="design-brief__lead">TokenRouter 是一个面向开发者和企业用户的 AI Model Platform，为用户提供统一的 AI 模型接入和使用体验。</p>
          <p>本次希望基于现有 TokenRouter 官网，对<strong>官网首页（Homepage）</strong>进行一次重新设计。</p>
          <p>本次作业主要希望了解候选人的视觉设计能力、品牌理解、UX 判断以及对科技类产品的设计表达能力，并非实际商业项目交付。</p>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">设计要求</h3>
          <p>请在现有官网内容和产品定位的基础上，对 TokenRouter Homepage 整体进行重新设计。</p>
          <div class="design-brief__callout">
            核心原则是：简洁、清晰、易用，同时比现有版本具有更强的设计感和品牌辨识度。
          </div>
          <p>我们希望新版设计能够体现 TokenRouter 自身的产品和品牌特点，可以围绕以下概念进行视觉探索：</p>
          <div class="design-brief__chips" aria-label="Visual exploration themes">
            <span class="design-brief__chip">Token</span>
            <span class="design-brief__chip">Routing</span>
            <span class="design-brief__chip">AI Models</span>
            <span class="design-brief__chip">Data Flow</span>
            <span class="design-brief__chip">Connection</span>
            <span class="design-brief__chip">API / AI Infrastructure</span>
          </div>
          <p>整体风格希望更加：</p>
          <div class="design-brief__chips" aria-label="Desired style">
            <span class="design-brief__chip">Modern</span>
            <span class="design-brief__chip">Professional</span>
            <span class="design-brief__chip">Technology</span>
            <span class="design-brief__chip">Premium</span>
          </div>
          <p>希望形成与 TokenRouter 产品本身有关的设计语言。</p>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">动效与交互</h3>
          <p>希望新版首页能够适当加入 Motion Design / Micro-interactions，提升整体体验和品牌感。</p>
          <p>动效的数量和形式不做限制，由候选人根据自己的设计方案决定。可以用于：</p>
          <ul class="design-brief__list">
            <li>Hero 主视觉</li>
            <li>Token / Data Flow</li>
            <li>Model Routing</li>
            <li>页面滚动</li>
            <li>Hover</li>
            <li>Section Transition</li>
            <li>其他能够强化品牌或帮助理解产品的交互</li>
          </ul>
          <p>我们更关注动效是否与整体设计理念和产品概念结合，而不是单纯追求复杂效果。</p>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">交付内容</h3>
          <p>只需要完成：</p>
          <div class="design-brief__callout"><strong>TokenRouter Homepage Desktop Version</strong></div>
          <p>本次作业不要求达到实际上线级别的完整度，我们更关注候选人的：</p>
          <ul class="design-brief__list">
            <li>Design Style</li>
            <li>Brand Thinking</li>
            <li>UX Judgment</li>
            <li>Visual Quality</li>
            <li>Motion &amp; Interaction</li>
          </ul>
          <p class="design-brief__meta">建议整体投入时间控制在 1–2 小时以内</p>
          <p>我们鼓励候选人灵活使用自己熟悉的 AI 工具提升设计和实现效率。</p>
          <p>最终可以提交 Figma 设计稿，也可以直接提交可交互的 Web Prototype / Demo，不限制具体实现方式。</p>
          <p>不需要设计其他内容页、Mobile Version、完整 Design System，也不要求 Production-ready Code。</p>
          <p>本次设计仅用于招聘评估，不会直接作为实际商业设计交付使用。</p>
        </section>
      </div>
    </div>
  </div>
`;

function ensureBrief() {
  let root = document.getElementById("design-brief");
  if (!root) {
    document.body.insertAdjacentHTML("beforeend", BRIEF_HTML);
    root = document.getElementById("design-brief");
  }
  return root;
}

function openBrief() {
  const root = ensureBrief();
  root.hidden = false;
  document.body.classList.add("design-brief-open");
  const closeBtn = root.querySelector(".design-brief__close");
  closeBtn?.focus();
}

function closeBrief() {
  const root = document.getElementById("design-brief");
  if (!root || root.hidden) return;
  root.hidden = true;
  document.body.classList.remove("design-brief-open");
}

function bind() {
  ensureBrief();

  document.addEventListener("click", (event) => {
    const openEl = event.target.closest("[data-design-brief-open]");
    if (openEl) {
      event.preventDefault();
      openBrief();
      return;
    }
    const closeEl = event.target.closest("[data-design-brief-close]");
    if (closeEl) {
      event.preventDefault();
      closeBrief();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBrief();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bind);
} else {
  bind();
}
