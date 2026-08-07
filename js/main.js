document.addEventListener('DOMContentLoaded', function() {
  
  /* ── 1. Mobile Burger Menu Logic ── */
  var burger = document.getElementById('burger');
  var rail = document.getElementById('rail');
  var railLinks = document.querySelectorAll('.rail__nav a, .rail__cta');

  if (burger && rail) {
    // Toggle mobile navigation drawer
    burger.addEventListener('click', function() {
      rail.classList.toggle('is-open');
      var isOpen = rail.classList.contains('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Automatically close mobile menu when clicking a navigation link
    railLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        rail.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 2. Tabs Logic (Driver vs Business) ── */
  var tabBtns = document.querySelectorAll('.switch__btn');
  var panels = document.querySelectorAll('.panel');

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Deactivate all tab buttons and hide all panels
      tabBtns.forEach(function(b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function(p) {
        p.setAttribute('hidden', '');
      });

      // Activate clicked tab and display target panel
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      var targetPanel = document.getElementById(btn.getAttribute('aria-controls'));
      if (targetPanel) {
        targetPanel.removeAttribute('hidden');
      }
    });
  });

  /* ── 3. Netlify AJAX Form Submission (with reCAPTCHA support) ── */
  function handleFormSubmit(formId, successMsgId, submitBtnClass) {
    var form = document.getElementById(formId);
    if (!form) return;

    var submitBtn = form.querySelector(submitBtnClass);
    
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default page refresh
      
      if (submitBtn) submitBtn.disabled = true;

      // FormData automatically gathers all fields including g-recaptcha-response token
      var formData = new FormData(form);

      // Submit form via Netlify AJAX endpoint
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(function (response) {
        if (response.ok) {
          // Show success message
          var successMsg = document.getElementById(successMsgId);
          if (successMsg) successMsg.removeAttribute("hidden");
          
          form.reset();
          
          // Reset CAPTCHA widget if reCAPTCHA is active
          if (typeof grecaptcha !== "undefined") {
            grecaptcha.reset();
          }
        } else {
          console.error("Form submission failed on Netlify.");
        }
      })
      .catch(function (error) {
        console.error("Network error during submission:", error);
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  // Initialize AJAX handlers for both forms
  handleFormSubmit("driver-form", "driver-ok", ".btn--driver-submit");
  handleFormSubmit("business-form", "biz-ok", ".biz-form__submit");

});
