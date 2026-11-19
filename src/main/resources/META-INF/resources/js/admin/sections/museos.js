/**
 * ============================================================================
 * SECCIÓN 02: MUSEOS — Gestión de museos registrados
 * Archivo: js/admin/sections/museos.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderCardsHtml(store) {
    var datos = store.getDatos();
    var texto = (store.filters.museosTexto || "").toLowerCase().trim();
    var lista = datos.museos.filter(function (m) {
      return (
        m.nombre.toLowerCase().indexOf(texto) !== -1 ||
        (m.descripcion || "").toLowerCase().indexOf(texto) !== -1
      );
    });

    if (lista.length === 0) {
      return (
        '<div class="admin-empty-state">' +
        '  <div class="admin-empty-state__medallion">' +
        Admin.getIcon("museos") +
        "</div>" +
        '  <h3 class="admin-empty-state__title">No se encontraron museos</h3>' +
        '  <p class="admin-empty-state__text">Ajusta el término de búsqueda o registra un nuevo museo en la base de datos.</p>' +
        "</div>"
      );
    }

    var html = '<div class="admin-cards-grid">';
    for (var i = 0; i < lista.length; i++) {
      var m = lista[i];
      var salas = datos.salas.filter(function (s) {
        return String(s.museo_id) === String(m.id);
      });
      var cantidadObjetos = 0;
      for (var s = 0; s < salas.length; s++) {
        var salaId = salas[s].id;
        cantidadObjetos += datos.objetos.filter(function (o) {
          return String(o.sala_exhibicion_id) === String(salaId);
        }).length;
      }

      var ubicacionHtml = '<p class="admin-muted-note">Sin coordenadas registradas</p>';
      if (m.latitud != null && m.longitud != null && m.latitud !== "" && m.longitud !== "") {
        var lat = Number(m.latitud);
        var lon = Number(m.longitud);
        ubicacionHtml =
          '<div class="admin-coords">' +
          '  <div><span>Latitud</span><strong>' +
          Math.abs(lat).toFixed(4) +
          "&deg; " +
          (lat >= 0 ? "N" : "S") +
          "</strong></div>" +
          '  <div><span>Longitud</span><strong>' +
          Math.abs(lon).toFixed(4) +
          "&deg; " +
          (lon >= 0 ? "E" : "O") +
          "</strong></div>" +
          '  <a class="admin-ext-link" href="https://www.google.com/maps?q=' +
          encodeURIComponent(lat + "," + lon) +
          '" target="_blank" rel="noopener">Ver mapa &#8599;</a>' +
          "</div>";
      }

      html +=
        '<article class="admin-card">' +
        '  <div class="admin-card__head">' +
        '    <span class="admin-card__eyebrow">Museo #' +
        Admin.escapeHtml(m.id) +
        "</span>" +
        '    <h2 class="admin-card__title">' +
        Admin.escapeHtml(m.nombre) +
        "</h2>" +
        "  </div>" +
        '  <p class="admin-card__desc">' +
        Admin.escapeHtml(m.descripcion || "Sin descripción registrada.") +
        "</p>" +
        '  <div class="admin-card__stats">' +
        '    <div><span>Salas</span><strong>' +
        salas.length +
        "</strong></div>" +
        '    <div><span>Objetos</span><strong>' +
        cantidadObjetos +
        "</strong></div>" +
        "  </div>" +
        ubicacionHtml +
        (m.url_pagina
          ? '<a class="admin-ext-link admin-ext-link--block" href="' +
            Admin.escapeHtml(m.url_pagina) +
            '" target="_blank" rel="noopener">Página principal &#8599;</a>'
          : "") +
        '  <div class="admin-card__actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-museo" data-id="' +
        Admin.escapeHtml(m.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-museo" data-id="' +
        Admin.escapeHtml(m.id) +
        '">Eliminar</button>' +
        "  </div>" +
        "</article>";
    }
    html += "</div>";
    return html;
  }

  Admin.registerSection({
    id: "museos",
    code: "02",
    eyebrow: "Módulo 02 · Sedes Institucionales",
    title: "Museos",
    shortDesc: "Gestión de museos registrados.",
    description:
      "Museos registrados, su ubicación geográfica, salas asociadas y página web oficial sincronizados con MySQL.",
    icon: "museos",
    dbEntity: "museo",
    flyoutLinks: [
      { label: "Ver museos registrados", action: "open" },
      { label: "Registrar nuevo museo", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      return (
        '<section class="admin-view" data-section-view="museos" aria-labelledby="section-heading-museos">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 02 · Sedes Institucionales</span>' +
        '      <h1 id="section-heading-museos" class="admin-section-title">Museos</h1>' +
        '      <p class="admin-section-desc">Museos registrados, su ubicación geográfica, conteo de salas y piezas, y enlace a su sitio web.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>museo (" +
        store.getDatos().museos.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar museo por nombre">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-museo" class="admin-search__input" placeholder="Buscar museo por nombre o descripción..." value="' +
        Admin.escapeHtml(store.filters.museosTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-museo">' +
        Admin.getIcon("plus") +
        "        <span>Nuevo museo</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="museos-results">' +
        renderCardsHtml(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-museo");
      var results = root.querySelector("#museos-results");
      if (input && results) {
        input.addEventListener("input", function () {
          store.filters.museosTexto = input.value;
          results.innerHTML = renderCardsHtml(store);
        });
      }
    }
  });
})(window.MuseosAdmin);
