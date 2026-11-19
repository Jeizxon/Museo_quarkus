/**
 * ============================================================================
 * SECCIÓN 08: RECORRIDOS — Gestión de recorridos guiados e itinerarios
 * Archivo: js/admin/sections/recorridos.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderRecorridosHtml(store) {
    var datos = store.getDatos();
    var hoy = store.ahora();
    var texto = (store.filters.recorridosTexto || "").toLowerCase().trim();

    var lista = datos.recorridos.filter(function (r) {
      if (!texto) return true;
      return (
        r.nombre.toLowerCase().indexOf(texto) !== -1 ||
        (r.descripcion || "").toLowerCase().indexOf(texto) !== -1
      );
    });

    if (lista.length === 0) {
      return (
        '<div class="admin-empty-state">' +
        '  <div class="admin-empty-state__medallion">' +
        Admin.getIcon("recorridos") +
        "</div>" +
        '  <h3 class="admin-empty-state__title">No se encontraron recorridos</h3>' +
        '  <p class="admin-empty-state__text">Crea un nuevo recorrido guiado y define el orden de visita de las salas.</p>' +
        "</div>"
      );
    }

    var html = '<div class="admin-cards-grid">';
    for (var i = 0; i < lista.length; i++) {
      var r = lista[i];
      var estadoHtml = '<span class="admin-status-tag admin-status-tag--bueno">Activo</span>';
      if (hoy < r.fecha_inicio) {
        estadoHtml = '<span class="admin-status-tag admin-status-tag--regular">Próximo</span>';
      } else if (hoy > r.fecha_fin) {
        estadoHtml = '<span class="admin-status-tag admin-status-tag--terminado">Finalizado</span>';
      }

      var salasIds = store.salasDelRecorrido(r.id);
      var salasListHtml = "";
      for (var s = 0; s < salasIds.length; s++) {
        var idSala = salasIds[s];
        salasListHtml +=
          "<li>" +
          "<span>" +
          Admin.escapeHtml(store.nombreSala(idSala)) +
          "</span>" +
          "<small>" +
          Admin.escapeHtml(store.nombreMuseoDeSala(idSala)) +
          "</small>" +
          "</li>";
      }

      html +=
        '<article class="admin-card">' +
        '  <div class="admin-card__head">' +
        '    <div class="admin-card__toprow">' +
        estadoHtml +
        '      <span class="admin-card__eyebrow">' +
        salasIds.length +
        " sala" +
        (salasIds.length === 1 ? "" : "s") +
        "</span>" +
        "    </div>" +
        '    <h2 class="admin-card__title">' +
        Admin.escapeHtml(r.nombre) +
        "</h2>" +
        "  </div>" +
        '  <p class="admin-card__desc">' +
        Admin.escapeHtml(r.descripcion || "Sin descripción registrada.") +
        "</p>" +
        '  <p class="admin-date-range">Del <strong>' +
        Admin.escapeHtml(store.formatoFechaHora(r.fecha_inicio)) +
        "</strong> al <strong>" +
        Admin.escapeHtml(store.formatoFechaHora(r.fecha_fin)) +
        "</strong></p>" +
        '  <div class="admin-route-box">' +
        '    <span class="admin-card__eyebrow">Orden de las salas</span>' +
        '    <ol class="admin-route-list">' +
        (salasListHtml || "<li>Sin salas asignadas</li>") +
        "</ol>" +
        "  </div>" +
        (r.url_pagina
          ? '<a class="admin-ext-link admin-ext-link--block" href="' +
            Admin.escapeHtml(r.url_pagina) +
            '" target="_blank" rel="noopener">Página del recorrido &#8599;</a>'
          : "") +
        '  <div class="admin-card__actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-recorrido" data-id="' +
        Admin.escapeHtml(r.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-recorrido" data-id="' +
        Admin.escapeHtml(r.id) +
        '">Eliminar</button>' +
        "  </div>" +
        "</article>";
    }
    html += "</div>";
    return html;
  }

  Admin.registerSection({
    id: "recorridos",
    code: "08",
    eyebrow: "Módulo 08 · Curaduría Espacial",
    title: "Recorridos",
    shortDesc: "Gestión de recorridos.",
    description:
      "Visitas guiadas, vigencia programada y secuencia ordenada de salas sincronizadas con MySQL.",
    icon: "recorridos",
    dbEntity: "recorrido_guiado",
    flyoutLinks: [
      { label: "Ver recorridos guiados", action: "open" },
      { label: "Crear nuevo recorrido", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      return (
        '<section class="admin-view" data-section-view="recorridos" aria-labelledby="section-heading-recorridos">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 08 · Curaduría Espacial</span>' +
        '      <h1 id="section-heading-recorridos" class="admin-section-title">Recorridos guiados</h1>' +
        '      <p class="admin-section-desc">Visitas guiadas programadas y el orden exacto en que pasan por las salas de los museos.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>recorrido_guiado (" +
        datos.recorridos.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar recorrido">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-recorrido" class="admin-search__input" placeholder="Buscar recorrido por nombre o descripción..." value="' +
        Admin.escapeHtml(store.filters.recorridosTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-recorrido">' +
        Admin.getIcon("plus") +
        "        <span>Nuevo recorrido</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="recorridos-results">' +
        renderRecorridosHtml(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-recorrido");
      var results = root.querySelector("#recorridos-results");
      if (input && results) {
        input.addEventListener("input", function () {
          store.filters.recorridosTexto = input.value;
          results.innerHTML = renderRecorridosHtml(store);
        });
      }
    }
  });
})(window.MuseosAdmin);
