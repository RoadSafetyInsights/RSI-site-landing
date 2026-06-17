(function () {
  var STORAGE_KEY = "rsi-interest-submissions";

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

  /* ── localStorage helpers ────────────────────────────────── */
  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getSubmissions() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function hasSubmitted(email) {
    var norm = normalizeEmail(email);
    return norm && getSubmissions().some(function (entry) {
      return entry.email === norm;
    });
  }

  function recordSubmission(email, type) {
    var submissions = getSubmissions();
    submissions.push({ email: normalizeEmail(email), type: type, at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
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
  var driverDuplicate  = driverForm ? driverForm.querySelector(".driver-form__duplicate") : null;

  if (driverForm) {
    driverForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (driverSubmitBtn && driverSubmitBtn.disabled) return;

      var email = driverEmailInput ? driverEmailInput.value.trim() : "";
      if (!email) { if (driverEmailInput) driverEmailInput.focus(); return; }

      if (driverSuccess)   driverSuccess.hidden   = true;
      if (driverDuplicate) driverDuplicate.hidden = true;

      if (hasSubmitted(email)) {
        if (driverDuplicate) driverDuplicate.hidden = false;
        return;
      }

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
          recordSubmission(email, "driver");
          if (driverSuccess) driverSuccess.hidden = false;
        })
        .catch(function () {
          if (driverSubmitBtn) driverSubmitBtn.disabled = false;
        });
    });

    if (driverEmailInput) {
      driverEmailInput.addEventListener("input", function () {
        if (driverDuplicate && !driverDuplicate.hidden) driverDuplicate.hidden = true;
      });
    }
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
    var bizSubmitBtn    = bizForm.querySelector(".biz-form__submit");
    var bizSuccess      = bizForm.querySelector(".biz-form__success");
    var bizDuplicate    = bizForm.querySelector(".biz-form__duplicate");
    var bizEmailInput   = bizForm.querySelector('[name="email"]');

    bizForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (bizSubmitBtn && bizSubmitBtn.disabled) return;

      if (bizSuccess)   bizSuccess.hidden   = true;
      if (bizDuplicate) bizDuplicate.hidden = true;

      var email = bizEmailInput ? bizEmailInput.value.trim() : "";

      if (hasSubmitted(email)) {
        if (bizDuplicate) bizDuplicate.hidden = false;
        return;
      }

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
          recordSubmission(email, "business");
          if (bizSuccess) bizSuccess.hidden = false;
        })
        .catch(function () {
          if (bizSubmitBtn) bizSubmitBtn.disabled = false;
        });
    });

    if (bizEmailInput) {
      bizEmailInput.addEventListener("input", function () {
        if (bizDuplicate && !bizDuplicate.hidden) bizDuplicate.hidden = true;
      });
    }
  }
})();
