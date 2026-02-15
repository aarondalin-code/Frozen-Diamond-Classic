(function(){
  function initNav(){
    const btn = document.querySelector(".navToggle");
    const nav = document.getElementById("siteNav");
    if (!btn || !nav) return;

    function setOpen(open){
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("noScroll", open);
    }

    btn.addEventListener("click", () => {
      setOpen(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", (e) => {
      if (e.target && e.target.tagName === "A") setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();
