(function () {
  const btn = document.querySelector(".navToggle");
  const nav = document.getElementById("siteNav");
  const overlay = document.querySelector(".navOverlay");

  if (!btn || !nav || !overlay) return;

  const mq = window.matchMedia("(max-width: 820px)");

  function isOpen() {
    return document.documentElement.classList.contains("navOpen");
  }

  function openMenu() {
    if (!mq.matches) return; // only on mobile
    document.documentElement.classList.add("navOpen");
    btn.setAttribute("aria-expanded", "true");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    btn.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
  }

  // Toggle
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // Click overlay closes
  overlay.addEventListener("click", closeMenu);

  // Clicking a nav link closes
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // KEY FIX: close menu when the user scrolls/touches (so it never "sticks")
  let scrollCloseArmed = false;

  function armScrollClose() {
    if (scrollCloseArmed) return;
    scrollCloseArmed = true;

    // next user gesture closes it
    const closeOnMove = () => {
      if (isOpen()) closeMenu();
    };

    window.addEventListener("scroll", closeOnMove, { passive: true, once: true });
    window.addEventListener("touchmove", closeOnMove, { passive: true, once: true });
  }

  // When menu opens, arm the “close on scroll”
  const observer = new MutationObserver(() => {
    if (isOpen()) armScrollClose();
    else scrollCloseArmed = false;
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // Safety: if you rotate / go desktop width, close it
  window.addEventListener("resize", () => {
    if (!mq.matches) closeMenu();
  });

  // Start closed
  closeMenu();
})();


