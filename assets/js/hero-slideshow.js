(function () {
  "use strict";

  var INTERVAL_MS = 5000;

  document.querySelectorAll(".hero-slideshow").forEach(function (container) {
    var slides = container.querySelectorAll(".hero-slide");
    if (slides.length < 2) return;

    var current = 0;
    setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, INTERVAL_MS);
  });
})();
