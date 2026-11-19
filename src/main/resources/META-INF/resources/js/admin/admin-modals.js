/**
 * ============================================================================
 * MODALES CRUD Y VALIDACIONES — PANEL DE ADMINISTRACIÓN DE MUSEOS
 * Archivo: js/admin/admin-modals.js
 * Propósito: Controla los 7 <dialog> del panel (Museo, Sala, Objeto, Categoría,
 *            Artista, Traslado y Recorrido) y las acciones de eliminación con
 *            las mismas reglas de integridad referencial que MySQL/Quarkus.
 * ============================================================================
 */

(function (global) {
  "use strict";

  var Admin = global.MuseosAdmin;
  var idEditando = null;
  var salasRecorrido = [];

  function byId(id) {
    return document.getElementById(id);
  }

  function llenarSelectsModales() {
    var store = Admin.store;
    var datos = store.getDatos();

    var museosHtml = "";
    for (var m = 0; m < datos.museos.length; m++) {
      museosHtml +=
        '<option value="' +
        Admin.escapeHtml(datos.museos[m].id) +
        '">' +
        Admin.escapeHtml(datos.museos[m].nombre) +
        "</option>";
    }

    var categoriasHtml = "";
    for (var c = 0; c < datos.categorias.length; c++) {
      categoriasHtml +=
        '<option value="' +
        Admin.escapeHtml(datos.categorias[c].id) +
        '">' +
        Admin.escapeHtml(datos.categorias[c].nombre) +
        "</option>";
    }

    var artistasHtml = "";
    for (var a = 0; a < datos.artistas.length; a++) {
      artistasHtml +=
        '<option value="' +
        Admin.escapeHtml(datos.artistas[a].id) +
        '">' +
        Admin.escapeHtml(datos.artistas[a].nombre) +
        "</option>";
    }

    var objetosHtml = "";
    for (var o = 0; o < datos.objetos.length; o++) {
      objetosHtml +=
        '<option value="' +
        Admin.escapeHtml(datos.objetos[o].id) +
        '">' +
        Admin.escapeHtml(datos.objetos[o].nombre) +
        "</option>";
    }

    var salasHtml = store.buildSalasOptgroupsHtml();

    if (byId("sala-museo")) {
      byId("sala-museo").innerHTML = '<option value="">Seleccione un museo...</option>' + museosHtml;
    }
    if (byId("objeto-categoria")) {
      byId("objeto-categoria").innerHTML =
        '<option value="">Seleccione una categoría...</option>' + categoriasHtml;
    }
    if (byId("objeto-artista")) {
      byId("objeto-artista").innerHTML =
        '<option value="">Anónimo / desconocido</option>' + artistasHtml;
    }
    if (byId("objeto-sala")) {
      byId("objeto-sala").innerHTML = '<option value="">Seleccione una sala...</option>' + salasHtml;
    }
    if (byId("traslado-objeto")) {
      byId("traslado-objeto").innerHTML = objetosHtml;
    }
    if (byId("traslado-sala")) {
      byId("traslado-sala").innerHTML = salasHtml;
    }
    if (byId("recorrido-sala")) {
      byId("recorrido-sala").innerHTML = salasHtml;
    }
  }

  function abrirModal(idModal) {
    var dlg = byId(idModal);
    if (dlg && dlg.showModal) {
      dlg.showModal();
    }
  }

  function cerrarModal(idModal) {
    var dlg = byId(idModal);
    if (dlg && dlg.open) {
      dlg.close();
    }
  }

  /* ---------------- MUSEOS ---------------- */

  function openNuevoMuseo() {
    idEditando = null;
    byId("form-museo").reset();
    byId("titulo-museo").textContent = "Nuevo museo";
    abrirModal("modal-museo");
  }

  function openEditarMuseo(id) {
    var m = Admin.store.buscarPorId(Admin.store.getDatos().museos, id);
    if (!m) return;
    idEditando = m.id;
    byId("titulo-museo").textContent = "Editar museo";
    byId("museo-nombre").value = m.nombre || "";
    byId("museo-descripcion").value = m.descripcion || "";
    byId("museo-latitud").value = m.latitud != null ? m.latitud : "";
    byId("museo-longitud").value = m.longitud != null ? m.longitud : "";
    byId("museo-url").value = m.url_pagina || "";
    abrirModal("modal-museo");
  }

  function eliminarMuseo(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var museo = store.buscarPorId(datos.museos, id);
    if (!museo) return;
    var idsSalas = datos.salas
      .filter(function (s) {
        return String(s.museo_id) === String(id);
      })
      .map(function (s) {
        return s.id;
      });

    if (store.salaEnUso(idsSalas)) {
      global.alert(
        "No se puede eliminar el museo porque sus salas tienen objetos, historial o recorridos."
      );
      return;
    }
    if (
      !global.confirm(
        '¿Eliminar el museo "' + museo.nombre + '"? También se eliminarán sus salas.'
      )
    ) {
      return;
    }

    datos.salas = datos.salas.filter(function (s) {
      return String(s.museo_id) !== String(id);
    });
    datos.museos = datos.museos.filter(function (m) {
      return String(m.id) !== String(id);
    });
    store.guardar("Museo eliminado");
  }

  /* ---------------- SALAS ---------------- */

  function openNuevaSala() {
    var datos = Admin.store.getDatos();
    if (datos.museos.length === 0) {
      global.alert("Primero debes registrar al menos un museo.");
      return;
    }
    llenarSelectsModales();
    idEditando = null;
    byId("form-sala").reset();
    byId("titulo-sala").textContent = "Nueva sala";
    abrirModal("modal-sala");
  }

  function openEditarSala(id) {
    var s = Admin.store.buscarPorId(Admin.store.getDatos().salas, id);
    if (!s) return;
    llenarSelectsModales();
    idEditando = s.id;
    byId("titulo-sala").textContent = "Editar sala";
    byId("sala-museo").value = String(s.museo_id);
    byId("sala-nombre").value = s.nombre || "";
    byId("sala-descripcion").value = s.descripcion || "";
    byId("sala-capacidad").value = s.capacidad;
    abrirModal("modal-sala");
  }

  function eliminarSala(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var sala = store.buscarPorId(datos.salas, id);
    if (!sala) return;
    if (store.salaEnUso([id])) {
      global.alert(
        "No se puede eliminar la sala porque tiene objetos, historial o está en un recorrido."
      );
      return;
    }
    if (!global.confirm('¿Eliminar la sala "' + sala.nombre + '"?')) return;

    datos.salas = datos.salas.filter(function (s) {
      return String(s.id) !== String(id);
    });
    store.guardar("Sala eliminada");
  }

  /* ---------------- OBJETOS ---------------- */

  function openNuevoObjeto() {
    var datos = Admin.store.getDatos();
    if (datos.categorias.length === 0 || datos.salas.length === 0) {
      global.alert("Para registrar un objeto necesitas al menos una categoría y una sala.");
      return;
    }
    llenarSelectsModales();
    idEditando = null;
    byId("form-objeto").reset();
    byId("titulo-objeto").textContent = "Nuevo objeto";
    abrirModal("modal-objeto");
  }

  function openEditarObjeto(id) {
    var o = Admin.store.buscarPorId(Admin.store.getDatos().objetos, id);
    if (!o) return;
    llenarSelectsModales();
    idEditando = o.id;
    byId("titulo-objeto").textContent = "Editar objeto";
    byId("objeto-nombre").value = o.nombre || "";
    byId("objeto-descripcion").value = o.descripcion || "";
    byId("objeto-imagen").value = o.url_imagen || "";
    byId("objeto-creacion").value = o.fecha_creacion || "";
    byId("objeto-adquisicion").value = o.fecha_adquisicion || "";
    byId("objeto-conservacion").value = o.porcentaje_conservacion;
    byId("objeto-categoria").value = String(o.categoria_id);
    byId("objeto-artista").value = o.artista_id != null ? String(o.artista_id) : "";
    byId("objeto-sala").value = String(o.sala_exhibicion_id);
    abrirModal("modal-objeto");
  }

  function eliminarObjeto(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var objeto = store.buscarPorId(datos.objetos, id);
    if (!objeto) return;
    if (
      !global.confirm('¿Eliminar "' + objeto.nombre + '"? También se borrará su historial.')
    ) {
      return;
    }

    datos.historial = datos.historial.filter(function (h) {
      return String(h.objeto_id) !== String(id);
    });
    datos.objetos = datos.objetos.filter(function (o) {
      return String(o.id) !== String(id);
    });
    if (String(store.filters.historialObjeto) === String(id)) {
      store.filters.historialObjeto = "";
    }
    store.guardar("Objeto eliminado");
  }

  /* ---------------- CATEGORÍAS ---------------- */

  function openNuevaCategoria() {
    idEditando = null;
    byId("form-categoria").reset();
    byId("titulo-categoria").textContent = "Nueva categoría";
    abrirModal("modal-categoria");
  }

  function openEditarCategoria(id) {
    var c = Admin.store.buscarPorId(Admin.store.getDatos().categorias, id);
    if (!c) return;
    idEditando = c.id;
    byId("titulo-categoria").textContent = "Editar categoría";
    byId("categoria-nombre").value = c.nombre || "";
    byId("categoria-descripcion").value = c.descripcion || "";
    abrirModal("modal-categoria");
  }

  function eliminarCategoria(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var categoria = store.buscarPorId(datos.categorias, id);
    if (!categoria) return;
    var tieneObjetos = datos.objetos.some(function (o) {
      return String(o.categoria_id) === String(id);
    });
    if (tieneObjetos) {
      global.alert("No se puede eliminar la categoría porque tiene objetos asociados.");
      return;
    }
    if (!global.confirm('¿Eliminar la categoría "' + categoria.nombre + '"?')) return;

    datos.categorias = datos.categorias.filter(function (c) {
      return String(c.id) !== String(id);
    });
    store.guardar("Categoría eliminada");
  }

  /* ---------------- ARTISTAS ---------------- */

  function openNuevoArtista() {
    idEditando = null;
    byId("form-artista").reset();
    byId("titulo-artista").textContent = "Nuevo artista";
    abrirModal("modal-artista");
  }

  function openEditarArtista(id) {
    var a = Admin.store.buscarPorId(Admin.store.getDatos().artistas, id);
    if (!a) return;
    idEditando = a.id;
    byId("titulo-artista").textContent = "Editar artista";
    byId("artista-nombre").value = a.nombre || "";
    byId("artista-nacionalidad").value = a.nacionalidad || "";
    byId("artista-biografia").value = a.biografia || "";
    abrirModal("modal-artista");
  }

  function eliminarArtista(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var artista = store.buscarPorId(datos.artistas, id);
    if (!artista) return;
    var obras = datos.objetos.filter(function (o) {
      return String(o.artista_id) === String(id);
    });
    var mensaje = '¿Eliminar a "' + artista.nombre + '"?';
    if (obras.length > 0) {
      mensaje += " Sus " + obras.length + " obras quedarán como anónimas.";
    }
    if (!global.confirm(mensaje)) return;

    for (var i = 0; i < obras.length; i++) {
      obras[i].artista_id = null;
    }
    datos.artistas = datos.artistas.filter(function (a) {
      return String(a.id) !== String(id);
    });
    store.guardar("Artista eliminado");
  }

  /* ---------------- TRASLADO DE OBJETO ---------------- */

  function actualizarTextoUbicacionActual() {
    var store = Admin.store;
    var selectObj = byId("traslado-objeto");
    var labelActual = byId("traslado-actual");
    if (!selectObj || !labelActual) return;
    var objeto = store.buscarPorId(store.getDatos().objetos, selectObj.value);
    if (!objeto) {
      labelActual.textContent = "";
      return;
    }
    labelActual.textContent =
      "Ubicación actual: " +
      store.nombreSala(objeto.sala_exhibicion_id) +
      " (" +
      store.nombreMuseoDeSala(objeto.sala_exhibicion_id) +
      ")";
  }

  function openTraslado(preselectedObjectId) {
    var store = Admin.store;
    var datos = store.getDatos();
    if (datos.objetos.length === 0) {
      global.alert("Primero debes registrar al menos un objeto.");
      return;
    }
    llenarSelectsModales();
    var objId =
      preselectedObjectId || store.filters.historialObjeto || String(datos.objetos[0].id);
    byId("traslado-objeto").value = String(objId);
    byId("traslado-fecha").value = store.ahora();
    actualizarTextoUbicacionActual();
    abrirModal("modal-traslado");
  }

  /* ---------------- RECORRIDOS ---------------- */

  function renderOrdenSalasModal() {
    var store = Admin.store;
    var cont = byId("orden-salas");
    if (!cont) return;
    if (salasRecorrido.length === 0) {
      cont.innerHTML = '<li class="admin-order-empty">Agrega al menos una sala al itinerario.</li>';
      return;
    }

    var html = "";
    for (var i = 0; i < salasRecorrido.length; i++) {
      var idSala = salasRecorrido[i];
      html +=
        '<li class="admin-order-item">' +
        '  <span class="admin-order-num">' +
        (i + 1) +
        "</span>" +
        '  <span class="admin-order-name">' +
        Admin.escapeHtml(store.nombreSala(idSala)) +
        "    <small>" +
        Admin.escapeHtml(store.nombreMuseoDeSala(idSala)) +
        "</small>" +
        "  </span>" +
        '  <div class="admin-order-controls">' +
        '    <button type="button" class="admin-icon-mini" data-recorrido-move="up" data-index="' +
        i +
        '" title="Subir" aria-label="Subir"' +
        (i === 0 ? " disabled" : "") +
        ">&#8593;</button>" +
        '    <button type="button" class="admin-icon-mini" data-recorrido-move="down" data-index="' +
        i +
        '" title="Bajar" aria-label="Bajar"' +
        (i === salasRecorrido.length - 1 ? " disabled" : "") +
        ">&#8595;</button>" +
        '    <button type="button" class="admin-icon-mini admin-icon-mini--danger" data-recorrido-move="remove" data-index="' +
        i +
        '" title="Quitar" aria-label="Quitar">&times;</button>' +
        "  </div>" +
        "</li>";
    }
    cont.innerHTML = html;
  }

  function openNuevoRecorrido() {
    var datos = Admin.store.getDatos();
    if (datos.salas.length === 0) {
      global.alert("Primero debes registrar al menos una sala.");
      return;
    }
    llenarSelectsModales();
    idEditando = null;
    salasRecorrido = [];
    byId("form-recorrido").reset();
    byId("titulo-recorrido").textContent = "Nuevo recorrido";
    renderOrdenSalasModal();
    abrirModal("modal-recorrido");
  }

  function openEditarRecorrido(id) {
    var store = Admin.store;
    var r = store.buscarPorId(store.getDatos().recorridos, id);
    if (!r) return;
    llenarSelectsModales();
    idEditando = r.id;
    salasRecorrido = store.salasDelRecorrido(r.id);
    byId("titulo-recorrido").textContent = "Editar recorrido";
    byId("recorrido-nombre").value = r.nombre || "";
    byId("recorrido-descripcion").value = r.descripcion || "";
    byId("recorrido-inicio").value = r.fecha_inicio || "";
    byId("recorrido-fin").value = r.fecha_fin || "";
    byId("recorrido-url").value = r.url_pagina || "";
    renderOrdenSalasModal();
    abrirModal("modal-recorrido");
  }

  function eliminarRecorrido(id) {
    var store = Admin.store;
    var datos = store.getDatos();
    var recorrido = store.buscarPorId(datos.recorridos, id);
    if (!recorrido) return;
    if (!global.confirm('¿Eliminar el recorrido "' + recorrido.nombre + '"?')) return;

    datos.recorrido_sala = datos.recorrido_sala.filter(function (r) {
      return String(r.recorrido_id) !== String(id);
    });
    datos.recorridos = datos.recorridos.filter(function (r) {
      return String(r.id) !== String(id);
    });
    store.guardar("Recorrido eliminado");
  }

  /* ---------------- EVENTOS DE FORMULARIOS ---------------- */

  function initModals() {
    // Cerrar modales con botones .cerrar-modal o clic sobre backdrop del <dialog>
    var closeBtns = document.querySelectorAll(".cerrar-modal");
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener("click", function () {
        var dlg = this.closest("dialog");
        if (dlg) dlg.close();
      });
    }

    var dialogs = document.querySelectorAll("dialog.admin-dialog");
    for (var d = 0; d < dialogs.length; d++) {
      dialogs[d].addEventListener("click", function (ev) {
        if (ev.target === this) {
          this.close();
        }
      });
    }

    // Form Museo
    byId("form-museo").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var lat = byId("museo-latitud").value;
      var lon = byId("museo-longitud").value;

      var museo = {
        nombre: byId("museo-nombre").value.trim(),
        descripcion: byId("museo-descripcion").value.trim(),
        latitud: lat === "" ? null : Number(lat),
        longitud: lon === "" ? null : Number(lon),
        url_pagina: byId("museo-url").value.trim()
      };

      if (idEditando != null) {
        Object.assign(store.buscarPorId(datos.museos, idEditando), museo);
        cerrarModal("modal-museo");
        store.guardar("Museo actualizado");
      } else {
        museo.id = store.siguienteId(datos.museos);
        datos.museos.push(museo);
        cerrarModal("modal-museo");
        store.guardar("Museo registrado");
      }
    });

    // Form Sala
    byId("form-sala").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var museoId = Number(byId("sala-museo").value);
      var nombre = byId("sala-nombre").value.trim();

      var repetida = datos.salas.some(function (s) {
        return (
          Number(s.museo_id) === museoId &&
          s.nombre.toLowerCase() === nombre.toLowerCase() &&
          String(s.id) !== String(idEditando)
        );
      });
      if (repetida) {
        global.alert("Ya existe una sala con ese nombre dentro del mismo museo.");
        return;
      }

      var sala = {
        museo_id: museoId,
        nombre: nombre,
        descripcion: byId("sala-descripcion").value.trim(),
        capacidad: Number(byId("sala-capacidad").value)
      };

      if (idEditando != null) {
        Object.assign(store.buscarPorId(datos.salas, idEditando), sala);
        cerrarModal("modal-sala");
        store.guardar("Sala actualizada");
      } else {
        sala.id = store.siguienteId(datos.salas);
        datos.salas.push(sala);
        cerrarModal("modal-sala");
        store.guardar("Sala registrada");
      }
    });

    // Form Objeto
    byId("form-objeto").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var creacion = byId("objeto-creacion").value;
      var adquisicion = byId("objeto-adquisicion").value;
      var artista = byId("objeto-artista").value;

      if (creacion && adquisicion && adquisicion < creacion) {
        global.alert("La fecha de adquisición no puede ser anterior a la fecha de creación.");
        return;
      }

      var objeto = {
        nombre: byId("objeto-nombre").value.trim(),
        descripcion: byId("objeto-descripcion").value.trim(),
        url_imagen: byId("objeto-imagen").value.trim(),
        fecha_creacion: creacion,
        fecha_adquisicion: adquisicion,
        porcentaje_conservacion: Number(byId("objeto-conservacion").value),
        categoria_id: Number(byId("objeto-categoria").value),
        artista_id: artista ? Number(artista) : null,
        sala_exhibicion_id: Number(byId("objeto-sala").value)
      };

      if (idEditando != null) {
        var actual = store.buscarPorId(datos.objetos, idEditando);
        if (String(actual.sala_exhibicion_id) !== String(objeto.sala_exhibicion_id)) {
          store.moverObjeto(actual.id, objeto.sala_exhibicion_id, store.ahora());
        }
        Object.assign(actual, objeto);
        cerrarModal("modal-objeto");
        store.guardar("Objeto actualizado");
      } else {
        objeto.id = store.siguienteId(datos.objetos);
        datos.objetos.push(objeto);
        datos.historial.push({
          id: store.siguienteId(datos.historial),
          objeto_id: objeto.id,
          sala_exhibicion_id: objeto.sala_exhibicion_id,
          fecha_inicio: store.ahora(),
          fecha_fin: null
        });
        cerrarModal("modal-objeto");
        store.guardar("Objeto registrado");
      }
    });

    // Form Categoría
    byId("form-categoria").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var nombre = byId("categoria-nombre").value.trim();

      var repetida = datos.categorias.some(function (c) {
        return (
          c.nombre.toLowerCase() === nombre.toLowerCase() &&
          String(c.id) !== String(idEditando)
        );
      });
      if (repetida) {
        global.alert("Ya existe una categoría con ese nombre.");
        return;
      }

      var categoria = {
        nombre: nombre,
        descripcion: byId("categoria-descripcion").value.trim()
      };

      if (idEditando != null) {
        Object.assign(store.buscarPorId(datos.categorias, idEditando), categoria);
        cerrarModal("modal-categoria");
        store.guardar("Categoría actualizada");
      } else {
        categoria.id = store.siguienteId(datos.categorias);
        datos.categorias.push(categoria);
        cerrarModal("modal-categoria");
        store.guardar("Categoría registrada");
      }
    });

    // Form Artista
    byId("form-artista").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var artista = {
        nombre: byId("artista-nombre").value.trim(),
        nacionalidad: byId("artista-nacionalidad").value.trim(),
        biografia: byId("artista-biografia").value.trim()
      };

      if (idEditando != null) {
        Object.assign(store.buscarPorId(datos.artistas, idEditando), artista);
        cerrarModal("modal-artista");
        store.guardar("Artista actualizado");
      } else {
        artista.id = store.siguienteId(datos.artistas);
        datos.artistas.push(artista);
        cerrarModal("modal-artista");
        store.guardar("Artista registrado");
      }
    });

    // Form Traslado
    byId("traslado-objeto").addEventListener("change", actualizarTextoUbicacionActual);

    byId("form-traslado").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var objeto = store.buscarPorId(datos.objetos, byId("traslado-objeto").value);
      if (!objeto) return;
      var idSala = Number(byId("traslado-sala").value);
      var fecha = byId("traslado-fecha").value;
      var actual = null;
      for (var h = 0; h < datos.historial.length; h++) {
        if (String(datos.historial[h].objeto_id) === String(objeto.id) && !datos.historial[h].fecha_fin) {
          actual = datos.historial[h];
          break;
        }
      }

      if (String(idSala) === String(objeto.sala_exhibicion_id)) {
        global.alert("El objeto ya se encuentra en esa sala.");
        return;
      }
      if (actual && fecha <= actual.fecha_inicio) {
        global.alert(
          "La fecha debe ser posterior al " +
            store.formatoFechaHora(actual.fecha_inicio) +
            ", que es cuando llegó a la sala actual."
        );
        return;
      }

      store.moverObjeto(objeto.id, idSala, fecha);
      store.filters.historialObjeto = String(objeto.id);
      cerrarModal("modal-traslado");
      store.guardar("Traslado registrado en historial");
    });

    // Controles de orden de salas en Recorrido
    byId("btn-agregar-sala-recorrido").addEventListener("click", function () {
      var idSala = Number(byId("recorrido-sala").value);
      if (!idSala) return;
      if (salasRecorrido.indexOf(idSala) !== -1) {
        global.alert("Esa sala ya está agregada en el recorrido.");
        return;
      }
      salasRecorrido.push(idSala);
      renderOrdenSalasModal();
    });

    byId("orden-salas").addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-recorrido-move]");
      if (!btn) return;
      var dir = btn.getAttribute("data-recorrido-move");
      var idx = Number(btn.getAttribute("data-index"));
      if (dir === "up" && idx > 0) {
        var tmpUp = salasRecorrido[idx - 1];
        salasRecorrido[idx - 1] = salasRecorrido[idx];
        salasRecorrido[idx] = tmpUp;
      } else if (dir === "down" && idx < salasRecorrido.length - 1) {
        var tmpDn = salasRecorrido[idx + 1];
        salasRecorrido[idx + 1] = salasRecorrido[idx];
        salasRecorrido[idx] = tmpDn;
      } else if (dir === "remove") {
        salasRecorrido.splice(idx, 1);
      }
      renderOrdenSalasModal();
    });

    // Form Recorrido
    byId("form-recorrido").addEventListener("submit", function (e) {
      e.preventDefault();
      var store = Admin.store;
      var datos = store.getDatos();
      var inicio = byId("recorrido-inicio").value;
      var fin = byId("recorrido-fin").value;

      if (fin <= inicio) {
        global.alert("La fecha de fin debe ser posterior a la fecha de inicio.");
        return;
      }
      if (salasRecorrido.length === 0) {
        global.alert("Agrega al menos una sala al recorrido.");
        return;
      }

      var recorrido = {
        nombre: byId("recorrido-nombre").value.trim(),
        descripcion: byId("recorrido-descripcion").value.trim(),
        fecha_inicio: inicio,
        fecha_fin: fin,
        url_pagina: byId("recorrido-url").value.trim()
      };

      var id = idEditando;
      var isEdit = idEditando != null;
      if (isEdit) {
        Object.assign(store.buscarPorId(datos.recorridos, idEditando), recorrido);
      } else {
        id = store.siguienteId(datos.recorridos);
        recorrido.id = id;
        datos.recorridos.push(recorrido);
      }

      datos.recorrido_sala = datos.recorrido_sala.filter(function (r) {
        return String(r.recorrido_id) !== String(id);
      });
      for (var k = 0; k < salasRecorrido.length; k++) {
        datos.recorrido_sala.push({
          recorrido_id: id,
          sala_exhibicion_id: salasRecorrido[k],
          numero_orden: k + 1
        });
      }

      cerrarModal("modal-recorrido");
      store.guardar(isEdit ? "Recorrido actualizado" : "Recorrido registrado");
    });
  }

  Admin.modals = {
    init: initModals,
    openNuevoMuseo: openNuevoMuseo,
    openEditarMuseo: openEditarMuseo,
    eliminarMuseo: eliminarMuseo,
    openNuevaSala: openNuevaSala,
    openEditarSala: openEditarSala,
    eliminarSala: eliminarSala,
    openNuevoObjeto: openNuevoObjeto,
    openEditarObjeto: openEditarObjeto,
    eliminarObjeto: eliminarObjeto,
    openNuevaCategoria: openNuevaCategoria,
    openEditarCategoria: openEditarCategoria,
    eliminarCategoria: eliminarCategoria,
    openNuevoArtista: openNuevoArtista,
    openEditarArtista: openEditarArtista,
    eliminarArtista: eliminarArtista,
    openTraslado: openTraslado,
    openNuevoRecorrido: openNuevoRecorrido,
    openEditarRecorrido: openEditarRecorrido,
    eliminarRecorrido: eliminarRecorrido
  };
})(window);
