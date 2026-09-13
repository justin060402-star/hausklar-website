(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showAllReveals() {
    document.querySelectorAll(".reveal, .reveal-scale").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }

  // Sicherheitsnetz nur fuer den Fall, dass GSAP/ScrollTrigger gar nicht laden
  // (CDN-Ausfall, Adblocker) - sonst bliebe alles dauerhaft unsichtbar, da
  // opacity:0 der CSS-Grundzustand ist. Kein pauschaler Timeout mehr, der
  // sonst jedes noch nicht gescrollte Element ungefragt sichtbar schalten wuerde.
  if (typeof gsap === "undefined") {
    showAllReveals();
    return;
  }
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // Trigger-Positionen neu berechnen, sobald alle Bilder geladen sind
    // (verspätet nachladende Bilder koennen sonst Trigger-Punkte verschieben).
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }

  if (prefersReduced) {
    showAllReveals();
  } else {
    // Fade-Reveal beim Scrollen (dezenter Weg, sanftes Abbremsen)
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: "power2.out",
        delay: (i % 3) * 0.06,
        overwrite: "auto",
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          toggleActions: "play none none none",
        },
      });
    });

    // Scale-Reveal (Karten, Bilder) - sehr dezenter Zoom statt auffaelligem Pop
    document.querySelectorAll(".reveal-scale").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 1.4,
        ease: "power2.out",
        delay: (i % 3) * 0.06,
        overwrite: "auto",
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          toggleActions: "play none none none",
        },
      });
    });

    // Dezenter Parallax auf großen Bild-Platzhaltern (Hero / Page-Hero)
    document.querySelectorAll(".hero .img-placeholder, .page-hero .img-placeholder").forEach(function (el) {
      gsap.to(el, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest(".hero, .page-hero"),
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  // Count-Up für Vertrauens-Zahlen
  document.querySelectorAll(".stat-num[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var counter = { val: prefersReduced ? end : 0 };
    var numEl = el.querySelector(".num");
    if (!numEl) return;

    function render() {
      var val = counter.val;
      numEl.textContent = end % 1 !== 0 ? val.toFixed(1) : Math.round(val);
    }

    if (prefersReduced) {
      render();
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        gsap.to(counter, {
          val: end,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: render,
        });
      },
    });
  });
})();
