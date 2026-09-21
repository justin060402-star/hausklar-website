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
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var currentY = window.scrollY;

    if (currentY < threshold) {
      hide();
    } else if (currentY < lastY - 4) {
      show();
    } else if (currentY > lastY + 4) {
      hide();
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
})();
