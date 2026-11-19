/**
 * ============================================================================
 * REGISTRO CENTRAL Y PLANTILLA BASE — PANEL DE ADMINISTRACIÓN DE MUSEOS
 * Archivo: js/admin/admin-registry.js
 * Propósito: Núcleo modular del panel (window.MuseosAdmin). Registra cada
 *            sección independiente, centraliza íconos SVG y ofrece plantillas
 *            estructuradas listas para inyectar datos reales de base de datos.
 * ============================================================================
 */

(function (global) {
  "use strict";

  var sectionsOrder = [];
  var sectionsMap = {};
  var toastTimer = null;

  var ICONS = {
    inicio:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="3" width="7" height="9" rx="1"/>' +
      '<rect x="14" y="3" width="7" height="5" rx="1"/>' +
      '<rect x="14" y="12" width="7" height="9" rx="1"/>' +
      '<rect x="3" y="16" width="7" height="5" rx="1"/>' +
      "</svg>",
    museos:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 10h18"/>' +
      '<path d="M5 10v8"/>' +
      '<path d="M9 10v8"/>' +
      '<path d="M15 10v8"/>' +
      '<path d="M19 10v8"/>' +
      '<path d="M2 20h20"/>' +
      '<path d="M12 3 2 8v2h20V8L12 3z"/>' +
      "</svg>",
    salas:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 20h18"/>' +
      '<path d="M5 20V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15"/>' +
      '<path d="M9 20v-5a3 3 0 0 1 6 0v5"/>' +
      '<path d="M9 8h6"/>' +
      "</svg>",
    objetos:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3z"/>' +
      '<path d="M12 12 4 7.5"/>' +
      '<path d="M12 12l8-4.5"/>' +
      '<path d="M12 12v9"/>' +
      "</svg>",
    categorias:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 2H6a2 2 0 0 0-2 2v6l8.59 8.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82L12 2z"/>' +
      '<circle cx="8.5" cy="8.5" r="1.25"/>' +
      "</svg>",
    artistas:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M19 8v6"/>' +
      '<path d="M22 11h-6"/>' +
      "</svg>",
    historial:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>' +
      '<path d="M3 3v5h5"/>' +
      '<path d="M12 7v5l3 2"/>' +
      "</svg>",
    recorridos:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="6" cy="19" r="2.5"/>' +
      '<circle cx="18" cy="5" r="2.5"/>' +
      '<path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>' +
      "</svg>",
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/>' +
      '<path d="m20 20-3.5-3.5"/>' +
      "</svg>",
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 5v14"/>' +
      '<path d="M5 12h14"/>' +
      "</svg>",
    arrowRight:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m9 18 6-6-6-6"/>' +
      "</svg>",
    database:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<ellipse cx="12" cy="5" rx="8" ry="3"/>' +
      '<path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/>' +
      '<path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>' +
      "</svg>",
    download:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<path d="m7 10 5 5 5-5"/>' +
      '<path d="M12 15V3"/>' +
      "</svg>"
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getIcon(name) {
    return ICONS[name] || ICONS.database;
  }

  function registerSection(sectionConfig) {
    if (!sectionConfig || !sectionConfig.id) {
      return;
    }
    if (!sectionsMap[sectionConfig.id]) {
      sectionsOrder.push(sectionConfig.id);
    }
    sectionsMap[sectionConfig.id] = sectionConfig;
  }

  function getSection(id) {
    return sectionsMap[id] || null;
  }

  function getSections() {
    var list = [];
    for (var i = 0; i < sectionsOrder.length; i++) {
      list.push(sectionsMap[sectionsOrder[i]]);
    }
    return list;
  }

  function showToast(title, message) {
    var toastEl = document.getElementById("admin-toast");
    var titleEl = document.getElementById("admin-toast-title");
    var msgEl = document.getElementById("admin-toast-message");
    if (!toastEl || !titleEl || !msgEl) {
      return;
    }
    titleEl.textContent = title || "Módulo preparado para base de datos";
    msgEl.textContent =
      message ||
      "Esta acción queda lista para conectarse con la base de datos en el siguiente paso.";

    toastEl.classList.add("is-visible");
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3600);
  }

  /**
   * Renderiza la plantilla base reutilizable para cada sección de catálogo/gestión:
   *  - Encabezado con código de módulo, título, descripción y entidad prevista.
   *  - Barra superior con buscador, filtros preparados y botón principal de acción.
   *  - Contenedor estructurado de tabla/estado vacío y slot de formulario listo para BD.
   */
  function renderEntityTemplate(cfg) {
    var cols = cfg.columns || [];
    var filters = cfg.filters || [];
    var iconMarkup = getIcon(cfg.icon || cfg.id);
    var actionIconMarkup = getIcon(cfg.primaryActionIcon || "plus");

    var filtersHtml = "";
    for (var f = 0; f < filters.length; f++) {
      filtersHtml +=
        '<span class="admin-filter-chip" data-db-filter="' +
        escapeHtml(filters[f].key) +
        '">' +
        escapeHtml(filters[f].label) +
        "</span>";
    }

    var schemaHtml = "";
    if (cols.length) {
      schemaHtml +=
        '<div class="admin-schema-row" style="--schema-cols: ' +
        cols.length +
        ';" aria-hidden="true">';
      for (var c = 0; c < cols.length; c++) {
        schemaHtml += '<div class="admin-schema-col">' + escapeHtml(cols[c]) + "</div>";
      }
      schemaHtml += "</div>";
    }

    return (
      '<section class="admin-view" data-section-view="' +
      escapeHtml(cfg.id) +
      '" aria-labelledby="section-heading-' +
      escapeHtml(cfg.id) +
      '">' +
      '  <header class="admin-section-header">' +
      '    <div class="admin-section-header__copy">' +
      '      <span class="admin-eyebrow">' +
      escapeHtml(cfg.eyebrow) +
      "</span>" +
      '      <h1 id="section-heading-' +
      escapeHtml(cfg.id) +
      '" class="admin-section-title">' +
      escapeHtml(cfg.title) +
      "</h1>" +
      '      <p class="admin-section-desc">' +
      escapeHtml(cfg.description) +
      "</p>" +
      "    </div>" +
      '    <div class="admin-entity-stamp" aria-label="Información de integración con base de datos">' +
      '      <span>Entidad prevista</span>' +
      "      <strong>" +
      escapeHtml(cfg.dbEntity) +
      "</strong>" +
      "    </div>" +
      "  </header>" +
      '  <div class="admin-toolbar" data-db-toolbar="' +
      escapeHtml(cfg.id) +
      '">' +
      '    <div class="admin-toolbar__search-group">' +
      '      <label class="admin-search" aria-label="' +
      escapeHtml(cfg.searchPlaceholder) +
      '">' +
      '        <span class="admin-search__icon">' +
      getIcon("search") +
      "</span>" +
      '        <input type="search" class="admin-search__input" placeholder="' +
      escapeHtml(cfg.searchPlaceholder) +
      '" data-db-search="' +
      escapeHtml(cfg.id) +
      '" autocomplete="off">' +
      '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
      "      </label>" +
      (filtersHtml
        ? '<div class="admin-toolbar__filters" data-db-slot="filters-' +
          escapeHtml(cfg.id) +
          '">' +
          filtersHtml +
          "</div>"
        : "") +
      "    </div>" +
      '    <div class="admin-toolbar__actions">' +
      '      <button type="button" class="admin-btn admin-btn--primary" data-db-primary-action="' +
      escapeHtml(cfg.id) +
      '" data-action-label="' +
      escapeHtml(cfg.primaryActionLabel) +
      '">' +
      actionIconMarkup +
      "<span>" +
      escapeHtml(cfg.primaryActionLabel) +
      "</span>" +
      "      </button>" +
      "    </div>" +
      "  </div>" +
      '  <div class="admin-panel" id="' +
      escapeHtml(cfg.id) +
      '-panel" data-db-container="' +
      escapeHtml(cfg.dbEntity) +
      '">' +
      '    <div class="admin-panel__head">' +
      '      <h2 class="admin-panel__title">' +
      escapeHtml(cfg.panelTitle) +
      "</h2>" +
      '      <div class="admin-panel__meta">' +
      '        <span class="admin-badge">Pendiente de BD</span>' +
      '        <span data-db-count="' +
      escapeHtml(cfg.id) +
      '">0 registros</span>' +
      "      </div>" +
      "    </div>" +
      schemaHtml +
      '    <div class="admin-empty-state" id="' +
      escapeHtml(cfg.id) +
      '-list-slot" data-db-slot="list">' +
      '      <div class="admin-empty-state__medallion">' +
      iconMarkup +
      "</div>" +
      '      <h3 class="admin-empty-state__title">' +
      escapeHtml(cfg.emptyTitle) +
      "</h3>" +
      '      <p class="admin-empty-state__text">' +
      escapeHtml(cfg.emptyDescription) +
      "</p>" +
      '      <div class="admin-slot-tags">' +
      '        <span class="admin-slot-tag"><span>Entidad:</span> ' +
      escapeHtml(cfg.dbEntity) +
      "</span>" +
      '        <span class="admin-slot-tag"><span>Listado:</span> #' +
      escapeHtml(cfg.id) +
      "-list-slot</span>" +
      '        <span class="admin-slot-tag"><span>Formulario:</span> #' +
      escapeHtml(cfg.id) +
      "-form-slot</span>" +
      "      </div>" +
      '      <button type="button" class="admin-btn admin-btn--ghost" data-db-primary-action="' +
      escapeHtml(cfg.id) +
      '" data-action-label="' +
      escapeHtml(cfg.primaryActionLabel) +
      '">' +
      actionIconMarkup +
      "<span>" +
      escapeHtml(cfg.primaryActionLabel) +
      " (pendiente de BD)</span>" +
      "      </button>" +
      "    </div>" +
      '    <div class="admin-panel__foot" data-db-slot="pagination">' +
      "      <span>Mostrando 0 de 0 registros · Sin fuente de datos conectada</span>" +
      "      <span>Esquema preparado para consulta paginada</span>" +
      "    </div>" +
      "  </div>" +
      '  <div class="admin-form-mount" id="' +
      escapeHtml(cfg.id) +
      '-form-slot" data-db-slot="form">' +
      "    <span><strong>Área de formulario / modal reservada:</strong> aquí se montará el formulario de alta y edición para <code>" +
      escapeHtml(cfg.dbEntity) +
      "</code>.</span>" +
      '    <span class="admin-badge admin-badge--almagre">CRUD diferido</span>' +
      "  </div>" +
      "</section>"
    );
  }

  global.MuseosAdmin = {
    version: "1.0.0-scaffold",
    dataAdapter: null,
    registerSection: registerSection,
    getSection: getSection,
    getSections: getSections,
    getIcon: getIcon,
    escapeHtml: escapeHtml,
    renderEntityTemplate: renderEntityTemplate,
    showToast: showToast,
    navigate: null
  };
})(window);
