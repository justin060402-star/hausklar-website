(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var mobileToggle = document.getElementById("mobileToggle");
  var mobilePanel = document.getElementById("mobilePanel");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      mobileToggle.classList.toggle("is-open", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobilePanel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobilePanel.classList.remove("is-open");
        mobileToggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  // Mega-Menü per Klick/Tap zusätzlich zu :hover (Tablets ohne Hover)
  document.querySelectorAll(".has-mega > .nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        link.parentElement.classList.toggle("is-open");
      }
    });
  });

  // Aktive Seite markieren
  var path = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  document.querySelectorAll("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    var normalized = href.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    var full = new URL(normalized, window.location.href).pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    if (full === path && (a.classList.contains("nav-link") || a.hasAttribute("data-slug"))) {
      a.classList.add("is-active");
    }
  });

  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
