(function () {
  "use strict";

  var overlay = document.getElementById("modalOverlay");
  var box = document.getElementById("modalBox");
  var closeBtn = document.getElementById("modalClose");
  var form = document.getElementById("anfrageForm");
  var lockedRow = document.getElementById("serviceLockedRow");
  var lockedLabel = document.getElementById("serviceLockedLabel");
  var gridRow = document.getElementById("serviceGridRow");
  var modalSub = document.getElementById("modalSub");
  var modalTitle = document.getElementById("modalTitle");

  if (!overlay || !box || !form) return;

  var lockedServices = null;

  function openModal(servicesAttr) {
    lockedServices = servicesAttr
      ? servicesAttr
          .split(",")
          .map(function (s) { return s.trim(); })
          .filter(Boolean)
      : null;

    if (lockedServices && lockedServices.length) {
      var label = lockedServices.join(" & ");
      modalTitle.textContent = "Jetzt " + label + " anfragen";
      modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + label + ". Wir melden uns zeitnah mit einer unverbindlichen Einschätzung.";
      lockedRow.hidden = false;
      lockedLabel.textContent = label;
      gridRow.hidden = true;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = lockedServices.indexOf(cb.value) !== -1;
      });
    } else {
      modalTitle.textContent = "Jetzt Anfrage stellen";
      modalSub.textContent = "Wählen Sie eine oder mehrere Leistungen aus – wir melden uns zeitnah mit einer unverbindlichen Einschätzung.";
      lockedRow.hidden = true;
      gridRow.hidden = false;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = false;
      });
    }

    overlay.classList.add("is-open");
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var firstField = document.getElementById("af-name");
    if (firstField) setTimeout(function () { firstField.focus(); }, 250);
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    box.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".js-open-anfrage").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(trigger.getAttribute("data-services"));
    });
  });

  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var message = form.message.value.trim();

    var services =
      lockedServices && lockedServices.length
        ? lockedServices
        : Array.from(form.querySelectorAll('input[name="leistung"]:checked')).map(function (cb) {
            return cb.value;
          });

    if (!name || !email) return;

    var photosInput = document.getElementById("af-photos");
    var photoCount = photosInput && photosInput.files ? photosInput.files.length : 0;

    var subject = "Anfrage: " + (services.length ? services.join(", ") : "Allgemeine Anfrage");
    var bodyLines = [
      "Name: " + name,
      "E-Mail: " + email,
      "Telefon: " + (phone || "-"),
      "Gewünschte Leistung(en): " + (services.length ? services.join(", ") : "-"),
      "",
      "Nachricht:",
      message || "-",
    ];
    if (photoCount > 0) {
      bodyLines.push("", "Hinweis: " + photoCount + " Foto(s) ausgewählt – bitte in dieser E-Mail manuell anhängen.");
    }
    var mailto =
      "mailto:info@hausklar-oberfranken.de?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(bodyLines.join("\n"));

    window.location.href = mailto;
  });
})();
