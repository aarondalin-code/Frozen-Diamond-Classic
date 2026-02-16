(function () {
  const btn = document.querySelector(".hasHamburger .navToggle");
  const overlay = document.querySelector(".hasHamburger .navOverlay");
  const nav = document.querySelector(".hasHamburger .nav");

  if (!btn || !overlay || !nav) return;

  function openMenu() {
    document.documentElement.classList.add("navOpen");
    btn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.documentElement.classList.remove("navOpen");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", () => {
    const open = document.documentElement.classList.contains("navOpen");
    open ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // Close if user rotates / resizes into desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 821) closeMenu();
  });

  // Esc to close (if keyboard present)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();




