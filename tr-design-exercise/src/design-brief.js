import "./design-brief.css";

const BRIEF_HTML = `
  <div class="design-brief" id="design-brief" hidden role="dialog" aria-modal="true" aria-labelledby="design-brief-title">
    <button type="button" class="design-brief__backdrop" data-design-brief-close aria-label="Close design exercise"></button>
    <div class="design-brief__card">
      <header class="design-brief__header">
        <div>
          <p class="design-brief__eyebrow">Hiring Brief</p>
          <h2 class="design-brief__title" id="design-brief-title">TokenRouter UI/UX Design Exercise</h2>
        </div>
        <button type="button" class="design-brief__close" data-design-brief-close aria-label="Close">&times;</button>
      </header>
      <div class="design-brief__body">
        <section class="design-brief__section">
          <h3 class="design-brief__section-title">Project Background / 项目背景</h3>
          <p class="design-brief__lead">TokenRouter is an AI Model Platform for developers and enterprises, providing a unified AI model access and usage experience.</p>
          <p>This design exercise calls for a redesign of the <strong>TokenRouter Homepage</strong> based on the current website content and brand positioning.</p>
          <p>The goal is to evaluate the candidate's visual design skills, brand comprehension, UX judgment, and ability to express technology products, rather than delivering a commercial project.</p>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">Design Requirements / 设计要求</h3>
          <p>Redesign the entire TokenRouter Homepage based on existing website content and product positioning.</p>
          <div class="design-brief__callout">
            Core Principles: Clean, Clear, Easy to Use, with significantly stronger design aesthetics and brand recognition than the current version.
          </div>
          <p>The new design should reflect TokenRouter's unique product and brand attributes around these core concepts:</p>
          <div class="design-brief__chips" aria-label="Visual exploration themes">
            <span class="design-brief__chip">Token</span>
            <span class="design-brief__chip">Routing</span>
            <span class="design-brief__chip">AI Models</span>
            <span class="design-brief__chip">Data Flow</span>
            <span class="design-brief__chip">Connection</span>
            <span class="design-brief__chip">API / AI Infrastructure</span>
          </div>
          <p>Desired Overall Style:</p>
          <div class="design-brief__chips" aria-label="Desired style">
            <span class="design-brief__chip">Modern</span>
            <span class="design-brief__chip">Professional</span>
            <span class="design-brief__chip">Technology</span>
            <span class="design-brief__chip">Premium</span>
          </div>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">Motion & Interaction / 动效与交互</h3>
          <p>Appropriately incorporate Motion Design / Micro-interactions on the new homepage to enhance the overall experience and brand perception.</p>
          <p>There are no restrictions on motion quantity or style. Candidates may decide based on their design proposal, such as:</p>
          <ul class="design-brief__list">
            <li>Hero Section Visuals</li>
            <li>Token / Data Flow</li>
            <li>Model Routing</li>
            <li>Page Scrolling</li>
            <li>Hover Effects</li>
            <li>Section Transitions</li>
            <li>Interactive elements that strengthen brand or product comprehension</li>
          </ul>
          <p>Evaluation focuses on whether motion aligns with the core design concept and product story, rather than mere visual complexity.</p>
        </section>

        <section class="design-brief__section">
          <h3 class="design-brief__section-title">Deliverables & Scope / 交付内容</h3>
          <div class="design-brief__callout">
            <strong>Required Deliverable: TokenRouter Homepage Desktop Version</strong>
          </div>
          <p>Production-level completeness is not required. Evaluation centers on:</p>
          <ul class="design-brief__list">
            <li>Design Style & Brand Thinking</li>
            <li>UX Judgment & Visual Quality</li>
            <li>Motion & Interaction Design</li>
          </ul>
          <p class="design-brief__meta">Suggested Time Investment: 1–2 hours</p>
          <p>Candidates are encouraged to utilize AI tools to boost design and development efficiency.</p>
          <p>Submissions can be Figma design files or an interactive Web Prototype / Demo.</p>
          <p>No additional content pages, mobile versions, full design systems, or production-ready code are required.</p>
          <p class="text-xs opacity-75">Note: This exercise is strictly for recruitment evaluation purposes and will not be used commercially.</p>
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
  if (!root) return;
  root.hidden = false;
  document.body.classList.add("design-brief-open");
}

function closeBrief() {
  const root = document.getElementById("design-brief");
  if (!root) return;
  root.hidden = true;
  document.body.classList.remove("design-brief-open");
}

window.openDesignBrief = openBrief;
window.closeDesignBrief = closeBrief;

function bind() {
  const root = ensureBrief();

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const openEl = target.closest("[data-design-brief-open]");
    const closeEl = target.closest("[data-design-brief-close]");
    if (openEl) {
      event.preventDefault();
      event.stopPropagation();
      openBrief();
      return;
    }
    if (closeEl) {
      event.preventDefault();
      event.stopPropagation();
      closeBrief();
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBrief();
  }, true);

  root?.querySelector(".design-brief__close")?.addEventListener("click", closeBrief, true);
  root?.querySelector(".design-brief__backdrop")?.addEventListener("click", closeBrief, true);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bind, { once: true });
} else {
  bind();
}
