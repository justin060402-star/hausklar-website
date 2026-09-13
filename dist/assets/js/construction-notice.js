(function () {
  "use strict";

  var STORAGE_KEY = "hausklar-construction-notice-dismissed";

  var overlay = document.getElementById("constructionOverlay");
  var closeBtn = document.getElementById("constructionClose");
  var okBtn = document.getElementById("constructionOk");
  if (!overlay || !closeBtn || !okBtn) return;

  var dismissed = false;
  try {
    dismissed = window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {}

  if (!dismissed) {
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
    });
    document.body.style.overflow = "hidden";
  }

  function dismiss() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      overlay.hidden = true;
    }, 400);
  }

  closeBtn.addEventListener("click", dismiss);
  okBtn.addEventListener("click", dismiss);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) dismiss();
  });
})();
