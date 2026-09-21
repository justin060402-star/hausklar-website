(function () {
  "use strict";

  var widget = document.getElementById("whatsappWidget");
  if (!widget) return;

  var hero = document.querySelector(".hero");
  var trigger = document.querySelector(".kundenstimmen-slide") || hero;

  function show() {
    widget.classList.add("is-visible");
  }
  function hide() {
    widget.classList.remove("is-visible");
  }

  if (!trigger) {
    window.setTimeout(show, 2500);
    return;
  }

  var ticking = false;

  function onScroll() {
    if (trigger.getBoundingClientRect().top <= window.innerHeight * 0.6) {
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
