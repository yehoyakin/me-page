import { runTransition } from "../utils/transitions";

/**
 * Reads the current animation name from <html data-theme="..."> and
 * runs the matching page transition on every Astro navigation event.
 */

function getAnimationName() {
  return document.documentElement.getAttribute("data-theme") || "pixel";
}

document.addEventListener("astro:before-preparation", async (event) => {
  const to = event?.detail?.to;
  if (!to) return;

  // Stop Astro from instantly swapping DOM
  try {
    event.preventDefault?.();
  } catch (err) {
    console.error("transitionHook: error preventing default", err);
  }

  const animation = getAnimationName();

  try {
    await runTransition(animation, async () => {
      try {
        window.location.assign(to);
      } catch (err) {
        console.error("transitionHook: navigation error", err);
        window.location.href = to;
      }
    });
  } catch (err) {
    console.error("transitionHook: transition failed, navigating directly", err);
    window.location.href = to;
  }
});
