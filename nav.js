(() => {
  const body = document.body;

  // Only run on pages that actually use the hamburger system
  if (!body.classList.contains("hasHamburger")) return;

  const toggle = document.querySelector(".navToggle");
  const overlay = document.querySelector(".navOverlay");
  const nav = document.getElementById("siteNav");

  if (!toggle || !overlay || !nav) return;

  function openMenu() {
    document.documentElement.classList.add("navOpen");
    document.body.classList.add("navOpen");
    toggle.setAttribute("aria-expanded", "true");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    document.body.classList.remove("navOpen");
    toggle.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
  }

  function isOpen() {
    return document.documentElement.classList.contains("navOpen");
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
  });

  // Close when a link is clicked
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // Close if user starts scrolling while open (your desired behavior)
  window.addEventListener(
    "scroll",
    () => {
      if (isOpen()) closeMenu();
    },
    { passive: true }
  );

  // Close on orientation change / resize
  window.addEventListener("resize", () => {
    if (isOpen()) closeMenu();
  });

  // Escape closes (desktop testing)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Ensure it starts closed
  closeMenu();
})();





