/**
 * ============================================================================
 * SECCIÓN 06: ARTISTAS — Registro de artistas y autores
 * Archivo: js/admin/sections/artistas.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderArtistasHtml(store) {
    var datos = store.getDatos();
    var texto = (store.filters.artistasTexto || "").toLowerCase().trim();

    var lista = datos.artistas.filter(function (a) {
      var campo = (a.nombre + " " + (a.nacionalidad || "")).toLowerCase();
      return campo.indexOf(texto) !== -1;
    });

    if (lista.length === 0) {
      return (
        '<div class="admin-empty-state">' +
        '  <div class="admin-empty-state__medallion">' +
        Admin.getIcon("artistas") +
        "</div>" +
        '  <h3 class="admin-empty-state__title">No se encontraron artistas</h3>' +
        '  <p class="admin-empty-state__text">Prueba con otro término de búsqueda o registra un nuevo autor.</p>' +
        "</div>"
      );
    }

    var html = '<div class="admin-cards-grid">';
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      var obras = datos.objetos
        .filter(function (o) {
          return String(o.artista_id) === String(a.id);
        })
        .map(function (o) {
          return o.nombre;
        });

      html +=
        '<article class="admin-card">' +
        '  <div class="admin-card__head">' +
        '    <span class="admin-card__eyebrow">' +
        Admin.escapeHtml(a.nacionalidad || "Sin nacionalidad") +
        "</span>" +
        '    <h2 class="admin-card__title">' +
        Admin.escapeHtml(a.nombre) +
        "</h2>" +
        "  </div>" +
        '  <p class="admin-card__desc">' +
        Admin.escapeHtml(a.biografia || "Sin biografía registrada.") +
        "</p>" +
        '  <div class="admin-works-box">' +
        "    <strong>Obras (" +
        obras.length +
        "):</strong> " +
        "<span>" +
        Admin.escapeHtml(obras.length > 0 ? obras.join(", ") : "Ninguna obra asociada") +
        "</span>" +
        "  </div>" +
        '  <div class="admin-card__actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-artista" data-id="' +
        Admin.escapeHtml(a.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-artista" data-id="' +
        Admin.escapeHtml(a.id) +
        '">Eliminar</button>' +
        "  </div>" +
        "</article>";
    }
    html += "</div>";
    return html;
  }

  Admin.registerSection({
    id: "artistas",
    code: "06",
    eyebrow: "Módulo 06 · Autoría y Talleres",
    title: "Artistas",
    shortDesc: "Registro de artistas y autores.",
    description:
      "Autores de las obras con su nacionalidad, biografía y listado de piezas asociadas dentro de la colección.",
    icon: "artistas",
    dbEntity: "artista",
    flyoutLinks: [
      { label: "Ver directorio de artistas", action: "open" },
      { label: "Registrar nuevo artista", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      return (
        '<section class="admin-view" data-section-view="artistas" aria-labelledby="section-heading-artistas">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 06 · Autoría y Talleres</span>' +
        '      <h1 id="section-heading-artistas" class="admin-section-title">Artistas</h1>' +
        '      <p class="admin-section-desc">Autores de las obras, su nacionalidad, biografía y catálogo vinculado en MySQL.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>artista (" +
        datos.artistas.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar artista por nombre o nacionalidad">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-artista" class="admin-search__input" placeholder="Buscar por nombre o nacionalidad..." value="' +
        Admin.escapeHtml(store.filters.artistasTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-artista">' +
        Admin.getIcon("plus") +
        "        <span>Nuevo artista</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="artistas-results">' +
        renderArtistasHtml(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-artista");
      var results = root.querySelector("#artistas-results");
      if (input && results) {
        input.addEventListener("input", function () {
          store.filters.artistasTexto = input.value;
          results.innerHTML = renderArtistasHtml(store);
        });
      }
    }
  });
})(window.MuseosAdmin);
