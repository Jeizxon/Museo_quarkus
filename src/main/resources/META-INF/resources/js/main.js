/**
 * ============================================================================
 * COMPORTAMIENTO BASE Y NAVEGACIÓN COMÚN — IGLESIA DE SANTO DOMINGO DE TUNJA
 * Archivo: js/main.js
 * Propósito: Control accesible del menú adaptable (móvil/escritorio), gestión
 *            de atributos ARIA (aria-expanded), cierre con tecla Escape y
 *            sincronización al redimensionar el viewport.
 * ============================================================================
 */

(function () {
  "use strict";

  function initResponsiveNavigation() {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (!navToggle || !siteNav) {
      return;
    }

    function closeMenu(returnFocus) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú de navegación");
      if (returnFocus) {
        navToggle.focus();
      }
    }

    function openMenu() {
      siteNav.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Cerrar menú de navegación");
    }

    navToggle.addEventListener("click", function () {
      var isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    /* Cerrar con tecla Escape por accesibilidad */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        closeMenu(true);
      }
    });

    /* Cerrar al hacer clic fuera del encabezado en pantallas móviles */
    document.addEventListener("click", function (event) {
      if (!siteNav.classList.contains("is-open")) {
        return;
      }
      var isClickInsideHeader =
        siteNav.contains(event.target) || navToggle.contains(event.target);
      if (!isClickInsideHeader) {
        closeMenu(false);
      }
    });

    /* Restablecer estado al pasar a escritorio (> 1120px) */
    var desktopMedia = window.matchMedia("(min-width: 1121px)");
    if (desktopMedia.addEventListener) {
      desktopMedia.addEventListener("change", function (e) {
        if (e.matches) {
          closeMenu(false);
        }
      });
    }
  }

  /**
   * Inicializa la animación tridimensional de paso de página (page-flip)
   * en los componentes esquemórficos de Códice Abierto ([data-codex-book]).
   * Funciona mediante clic, toque táctil y teclado sin depender de :hover.
   */
  function initCodexPageFlip() {
    var codexBooks = document.querySelectorAll("[data-codex-book]");
    if (!codexBooks.length) {
      return;
    }

    for (var i = 0; i < codexBooks.length; i++) {
      (function (codex) {
        var toggleBtn = codex.querySelector("[data-codex-toggle]");
        var statusEl = codex.querySelector("[data-codex-status]");
        var labelEl = codex.querySelector("[data-codex-toggle-label]");
        var badgeEl = codex.querySelector("[data-codex-toggle-badge]");

        if (!toggleBtn) {
          return;
        }

        function setFlippedState(isFlipped) {
          if (isFlipped) {
            codex.classList.remove("is-returning");
            codex.classList.add("is-flipped");
            toggleBtn.setAttribute("aria-expanded", "true");
            if (statusEl) {
              statusEl.textContent =
                codex.getAttribute("data-status-flipped") ||
                "PLIEGO ABIERTO: FOLIOS III Y IV (REVERSO DOCUMENTAL)";
            }
            if (labelEl) {
              labelEl.textContent =
                toggleBtn.getAttribute("data-label-flipped") ||
                "Regresar hoja a los Folios I y II";
            }
            if (badgeEl) {
              badgeEl.textContent = "FOLIOS I–II";
            }
          } else {
            codex.classList.remove("is-flipped");
            codex.classList.add("is-returning");
            toggleBtn.setAttribute("aria-expanded", "false");
            if (statusEl) {
              statusEl.textContent =
                codex.getAttribute("data-status-default") ||
                "PLIEGO ABIERTO: FOLIOS I Y II (ANVERSO DOCUMENTAL)";
            }
            if (labelEl) {
              labelEl.textContent =
                toggleBtn.getAttribute("data-label-default") ||
                "Pasar hoja a los Folios III y IV";
            }
            if (badgeEl) {
              badgeEl.textContent = "FOLIOS III–IV";
            }
          }
        }

        toggleBtn.addEventListener("click", function () {
          var currentlyFlipped = codex.classList.contains("is-flipped");
          setFlippedState(!currentlyFlipped);
        });
      })(codexBooks[i]);
    }
  }

  function initAll() {
    initResponsiveNavigation();
    initCodexPageFlip();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
