(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof Lenis === "undefined") return;

  var lenis = new Lenis({
    duration: 1.1,
    easing: function (t) {
      return Math.min(1, 1 - Math.pow(2, -10 * t));
    },
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.1,
  });

  window.__lenis = lenis;

  if (typeof gsap !== "undefined" && gsap.ticker) {
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Anker-Links (z. B. Subtabs) sanft über Lenis scrollen
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90, duration: 1.2 });
    });
  });
})();
