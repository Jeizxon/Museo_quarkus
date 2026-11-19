/**
 * ============================================================================
 * SECCIÓN 05: CATEGORÍAS — Clasificación de los objetos de la colección
 * Archivo: js/admin/sections/categorias.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderTableRows(store) {
    var datos = store.getDatos();
    var texto = (store.filters.categoriasTexto || "").toLowerCase().trim();
    var lista = datos.categorias.filter(function (c) {
      if (!texto) return true;
      return (
        c.nombre.toLowerCase().indexOf(texto) !== -1 ||
        (c.descripcion || "").toLowerCase().indexOf(texto) !== -1
      );
    });

    if (lista.length === 0) {
      return '<tr><td colspan="4" class="admin-table-empty">No se encontraron categorías.</td></tr>';
    }

    var html = "";
    for (var i = 0; i < lista.length; i++) {
      var c = lista[i];
      var cantidad = datos.objetos.filter(function (o) {
        return String(o.categoria_id) === String(c.id);
      }).length;
      html +=
        "<tr>" +
        '  <td><strong class="admin-table-primary">' +
        Admin.escapeHtml(c.nombre) +
        "</strong></td>" +
        "  <td>" +
        Admin.escapeHtml(c.descripcion || "Sin descripción") +
        "</td>" +
        '  <td><span class="admin-badge">' +
        cantidad +
        " objeto" +
        (cantidad === 1 ? "" : "s") +
        "</span></td>" +
        '  <td class="admin-table-actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-categoria" data-id="' +
        Admin.escapeHtml(c.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-categoria" data-id="' +
        Admin.escapeHtml(c.id) +
        '">Eliminar</button>' +
        "  </td>" +
        "</tr>";
    }
    return html;
  }

  Admin.registerSection({
    id: "categorias",
    code: "05",
    eyebrow: "Módulo 05 · Taxonomía Curatorial",
    title: "Categorías",
    shortDesc: "Gestión de categorías.",
    description:
      "Clasificación temática y técnica de los objetos de la colección, validando nombres únicos e integridad con el catálogo.",
    icon: "categorias",
    dbEntity: "categoria",
    flyoutLinks: [
      { label: "Ver tabla de categorías", action: "open" },
      { label: "Registrar nueva categoría", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      return (
        '<section class="admin-view" data-section-view="categorias" aria-labelledby="section-heading-categorias">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 05 · Taxonomía Curatorial</span>' +
        '      <h1 id="section-heading-categorias" class="admin-section-title">Categorías</h1>' +
        '      <p class="admin-section-desc">Clasificación de los objetos de la colección (pintura, escultura, orfebrería, etc.) sincronizada con MySQL.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>categoria (" +
        datos.categorias.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar categoría">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-categoria" class="admin-search__input" placeholder="Buscar categoría por nombre o descripción..." value="' +
        Admin.escapeHtml(store.filters.categoriasTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-categoria">' +
        Admin.getIcon("plus") +
        "        <span>Nueva categoría</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div class="admin-panel">' +
        '    <div class="admin-panel__head">' +
        '      <h2 class="admin-panel__title">Listado de categorías curatoriales</h2>' +
        '      <span class="admin-badge">' +
        datos.categorias.length +
        " registros</span>" +
        "    </div>" +
        '    <div class="admin-table-wrap">' +
        '      <table class="admin-table">' +
        "        <thead>" +
        "          <tr>" +
        "            <th>Nombre</th>" +
        "            <th>Descripción</th>" +
        "            <th>Objetos</th>" +
        "            <th>Acciones</th>" +
        "          </tr>" +
        "        </thead>" +
        '        <tbody id="tabla-categorias">' +
        renderTableRows(store) +
        "</tbody>" +
        "      </table>" +
        "    </div>" +
        "  </div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-categoria");
      var tbody = root.querySelector("#tabla-categorias");
      if (input && tbody) {
        input.addEventListener("input", function () {
          store.filters.categoriasTexto = input.value;
          tbody.innerHTML = renderTableRows(store);
        });
      }
    }
  });
})(window.MuseosAdmin);
