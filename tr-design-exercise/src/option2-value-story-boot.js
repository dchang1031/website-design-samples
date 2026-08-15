(() => {
  if (!document.querySelector('link[href*="option2-value-story.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/src/option2-value-story.css";
    document.head.appendChild(link);
  }
  const root = document.querySelector("[data-value-story]");
  if (!root) return;
  const headline = root.querySelector("[data-story-headline]");
  if (headline && !root.querySelector("[data-word]")) {
    headline.innerHTML =
      '<span class="value-story__word value-story__word--accent" data-word="0">One</span> ' +
      '<span class="value-story__word" data-word="1">TokenRouter,</span> ' +
      '<span class="value-story__word value-story__word--accent" data-word="2">all</span> ' +
      '<span class="value-story__word" data-word="3">models</span>';
  }
  root.querySelectorAll(".value-story__index").forEach((el) => { el.style.display = "none"; });
})();
