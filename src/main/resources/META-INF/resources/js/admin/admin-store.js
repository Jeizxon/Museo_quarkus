/**
 * ============================================================================
 * ADAPTADOR QUARKUS + MYSQL (XAMPP) Y ESTADO GLOBAL DEL PANEL
 * Archivo: js/admin/admin-store.js
 * Propósito: Conecta window.MuseosAdmin con el backend Quarkus (/api/datos ->
 *            MySQL sistema_museos en XAMPP) con respaldo automático en
 *            localStorage y helpers compartidos para las 8 secciones.
 * ============================================================================
 */

(function (global) {
  "use strict";

  var Admin = global.MuseosAdmin;
  var STORAGE_KEY = "museos";

  var API_URL =
    global.location &&
    global.location.protocol.indexOf("http") === 0 &&
    global.location.port === "8080"
      ? "/api/datos"
      : "http://localhost:8080/api/datos";

  var listeners = [];
  var connectionListeners = [];
  var connectionState = "connecting"; // 'connecting' | 'connected' | 'offline'

  function copiarDatosIniciales() {
    return JSON.parse(JSON.stringify(global.DATOS_INICIALES));
  }

  function leerLocal() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.museos)) {
          return parsed;
        }
      }
    } catch (e) {
      /* Ignorar error de lectura localStorage */
    }
    return copiarDatosIniciales();
  }

  var state = {
    datos: leerLocal(),
    filters: {
      museosTexto: "",
      salasMuseo: "",
      salasTexto: "",
      objetosTexto: "",
      objetosCategoria: "",
      objetosMuseo: "",
      objetosEstado: "",
      categoriasTexto: "",
      artistasTexto: "",
      historialObjeto: "",
      recorridosTexto: ""
    }
  };

  function setConnectionState(nextState) {
    connectionState = nextState;
    for (var i = 0; i < connectionListeners.length; i++) {
      connectionListeners[i](nextState);
    }
  }

  function notifyChange() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](state.datos);
    }
  }

  function persistirLocal() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.datos));
    } catch (e) {
      /* Ignorar cuota o bloqueo */
    }
  }

  function guardar(mensajeExito) {
    persistirLocal();
    notifyChange();

    return fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.datos)
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (remoto) {
        var mysqlActivo = Boolean(remoto && remoto.mysql_conectado);
        setConnectionState(mysqlActivo ? "connected" : "memory");
        if (remoto && Array.isArray(remoto.museos)) {
          state.datos = remoto;
          persistirLocal();
          notifyChange();
        }
        if (mensajeExito && Admin && Admin.showToast) {
          if (mysqlActivo) {
            Admin.showToast(mensajeExito, "Sincronizado con Quarkus y MySQL (XAMPP).");
          } else {
            Admin.showToast(
              mensajeExito + " (memoria Quarkus)",
              "Quarkus recibió los cambios, pero MySQL en XAMPP está apagado. Enciéndelo para persistir en phpMyAdmin."
            );
          }
        }
        return true;
      })
      .catch(function () {
        setConnectionState("offline");
        if (mensajeExito && Admin && Admin.showToast) {
          Admin.showToast(
            mensajeExito + " (respaldo local)",
            "No se pudo conectar con Quarkus en localhost:8080; se guardó en localStorage."
          );
        }
        return false;
      });
  }

  function cargarDesdeBackend(silent) {
    setConnectionState("connecting");
    return fetch(API_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (remoto) {
        var mysqlActivo = Boolean(remoto && remoto.mysql_conectado);
        setConnectionState(mysqlActivo ? "connected" : "memory");
        if (remoto && Array.isArray(remoto.museos)) {
          state.datos = remoto;
          persistirLocal();
          notifyChange();
        }
        if (!silent && Admin && Admin.showToast) {
          if (mysqlActivo) {
            Admin.showToast(
              "Conexión activa con MySQL (XAMPP)",
              "Datos sincronizados desde Quarkus (" + API_URL + ")."
            );
          } else {
            Admin.showToast(
              "Quarkus activo · MySQL apagado",
              "Enciende el módulo MySQL en XAMPP para persistir y ver los cambios en phpMyAdmin."
            );
          }
        }
        return true;
      })
      .catch(function () {
        setConnectionState("offline");
        if (!silent && Admin && Admin.showToast) {
          Admin.showToast(
            "Backend Quarkus desconectado",
            "Mostrando respaldo local. Ejecuta iniciar.bat para sincronizar con XAMPP/MySQL."
          );
        }
        return false;
      });
  }

  function restaurarDatos() {
    if (
      !global.confirm(
        "Se van a borrar los cambios actuales y se cargarán de nuevo los datos de ejemplo en el panel y MySQL. ¿Continuar?"
      )
    ) {
      return;
    }
    state.datos = copiarDatosIniciales();
    state.filters.historialObjeto = "";
    guardar("Datos de ejemplo restaurados");
  }

  /* ---------------- Utilidades de negocio (fieles a app.js) ---------------- */

  function siguienteId(lista) {
    var mayor = 0;
    for (var i = 0; i < lista.length; i++) {
      if (Number(lista[i].id) > mayor) {
        mayor = Number(lista[i].id);
      }
    }
    return mayor + 1;
  }

  function buscarPorId(lista, id) {
    for (var i = 0; i < lista.length; i++) {
      if (String(lista[i].id) === String(id)) {
        return lista[i];
      }
    }
    return null;
  }

  function formatoFecha(fecha) {
    if (!fecha) return "Sin dato";
    var partes = String(fecha).substring(0, 10).split("-");
    if (partes.length < 3) return String(fecha);
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function formatoFechaHora(fecha) {
    if (!fecha) return "";
    return formatoFecha(fecha) + " " + String(fecha).substring(11, 16);
  }

  function ahora() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    var hora = String(d.getHours()).padStart(2, "0");
    var min = String(d.getMinutes()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia + "T" + hora + ":" + min;
  }

  function estadoConservacion(porcentaje) {
    var pct = Number(porcentaje);
    if (pct >= 80) return { clase: "bueno", texto: "Buen estado" };
    if (pct >= 60) return { clase: "regular", texto: "Regular" };
    return { clase: "riesgo", texto: "En riesgo" };
  }

  function nombreSala(idSala) {
    var sala = buscarPorId(state.datos.salas, idSala);
    return sala ? sala.nombre : "Sala eliminada";
  }

  function nombreMuseoDeSala(idSala) {
    var sala = buscarPorId(state.datos.salas, idSala);
    if (!sala) return "";
    var museo = buscarPorId(state.datos.museos, sala.museo_id);
    return museo ? museo.nombre : "";
  }

  function salaEnUso(ids) {
    var idSet = ids.map(String);
    return (
      state.datos.objetos.some(function (o) {
        return idSet.indexOf(String(o.sala_exhibicion_id)) !== -1;
      }) ||
      state.datos.historial.some(function (h) {
        return idSet.indexOf(String(h.sala_exhibicion_id)) !== -1;
      }) ||
      state.datos.recorrido_sala.some(function (r) {
        return idSet.indexOf(String(r.sala_exhibicion_id)) !== -1;
      })
    );
  }

  function salasDelRecorrido(idRecorrido) {
    return state.datos.recorrido_sala
      .filter(function (r) {
        return String(r.recorrido_id) === String(idRecorrido);
      })
      .slice()
      .sort(function (a, b) {
        return a.numero_orden - b.numero_orden;
      })
      .map(function (r) {
        return r.sala_exhibicion_id;
      });
  }

  function moverObjeto(idObjeto, idSala, fecha) {
    var objeto = buscarPorId(state.datos.objetos, idObjeto);
    if (!objeto) return;
    var actual = null;
    for (var i = 0; i < state.datos.historial.length; i++) {
      var h = state.datos.historial[i];
      if (String(h.objeto_id) === String(idObjeto) && !h.fecha_fin) {
        actual = h;
        break;
      }
    }

    if (actual && actual.fecha_inicio >= fecha) {
      actual.sala_exhibicion_id = Number(idSala);
    } else {
      if (actual) {
        actual.fecha_fin = fecha;
      }
      state.datos.historial.push({
        id: siguienteId(state.datos.historial),
        objeto_id: Number(idObjeto),
        sala_exhibicion_id: Number(idSala),
        fecha_inicio: fecha,
        fecha_fin: null
      });
    }
    objeto.sala_exhibicion_id = Number(idSala);
  }

  function buildSalasOptgroupsHtml() {
    var html = "";
    var museos = state.datos.museos;
    for (var i = 0; i < museos.length; i++) {
      var m = museos[i];
      html += '<optgroup label="' + Admin.escapeHtml(m.nombre) + '">';
      var salas = state.datos.salas.filter(function (s) {
        return String(s.museo_id) === String(m.id);
      });
      for (var j = 0; j < salas.length; j++) {
        html +=
          '<option value="' +
          Admin.escapeHtml(salas[j].id) +
          '">' +
          Admin.escapeHtml(salas[j].nombre) +
          "</option>";
      }
      html += "</optgroup>";
    }
    return html;
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function onConnectionChange(fn) {
    connectionListeners.push(fn);
    fn(connectionState);
  }

  var store = {
    API_URL: API_URL,
    getDatos: function () {
      return state.datos;
    },
    filters: state.filters,
    getConnectionState: function () {
      return connectionState;
    },
    guardar: guardar,
    cargarDesdeBackend: cargarDesdeBackend,
    restaurarDatos: restaurarDatos,
    subscribe: subscribe,
    onConnectionChange: onConnectionChange,
    siguienteId: siguienteId,
    buscarPorId: buscarPorId,
    formatoFecha: formatoFecha,
    formatoFechaHora: formatoFechaHora,
    ahora: ahora,
    estadoConservacion: estadoConservacion,
    nombreSala: nombreSala,
    nombreMuseoDeSala: nombreMuseoDeSala,
    salaEnUso: salaEnUso,
    salasDelRecorrido: salasDelRecorrido,
    moverObjeto: moverObjeto,
    buildSalasOptgroupsHtml: buildSalasOptgroupsHtml
  };

  Admin.store = store;
  Admin.dataAdapter = {
    type: "quarkus-mysql-rest",
    endpoint: API_URL,
    load: cargarDesdeBackend,
    save: guardar,
    restoreDefaults: restaurarDatos
  };
})(window);
