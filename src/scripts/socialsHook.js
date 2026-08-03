function attachSocials() {
  const container = document.getElementById('socials-container');
  const toggle = document.getElementById('socials-toggle');
  if (!container || !toggle) return;

  if (container.__socialsAttached) return;

  const onToggle = (e) => {
    e.stopPropagation();
    container.classList.toggle('socials-open');
  };

  const onMouseEnter = () => container.classList.add('socials-open');
  const onMouseLeave = () => container.classList.remove('socials-open');
  const onDocClick = (e) => {
    if (!container.contains(e.target)) container.classList.remove('socials-open');
  };

  toggle.addEventListener('click', onToggle);
  container.addEventListener('mouseenter', onMouseEnter);
  container.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('click', onDocClick);

  container.__socialsAttached = true;
  container.__socialsHandlers = { onToggle, onMouseEnter, onMouseLeave, onDocClick };
}

function detachSocials() {
  const container = document.getElementById('socials-container');
  if (!container || !container.__socialsAttached) return;
  const h = container.__socialsHandlers || {};
  const toggle = document.getElementById('socials-toggle');
  if (toggle && h.onToggle) toggle.removeEventListener('click', h.onToggle);
  if (h.onMouseEnter) container.removeEventListener('mouseenter', h.onMouseEnter);
  if (h.onMouseLeave) container.removeEventListener('mouseleave', h.onMouseLeave);
  if (h.onDocClick) document.removeEventListener('click', h.onDocClick);
  delete container.__socialsAttached;
  delete container.__socialsHandlers;
}

function init() {
  // attach on first load
  attachSocials();

  // re-attach after Astro client-side navigations
  document.addEventListener('astro:after-swap', () => {
    try {
      detachSocials();
      attachSocials();
    } catch (err) {
      console.error('socialsHook: error reattaching handlers', err);
    }
  });

  // also attach on DOM mutations (fallback)
  const obs = new MutationObserver(() => {
    attachSocials();
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
