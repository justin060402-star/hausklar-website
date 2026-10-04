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
  var requestType = null;
  var requestTypeRow = document.getElementById("requestTypeRow");
  var requestTypeLabel = document.getElementById("requestTypeLabel");

  function ensureRequestTypeRow() {
    if (requestTypeRow || !lockedRow) return;
    requestTypeRow = document.createElement("div");
    requestTypeRow.className = "form-row";
    requestTypeRow.id = "requestTypeRow";
    requestTypeRow.hidden = true;
    requestTypeRow.innerHTML = '<label>Anfrageart</label><div class="service-locked" id="requestTypeLabel"></div>';
    lockedRow.parentNode.insertBefore(requestTypeRow, lockedRow);
    requestTypeLabel = requestTypeRow.querySelector("#requestTypeLabel");
  }

  function resetFormView() {
    form.hidden = false;
    if (successBox) successBox.hidden = true;
    if (errorBox) errorBox.hidden = true;
    if (modalTitle) modalTitle.hidden = false;
    if (modalSub) modalSub.hidden = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Anfrage senden";
    }
  }

  function openModal(servicesAttr, requestTypeAttr) {
    form.reset();
    resetFormView();
    ensureRequestTypeRow();

    lockedServices = servicesAttr
      ? servicesAttr
          .split(",")
          .map(function (s) { return s.trim(); })
          .filter(Boolean)
      : null;
    requestType = requestTypeAttr ? requestTypeAttr.trim() : null;

    if (lockedServices && lockedServices.length) {
      var label = lockedServices.join(" & ");
      lockedRow.hidden = false;
      lockedLabel.textContent = label;
      gridRow.hidden = true;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = lockedServices.indexOf(cb.value) !== -1;
      });

      if (requestType) {
        modalTitle.textContent = requestType + " – " + label;
        modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + requestType + " (" + label + "). Wir melden uns noch am selben Tag bei Ihnen.";
      } else {
        modalTitle.textContent = "Jetzt " + label + " anfragen";
        modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + label + ". Wir melden uns noch am selben Tag mit einer unverbindlichen Einschätzung.";
      }
    } else {
      modalTitle.textContent = "Sagen Sie uns welche Flächen wir Reinigen sollen!";
      modalSub.textContent = "Wählen Sie Ihre gewünschte Leistung aus und wir melden uns noch am selben Tag mit einer unverbindlichen kostenlosen Ersteinschätzung bei Ihnen.";
      lockedRow.hidden = true;
      gridRow.hidden = false;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = false;
      });
    }

    if (requestTypeRow) {
      if (requestType) {
        requestTypeRow.hidden = false;
        requestTypeLabel.textContent = requestType;
      } else {
        requestTypeRow.hidden = true;
      }
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
      openModal(trigger.getAttribute("data-services"), trigger.getAttribute("data-request-type"));
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

    var probeflaecheChecked = form.querySelector('input[name="probeflaeche"]:checked');
    var probeflaecheAnswer = probeflaecheChecked ? probeflaecheChecked.value : "Nicht beantwortet";

    var formData = new FormData(form);
    formData.delete("leistung");
    formData.delete("probeflaeche");
    formData.set("Gewünschte Leistung(en)", services.length ? services.join(", ") : "Allgemeine Anfrage");
    if (requestType) formData.set("Anfrageart", requestType);
    formData.set("Kostenlose Probefläche gewünscht", probeflaecheAnswer);
    formData.set(
      "subject",
      "Anfrage: " + (requestType ? requestType + " – " : "") + (services.length ? services.join(", ") : "Allgemeine Anfrage") + (probeflaecheAnswer === "Ja" ? " (+ Probefläche)" : "")
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
          if (modalTitle) modalTitle.hidden = true;
          if (modalSub) modalSub.hidden = true;
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
