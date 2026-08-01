(function () {
  /* ── Mobile Menu / Hamburger Toggle ─────────────────────────
     Opens and closes the side rail on mobile devices, and closes
     it automatically when a navigation link is clicked. */
  var burger = document.getElementById("burger");
  var rail = document.getElementById("rail");
  var navLinks = document.querySelectorAll(".rail__nav a");

  if (burger && rail) {
    burger.addEventListener("click", function () {
      rail.classList.toggle("is-open");
      var isOpen = rail.classList.contains("is-open");
      burger.setAttribute("aria-expanded", isOpen);
    });
  }

  if (navLinks.length > 0) {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 880) {
          rail.classList.remove("is-open");
          if (burger) {
            burger.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  /* ── Form Tabs / Switch Logic ───────────────────────────────
     Handles the switching between the Driver and Business interest forms. */
  var tabDriver = document.getElementById("tab-driver");
  var tabBiz = document.getElementById("tab-biz");
  var panelDriver = document.getElementById("panel-driver");
  var panelBiz = document.getElementById("panel-biz");

  if (tabDriver && tabBiz && panelDriver && panelBiz) {
    tabDriver.addEventListener("click", function () {
      tabDriver.classList.add("is-active");
      tabDriver.setAttribute("aria-selected", "true");
      tabBiz.classList.remove("is-active");
      tabBiz.setAttribute("aria-selected", "false");
      panelDriver.hidden = false;
      panelBiz.hidden = true;
    });

    tabBiz.addEventListener("click", function () {
      tabBiz.classList.add("is-active");
      tabBiz.setAttribute("aria-selected", "true");
      tabDriver.classList.remove("is-active");
      tabDriver.setAttribute("aria-selected", "false");
      panelBiz.hidden = false;
      panelDriver.hidden = true;
    });
  }

  /* ── Scroll-reveal ────────────────────────────────────────────
     Fades/slides any .up or .reveal element into place the first time it
     enters the viewport. */
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
    /* No IntersectionObserver support: just show everything */
    revealEls.forEach(function (el) {
      revealElement(el);
    });
  }

  /* ── Hero motion accents ───────────────────────────────────
     Adds a subtle parallax response to the hero section for a more
     futuristic feel without affecting the content flow. */
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

  /* ── Route-rail progress dot ─────────────────────────────────
     Moves the glowing dot down the fixed side-rail. */
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
})();
