/**
 * ============================================================================
 * SECCIÓN 07: HISTORIAL — Trazabilidad de exhibición y traslados entre salas
 * Archivo: js/admin/sections/historial.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderHistorialContent(store) {
    var datos = store.getDatos();
    var idObjeto = store.filters.historialObjeto || "";
    var lista = datos.historial.slice();

    if (idObjeto) {
      lista = lista.filter(function (h) {
        return String(h.objeto_id) === String(idObjeto);
      });
    }

    lista.sort(function (a, b) {
      var objA = store.buscarPorId(datos.objetos, a.objeto_id);
      var objB = store.buscarPorId(datos.objetos, b.objeto_id);
      var nameA = objA ? objA.nombre : "";
      var nameB = objB ? objB.nombre : "";
      if (String(a.objeto_id) !== String(b.objeto_id)) {
        return nameA.localeCompare(nameB);
      }
      return String(a.fecha_inicio).localeCompare(String(b.fecha_inicio));
    });

    // Línea de tiempo cuando hay un objeto seleccionado
    var timelineHtml = "";
    if (idObjeto && lista.length > 0) {
      var objSel = store.buscarPorId(datos.objetos, idObjeto);
      timelineHtml +=
        '<div class="admin-panel admin-timeline-panel">' +
        '  <div class="admin-panel__head">' +
        '    <h2 class="admin-panel__title">Línea de tiempo: ' +
        Admin.escapeHtml(objSel ? objSel.nombre : "Objeto") +
        "</h2>" +
        '    <span class="admin-badge">' +
        lista.length +
        " estancia" +
        (lista.length === 1 ? "" : "s") +
        "</span>" +
        "  </div>" +
        '  <ol class="admin-timeline">';
      for (var t = 0; t < lista.length; t++) {
        var ht = lista[t];
        var isActual = !ht.fecha_fin;
        timelineHtml +=
          '<li class="admin-timeline__item' +
          (isActual ? " is-current" : "") +
          '">' +
          '  <span class="admin-timeline__dot" aria-hidden="true"></span>' +
          '  <div class="admin-timeline__content">' +
          "    <strong>" +
          Admin.escapeHtml(store.nombreSala(ht.sala_exhibicion_id)) +
          "</strong>" +
          "    <span>" +
          Admin.escapeHtml(store.nombreMuseoDeSala(ht.sala_exhibicion_id)) +
          " · del " +
          Admin.escapeHtml(store.formatoFecha(ht.fecha_inicio)) +
          " al " +
          (ht.fecha_fin
            ? Admin.escapeHtml(store.formatoFecha(ht.fecha_fin))
            : "<strong>hoy (ubicación actual)</strong>") +
          "</span>" +
          "  </div>" +
          "</li>";
      }
      timelineHtml += "</ol></div>";
    }

    var rowsHtml = "";
    if (lista.length === 0) {
      rowsHtml =
        '<tr><td colspan="6" class="admin-table-empty">No hay registros de exhibición para este filtro.</td></tr>';
    } else {
      for (var i = 0; i < lista.length; i++) {
        var h = lista[i];
        var objeto = store.buscarPorId(datos.objetos, h.objeto_id);
        var finDate = h.fecha_fin ? new Date(h.fecha_fin) : new Date();
        var iniDate = new Date(h.fecha_inicio);
        var dias = Math.max(0, Math.floor((finDate - iniDate) / (1000 * 60 * 60 * 24)));

        rowsHtml +=
          "<tr>" +
          '  <td><strong class="admin-table-primary">' +
          Admin.escapeHtml(objeto ? objeto.nombre : "Objeto eliminado") +
          "</strong></td>" +
          "  <td>" +
          Admin.escapeHtml(store.nombreSala(h.sala_exhibicion_id)) +
          "</td>" +
          "  <td>" +
          Admin.escapeHtml(store.nombreMuseoDeSala(h.sala_exhibicion_id)) +
          "</td>" +
          '  <td class="mono-code">' +
          Admin.escapeHtml(store.formatoFechaHora(h.fecha_inicio)) +
          "</td>" +
          "  <td>" +
          (h.fecha_fin
            ? '<span class="mono-code">' +
              Admin.escapeHtml(store.formatoFechaHora(h.fecha_fin)) +
              "</span>"
            : '<span class="admin-status-tag admin-status-tag--bueno">Actual</span>') +
          "</td>" +
          '  <td class="mono-code">' +
          dias +
          "</td>" +
          "</tr>";
      }
    }

    return (
      timelineHtml +
      '<div class="admin-panel">' +
      '  <div class="admin-panel__head">' +
      '    <h2 class="admin-panel__title">Registro histórico de exhibición</h2>' +
      '    <span class="admin-badge">' +
      lista.length +
      " movimiento" +
      (lista.length === 1 ? "" : "s") +
      "</span>" +
      "  </div>" +
      '  <div class="admin-table-wrap">' +
      '    <table class="admin-table">' +
      "      <thead>" +
      "        <tr>" +
      "          <th>Objeto</th>" +
      "          <th>Sala</th>" +
      "          <th>Museo</th>" +
      "          <th>Inicio</th>" +
      "          <th>Fin</th>" +
      "          <th>Días</th>" +
      "        </tr>" +
      "      </thead>" +
      "      <tbody>" +
      rowsHtml +
      "</tbody>" +
      "    </table>" +
      "  </div>" +
      "</div>"
    );
  }

  Admin.registerSection({
    id: "historial",
    code: "07",
    eyebrow: "Módulo 07 · Trazabilidad de Salas",
    title: "Historial",
    shortDesc: "Registro de actividad y cambios.",
    description:
      "Salas en las que ha estado exhibido cada objeto, fechas de entrada y salida, días de permanencia y gestión de traslados.",
    icon: "historial",
    dbEntity: "historial_exhibicion",
    flyoutLinks: [
      { label: "Ver historial completo", action: "open" },
      { label: "Trasladar objeto de sala", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      var objOpts = '<option value="">Todos los objetos</option>';
      for (var i = 0; i < datos.objetos.length; i++) {
        var o = datos.objetos[i];
        var sel = String(store.filters.historialObjeto) === String(o.id) ? " selected" : "";
        objOpts +=
          '<option value="' +
          Admin.escapeHtml(o.id) +
          '"' +
          sel +
          ">" +
          Admin.escapeHtml(o.nombre) +
          "</option>";
      }

      return (
        '<section class="admin-view" data-section-view="historial" aria-labelledby="section-heading-historial">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 07 · Trazabilidad de Salas</span>' +
        '      <h1 id="section-heading-historial" class="admin-section-title">Historial de exhibición</h1>' +
        '      <p class="admin-section-desc">Salas en las que ha estado cada objeto y en qué fechas. Selecciona una pieza para visualizar su línea de tiempo.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Tabla MySQL</span>" +
        "      <strong>historial_exhibicion (" +
        datos.historial.length +
        ")</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <select id="filtro-historial" class="admin-select admin-select--wide" aria-label="Filtrar historial por objeto">' +
        objOpts +
        "</select>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-traslado">' +
        Admin.getIcon("historial") +
        "        <span>Trasladar objeto</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div id="historial-results">' +
        renderHistorialContent(store) +
        "</div>" +
        "</section>"
      );
    },
    mount: function (root) {
      var store = Admin.store;
      var select = root.querySelector("#filtro-historial");
      var results = root.querySelector("#historial-results");
      if (select && results) {
        select.addEventListener("change", function () {
          store.filters.historialObjeto = select.value;
          results.innerHTML = renderHistorialContent(store);
        });
      }
    }
  });
})(window.MuseosAdmin);
