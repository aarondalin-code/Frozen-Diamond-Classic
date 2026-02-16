(() => {
  const btn = document.querySelector(".navToggle");
  const overlay = document.querySelector(".navOverlay");
  const nav = document.getElementById("siteNav");
  if (!btn || !overlay || !nav) return;

  function openMenu() {
    document.documentElement.classList.add("navOpen");
    btn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    btn.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return document.documentElement.classList.contains("navOpen");
  }

  // Toggle
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen() ? closeMenu() : openMenu();
  });

  // Click outside closes
  overlay.addEventListener("click", closeMenu);

  // Tapping a link closes
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // BIG FIX: scrolling closes menu (so you never get stuck)
  window.addEventListener("scroll", () => {
    if (isOpen()) closeMenu();
  }, { passive: true });

  // iOS: touch scroll gesture should also close
  window.addEventListener("touchmove", () => {
    if (isOpen()) closeMenu();
  }, { passive: true });
})();



