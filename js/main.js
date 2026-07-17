function initLandingPage() {
  
  // Navigation toggle logic for mobile menu. Clicking the hamburger icon will open/close the menu and update ARIA attributes accordingly.
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;
  var backdrop = document.getElementById("nav-backdrop");

  if (navToggle) {
    function toggleMenu() {
      var isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (backdrop) {
        backdrop.hidden = !isOpen;
        backdrop.setAttribute("aria-hidden", isOpen ? "false" : "true");
      }
    }

    function handleToggle(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toggleMenu();
    }

    // This one listener perfectly handles mouse clicks, mobile screen taps, 
    // AND keyboard Enter/Spacebar accessibility.
    navToggle.addEventListener("click", handleToggle);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        toggleMenu();
      }
    });

    // Close when clicking links, login button, or the backdrop
    document.querySelectorAll(".nav a, .btn--login, .nav-backdrop").forEach(function (el) {
      el.addEventListener("click", function () {
        // Only trigger close if it's currently open
        if (body.classList.contains("nav-open")) {
          toggleMenu();
        }
      });
    });
  }

  // Persona selection logic for the landing page. Clicking on a persona card will highlight it and unhighlight the other.
  var driverCard = document.querySelector('[data-persona="driver"]');
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

  // Submissions from Netlify forms require the data to be sent as URL-encoded form data. This function converts a JavaScript object into a URL-encoded string.
  function encodeFormData(data) {
    return Object.keys(data).map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
    }).join("&");
  }

  // 1. Driver Form
  var driverForm = document.getElementById("driver-form");
  if (driverForm) {
    var driverSubmitBtn = driverForm.querySelector(".btn--driver-submit");
    
    driverForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      var emailInput = driverForm.querySelector('[name="email"]');
      var email = emailInput ? emailInput.value.trim() : "";
      if (!email) return;

      if (driverSubmitBtn) driverSubmitBtn.disabled = true;

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
        var successMsg = driverForm.querySelector(".driver-form__success");
        if(successMsg) successMsg.hidden = false; 
      })
      .finally(function() {
        if (driverSubmitBtn) driverSubmitBtn.disabled = false;
      });
    });
  }

  // 2. Business Form Toggle & Submit
  var formCard = document.getElementById("business-form");
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
    var bizSubmitBtn = bizForm.querySelector(".biz-form__submit");
    
    bizForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      if (bizSubmitBtn) bizSubmitBtn.disabled = true;

      var formData = new FormData(bizForm);
      formData.set("timestamp", new Date().toISOString());
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });

      fetch("/", { 
        method: "POST", 
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
        body: encodeFormData(payload) 
      })
      .then(function () { 
        var successMsg = bizForm.querySelector(".biz-form__success");
        if(successMsg) successMsg.hidden = false; 
      })
      .finally(function() {
        if (bizSubmitBtn) bizSubmitBtn.disabled = false;
      });
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLandingPage);
} else {
  initLandingPage();
}
