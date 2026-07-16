(function () {
  /* Navigation Toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;

  if (navToggle) {
    var backdrop = document.getElementById("nav-backdrop");

    function syncBackdrop(isOpen) {
      if (!backdrop) return;
      backdrop.hidden = !isOpen;
      backdrop.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    // Toggle menu
    navToggle.addEventListener("click", function () {
      var isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      syncBackdrop(isOpen);
    });

    // Close menu with delay to allow animation to finish
    function closeMenu() {
      // 400ms matches our CSS transition duration (0.4s)
      setTimeout(function() {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        syncBackdrop(false);
      }, 300); 
    }

    // Apply to links and backdrop
    document.querySelectorAll(".nav a, .btn--login").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeMenu);
    }
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

      var feedbackInput = driverForm.querySelector('[name="dangerous_roads_feedback"]');

      var payload = {
        "form-name": "driver-interest",
        type: "driver",
        email: email,
        dangerous_roads_feedback: feedbackInput ? feedbackInput.value.trim() : "",
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

