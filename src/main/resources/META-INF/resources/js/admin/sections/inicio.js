/**
 * ============================================================================
 * SECCIÓN 01: INICIO — Vista general de la colección y alertas de conservación
 * Archivo: js/admin/sections/inicio.js
 * ============================================================================
 */

(function (Admin) {
  "use strict";

  function renderListaRiesgo(store) {
    var datos = store.getDatos();
    var enRiesgo = datos.objetos.filter(function (o) {
      return Number(o.porcentaje_conservacion) < 60;
    });

    if (enRiesgo.length === 0) {
      return (
        '<div class="admin-empty-compact">' +
        "  <p>No hay objetos en estado crítico (&lt; 60% de conservación). Toda la colección se mantiene en niveles estables.</p>" +
        "</div>"
      );
    }

    var html = '<ul class="admin-risk-list">';
    for (var i = 0; i < enRiesgo.length; i++) {
      var o = enRiesgo[i];
      var sala = store.nombreSala(o.sala_exhibicion_id);
      var museo = store.nombreMuseoDeSala(o.sala_exhibicion_id);
      html +=
        '<li class="admin-risk-item">' +
        '  <div class="admin-risk-item__info">' +
        '    <div class="admin-risk-item__top">' +
        "      <strong>" +
        Admin.escapeHtml(o.nombre) +
        "</strong>" +
        '      <span class="admin-status-tag admin-status-tag--riesgo">' +
        Admin.escapeHtml(o.porcentaje_conservacion) +
        "% · En riesgo</span>" +
        "    </div>" +
        '    <span class="admin-risk-item__loc">' +
        Admin.escapeHtml(sala + (museo ? " — " + museo : "")) +
        "</span>" +
        "  </div>" +
        '  <div class="admin-risk-item__actions">' +
        '    <button type="button" class="admin-btn-sm" data-crud="edit-objeto" data-id="' +
        Admin.escapeHtml(o.id) +
        '">Editar</button>' +
        '    <button type="button" class="admin-btn-sm" data-crud="ver-historial" data-id="' +
        Admin.escapeHtml(o.id) +
        '">Historial</button>' +
        "  </div>" +
        "</li>";
    }
    html += "</ul>";
    return html;
  }

  Admin.registerSection({
    id: "inicio",
    code: "01",
    eyebrow: "Módulo 01 · Resumen Ejecutivo",
    title: "Inicio",
    shortDesc: "Vista general del panel.",
    description:
      "Resumen general de la colección, métricas en tiempo real sincronizadas con Quarkus y MySQL (XAMPP), y alertas de objetos que requieren restauración.",
    icon: "inicio",
    dbEntity: "sistema_museos",
    flyoutLinks: [
      { label: "Resumen e indicadores", action: "open" },
      { label: "Objetos en riesgo (<60%)", action: "open" },
      { label: "Registrar nuevo objeto", action: "create" }
    ],
    render: function () {
      var store = Admin.store;
      var datos = store.getDatos();

      var suma = 0;
      for (var i = 0; i < datos.objetos.length; i++) {
        suma += Number(datos.objetos[i].porcentaje_conservacion) || 0;
      }
      var promedio = datos.objetos.length > 0 ? Math.round(suma / datos.objetos.length) : 0;

      var hoy = store.ahora();
      var activos = datos.recorridos.filter(function (r) {
        return r.fecha_inicio <= hoy && r.fecha_fin >= hoy;
      }).length;

      var kpis = [
        {
          target: "museos",
          icon: "museos",
          entity: "museo",
          value: String(datos.museos.length),
          label: "Museos",
          hint: "Sedes registradas en MySQL"
        },
        {
          target: "salas",
          icon: "salas",
          entity: "sala_exposicion",
          value: String(datos.salas.length),
          label: "Salas",
          hint: "Espacios expositivos activos"
        },
        {
          target: "objetos",
          icon: "objetos",
          entity: "obra",
          value: String(datos.objetos.length),
          label: "Objetos",
          hint: "Piezas catalogadas en colección"
        },
        {
          target: "artistas",
          icon: "artistas",
          entity: "artista",
          value: String(datos.artistas.length),
          label: "Artistas",
          hint: "Autores registrados"
        },
        {
          target: "objetos",
          icon: "categorias",
          entity: "conservación",
          value: promedio + "%",
          label: "Conservación promedio",
          hint: "Promedio global de las obras"
        },
        {
          target: "recorridos",
          icon: "recorridos",
          entity: "recorrido_guiado",
          value: String(activos),
          label: "Recorridos activos",
          hint: "De " + datos.recorridos.length + " recorridos totales"
        }
      ];

      var kpiHtml = "";
      for (var k = 0; k < kpis.length; k++) {
        var item = kpis[k];
        kpiHtml +=
          '<button type="button" class="admin-kpi-card" data-nav-target="' +
          Admin.escapeHtml(item.target) +
          '">' +
          '  <div class="admin-kpi-card__top">' +
          '    <span class="admin-kpi-card__icon">' +
          Admin.getIcon(item.icon) +
          "</span>" +
          '    <span class="admin-kpi-card__entity">' +
          Admin.escapeHtml(item.entity) +
          "</span>" +
          "  </div>" +
          '  <span class="admin-kpi-card__value">' +
          Admin.escapeHtml(item.value) +
          "</span>" +
          '  <span class="admin-kpi-card__label">' +
          Admin.escapeHtml(item.label) +
          "</span>" +
          '  <span class="admin-kpi-card__hint">' +
          Admin.escapeHtml(item.hint) +
          "</span>" +
          "</button>";
      }

      var allSections = Admin.getSections();
      var ledgerHtml = "";
      for (var s = 0; s < allSections.length; s++) {
        var sec = allSections[s];
        ledgerHtml +=
          '<li class="admin-module-ledger__item">' +
          '  <div class="admin-module-ledger__name">' +
          "    <strong>" +
          Admin.escapeHtml(sec.code + " · " + sec.title) +
          "</strong>" +
          "    <span>Tabla: " +
          Admin.escapeHtml(sec.dbEntity) +
          "</span>" +
          "  </div>" +
          '  <button type="button" class="admin-module-ledger__go" data-nav-target="' +
          Admin.escapeHtml(sec.id) +
          '">Abrir</button>' +
          "</li>";
      }

      return (
        '<section class="admin-view" data-section-view="inicio" aria-labelledby="section-heading-inicio">' +
        '  <header class="admin-section-header">' +
        '    <div class="admin-section-header__copy">' +
        '      <span class="admin-eyebrow">Módulo 01 · Resumen Ejecutivo</span>' +
        '      <h1 id="section-heading-inicio" class="admin-section-title">Inicio</h1>' +
        '      <p class="admin-section-desc">Resumen general de la colección conectado al backend Quarkus y la base de datos MySQL (XAMPP). Supervisa indicadores, piezas en riesgo y accede rápidamente a cada módulo.</p>' +
        "    </div>" +
        '    <div class="admin-entity-stamp">' +
        "      <span>Base de datos MySQL</span>" +
        "      <strong>sistema_museos</strong>" +
        "    </div>" +
        "  </header>" +
        '  <div class="admin-toolbar">' +
        '    <div class="admin-toolbar__search-group">' +
        '      <div class="admin-toolbar__filters">' +
        '        <a class="admin-btn admin-btn--ghost" href="http://localhost:8080/swagger-ui" target="_blank" rel="noopener">Swagger UI (API)</a>' +
        '        <a class="admin-btn admin-btn--ghost" href="http://localhost/phpmyadmin" target="_blank" rel="noopener">phpMyAdmin (XAMPP)</a>' +
        '        <button type="button" class="admin-btn admin-btn--ghost" data-crud="sync-backend">Sincronizar MySQL</button>' +
        "      </div>" +
        "    </div>" +
        '    <div class="admin-toolbar__actions">' +
        '      <button type="button" class="admin-btn admin-btn--primary" data-crud="new-objeto">' +
        Admin.getIcon("plus") +
        "        <span>Nuevo objeto</span>" +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        '  <div class="admin-kpi-grid" aria-label="Resumen de métricas del museo">' +
        kpiHtml +
        "  </div>" +
        '  <div class="admin-overview-split">' +
        '    <div class="admin-panel">' +
        '      <div class="admin-panel__head">' +
        '        <div>' +
        '          <h2 class="admin-panel__title">Objetos que necesitan restauración</h2>' +
        '          <p class="admin-panel__sub">Piezas con porcentaje de conservación inferior al 60%.</p>' +
        "        </div>" +
        '        <span class="admin-badge admin-badge--almagre">Prioridad crítica</span>' +
        "      </div>" +
        '      <div class="admin-panel__body">' +
        renderListaRiesgo(store) +
        "      </div>" +
        '      <div class="admin-panel__foot">' +
        "        <span>Criterio técnico: &lt; 60% requiere retiro a restauración</span>" +
        '        <button type="button" class="admin-link-inline" data-nav-target="objetos">Ver catálogo completo &rarr;</button>' +
        "      </div>" +
        "    </div>" +
        '    <aside class="admin-panel" aria-label="Mapa de módulos administrativos">' +
        '      <div class="admin-panel__head">' +
        '        <h2 class="admin-panel__title">Módulos del sistema</h2>' +
        '        <span class="admin-badge">8 vistas</span>' +
        "      </div>" +
        '      <ul class="admin-module-ledger">' +
        ledgerHtml +
        "      </ul>" +
        "    </aside>" +
        "  </div>" +
        "</section>"
      );
    }
  });
})(window.MuseosAdmin);
