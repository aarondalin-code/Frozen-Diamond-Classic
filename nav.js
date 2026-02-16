(() => {
  const toggle = document.querySelector(".navToggle");
  const overlay = document.querySelector(".navOverlay");
  const nav = document.getElementById("siteNav");

  if (!toggle || !overlay || !nav) return;

  function openMenu() {
    document.documentElement.classList.add("navOpen");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    toggle.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return document.documentElement.classList.contains("navOpen");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  // Close when a link is clicked
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // Close if user tries to scroll while open (solves the "stays open behind content" problem)
  window.addEventListener("scroll", () => {
    if (isOpen()) closeMenu();
  }, { passive: true });

  // Close on orientation change / resize
  window.addEventListener("resize", () => {
    if (isOpen()) closeMenu();
  });

  // Escape closes (desktop testing)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });
})();




