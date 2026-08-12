document.addEventListener('DOMContentLoaded', function() {
  
  var burger = document.getElementById('burger');
  var header = document.getElementById('header');
  var navLinks = document.querySelectorAll('.header__nav a');

  if (burger && header) {
    burger.addEventListener('click', function() {
      header.classList.toggle('is-open');
      var isOpen = header.classList.contains('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var tabBtns = document.querySelectorAll('.switch__btn');
  var panels = document.querySelectorAll('.panel');

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(function(b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function(p) {
        p.setAttribute('hidden', '');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      var targetPanel = document.getElementById(btn.getAttribute('aria-controls'));
      if (targetPanel) {
        targetPanel.removeAttribute('hidden');
      }
    });
  });

  function handleFormSubmit(formId, successMsgId, submitBtnClass) {
    var form = document.getElementById(formId);
    if (!form) return;

    var submitBtn = form.querySelector(submitBtnClass);
    
    form.addEventListener("submit", function (e) {
      e.preventDefault(); 
      
      if (submitBtn) submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(function (response) {
        if (response.ok) {
          var successMsg = document.getElementById(successMsgId);
          if (successMsg) successMsg.removeAttribute("hidden");
          
          form.reset();
          
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

  handleFormSubmit("driver-form", "driver-ok", ".btn--driver-submit");
  handleFormSubmit("business-form", "biz-ok", ".biz-form__submit");

});
