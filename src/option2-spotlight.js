/**
 * Organic spotlight reveal with spring inertia + velocity warp.
 * Only content under the moving spotlight is visible.
 */
function createSpotlight(host) {
  const content = host.querySelector("[data-spotlight-content]");
  if (!content) return;

  let targetX = 0.5;
  let targetY = 0.45;
  let x = 0.5;
  let y = 0.45;
  let vx = 0;
  let vy = 0;
  let hovering = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stiffness = 0.09;
  const damping = 0.8;

  const setTargetFromEvent = (e) => {
    const rect = host.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    targetX = Math.min(0.98, Math.max(0.02, (e.clientX - rect.left) / rect.width));
    targetY = Math.min(0.98, Math.max(0.02, (e.clientY - rect.top) / rect.height));
  };

  host.addEventListener("pointerenter", (e) => {
    hovering = true;
    setTargetFromEvent(e);
  });
  host.addEventListener("pointermove", (e) => {
    hovering = true;
    setTargetFromEvent(e);
  });
  host.addEventListener("pointerleave", () => {
    hovering = false;
    targetX = 0.5;
    targetY = 0.45;
  });

  const applyMask = (cx, cy, major, minor, angleDeg, warp) => {
    // Dual overlapping ellipses → irregular organic spotlight
    const x1 = cx * 100;
    const y1 = cy * 100;
    const x2 = (cx + Math.cos((angleDeg * Math.PI) / 180) * 0.04 * (1 + warp)) * 100;
    const y2 = (cy + Math.sin((angleDeg * Math.PI) / 180) * 0.05 * (1 + warp)) * 100;
    const rx1 = major * 100;
    const ry1 = minor * 100;
    const rx2 = major * 72;
    const ry2 = minor * 88;

    const mask = [
      `radial-gradient(${rx1}% ${ry1}% at ${x1}% ${y1}%, #000 0%, #000 38%, rgba(0,0,0,0.55) 58%, transparent 76%)`,
      `radial-gradient(${rx2}% ${ry2}% at ${x2}% ${y2}%, #000 0%, #000 30%, transparent 64%)`,
    ].join(", ");

    content.style.webkitMaskImage = mask;
    content.style.maskImage = mask;
    content.style.webkitMaskComposite = "source-over";
    content.style.maskComposite = "add";
    content.style.webkitMaskRepeat = "no-repeat";
    content.style.maskRepeat = "no-repeat";
    content.style.webkitMaskSize = "100% 100%";
    content.style.maskSize = "100% 100%";
  };

  let angle = 0;

  const tick = () => {
    if (!reducedMotion) {
      const ax = (targetX - x) * stiffness;
      const ay = (targetY - y) * stiffness;
      vx = (vx + ax) * damping;
      vy = (vy + ay) * damping;
      x += vx;
      y += vy;

      const speed = Math.hypot(vx, vy);
      // Faster motion → stronger warp (physics inertia feel)
      const warp = Math.min(speed * 16, 0.65);

      if (speed > 0.00035) {
        const targetAngle = (Math.atan2(vy, vx) * 180) / Math.PI;
        const diff = ((targetAngle - angle + 540) % 360) - 180;
        angle += diff * 0.2;
      }

      // Stretch along travel direction, squeeze perpendicular
      const major = 0.34 * (1 + warp * 1.25);
      const minor = 0.4 * (1 - warp * 0.48);

      // Bias stretch by axis of velocity for CSS radial-gradient (no true rotate)
      const absVx = Math.abs(vx);
      const absVy = Math.abs(vy);
      const axisBias = absVx + absVy > 0.0001 ? absVx / (absVx + absVy) : 0.5;
      const rx = major * (0.7 + axisBias * 0.6) * (1 + warp * 0.35);
      const ry = minor * (0.7 + (1 - axisBias) * 0.6) * (1 + warp * 0.2);

      applyMask(x, y, rx, ry, angle, warp);
    } else {
      applyMask(targetX, targetY, 0.36, 0.42, 0, 0);
    }

    host.classList.toggle("is-hovering", hovering);
    requestAnimationFrame(tick);
  };

  applyMask(x, y, 0.34, 0.4, 0, 0);
  requestAnimationFrame(tick);
}

export function initSpotlights() {
  document.querySelectorAll("[data-spotlight]").forEach(createSpotlight);
}

initSpotlights();
