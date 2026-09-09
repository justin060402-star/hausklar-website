(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  if (prefersReduced) {
    document.querySelectorAll(".reveal, .reveal-scale").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  } else {
    // Fade/Blur-Reveal beim Scrollen
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    // Scale-Reveal (Karten, Bilder)
    document.querySelectorAll(".reveal-scale").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        delay: (i % 3) * 0.07,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
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

  // Vorher/Nachher-Slider (Referenzen)
  document.querySelectorAll(".ba-slider").forEach(function (slider) {
    var after = slider.querySelector(".ba-after");
    var handle = slider.querySelector(".ba-handle");
    if (!after || !handle) return;
    var dragging = false;

    function setPos(clientX) {
      var rect = slider.getBoundingClientRect();
      var pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      after.style.width = pct + "%";
      handle.style.left = pct + "%";
    }

    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
    });
    window.addEventListener("pointerup", function () {
      dragging = false;
    });
    slider.addEventListener("pointermove", function (e) {
      if (dragging) setPos(e.clientX);
    });
    slider.addEventListener("click", function (e) {
      setPos(e.clientX);
    });
  });
})();
