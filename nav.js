(function () {
  const root = document.querySelector(".navWrap");
  if (!root) return;

  const btn = root.querySelector(".navToggle");
  const overlay = root.querySelector(".navOverlay");
  const nav = root.querySelector("#siteNav");
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
    return document.body.classList.contains("navOpen");
  }

  // Toggle button
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  // Click outside to close
  overlay.addEventListener("click", closeMenu);

  // Close when a nav link is clicked (nice UX)
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close on scroll (so it doesn't stay open behind content)
  window.addEventListener("scroll", () => {
    if (isOpen()) closeMenu();
  }, { passive: true });
})();


