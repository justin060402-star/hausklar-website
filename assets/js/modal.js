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
  var probeflaecheRow = document.getElementById("probeflaecheRow");
  var lockedChangeBtn = document.getElementById("serviceLockedChange");
  var gridToggleBtn = document.getElementById("serviceGridToggle");

  function setGridExpanded(expanded) {
    if (!gridToggleBtn) return;
    form.querySelectorAll(".service-chip-extra").forEach(function (chip) {
      chip.hidden = !expanded;
    });
    gridToggleBtn.classList.toggle("is-expanded", expanded);
    var label = gridToggleBtn.querySelector("span");
    if (label) label.textContent = expanded ? "Weniger anzeigen" : "Mehr Leistungen anzeigen";
  }

  if (!overlay || !box || !form) return;

  var PROBEFLAECHE_SERVICES = ["Solar- & Photovoltaikanlagen", "Terrassen- & Pflasterflächen", "Dächer", "Fassaden"];

  var SERVICE_LABELS = {
    "Terrassen- & Pflasterflächen": "Terrassen- & Pflasterreinigung",
    "Solar- & Photovoltaikanlagen": "Solar- & PV-Reinigung",
    "Fenster & Glasflächen": "Fenster- & Glasreinigung",
    "Wintergärten": "Wintergartenreinigung",
    "Terrassenüberdachungen": "Terrassenüberdachungsreinigung",
    "Fassaden": "Fassadenreinigung",
    "Dächer": "Dachreinigung",
    "Mauern & Treppen": "Mauer- & Treppenreinigung",
    "Dachrinnen": "Dachrinnenreinigung",
    "Spezialleistungen": "Spezialreinigung",
    "Garagentore & Carports": "Garagentor- & Carportreinigung",
    "Gewerbe- & Großobjekte": "Gewerbe- & Großobjektreinigung",
    "Graffiti-Entfernung": "Graffiti-Entfernung",
    "Ich bin mir noch nicht sicher": "Noch nicht sicher"
  };

  function serviceLabel(value) {
    return SERVICE_LABELS[value] || value;
  }

  var SERVICE_META = {
    "Terrassen- & Pflasterflächen": {
      title: "Jetzt die Reinigung Ihrer Terrassen- & Pflasterflächen anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Terrassen- & Pflasterflächen."
    },
    "Solar- & Photovoltaikanlagen": {
      title: "Jetzt die Reinigung Ihrer Solar- & Photovoltaikanlage anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Solar- & Photovoltaikanlage."
    },
    "Fenster & Glasflächen": {
      title: "Jetzt die Reinigung Ihrer Fenster & Glasflächen anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Fenster & Glasflächen."
    },
    "Wintergärten": {
      title: "Jetzt die Reinigung Ihres Wintergartens anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihres Wintergartens."
    },
    "Terrassenüberdachungen": {
      title: "Jetzt die Reinigung Ihrer Terrassenüberdachung anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Terrassenüberdachung."
    },
    "Fassaden": {
      title: "Jetzt die Reinigung Ihrer Fassade anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Fassade."
    },
    "Dächer": {
      title: "Jetzt die Reinigung Ihres Daches anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihres Daches."
    },
    "Mauern & Treppen": {
      title: "Jetzt die Reinigung Ihrer Mauern & Treppen anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Mauern & Treppen."
    },
    "Dachrinnen": {
      title: "Jetzt die Reinigung Ihrer Dachrinne anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Dachrinne."
    },
    "Spezialleistungen": {
      title: "Jetzt Ihre Spezialreinigung anfragen",
      sub: "Ihre Anfrage bezieht sich auf Ihre Spezialreinigung."
    },
    "Garagentore & Carports": {
      title: "Jetzt die Reinigung Ihres Garagentors & Carports anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihres Garagentors & Carports."
    },
    "Gewerbe- & Großobjekte": {
      title: "Jetzt Ihre Gewerbe- & Großobjektreinigung anfragen",
      sub: "Ihre Anfrage bezieht sich auf Ihre Gewerbe- & Großobjektreinigung."
    },
    "Graffiti-Entfernung": {
      title: "Jetzt die Entfernung Ihres Graffitis anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Entfernung Ihres Graffitis."
    }
  };

  var SERVICE_COMBO_META = {
    "Terrassenüberdachungen,Wintergärten": {
      title: "Jetzt die Reinigung Ihrer Terrassenüberdachung & Ihres Wintergartens anfragen",
      sub: "Ihre Anfrage bezieht sich auf die Reinigung Ihrer Terrassenüberdachung & Ihres Wintergartens."
    }
  };

  var lockedServices = null;
  var requestType = null;
  var requestTypeRow = document.getElementById("requestTypeRow");
  var requestTypeLabel = document.getElementById("requestTypeLabel");

  function updateProbeflaecheVisibility(services) {
    if (!probeflaecheRow) return;
    var relevant = (services || []).some(function (s) {
      return PROBEFLAECHE_SERVICES.indexOf(s) !== -1;
    });
    probeflaecheRow.hidden = !relevant;
    if (!relevant) {
      form.querySelectorAll('input[name="probeflaeche"]').forEach(function (r) {
        r.checked = false;
      });
    }
  }

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
      var label = lockedServices.map(serviceLabel).join(" & ");
      lockedRow.hidden = false;
      lockedLabel.textContent = label;
      gridRow.hidden = true;
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = lockedServices.indexOf(cb.value) !== -1;
      });
      updateProbeflaecheVisibility(lockedServices);

      if (requestType) {
        modalTitle.textContent = requestType + " – " + label;
        modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + requestType + " (" + label + "). Wir melden uns noch am selben Tag bei Ihnen.";
      } else {
        var comboKey = lockedServices.join(",");
        var meta = lockedServices.length === 1 ? SERVICE_META[lockedServices[0]] : SERVICE_COMBO_META[comboKey];
        if (meta) {
          modalTitle.textContent = meta.title;
          modalSub.textContent = meta.sub + " Wir melden uns noch am selben Tag mit einer unverbindlichen Einschätzung.";
        } else {
          modalTitle.textContent = "Jetzt " + label + " anfragen";
          modalSub.textContent = "Ihre Anfrage bezieht sich auf: " + label + ". Wir melden uns noch am selben Tag mit einer unverbindlichen Einschätzung.";
        }
      }
    } else {
      modalTitle.textContent = "Teilen Sie uns hier mit welche Flächen wir für Sie Reinigen sollen!";
      modalSub.textContent = "Wählen Sie Ihre gewünschte Leistung aus und wir melden uns noch am selben Tag mit einer unverbindlichen kostenlosen Ersteinschätzung bei Ihnen.";
      lockedRow.hidden = true;
      gridRow.hidden = false;
      setGridExpanded(false);
      form.querySelectorAll('input[name="leistung"]').forEach(function (cb) {
        cb.checked = false;
      });
      updateProbeflaecheVisibility([]);
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

  function unlockServiceSelection() {
    lockedServices = null;
    lockedRow.hidden = true;
    gridRow.hidden = false;
    setGridExpanded(true);
    modalTitle.textContent = "Teilen Sie uns hier mit welche Flächen wir für Sie Reinigen sollen!";
    modalSub.textContent = "Wählen Sie Ihre gewünschte Leistung aus und wir melden uns noch am selben Tag mit einer unverbindlichen kostenlosen Ersteinschätzung bei Ihnen.";
    var checked = Array.from(form.querySelectorAll('input[name="leistung"]:checked')).map(function (cb) {
      return cb.value;
    });
    updateProbeflaecheVisibility(checked);
  }

  document.querySelectorAll(".js-open-anfrage").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var services = trigger.getAttribute("data-services");
      var requestType = trigger.getAttribute("data-request-type");
      if (!services) {
        var pageTrigger = document.querySelector(".js-open-anfrage[data-services]");
        if (pageTrigger) {
          services = pageTrigger.getAttribute("data-services");
          requestType = requestType || pageTrigger.getAttribute("data-request-type");
        }
      }
      openModal(services, requestType);
    });
  });

  form.addEventListener("change", function (e) {
    if (e.target && e.target.name === "leistung" && !gridRow.hidden) {
      var checked = Array.from(form.querySelectorAll('input[name="leistung"]:checked')).map(function (cb) {
        return cb.value;
      });
      updateProbeflaecheVisibility(checked);
    }
  });

  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  if (lockedChangeBtn) {
    lockedChangeBtn.addEventListener("click", unlockServiceSelection);
  }
  if (gridToggleBtn) {
    gridToggleBtn.addEventListener("click", function () {
      setGridExpanded(!gridToggleBtn.classList.contains("is-expanded"));
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();

    if (!name || !email) return;

    var services = (
      lockedServices && lockedServices.length
        ? lockedServices
        : Array.from(form.querySelectorAll('input[name="leistung"]:checked')).map(function (cb) {
            return cb.value;
          })
    ).map(serviceLabel);

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
