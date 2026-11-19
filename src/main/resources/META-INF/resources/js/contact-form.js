/**
 * ============================================================================
 * VALIDACIÓN ACCESIBLE DE FORMULARIO — IGLESIA DE SANTO DOMINGO DE TUNJA
 * Archivo: js/contact-form.js
 * Propósito: Validación en línea de campos obligatorios en visita.html,
 *            gestión de estados de error (aria-invalid) y confirmación de
 *            recepción en la Fase 1 académica.
 * ============================================================================
 */

(function () {
  "use strict";

  function initContactForm() {
    var form = document.getElementById("form-consulta");
    if (!form) {
      return;
    }

    var statusBanner = document.getElementById("form-estado-global");

    function setFieldError(input, errorId, message) {
      var errorEl = document.getElementById(errorId);
      if (message) {
        input.setAttribute("aria-invalid", "true");
        if (errorEl) {
          errorEl.textContent = message;
        }
      } else {
        input.setAttribute("aria-invalid", "false");
        if (errorEl) {
          errorEl.textContent = "";
        }
      }
    }

    function validateField(input) {
      var id = input.id;
      var value = input.value.trim();

      if (id === "consulta-nombre") {
        if (value.length < 3) {
          setFieldError(
            input,
            "error-nombre",
            "Por favor, ingrese su nombre completo (mínimo 3 caracteres)."
          );
          return false;
        }
        setFieldError(input, "error-nombre", "");
        return true;
      }

      if (id === "consulta-correo") {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setFieldError(
            input,
            "error-correo",
            "Ingrese una dirección de correo electrónico válida (ej. nombre@dominio.co)."
          );
          return false;
        }
        setFieldError(input, "error-correo", "");
        return true;
      }

      if (id === "consulta-motivo") {
        if (!value) {
          setFieldError(
            input,
            "error-motivo",
            "Seleccione el motivo principal de su consulta."
          );
          return false;
        }
        setFieldError(input, "error-motivo", "");
        return true;
      }

      if (id === "consulta-mensaje") {
        if (value.length < 15) {
          setFieldError(
            input,
            "error-mensaje",
            "Describa su consulta con al menos 15 caracteres para orientar la respuesta."
          );
          return false;
        }
        setFieldError(input, "error-mensaje", "");
        return true;
      }

      if (id === "consulta-consentimiento") {
        if (!input.checked) {
          setFieldError(
            input,
            "error-consentimiento",
            "Debe confirmar que comprende el alcance académico e informativo del formulario."
          );
          return false;
        }
        setFieldError(input, "error-consentimiento", "");
        return true;
      }

      return true;
    }

    var fields = form.querySelectorAll(
      "#consulta-nombre, #consulta-correo, #consulta-motivo, #consulta-mensaje, #consulta-consentimiento"
    );

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var isFormValid = true;
      var firstInvalid = null;

      fields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalid) {
            firstInvalid = field;
          }
        }
      });

      if (!isFormValid) {
        if (statusBanner) {
          statusBanner.className = "status-banner status-banner--error";
          statusBanner.textContent =
            "Revise los campos señalados en rojo antes de registrar la consulta.";
          statusBanner.removeAttribute("hidden");
        }
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      if (statusBanner) {
        statusBanner.className = "status-banner status-banner--success";
        statusBanner.textContent =
          "Consulta validada correctamente (Entorno demostrativo de Fase 1). Sus datos han sido verificados en la estructura del formulario.";
        statusBanner.removeAttribute("hidden");
      }

      form.reset();
      fields.forEach(function (f) {
        f.setAttribute("aria-invalid", "false");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactForm);
  } else {
    initContactForm();
  }
})();
