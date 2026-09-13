/**
 * Card carousel.
 *
 * Turns a horizontally scrolling strip into a one-card-at-a-time carousel.
 * Swiping/dragging stays native (the strip keeps its `overflow-x` and gains
 * CSS scroll-snap in `styles/base/responsive.css`); this script only adds and
 * syncs the controls — prev/next arrows plus position dots — because the
 * browser scrollbar is hidden.
 *
 * Runs at every screen width. On wide screens the CSS caps the slide width so
 * a card cannot stretch to the whole viewport (see `--carousel-slide`).
 *
 * The controls wrap: prev from the first slide moves to the last one and next
 * from the last moves back to the first, so neither arrow ever runs out of
 * places to go and neither is ever disabled.
 *
 * Markup contract (all optional except `data-carousel` + the track):
 *   <div data-carousel data-carousel-item=".slide" data-carousel-label="Projects">
 *     <div data-carousel-track>
 *       <div class="slide">...</div>
 *     </div>
 *   </div>
 */

function initStrip(scroller) {
  if (scroller.dataset.carouselReady === "true") return;

  const track = scroller.querySelector("[data-carousel-track]");
  if (!track) return;

  const itemSelector = scroller.dataset.carouselItem;
  const getItems = () =>
    itemSelector
      ? Array.from(track.querySelectorAll(`:scope > ${itemSelector}`))
      : Array.from(track.children);

  // A single card has nothing to rotate through.
  if (getItems().length <= 1) return;

  scroller.dataset.carouselReady = "true";

  /* ---------------------------------------------------------
   * Controls
   * --------------------------------------------------------- */

  const controls = document.createElement("div");
  controls.className = "card-carousel-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute(
    "aria-label",
    scroller.dataset.carouselLabel || "Carousel navigation",
  );

  // Crisp SVG chevrons rather than text glyphs. Text arrows render with
  // whatever font ends up applied, which the pixel themes turn into odd or
  // missing shapes; the SVG is the same on every platform. Square caps keep
  // the corners sharp, matching the site's no-border-radius look.
  const ARROW_PATHS = {
    prev: "M15 6 9 12 15 18",
    next: "M9 6 15 12 9 18",
  };

  const makeArrow = (label, direction) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card-carousel-arrow";
    button.setAttribute("aria-label", label);
    button.innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" ` +
      `aria-hidden="true" focusable="false">` +
      `<path d="${ARROW_PATHS[direction]}" /></svg>`;
    return button;
  };

  const prev = makeArrow("Previous slide", "prev");
  const next = makeArrow("Next slide", "next");

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "card-carousel-dots";

  let current = 0;

  const dots = getItems().map((_item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "card-carousel-dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => goTo(index));
    dotsWrap.appendChild(dot);
    return dot;
  });

  controls.append(prev, dotsWrap, next);

  // Sits right after the strip, before any expandable panels.
  scroller.insertAdjacentElement("afterend", controls);

  /* ---------------------------------------------------------
   * Geometry — measured from rects so it does not depend on
   * which ancestor happens to be each item's offsetParent.
   * --------------------------------------------------------- */

  const positions = () => {
    const scrollRect = scroller.getBoundingClientRect();

    return getItems().map((item) => {
      const rect = item.getBoundingClientRect();
      const left = rect.left - scrollRect.left + scroller.scrollLeft;

      return {
        left,
        width: rect.width,
        center: left + rect.width / 2,
      };
    });
  };

  const offsetFor = (index) => {
    const position = positions()[index];
    if (!position) return 0;

    return position.left - (scroller.clientWidth - position.width) / 2;
  };

  function goTo(index) {
    const count = getItems().length;
    if (!count) return;

    // Wrap around, in both directions: -1 -> last, count -> 0.
    const target = ((index % count) + count) % count;

    scroller.scrollTo({ left: offsetFor(target), behavior: "smooth" });
  }

  function sync() {
    const items = positions();
    if (!items.length) return;

    const viewCenter = scroller.scrollLeft + scroller.clientWidth / 2;

    let best = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < items.length; i++) {
      const distance = Math.abs(items[i].center - viewCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }

    current = best;

    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === current ? "true" : "false");
    });
  }

  prev.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));

  /* ---------------------------------------------------------
   * Track position while the user swipes
   * --------------------------------------------------------- */

  let frame = 0;

  scroller.addEventListener(
    "scroll",
    () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    },
    { passive: true },
  );

  /* ---------------------------------------------------------
   * Re-align after the slide width changes (rotation, resize)
   * --------------------------------------------------------- */

  let resizeTimer = 0;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      // Keep the active slide centred after the slide width changes.
      scroller.scrollTo({ left: offsetFor(current) });
      sync();
    }, 150);
  });

  sync();

  return { sync, goTo };
}

export function initCardCarousels(root = document) {
  root.querySelectorAll("[data-carousel]").forEach(initStrip);
}

/* -------------------------------------------------------------------------
 * Re-init after every Astro navigation
 * -------------------------------------------------------------------------
 * Page scripts run once per document, so the second time a listing is shown
 * (back/forward, or any client-side navigation) the router swaps in the
 * server markup — which has no controls — and nothing rebuilds them. The
 * listener is registered as soon as this module loads and stays for the life
 * of the document, so whichever page imported it can rebuild the controls of
 * every carousel that comes into view afterwards. `initStrip` sets
 * `data-carousel-ready`, so the pages' own load-time call is not repeated. */

document.addEventListener("astro:page-load", () => initCardCarousels());
