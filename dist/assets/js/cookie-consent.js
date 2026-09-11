(function () {
  "use strict";

  var STORAGE_KEY = "hausklar-cookie-consent"; // "all" | "essential"

  function loadGoogleFonts() {
    if (document.getElementById("google-fonts-link")) return;
    var link = document.createElement("link");
    link.id = "google-fonts-link";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }

  var stored = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {}

  if (stored === "all") {
    loadGoogleFonts();
  }

  var banner = document.getElementById("cookieBanner");
  var acceptAllBtn = document.getElementById("cookieBannerAcceptAll");
  var essentialBtn = document.getElementById("cookieBannerEssential");
  if (!banner || !acceptAllBtn || !essentialBtn) return;

  if (!stored) {
    banner.hidden = false;
    requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });
  }

  function dismiss(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch (e) {}
    if (choice === "all") loadGoogleFonts();
    banner.classList.remove("is-visible");
    window.setTimeout(function () {
      banner.hidden = true;
    }, 400);
  }

  acceptAllBtn.addEventListener("click", function () {
    dismiss("all");
  });
  essentialBtn.addEventListener("click", function () {
    dismiss("essential");
  });
})();
