(function () {
  "use strict";

  var widget = document.getElementById("whatsappWidget");
  if (!widget) return;

  window.setTimeout(function () {
    widget.classList.add("is-visible");
  }, 2500);
})();
