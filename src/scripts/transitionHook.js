import { pixelChunkTransition } from "../utils/pixelTransition";

/**
 * This runs on every Astro navigation event
 * and wraps the page change inside your pixel effect.
 */

document.addEventListener("astro:before-preparation", async (event) => {
  const to = event?.detail?.to;
  console.debug("transitionHook: astro:before-preparation", { to, detail: event?.detail });
  if (!to) return;

  // stop Astro from instantly swapping DOM
  try {
    event.preventDefault?.();
  } catch (err) {
    console.error("transitionHook: error preventing default", err);
  }

  try {
    await pixelChunkTransition(async () => {
      // trigger navigation manually
      try {
        window.location.assign(to);
      } catch (err) {
        console.error("transitionHook: error during navigation assign", err, to);
        window.location.href = to;
      }
    });
  } catch (err) {
    console.error("transitionHook: pixelChunkTransition failed, navigating directly", err);
    window.location.href = to;
  }
});