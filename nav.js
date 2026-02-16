(() => {
  const btn = document.querySelector(".navToggle");
  const overlay = document.querySelector(".navOverlay");
  const nav = document.getElementById("siteNav");

  if (!btn || !overlay || !nav) return;

  function openMenu() {
    document.documentElement.classList.add("navOpen");
    document.body.classList.add("navOpen");
    btn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    document.body.classList.remove("navOpen");
    btn.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return document.documentElement.classList.contains("navOpen");
  }

  btn.addEventListener("click", () => {
    if (isOpen()) closeMenu();
    else openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  // Close when a link is tapped
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // Close on scroll (your requirement)
  let scrollTimeout = null;
  window.addEventListener("scroll", () => {
    if (!isOpen()) return;
    // close immediately on scroll start
    closeMenu();
    // guard against bounce / momentum: don't reopen, just ensure closed
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => closeMenu(), 150);
  }, { passive: true });

  // Close on orientation change / resize
  window.addEventListener("resize", () => {
    if (isOpen()) closeMenu();
  });

  // Escape key (desktop testing)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });
})();

