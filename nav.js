// nav.js — Frozen Diamond Classic (mobile hamburger only)
(function () {
  function initMobileNav() {
    const header = document.querySelector(".siteHeader");
    const btn = document.querySelector(".navToggle");
    const nav = document.getElementById("siteNav");
    const overlay = document.querySelector(".navOverlay");

    if (!header || !btn || !nav || !overlay) return;

    function openMenu() {
      document.body.classList.add("navOpen");
      btn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      document.body.classList.remove("navOpen");
      btn.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      if (document.body.classList.contains("navOpen")) closeMenu();
      else openMenu();
    }

    // Button toggles menu
    btn.addEventListener("click", toggleMenu);

    // Tap outside closes
    overlay.addEventListener("click", closeMenu);

    // Clicking any nav link closes
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) closeMenu();
    });

    // Close on scroll (prevents “menu stays open behind content”)
    window.addEventListener(
      "scroll",
      () => {
        if (document.body.classList.contains("navOpen")) closeMenu();
      },
      { passive: true }
    );

    // Close on Escape (desktop debugging / accessibility)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // Run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav);
  } else {
    initMobileNav();
  }
})();

