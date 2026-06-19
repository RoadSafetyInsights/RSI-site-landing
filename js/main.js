(function () {
  /* ── Nav toggle ─────────────────────────────────────────── */
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;

  if (navToggle) {
    var backdrop = document.getElementById("nav-backdrop");

    function syncBackdrop() {
      if (!backdrop) return;
      var open = body.classList.contains("nav-open");
      backdrop.hidden = !open;
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }

    navToggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      syncBackdrop();
    });

    document.querySelectorAll(".nav a, .btn--login").forEach(function (link) {
      link.addEventListener("click", function () {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        syncBackdrop();
      });
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        syncBackdrop();
      });
    }

    syncBackdrop();
  }

  function encodeFormData(data) {
    return Object.keys(data).map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
    }).join("&");
  }

  /* ── Persona card selection ──────────────────────────────── */
  var driverCard   = document.querySelector('[data-persona="driver"]');
  var businessCard = document.querySelector('[data-persona="business"]');

  function setPersona(isDriver) {
    if (!driverCard || !businessCard) return;
    driverCard.classList.toggle("persona-card--selected", isDriver);
    businessCard.classList.toggle("persona-card--selected", !isDriver);
  }

  if (driverCard) {
    driverCard.addEventListener("click", function (e) {
      if (e.target.closest("label, input, button, form")) return;
      setPersona(true);
    });
  }

  if (businessCard) {
    businessCard.addEventListener("click", function (e) {
      if (e.target.closest("button.btn--persona-cta")) return;
      setPersona(false);
    });
  }

  /* ── Driver inline form ──────────────────────────────────── */
  var driverForm       = document.getElementById("driver-form");
  var driverEmailInput = document.getElementById("driver-email");
  var driverSubmitBtn  = driverForm ? driverForm.querySelector(".btn--driver-submit") : null;
  var driverSuccess    = driverForm ? driverForm.querySelector(".driver-form__success") : null;

  if (driverForm) {
    driverForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var email = driverEmailInput ? driverEmailInput.value.trim() : "";
      if (!email) { if (driverEmailInput) driverEmailInput.focus(); return; }

      if (driverSuccess) driverSuccess.hidden = true;
      if (driverSubmitBtn) driverSubmitBtn.disabled = true;

      var timestampInput = driverForm.querySelector('[name="timestamp"]');
      if (timestampInput) timestampInput.value = new Date().toISOString();

      var payload = {
        "form-name": "driver-interest",
        type: "driver",
        email: email,
        timestamp: new Date().toISOString()
      };

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(payload)
      })
        .then(function () {
          if (driverSuccess) driverSuccess.hidden = false;
        })
        .catch(function () {
          /* Allow retry on failure */
        })
        .finally(function () {
          if (driverSubmitBtn) driverSubmitBtn.disabled = false;
        });
    });
  }

  /* ── Business form card ──────────────────────────────────── */
  var formCard    = document.getElementById("business-form");
  var businessCta = document.querySelector(".btn--persona-cta");

  if (businessCta) {
    businessCta.addEventListener("click", function () {
      setPersona(false);
      if (formCard) {
        formCard.hidden = false;
        formCard.setAttribute("aria-hidden", "false");
        formCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  var bizForm = document.querySelector(".biz-form");
  if (bizForm) {
    var bizSubmitBtn  = bizForm.querySelector(".biz-form__submit");
    var bizSuccess    = bizForm.querySelector(".biz-form__success");

    bizForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (bizSuccess) bizSuccess.hidden = true;

      var formData = new FormData(bizForm);
      formData.set("timestamp", new Date().toISOString());
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });

      if (bizSubmitBtn) bizSubmitBtn.disabled = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(payload)
      })
        .then(function () {
          if (bizSuccess) bizSuccess.hidden = false;
        })
        .catch(function () {
          /* Allow retry on failure */
        })
        .finally(function () {
          if (bizSubmitBtn) bizSubmitBtn.disabled = false;
        });
    });
  }
})();
