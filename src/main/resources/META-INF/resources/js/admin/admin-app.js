/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL — PANEL DE ADMINISTRACIÓN DE MUSEOS
 * Archivo: js/admin/admin-app.js
 * Propósito: Orquesta el App Sidebar 2 (Icon Rail con Hover Flyouts),
 *            el enrutamiento modular por hash (#inicio..#recorridos), el
 *            renderizado reactivo conectado a Quarkus + MySQL (XAMPP) y
 *            todas las acciones CRUD / modales.
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  var STORAGE_RAIL_KEY = "museos_admin_rail_expanded";
  var currentSectionId = "inicio";

  var railEl = null;
  var railListEl = null;
  var viewRootEl = null;
  var topbarCrumbEl = null;
  var dbPillEl = null;
  var dbPillTextEl = null;
  var pinBtnEl = null;
  var mobileTriggerEl = null;
  var mobileCloseEl = null;
  var backdropEl = null;
  var restoreBtnEl = null;

  var openFlyoutHost = null;
  var openTimer = null;
  var closeTimer = null;
  var hotResetTimer = null;
  var isRailHot = false;

  function canUseHoverFlyouts() {
    if (document.body.classList.contains("admin-rail-expanded")) {
      return false;
    }
    if (window.innerWidth <= 900) {
      return false;
    }
    return true;
  }

  function clearFlyoutTimers() {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function closeAllFlyouts(resetHot) {
    clearFlyoutTimers();
    if (openFlyoutHost) {
      openFlyoutHost.classList.remove("is-flyout-open");
      openFlyoutHost = null;
    }
    if (resetHot) {
      isRailHot = false;
      if (railEl) {
        railEl.classList.remove("is-rail-hot");
      }
    }
  }

  function openFlyout(hostEl, immediate) {
    if (!canUseHoverFlyouts() || !hostEl) {
      return;
    }
    clearFlyoutTimers();
    if (hotResetTimer) {
      clearTimeout(hotResetTimer);
      hotResetTimer = null;
    }

    var delay = immediate || isRailHot ? 0 : 55;
    openTimer = setTimeout(function () {
      if (openFlyoutHost && openFlyoutHost !== hostEl) {
        openFlyoutHost.classList.remove("is-flyout-open");
      }
      hostEl.classList.add("is-flyout-open");
      openFlyoutHost = hostEl;
      isRailHot = true;
      if (railEl) {
        railEl.classList.add("is-rail-hot");
      }
    }, delay);
  }

  function scheduleFlyoutClose(hostEl) {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    if (closeTimer) {
      clearTimeout(closeTimer);
    }
    closeTimer = setTimeout(function () {
      if (openFlyoutHost === hostEl) {
        hostEl.classList.remove("is-flyout-open");
        openFlyoutHost = null;
      }
      hotResetTimer = setTimeout(function () {
        if (!openFlyoutHost) {
          isRailHot = false;
          if (railEl) {
            railEl.classList.remove("is-rail-hot");
          }
        }
      }, 220);
    }, 125);
  }

  function bindFlyoutHost(hostEl) {
    if (!hostEl) {
      return;
    }
    var finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    hostEl.addEventListener("mouseenter", function () {
      if (!finePointerQuery.matches) {
        return;
      }
      openFlyout(hostEl, false);
    });

    hostEl.addEventListener("mouseleave", function () {
      if (!finePointerQuery.matches) {
        return;
      }
      scheduleFlyoutClose(hostEl);
    });

    hostEl.addEventListener("focusin", function () {
      if (!canUseHoverFlyouts()) {
        return;
      }
      openFlyout(hostEl, true);
    });

    hostEl.addEventListener("focusout", function (event) {
      if (!hostEl.contains(event.relatedTarget)) {
        scheduleFlyoutClose(hostEl);
      }
    });
  }

  function buildRailNavigation() {
    if (!railListEl) {
      return;
    }
    var sections = Admin.getSections();
    var total = sections.length;
    var html = "";

    for (var i = 0; i < total; i++) {
      var sec = sections[i];
      var posClass = "";
      if (i <= 1) {
        posClass = " rail-flyout--top";
      } else if (i >= total - 2) {
        posClass = " rail-flyout--bottom";
      }

      var linksHtml = "";
      var flyoutLinks = sec.flyoutLinks || [];
      for (var l = 0; l < flyoutLinks.length; l++) {
        var link = flyoutLinks[l];
        linksHtml +=
          '<button type="button" class="rail-flyout__link" data-flyout-section="' +
          Admin.escapeHtml(sec.id) +
          '" data-flyout-action="' +
          Admin.escapeHtml(link.action || "open") +
          '">' +
          "<span>" +
          Admin.escapeHtml(link.label) +
          "</span>" +
          Admin.getIcon("arrowRight") +
          "</button>";
      }

      html +=
        '<li class="rail-item" data-flyout-host data-rail-item="' +
        Admin.escapeHtml(sec.id) +
        '">' +
        '  <button type="button" class="rail-btn" data-nav-target="' +
        Admin.escapeHtml(sec.id) +
        '" aria-label="' +
        Admin.escapeHtml(sec.title + " — " + sec.shortDesc) +
        '">' +
        '    <span class="rail-btn__icon">' +
        Admin.getIcon(sec.icon || sec.id) +
        "</span>" +
        '    <span class="rail-btn__label">' +
        Admin.escapeHtml(sec.title) +
        "</span>" +
        '    <span class="rail-btn__code">' +
        Admin.escapeHtml(sec.code) +
        "</span>" +
        "  </button>" +
        '  <div class="rail-flyout' +
        posClass +
        '" role="region" aria-label="Vista rápida de ' +
        Admin.escapeHtml(sec.title) +
        '">' +
        '    <div class="rail-flyout__eyebrow">' +
        "      <span>Módulo " +
        Admin.escapeHtml(sec.code) +
        "</span>" +
        "      <span>" +
        Admin.escapeHtml(sec.dbEntity) +
        "</span>" +
        "    </div>" +
        '    <p class="rail-flyout__title">' +
        Admin.escapeHtml(sec.title) +
        "</p>" +
        '    <p class="rail-flyout__desc">' +
        Admin.escapeHtml(sec.shortDesc) +
        "</p>" +
        (linksHtml
          ? '<div class="rail-flyout__links">' + linksHtml + "</div>"
          : "") +
        '    <div class="rail-flyout__meta">' +
        '      <span class="rail-flyout__status">Quarkus + MySQL</span>' +
        "      <span>Clic para abrir</span>" +
        "    </div>" +
        "  </div>" +
        "</li>";
    }

    railListEl.innerHTML = html;

    var allFlyoutHosts = document.querySelectorAll("[data-flyout-host]");
    for (var h = 0; h < allFlyoutHosts.length; h++) {
      bindFlyoutHost(allFlyoutHosts[h]);
    }
  }

  function updateActiveRailState(sectionId) {
    var buttons = document.querySelectorAll(".rail-list .rail-btn[data-nav-target]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isCurrent = btn.getAttribute("data-nav-target") === sectionId;
      btn.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    }
  }

  function updateConnectionPill(connState) {
    if (!dbPillEl || !dbPillTextEl) return;
    dbPillEl.classList.remove("is-connected", "is-offline");
    if (connState === "connected") {
      dbPillEl.classList.add("is-connected");
      dbPillTextEl.textContent = "Quarkus + MySQL activo";
      dbPillEl.setAttribute(
        "title",
        "Conectado con Quarkus (" + Admin.store.API_URL + ") y MySQL en XAMPP"
      );
    } else if (connState === "memory") {
      dbPillEl.classList.add("is-offline");
      dbPillTextEl.textContent = "Quarkus activo · MySQL apagado";
      dbPillEl.setAttribute(
        "title",
        "Quarkus está activo en memoria, pero MySQL en XAMPP no responde. Enciende MySQL y haz clic para sincronizar."
      );
    } else if (connState === "offline") {
      dbPillEl.classList.add("is-offline");
      dbPillTextEl.textContent = "Respaldo local (Quarkus offline)";
      dbPillEl.setAttribute(
        "title",
        "Quarkus no respondió en " +
          Admin.store.API_URL +
          ". Clic para reintentar conexión."
      );
    } else {
      dbPillTextEl.textContent = "Conectando con Quarkus...";
    }
  }

  function setMobileDrawerOpen(isOpen, returnFocus) {
    document.body.classList.toggle("admin-mobile-open", isOpen);
    if (backdropEl) {
      backdropEl.classList.toggle("is-visible", isOpen);
    }
    if (mobileTriggerEl) {
      mobileTriggerEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (!isOpen && returnFocus) {
        mobileTriggerEl.focus();
      }
    }
  }

  function setRailExpanded(expanded, persist) {
    document.body.classList.toggle("admin-rail-expanded", expanded);
    if (pinBtnEl) {
      pinBtnEl.setAttribute("aria-expanded", expanded ? "true" : "false");
      pinBtnEl.setAttribute(
        "aria-label",
        expanded
          ? "Contraer barra lateral a modo Icon Rail"
          : "Expandir barra lateral con etiquetas"
      );
      pinBtnEl.setAttribute(
        "title",
        expanded ? "Contraer a Icon Rail" : "Expandir sidebar"
      );
    }
    if (expanded) {
      closeAllFlyouts(true);
    }
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_RAIL_KEY, expanded ? "1" : "0");
      } catch (e) {
        /* Ignorar almacenamiento bloqueado */
      }
    }
  }

  function renderSection(sectionId, options) {
    var opts = options || {};
    var section = Admin.getSection(sectionId) || Admin.getSection("inicio");
    if (!section || !viewRootEl) {
      return;
    }

    currentSectionId = section.id;
    viewRootEl.innerHTML = section.render();
    if (typeof section.mount === "function") {
      section.mount(viewRootEl);
    }

    updateActiveRailState(section.id);

    if (topbarCrumbEl) {
      topbarCrumbEl.textContent = section.code + " · " + section.title;
    }
    document.title = section.title + " | Museos — Panel de administración";

    if (!opts.fromHashChange) {
      var targetHash = "#" + section.id;
      if (window.location.hash !== targetHash) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    }

    closeAllFlyouts(false);
    setMobileDrawerOpen(false, false);

    if (opts.scrollTop !== false) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function triggerCreateForSection(sectionId) {
    var modals = Admin.modals;
    if (!modals) return;
    if (sectionId === "museos") modals.openNuevoMuseo();
    else if (sectionId === "salas") modals.openNuevaSala();
    else if (sectionId === "objetos" || sectionId === "inicio") modals.openNuevoObjeto();
    else if (sectionId === "categorias") modals.openNuevaCategoria();
    else if (sectionId === "artistas") modals.openNuevoArtista();
    else if (sectionId === "historial") modals.openTraslado();
    else if (sectionId === "recorridos") modals.openNuevoRecorrido();
  }

  function handleCrudAction(action, id) {
    var modals = Admin.modals;
    var store = Admin.store;
    if (!modals || !store) return;

    switch (action) {
      case "new-museo":
        modals.openNuevoMuseo();
        break;
      case "edit-museo":
        modals.openEditarMuseo(id);
        break;
      case "delete-museo":
        modals.eliminarMuseo(id);
        break;
      case "new-sala":
        modals.openNuevaSala();
        break;
      case "edit-sala":
        modals.openEditarSala(id);
        break;
      case "delete-sala":
        modals.eliminarSala(id);
        break;
      case "new-objeto":
        modals.openNuevoObjeto();
        break;
      case "edit-objeto":
        modals.openEditarObjeto(id);
        break;
      case "delete-objeto":
        modals.eliminarObjeto(id);
        break;
      case "ver-historial":
        store.filters.historialObjeto = String(id);
        renderSection("historial");
        break;
      case "new-categoria":
        modals.openNuevaCategoria();
        break;
      case "edit-categoria":
        modals.openEditarCategoria(id);
        break;
      case "delete-categoria":
        modals.eliminarCategoria(id);
        break;
      case "new-artista":
        modals.openNuevoArtista();
        break;
      case "edit-artista":
        modals.openEditarArtista(id);
        break;
      case "delete-artista":
        modals.eliminarArtista(id);
        break;
      case "new-traslado":
        modals.openTraslado();
        break;
      case "new-recorrido":
        modals.openNuevoRecorrido();
        break;
      case "edit-recorrido":
        modals.openEditarRecorrido(id);
        break;
      case "delete-recorrido":
        modals.eliminarRecorrido(id);
        break;
      case "sync-backend":
        store.cargarDesdeBackend(false);
        break;
      default:
        break;
    }
  }

  function resolveInitialSection() {
    var rawHash = (window.location.hash || "").replace(/^#\/?/, "").trim().toLowerCase();
    if (rawHash && Admin.getSection(rawHash)) {
      return rawHash;
    }
    return "inicio";
  }

  function bindGlobalEvents() {
    document.addEventListener("click", function (event) {
      var flyoutBtn = event.target.closest("[data-flyout-section]");
      if (flyoutBtn) {
        var fSection = flyoutBtn.getAttribute("data-flyout-section");
        var fAction = flyoutBtn.getAttribute("data-flyout-action");
        renderSection(fSection);
        if (fAction === "create") {
          triggerCreateForSection(fSection);
        }
        return;
      }

      var crudBtn = event.target.closest("[data-crud]");
      if (crudBtn) {
        var action = crudBtn.getAttribute("data-crud");
        var id = crudBtn.getAttribute("data-id");
        handleCrudAction(action, id);
        return;
      }

      var navTarget = event.target.closest("[data-nav-target]");
      if (navTarget) {
        var targetId = navTarget.getAttribute("data-nav-target");
        renderSection(targetId);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllFlyouts(true);
        if (document.body.classList.contains("admin-mobile-open")) {
          setMobileDrawerOpen(false, true);
        }
        return;
      }

      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        var activeTag = (document.activeElement && document.activeElement.tagName) || "";
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA" && activeTag !== "SELECT") {
          var searchInput = viewRootEl && viewRootEl.querySelector(".admin-search__input");
          if (searchInput) {
            event.preventDefault();
            searchInput.focus();
          }
        }
      }
    });

    if (restoreBtnEl) {
      restoreBtnEl.addEventListener("click", function () {
        closeAllFlyouts(true);
        Admin.store.restaurarDatos();
      });
    }

    if (dbPillEl) {
      dbPillEl.addEventListener("click", function () {
        Admin.store.cargarDesdeBackend(false);
      });
    }

    if (pinBtnEl) {
      pinBtnEl.addEventListener("click", function () {
        var isExpanded = document.body.classList.contains("admin-rail-expanded");
        setRailExpanded(!isExpanded, true);
      });
    }

    if (mobileTriggerEl) {
      mobileTriggerEl.addEventListener("click", function () {
        var isOpen = document.body.classList.contains("admin-mobile-open");
        setMobileDrawerOpen(!isOpen, false);
      });
    }

    if (mobileCloseEl) {
      mobileCloseEl.addEventListener("click", function () {
        setMobileDrawerOpen(false, true);
      });
    }

    if (backdropEl) {
      backdropEl.addEventListener("click", function () {
        setMobileDrawerOpen(false, false);
      });
    }

    window.addEventListener("hashchange", function () {
      var hashSection = resolveInitialSection();
      if (hashSection !== currentSectionId) {
        renderSection(hashSection, { fromHashChange: true });
      }
    });

    var desktopMq = window.matchMedia("(min-width: 901px)");
    if (desktopMq.addEventListener) {
      desktopMq.addEventListener("change", function (ev) {
        if (ev.matches) {
          setMobileDrawerOpen(false, false);
        }
      });
    }
  }

  function init() {
    railEl = document.getElementById("admin-rail");
    railListEl = document.getElementById("admin-rail-list");
    viewRootEl = document.getElementById("admin-view-root");
    topbarCrumbEl = document.getElementById("admin-topbar-crumb");
    dbPillEl = document.getElementById("admin-db-pill");
    dbPillTextEl = document.getElementById("admin-db-pill-text");
    pinBtnEl = document.getElementById("rail-pin-btn");
    mobileTriggerEl = document.getElementById("admin-mobile-trigger");
    mobileCloseEl = document.getElementById("rail-mobile-close");
    backdropEl = document.getElementById("admin-backdrop");
    restoreBtnEl = document.getElementById("btn-restaurar-datos");

    Admin.navigate = function (sectionId) {
      renderSection(sectionId);
    };

    try {
      if (window.localStorage.getItem(STORAGE_RAIL_KEY) === "1") {
        setRailExpanded(true, false);
      }
    } catch (e) {
      /* Mantener modo Icon Rail por defecto */
    }

    buildRailNavigation();
    Admin.modals.init();
    bindGlobalEvents();

    Admin.store.subscribe(function () {
      renderSection(currentSectionId, { fromHashChange: true, scrollTop: false });
    });

    Admin.store.onConnectionChange(updateConnectionPill);

    renderSection(resolveInitialSection(), { scrollTop: false });
    Admin.store.cargarDesdeBackend(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.MuseosAdmin);
