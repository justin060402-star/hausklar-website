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

  if (!hero || !("IntersectionObserver" in window)) {
    window.setTimeout(show, 2500);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          hide();
        } else {
          show();
        }
      });
    },
    { threshold: 0 }
  );
  observer.observe(hero);
})();
