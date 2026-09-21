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
  var submitBtn = document.getElementById("anfrageSubmit");
  var errorBox = document.getElementById("formError");
  var successBox = document.getElementById("formSuccess");
  var successCloseBtn = document.getElementById("formSuccessClose");

  if (!overlay || !box || !form) return;

  var lockedServices = null;

  function resetFormView() {
    form.hidden = false;
    if (successBox) successBox.hidden = true;
    if (errorBox) errorBox.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Anfrage senden";
    }
  }

  function openModal(servicesAttr) {
    form.reset();
    resetFormView();

    lockedServices = servicesAttr
      ? servicesAttr
          .split(",")
          .map(function (s) { return s.trim(); })
          .filter(Boolean)
      : null;

    if (lockedServices && lockedServices.length) {
      var label = lockedServices.join(" & ");
      modalTitle.textContent = "Jetzt " + label + " anfragen";
      modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + label + ". Wir melden uns noch am selben Tag mit einer unverbindlichen Einschätzung.";
      lockedRow.hidden = false;
      lockedLabel.textContent = label;
      gridRow.hidden = true;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = lockedServices.indexOf(cb.value) !== -1;
      });
    } else {
      modalTitle.textContent = "Jetzt Anfrage stellen";
      modalSub.textContent = "Wählen Sie eine oder mehrere Leistungen aus – wir melden uns noch am selben Tag mit einer unverbindlichen Einschätzung.";
      lockedRow.hidden = true;
      gridRow.hidden = false;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = false;
      });
    }

    overlay.classList.add("is-open");
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    box.scrollTop = 0;
    var firstField = document.getElementById("af-name");
    if (firstField) {
      setTimeout(function () {
        box.scrollTop = 0;
        firstField.focus({ preventScroll: true });
      }, 250);
    }
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

    if (!name || !email) return;

    var services =
      lockedServices && lockedServices.length
        ? lockedServices
        : Array.from(form.querySelectorAll('input[name="leistung"]:checked')).map(function (cb) {
            return cb.value;
          });

    if (errorBox) errorBox.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet…";
    }

    var formData = new FormData(form);
    formData.delete("leistung");
    formData.set("Gewünschte Leistung(en)", services.length ? services.join(", ") : "Allgemeine Anfrage");
    formData.set(
      "subject",
      "Anfrage: " + (services.length ? services.join(", ") : "Allgemeine Anfrage")
    );

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.data && result.data.success) {
          form.hidden = true;
          if (successBox) successBox.hidden = false;
        } else {
          showError((result.data && result.data.message) || "Unbekannter Fehler von Web3Forms");
        }
      })
      .catch(function (err) {
        showError("Netzwerkfehler: " + err.message);
      });
  });

  function showError(detail) {
    if (errorBox) {
      errorBox.hidden = false;
      var detailEl = document.getElementById("formErrorDetail");
      if (detailEl) detailEl.textContent = detail ? "(" + detail + ")" : "";
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Anfrage senden";
    }
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", closeModal);
  }
})();
