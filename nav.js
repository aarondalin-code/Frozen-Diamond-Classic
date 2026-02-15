(function () {
  const nav = document.getElementById("siteNav");
  const btn = nav ? nav.querySelector(".navToggle") : null;
  if (!nav || !btn) return;

  let lockedScrollY = 0;

  function lockScroll() {
    lockedScrollY = window.scrollY || 0;
    document.body.classList.add("menuOpen");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.classList.remove("menuOpen");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  }

  function openMenu() {
    nav.classList.add("isOpen");
    btn.setAttribute("aria-expanded", "true");
    lockScroll();
  }

  function closeMenu() {
    nav.classList.remove("isOpen");
    btn.setAttribute("aria-expanded", "false");
    unlockScroll();
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    nav.classList.contains("isOpen") ? closeMenu() : openMenu();
  });

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a && nav.classList.contains("isOpen")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("isOpen")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && nav.classList.contains("isOpen")) closeMenu();
  }, { passive: true });
})();

