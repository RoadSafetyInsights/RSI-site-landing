(function () {
  /* ── 1. Scroll-Reveal Animations ── */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".up, .reveal"));

  function revealElement(el) {
    if (el.classList.contains("up")) {
      el.classList.add("is-in");
    }

    if (el.classList.contains("reveal")) {
      el.classList.add("is-visible");
    }
  }

  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers lacking IntersectionObserver support
    revealEls.forEach(function (el) {
      revealElement(el);
    });
  }

  /* ── 2. Hero Parallax Effect ── */
  var hero = document.querySelector(".hero");
  var heroGlow = document.querySelector(".hero__glow");
  var heroContent = document.querySelector(".hero__content");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (hero && !prefersReducedMotion) {
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;

      if (heroGlow) {
        heroGlow.style.transform = "translate3d(" + (x * -18) + "px, " + (y * -18) + "px, 0) scale(1.02)";
      }

      if (heroContent) {
        heroContent.style.transform = "translate3d(" + (x * 8) + "px, " + (y * 8) + "px, 0)";
      }
    });

    hero.addEventListener("pointerleave", function () {
      if (heroGlow) heroGlow.style.transform = "";
      if (heroContent) heroContent.style.transform = "";
    });
  }

  /* ── 3. Route Rail Scroll Progress Dot ── */
  var dot = document.getElementById("route-dot");

  if (dot && !prefersReducedMotion) {
    var ticking = false;

    function updateDot() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      dot.style.top = (progress * 100) + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateDot);
        ticking = true;
      }
    });

    updateDot();
  }

  /* ── 4. Cookie Banner Smooth Dismissal ── */
  var cookieBanner = document.getElementById("cookie-banner");
  var acceptBtn = document.getElementById("cookie-accept");

  if (cookieBanner && acceptBtn) {
    // Show banner if consent flag is not found in localStorage
    if (!localStorage.getItem("rsi_cookie_consent")) {
      cookieBanner.removeAttribute("hidden");
    }

    acceptBtn.addEventListener("click", function () {
      // 1. Store consent
      localStorage.setItem("rsi_cookie_consent", "true");
      
      // 2. Add class to trigger CSS slide-down & fade transition
      cookieBanner.classList.add("is-hiding");
      
      // 3. Wait exactly 450ms (slightly more than the 0.4s CSS transition) and hide completely
      setTimeout(function() {
        cookieBanner.setAttribute("hidden", "");
      }, 450);
    });
  }
})();
