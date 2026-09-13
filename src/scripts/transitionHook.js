import { runTransition } from "../utils/transitions";

/**
 * Reads the page-transition name from <html data-transition="..."> and runs
 * the matching transition on every Astro navigation event. (`data-theme` on
 * <html> holds the theme token for fonts.css and is a separate concern.)
 */

function getAnimationName() {
  return document.documentElement.getAttribute("data-transition") || "pixel";
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
