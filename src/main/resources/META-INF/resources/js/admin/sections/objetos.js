/**
 * ============================================================================
 * SECCIÓN 04: OBJETOS — Catálogo de piezas y estado de conservación
 * Archivo: js/admin/sections/objetos.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function filtrarObjetos(store) {
    var datos = store.getDatos();
    var texto = (store.filters.objetosTexto || "").toLowerCase().trim();
    var categoria = store.filters.objetosCategoria || "";
    var museo = store.filters.objetosMuseo || "";
    var estado = store.filters.objetosEstado || "";

    return datos.objetos.filter(function (o) {
      var artista = store.buscarPorId(datos.artistas, o.artista_id);
      var sala = store.buscarPorId(datos.salas, o.sala_exhibicion_id);
      var nombreArtista = artista ? artista.nombre : "anónimo";

      if (
        texto &&
        o.nombre.toLowerCase().indexOf(texto) === -1 &&
        nombreArtista.toLowerCase().indexOf(texto) === -1
      ) {
        return false;
      }
      if (categoria && String(o.categoria_id) !== String(categoria)) return false;
      if (museo && (!sala || String(sala.museo_id) !== String(museo))) return false;
      if (estado && store.estadoConservacion(o.porcentaje_conservacion).clase !== estado) {
        return false;
      }
      return true;
    });
  }

  function renderObjetosHtml(store) {
    var datos = store.getDatos();
    var lista = filtrarObjetos(store);

    var counterHtml =
      '<p class="admin-results-counter">Mostrando <strong>' +
      lista.length +
      "</strong> de <strong>" +
      datos.objetos.length +
      "</strong> objetos</p>";

    if (lista.length === 0) {
      return (
        counterHtml +
        '<div class="admin-empty-state">' +
        '  <div class="admin-empty-state__medallion">' +
        Admin.getIcon("objetos") +
        "</div>" +
        '  <h3 class="admin-empty-state__title">Ningún objeto coincide con los filtros</h3>' +
        '  <p class="admin-empty-state__text">Limpia los filtros activos o agrega una nueva obra al catálogo.</p>' +
        "</div>"
      );
    }

    var html = counterHtml + '<div class="admin-cards-grid admin-cards-grid--obras">';
    for (var i = 0; i < lista.length; i++) {
      var o = lista[i];
      var categoria = store.buscarPorId(datos.categorias, o.categoria_id);
      var artista = store.buscarPorId(datos.artistas, o.artista_id);
      var estado = store.estadoConservacion(o.porcentaje_conservacion);
      var nombreCategoria = categoria ? categoria.nombre : "Sin categoría";
      var inicial = nombreCategoria.charAt(0).toUpperCase();

      var mediaHtml =
        '<div class="admin-obra-media admin-obra-media--tone-' +
        (Number(o.categoria_id) % 3) +
        '">' +
        '  <span class="admin-obra-initial" aria-hidden="true">' +
        Admin.escapeHtml(inicial) +
        "</span>" +
        (o.url_imagen
          ? '<img src="' +
            Admin.escapeHtml(o.url_imagen) +
            '" alt="' +
            Admin.escapeHtml(o.nombre) +
            '" loading="lazy" onerror="this.remove()">'
          : "") +
        "</div>";

      html +=
        '<article class="admin-card admin-card--obra">' +
        mediaHtml +
        '  <div class="admin-obra-body">' +
        '    <div class="admin-card__head">' +
        '      <span class="admin-card__eyebrow">' +
        Admin.escapeHtml(nombreCategoria) +
        "</span>" +
        '      <h2 class="admin-card__title">' +
        Admin.escapeHtml(o.nombre) +
        "</h2>" +
        '      <p class="admin-obra-author">' +
        Admin.escapeHtml(artista ? artista.nombre : "Anónimo") +
        "</p>" +
        "    </div>" +
        '    <p class="admin-card__desc">' +
        Admin.escapeHtml(o.descripcion || "Sin descripción catalográfica.") +
        "</p>" +
        '    <div class="admin-meter">' +
        '      <div class="admin-meter__row">' +
        '        <span class="admin-status-tag admin-status-tag--' +
        estado.clase +
        '">' +
        Admin.escapeHtml(estado.texto) +
        "</span>" +
        "        <span>Conservación: <strong>" +
        Admin.escapeHtml(o.porcentaje_conservacion) +
        "%</strong></span>" +
        "      </div>" +
        '      <div class="admin-meter__track"><div class="admin-meter__fill admin-meter__fill--' +
        estado.clase +
        '" style="width: ' +
        Admin.escapeHtml(o.porcentaje_conservacion) +
        '%"></div></div>' +
        "    </div>" +
        '    <dl class="admin-spec-grid">' +
        '      <div><dt>Creación</dt><dd>' +
        Admin.escapeHtml(store.formatoFecha(o.fecha_creacion)) +
        "</dd></div>" +
        '      <div><dt>Adquisición</dt><dd>' +
        Admin.escapeHtml(store.formatoFecha(o.fecha_adquisicion)) +
        "</dd></div>" +
        '      <div class="admin-spec-grid__full"><dt>Ubicación actual</dt><dd>' +
        Admin.escapeHtml(
          store.nombreSala(o.sala_exhibicion_id) +
            ", " +
            store.nombreMuseoDeSala(o.sala_exhibicion_id)
        ) +
        "</dd></div>" +
        "    </dl>" +
        '    <div class="admin-card__actions">' +
        '      <button type="button" class="admin-btn-sm" data-crud="edit-objeto" data-id="' +
        Admin.escapeHtml(o.id) +
        '">Editar</button>' +
        '      <button type="button" class="admin-btn-sm" data-crud="ver-historial" data-id="' +
        Admin.escapeHtml(o.id) +
        '">Historial</button>' +
        '      <button type="button" class="admin-btn-sm admin-btn-sm--danger" data-crud="delete-objeto" data-id="' +
        Admin.escapeHtml(o.id) +
        '">Eliminar</button>' +
        "    </div>" +
        "  </div>" +
        "</article>";
    }
    html += "</div>";
    return html;
  }

  Admin.registerSection({
    id: "objetos",
    code: "04",
    eyebrow: "Módulo 04 · Catálogo Patrimonial",
    title: "Objetos",
    shortDesc: "Catálogo de piezas y objetos.",
    description:
      "Catálogo de piezas con estado de conservación, fechas, autoría, ubicación actual en sala y acceso directo a su historial de exhibición.",
    icon: "objetos",
    dbEntity: "obra",
    flyoutLinks: [
      { label: "Ver catálogo de piezas", action: "open" },
      { label: "Registrar nuevo objeto", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      var catOpts = '<option value="">Todas las categorías</option>';
      for (var c = 0; c < datos.categorias.length; c++) {
        var cat = datos.categorias[c];
        var selC = String(store.filters.objetosCategoria) === String(cat.id) ? " selected" : "";
        catOpts +=
          '<option value="' +
          Admin.escapeHtml(cat.id) +
          '"' +
          selC +
          ">" +
          Admin.escapeHtml(cat.nombre) +
          "</option>";
      }

      var musOpts = '<option value="">Todos los museos</option>';
      for (var m = 0; m < datos.museos.length; m++) {
        var mus = datos.museos[m];
        var selM = String(store.filters.objetosMuseo) === String(mus.id) ? " selected" : "";
        musOpts +=
          '<option value="' +
          Admin.escapeHtml(mus.id) +
          '"' +
          selM +
          ">" +
          Admin.escapeHtml(mus.nombre) +
          "</option>";
      }

      var est = store.filters.objetosEstado || "";

      return (
        '<section class="admin-view" data-section-view="objetos" aria-labelledby="section-heading-objetos">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 04 · Catálogo Patrimonial</span>' +
        '      <h1 id="section-heading-objetos" class="admin-section-title">Objetos</h1>' +
        '      <p class="admin-section-desc">Catálogo de piezas con su estado de conservación, fechas de creación y adquisición, y ubicación actual en sala.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>obra (" +
        datos.objetos.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <label class="admin-search" aria-label="Buscar objeto por nombre o artista">' +
        '        <span class="admin-search__icon">' +
        Admin.getIcon("search") +
        "</span>" +
        '        <input type="search" id="buscar-objeto" class="admin-search__input" placeholder="Buscar por nombre o artista..." value="' +
        Admin.escapeHtml(store.filters.objetosTexto) +
        '" autocomplete="off">' +
        '        <span class="admin-search__kbd" aria-hidden="true">/</span>' +
        "      </label>" +
        '      <select id="filtro-categoria" class="admin-select" aria-label="Filtrar por categoría">' +
        catOpts +
        "</select>" +
        '      <select id="filtro-museo" class="admin-select" aria-label="Filtrar por museo">' +
        musOpts +
        "</select>" +
        '      <select id="filtro-estado" class="admin-select" aria-label="Filtrar por conservación">' +
        '        <option value=""' +
        (est === "" ? " selected" : "") +
        ">Conservación: Todas</option>" +
        '        <option value="bueno"' +
        (est === "bueno" ? " selected" : "") +
        ">Buen estado (80%+)</option>" +
        '        <option value="regular"' +
        (est === "regular" ? " selected" : "") +
        ">Regular (60%–79%)</option>" +
        '        <option value="riesgo"' +
        (est === "riesgo" ? " selected" : "") +
        ">En riesgo (&lt;60%)</option>" +
        "      </select>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-objeto">' +
        Admin.getIcon("plus") +
        "        <span>Nuevo objeto</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="objetos-results">' +
        renderObjetosHtml(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var input = root.querySelector("#buscar-objeto");
      var selCat = root.querySelector("#filtro-categoria");
      var selMus = root.querySelector("#filtro-museo");
      var selEst = root.querySelector("#filtro-estado");
      var results = root.querySelector("#objetos-results");

      function refresh() {
        if (results) results.innerHTML = renderObjetosHtml(store);
      }
      if (input) {
        input.addEventListener("input", function () {
          store.filters.objetosTexto = input.value;
          refresh();
        });
      }
      if (selCat) {
        selCat.addEventListener("change", function () {
          store.filters.objetosCategoria = selCat.value;
          refresh();
        });
      }
      if (selMus) {
        selMus.addEventListener("change", function () {
          store.filters.objetosMuseo = selMus.value;
          refresh();
        });
      }
      if (selEst) {
        selEst.addEventListener("change", function () {
          store.filters.objetosEstado = selEst.value;
          refresh();
        });
      }
    }
  });
})(window.MuseosAdmin);
