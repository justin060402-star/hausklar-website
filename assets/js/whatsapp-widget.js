(function () {
  "use strict";

  var widget = document.getElementById("whatsappWidget");
  if (!widget) return;

  var kundenstimmen = document.querySelector(".kundenstimmen-slide");
  var leistungenHero = document.querySelector(".page-hero-top");
  var hero = document.querySelector(".hero");

  var trigger = kundenstimmen || leistungenHero || hero;
  var waitUntilFullyPast = !kundenstimmen && !!leistungenHero;

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
    var rect = trigger.getBoundingClientRect();
    var shouldShow = waitUntilFullyPast ? rect.bottom <= 0 : rect.top <= window.innerHeight;
    if (shouldShow) {
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
