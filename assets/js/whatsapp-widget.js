(function () {
  "use strict";

  var widget = document.getElementById("whatsappWidget");
  if (!widget) return;

  var hero = document.querySelector(".hero");

  function show() {
    widget.classList.add("is-visible");
  }
  function hide() {
    widget.classList.remove("is-visible");
  }

  if (!hero) {
    window.setTimeout(show, 2500);
    return;
  }

  var threshold = hero.offsetHeight;
  var ticking = false;

  function onScroll() {
    if (window.scrollY >= threshold) {
      show();
    } else {
      hide();
    }
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

  onScroll();
})();
