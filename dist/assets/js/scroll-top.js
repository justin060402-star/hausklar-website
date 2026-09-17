(function () {
  "use strict";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "scroll-top-btn";
  btn.setAttribute("aria-label", "Nach oben scrollen");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var currentY = window.scrollY;

    if (currentY < 80) {
      btn.classList.remove("is-visible");
    } else if (currentY < lastY - 4) {
      btn.classList.add("is-visible");
    } else if (currentY > lastY + 4) {
      btn.classList.remove("is-visible");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  btn.addEventListener("click", function () {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
})();
