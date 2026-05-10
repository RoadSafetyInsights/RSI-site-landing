(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const body = document.body;

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

    document.querySelectorAll(".nav a").forEach(function (link) {
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

  const formCard = document.getElementById("business-form");
  const driverCard = document.querySelector('[data-persona="driver"]');
  const businessCard = document.querySelector('[data-persona="business"]');
  const driverCta = document.querySelector(".btn--driver-cta");
  const businessCta = document.querySelector(".btn--persona-cta");
  const driverInterestForm = document.forms["driver-interest"];

  function encodeFormData(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      })
      .join("&");
  }

  function setPersona(driverSelected) {
    if (!driverCard || !businessCard) return;
    if (driverSelected) {
      driverCard.classList.add("persona-card--selected");
      businessCard.classList.remove("persona-card--selected");
    } else {
      businessCard.classList.add("persona-card--selected");
      driverCard.classList.remove("persona-card--selected");
    }
  }

  if (driverCard) {
    driverCard.addEventListener("click", function (e) {
      if (e.target.closest("label, input, button")) return;
      setPersona(true);
    });
  }

  if (businessCard) {
    businessCard.addEventListener("click", function (e) {
      if (e.target.closest("button.btn--persona-cta")) return;
      setPersona(false);
    });
  }

  if (driverCta) {
    driverCta.addEventListener("click", function () {
      setPersona(true);
      if (driverInterestForm && !driverCta.disabled) {
        var driverFormData = new FormData(driverInterestForm);
        driverFormData.set("timestamp", new Date().toISOString());
        var driverPayload = {};
        driverFormData.forEach(function (value, key) {
          driverPayload[key] = value;
        });

        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeFormData(driverPayload)
        })
          .then(function () {
            driverCta.innerHTML = '<span class="check" aria-hidden="true">✓</span> Καταγράφηκε';
            driverCta.disabled = true;
            driverCta.classList.remove("btn--primary");
            driverCta.classList.add("btn--recorded");
          })
          .catch(function () {
            // Keep CTA active on failure so user can retry submission.
          });
      }
    });
  }

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
    var submitButton = bizForm.querySelector(".biz-form__submit");
    var successMessage = bizForm.querySelector(".biz-form__success");

    bizForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitButton && submitButton.disabled) return;

      var formData = new FormData(bizForm);
      formData.set("timestamp", new Date().toISOString());
      var payload = {};

      formData.forEach(function (value, key) {
        payload[key] = value;
      });

      if (submitButton) {
        submitButton.disabled = true;
      }

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(payload)
      })
        .then(function () {
          if (successMessage) {
            successMessage.hidden = false;
          }
        })
        .catch(function () {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    });
  }
})();
//test