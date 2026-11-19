/**
 * ============================================================================
 * SECCIÓN 03: SALAS — Administración de salas de exposición
 * Archivo: js/admin/sections/salas.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderSalasHtml(store) {
    var datos = store.getDatos();
    var museoFiltro = store.filters.salasMuseo || "";
    var texto = (store.filters.salasTexto || "").toLowerCase().trim();

    var mayorCapacidad = 1;
    for (var i = 0; i < datos.salas.length; i++) {
      if (Number(datos.salas[i].capacidad) > mayorCapacidad) {
        mayorCapacidad = Number(datos.salas[i].capacidad);
      }
    }

    var filtradas = datos.salas.filter(function (s) {
      if (museoFiltro && String(s.museo_id) !== String(museoFiltro)) return false;
      if (texto && s.nombre.toLowerCase().indexOf(texto) === -1) return false;
      return true;
    });

    if (filtradas.length === 0) {
      return (
        '<div class="admin-empty-state">' +
        '  <div class="admin-empty-state__medallion">' +
        Admin.getIcon("salas") +
        "</div>" +
        '  <h3 class="admin-empty-state__title">No hay salas con esos filtros</h3>' +
        '  <p class="admin-empty-state__text">Prueba cambiando el museo seleccionado o registra una nueva sala de exposición.</p>' +
        "</div>"
      );
    }

    var html = '<div class="admin-cards-grid">';
    for (var j = 0; j < filtradas.length; j++) {
      var s = filtradas[j];
      var objetos = datos.objetos.filter(function (o) {
        return String(o.sala_exhibicion_id) === String(s.id);
      }).length;
      var recorridos = datos.recorrido_sala.filter(function (r) {
        return String(r.sala_exhibicion_id) === String(s.id);
      }).length;
      var ancho = Math.round((Number(s.capacidad) / mayorCapacidad) * 100);

      html +=
        '<article class="admin-card">' +
        '  <div class="admin-card__head">' +
        '    <span class="admin-card__eyebrow">' +
        Admin.escapeHtml(store.nombreMuseoDeSala(s.id)) +
        "</span>" +
        '    <h2 class="admin-card__title">' +
        Admin.escapeHtml(s.nombre) +
        "</h2>" +
        "  </div>" +
        '  <p class="admin-card__desc">' +
        Admin.escapeHtml(s.descripcion || "Sin descripción registrada.") +
        "</p>" +
        '  <div class="admin-meter">' +
        '    <div class="admin-meter__row"><span>Aforo máximo</span><strong>' +
        Admin.escapeHtml(s.capacidad) +
        " personas</strong></div>" +
        '    <div class="admin-meter__track"><div class="admin-meter__fill admin-meter__fill--gold" style="width: ' +
        ancho +
        '%"></div></div>' +
        "  </div>" +
        '  <div class="admin-card__stats">' +
        '    <div><span>Objetos</span><strong>' +
        objetos +
        "</strong></div>" +
        '    <div><span>En recorridos</span><strong>' +
        recorridos +
        "</strong></div>" +
        "  </div>" +
        '  <div class="admin-card__actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-sala" data-id="' +
        Admin.escapeHtml(s.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-sala" data-id="' +
        Admin.escapeHtml(s.id) +
        '">Eliminar</button>' +
        "  </div>" +
        "</article>";
    }
    html += "</div>";
    return html;
  }

  Admin.registerSection({
    id: "salas",
    code: "03",
    eyebrow: "Módulo 03 · Espacios Expositivos",
    title: "Salas",
    shortDesc: "Administración de salas.",
    description:
      "Salas de exposición asociadas a cada museo, su capacidad máxima de aforo, piezas alojadas y participación en recorridos.",
    icon: "salas",
    dbEntity: "sala_exposicion",
    flyoutLinks: [
      { label: "Ver salas de exposición", action: "open" },
      { label: "Registrar nueva sala", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();
      var museosOpts = '<option value="">Todos los museos</option>';
      for (var i = 0; i < datos.museos.length; i++) {
        var m = datos.museos[i];
        var sel = String(store.filters.salasMuseo) === String(m.id) ? " selected" : "";
        museosOpts +=
          '<option value="' +
          Admin.escapeHtml(m.id) +
          '"' +
          sel +
          ">" +
          Admin.escapeHtml(m.nombre) +
          "</option>";
      }

      return (
        '<section class="admin-view" data-section-view="salas" aria-labelledby="section-heading-salas">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 03 · Espacios Expositivos</span>' +
        '      <h1 id="section-heading-salas" class="admin-section-title">Salas de exposición</h1>' +
        '      <p class="admin-section-desc">Salas de cada museo con su aforo proporcional, objetos en exhibición y presencia en recorridos guiados.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>sala_exposicion (" +
        datos.salas.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar sala por nombre">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-sala" class="admin-search__input" placeholder="Buscar por nombre de la sala..." value="' +
        Admin.escapeHtml(store.filters.salasTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        '      <select id="filtro-sala-museo" class="admin-select" aria-label="Filtrar salas por museo">' +
        museosOpts +
        "</select>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-sala">' +
        Admin.getIcon("plus") +
        "        <span>Nueva sala</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="salas-results">' +
        renderSalasHtml(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-sala");
      var select = root.querySelector("#filtro-sala-museo");
      var results = root.querySelector("#salas-results");
      function refresh() {
        if (results) results.innerHTML = renderSalasHtml(store);
      }
      if (input) {
        input.addEventListener("input", function () {
          store.filters.salasTexto = input.value;
          refresh();
        });
      }
      if (select) {
        select.addEventListener("change", function () {
          store.filters.salasMuseo = select.value;
          refresh();
        });
      }
    }
  });
})(window.MuseosAdmin);
