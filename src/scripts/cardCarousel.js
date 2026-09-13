/**
 * Card carousel for phones.
 *
 * Turns a horizontally scrolling strip into a one-card-at-a-time carousel.
 * Swiping stays native (the strip keeps its `overflow-x` and gains CSS
 * scroll-snap in `styles/base/responsive.css`); this script only adds and
 * syncs the controls — prev/next arrows plus position dots — because the
 * browser scrollbar is hidden on phones.
 *
 * Desktop is untouched: the controls are hidden above the phone breakpoint
 * and the strip scrolls freely.
 *
 * Markup contract (all optional except `data-carousel` + the track):
 *   <div data-carousel data-carousel-item=".slide" data-carousel-label="Projects">
 *     <div data-carousel-track>
 *       <div class="slide">...</div>
 *     </div>
 *   </div>
 */

const PHONE_QUERY = "(max-width: 767px)";

const isPhone = () =>
  typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

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

  const makeArrow = (label, glyph) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card-carousel-arrow";
    button.setAttribute("aria-label", label);
    button.innerHTML = `<span aria-hidden="true">${glyph}</span>`;
    return button;
  };

  const prev = makeArrow("Previous slide", "\u25C0");
  const next = makeArrow("Next slide", "\u25B6");

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
    const target = Math.max(0, Math.min(count - 1, index));

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

    prev.disabled = current === 0;
    next.disabled = current === items.length - 1;
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
      if (!isPhone() || frame) return;

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
      if (!isPhone()) return;

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
