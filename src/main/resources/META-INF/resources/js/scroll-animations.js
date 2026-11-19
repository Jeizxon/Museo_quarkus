/**
 * ============================================================================
 * ANIMACIONES DE APARICIÓN Y SCROLL REVEAL — IGLESIA DE SANTO DOMINGO DE TUNJA
 * Archivo: js/scroll-animations.js
 * Propósito: Orquestación nativa mediante IntersectionObserver para la entrada
 *            escalonada de textos en index.html y la revelación progresiva
 *            (Scroll Reveal: opacidad 0->1 + translateY + scale 0.98->1) de las
 *            fotografías reales en Inicio, La Iglesia, Patrimonio y Galería.
 *            Respeta estrictamente prefers-reduced-motion y nunca bloquea la
 *            lectura si JavaScript no está disponible.
 * ============================================================================
 */

(function () {
  "use strict";

  function initScrollAnimations() {
    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var revealElements = document.querySelectorAll("[data-reveal]");

    /* Si el usuario prefiere movimiento reducido o no existe IntersectionObserver,
       mostrar todos los elementos inmediatamente sin animación. */
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    /* Habilitar estado inicial de animación solo cuando JS e IntersectionObserver están activos */
    document.documentElement.classList.add("js-motion-ready");

    var observerOptions = {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    };

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          var delay = target.getAttribute("data-reveal-delay");
          if (delay) {
            target.style.transitionDelay = delay + "ms";
          }
          target.classList.add("is-revealed");
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollAnimations);
  } else {
    initScrollAnimations();
  }
})();
