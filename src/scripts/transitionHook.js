import { pixelChunkTransition } from "../utils/pixelTransition";

/**
 * This runs on every Astro navigation event
 * and wraps the page change inside your pixel effect.
 */

document.addEventListener("astro:before-preparation", async (event) => {
  const to = event?.detail?.to;
  if (!to) return;

  // stop Astro from instantly swapping DOM
  event.preventDefault?.();

  await pixelChunkTransition(async () => {
    // trigger navigation manually
    window.location.href = to;
  });
});