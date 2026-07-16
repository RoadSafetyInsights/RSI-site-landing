(function () {
  /* ── Scroll-reveal ────────────────────────────────────────────
     Fades/slides any .reveal element into place the first time it
     enters the viewport. Elements inside .reveal-stagger get a
     staggered delay driven by the --reveal-i custom property set
     inline on each child in the HTML. */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
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
    /* No IntersectionObserver support (or no reveal elements): just show everything */
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ── Route-rail progress dot ─────────────────────────────────
     Moves the glowing dot down the fixed side-rail in step with
     how far the user has scrolled through the page. Purely
     decorative, skipped for reduced-motion users. */
  var dot = document.getElementById("route-dot");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (dot && !prefersReducedMotion) {
    var ticking = false;

    function updateDot() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
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