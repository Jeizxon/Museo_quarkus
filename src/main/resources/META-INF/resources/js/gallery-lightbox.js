/**
 * ============================================================================
 * GRADIENT CAROUSEL 3D (React Bits Pro) Y MODAL LIGHTBOX ACCESIBLE
 * Archivo: js/gallery-lightbox.js
 * Propósito:
 *   1. Recrear fielmente el componente "Gradient Carousel" (gradient-carousel-tw)
 *      de React Bits Pro en 3D (perspective: 1200px, rotación en eje Y,
 *      profundidad en eje Z, escala gradual, arrastre con inercia y extracción
 *      dinámica del color dominante mediante <canvas> oculto + paleta calibrada
 *      para teñir suavemente el fondo de la sección Galería).
 *   2. Conservar intacto el sistema de visualización ampliada (<dialog>
 *      Modal / Lightbox) al seleccionar la tarjeta activa o el botón de
 *      inspección documental, mostrando la imagen en alta resolución y toda
 *      su información histórica, arquitectónica y de licencia.
 *   3. Mantener el filtrado documental por categorías arquitectónicas.
 * ============================================================================
 */

(function () {
  "use strict";

  /**
   * Parsea una cadena "R, G, B" a un arreglo numérico [R, G, B].
   */
  function parseRgbString(str, fallback) {
    if (!str) {
      return fallback || [214, 168, 102];
    }
    var parts = str.split(",").map(function (n) {
      return parseInt(n.trim(), 10);
    });
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts;
    }
    return fallback || [214, 168, 102];
  }

  /**
   * Extrae dos colores dominantes cálidos/atmosféricos de una imagen usando un
   * <canvas> oculto. Si el protocolo local (file://) restringe getImageData,
   * utiliza la paleta precalculada de la lámina.
   */
  function extractCardPalette(card, sampleCanvas, sampleCtx) {
    var fallbackPrimary = parseRgbString(
      card.getAttribute("data-tint-primary"),
      [214, 168, 102]
    );
    var fallbackSecondary = parseRgbString(
      card.getAttribute("data-tint-secondary"),
      [146, 52, 40]
    );

    if (card.__cachedPalette) {
      return card.__cachedPalette;
    }

    var img = card.querySelector("img");
    if (!img || !img.complete || !img.naturalWidth || !sampleCtx) {
      return { primary: fallbackPrimary, secondary: fallbackSecondary };
    }

    try {
      var size = 24;
      sampleCanvas.width = size;
      sampleCanvas.height = size;
      sampleCtx.clearRect(0, 0, size, size);
      sampleCtx.drawImage(img, 0, 0, size, size);
      var data = sampleCtx.getImageData(0, 0, size, size).data;

      var r1 = 0, g1 = 0, b1 = 0, w1 = 0;
      var r2 = 0, g2 = 0, b2 = 0, w2 = 0;

      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3];
        if (a < 128) {
          continue;
        }

        var maxC = Math.max(r, g, b);
        var minC = Math.min(r, g, b);
        var luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        var sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

        // Ignorar píxeles excesivamente oscuros o quemados
        if (luma < 0.12 || luma > 0.94) {
          continue;
        }

        var weight = 0.35 + sat * 1.65;
        var pixelIndex = i / 4;
        var row = Math.floor(pixelIndex / size);

        if (row < size / 2) {
          r1 += r * weight;
          g1 += g * weight;
          b1 += b * weight;
          w1 += weight;
        } else {
          r2 += r * weight;
          g2 += g * weight;
          b2 += b * weight;
          w2 += weight;
        }
      }

      if (w1 > 0 && w2 > 0) {
        // Mezclar 55% color extraído del canvas + 45% paleta curada para garantizar armonía patrimonial
        var p = [
          Math.round((r1 / w1) * 0.55 + fallbackPrimary[0] * 0.45),
          Math.round((g1 / w1) * 0.55 + fallbackPrimary[1] * 0.45),
          Math.round((b1 / w1) * 0.55 + fallbackPrimary[2] * 0.45)
        ];
        var s = [
          Math.round((r2 / w2) * 0.55 + fallbackSecondary[0] * 0.45),
          Math.round((g2 / w2) * 0.55 + fallbackSecondary[1] * 0.45),
          Math.round((b2 / w2) * 0.55 + fallbackSecondary[2] * 0.45)
        ];
        card.__cachedPalette = { primary: p, secondary: s };
        return card.__cachedPalette;
      }
    } catch (e) {
      // En entorno file:// estricto, usar paleta precalculada de cada lámina
    }

    card.__cachedPalette = { primary: fallbackPrimary, secondary: fallbackSecondary };
    return card.__cachedPalette;
  }

  function initGalleryAndLightbox() {
    var modal = document.getElementById("galeria-lightbox");
    var closeBtn = document.querySelector("[data-lightbox-close]");
    var modalImg = document.getElementById("lightbox-imagen");
    var modalTitle = document.getElementById("lightbox-titulo");
    var modalDesc = document.getElementById("lightbox-descripcion");
    var modalCredit = document.getElementById("lightbox-credito");
    var modalCounter = document.getElementById("lightbox-contador");
    var lastFocusedElement = null;

    var allCards = Array.prototype.slice.call(
      document.querySelectorAll(".gradient-carousel__card")
    );

    /**
     * Abre el Modal / Lightbox accesible con los metadatos completos del botón disparador.
     */
    function openLightboxFromTrigger(trigger, indexInList, totalCount, returnFocusEl) {
      if (!modal || !trigger) {
        return;
      }

      lastFocusedElement = returnFocusEl || trigger;

      var src = trigger.getAttribute("data-full-src") || "";
      var alt = trigger.getAttribute("data-alt") || "";
      var title = trigger.getAttribute("data-title") || "";
      var desc = trigger.getAttribute("data-desc") || "";
      var credit = trigger.getAttribute("data-credit") || "";

      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = alt;
      }
      if (modalTitle) {
        modalTitle.textContent = title;
      }
      if (modalDesc) {
        modalDesc.textContent = desc;
      }
      if (modalCredit) {
        modalCredit.textContent = credit;
      }
      if (modalCounter) {
        modalCounter.textContent =
          "Lámina " + (indexInList + 1) + " de " + totalCount;
      }

      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.setAttribute("open", "open");
      }

      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeLightbox() {
      if (!modal) {
        return;
      }
      if (typeof modal.close === "function" && modal.open) {
        modal.close();
      } else {
        modal.removeAttribute("open");
      }
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    if (modal) {
      if (closeBtn) {
        closeBtn.addEventListener("click", closeLightbox);
      }

      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeLightbox();
        }
      });

      modal.addEventListener("close", function () {
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
          lastFocusedElement.focus();
        }
      });
    }

    // Inicialización del componente Gradient Carousel 3D
    var carouselRoot = document.querySelector("[data-gradient-carousel]");
    var sectionEl = document.getElementById("galeria-gradient-section");
    if (!carouselRoot || allCards.length === 0) {
      return;
    }

    var stageEl = carouselRoot.querySelector(".gradient-carousel__stage");
    var prevBtn = carouselRoot.querySelector("[data-carousel-prev]");
    var nextBtn = carouselRoot.querySelector("[data-carousel-next]");
    var dotsContainer = carouselRoot.querySelector("[data-carousel-dots]");
    var inspectBtn = carouselRoot.querySelector("[data-carousel-inspect]");
    var activeCounterEl = document.getElementById("gc-active-counter");
    var activeCategoryEl = document.getElementById("gc-active-category");
    var activeTitleEl = document.getElementById("gc-active-title");
    var orbPrimary = document.getElementById("gc-orb-primary");
    var orbSecondary = document.getElementById("gc-orb-secondary");

    // Parámetros de React Bits Pro (gradient-carousel-tw)
    var maxRotationDeg = parseFloat(carouselRoot.getAttribute("data-max-rotation") || "28");
    var maxDepthPx = parseFloat(carouselRoot.getAttribute("data-max-depth") || "140");
    var minScale = parseFloat(carouselRoot.getAttribute("data-min-scale") || "0.92");
    var cardGap = parseFloat(carouselRoot.getAttribute("data-card-gap") || "28");

    // Canvas oculto para extracción dinámica de color dominante de cada lámina
    var sampleCanvas = document.createElement("canvas");
    var sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

    var visibleCards = allCards.slice();
    var activeIndex = 0;
    var currentPos = 0;
    var targetPos = 0;
    var rafId = null;

    // Estado de arrastre / swipe
    var isPointerDown = false;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartPos = 0;
    var dragMovedDistance = 0;
    var suppressClickUntil = 0;

    // Interpolación suave de colores de fondo
    var currentTint1 = [214, 168, 102];
    var currentTint2 = [146, 52, 40];
    var targetTint1 = [214, 168, 102];
    var targetTint2 = [146, 52, 40];

    function padTwo(num) {
      return num < 10 ? "0" + num : String(num);
    }

    /**
     * Calcula la distancia firmada más corta en un carrusel circular o lineal.
     */
    function getSignedOffset(itemIndex, position, total) {
      if (total <= 1) {
        return 0;
      }
      var diff = itemIndex - position;
      if (total >= 4) {
        var half = total / 2;
        while (diff > half) {
          diff -= total;
        }
        while (diff < -half) {
          diff += total;
        }
      }
      return diff;
    }

    /**
     * Normaliza un índice dentro del rango [0, total - 1].
     */
    function normalizeIndex(idx, total) {
      if (total <= 0) {
        return 0;
      }
      return ((idx % total) + total) % total;
    }

    /**
     * Reconstruye los indicadores de paginación (dots) según las tarjetas visibles.
     */
    function renderPaginationDots() {
      if (!dotsContainer) {
        return;
      }
      dotsContainer.innerHTML = "";
      visibleCards.forEach(function (card, idx) {
        var trigger = card.querySelector("[data-lightbox-trigger]");
        var title = trigger ? trigger.getAttribute("data-title") : "Lámina " + (idx + 1);
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "gradient-carousel__dot" + (idx === activeIndex ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", idx === activeIndex ? "true" : "false");
        dot.setAttribute("aria-label", "Ir a " + title);
        dot.addEventListener("click", function () {
          goToCard(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    /**
     * Actualiza los textos informativos, atributos de accesibilidad y el tinte
     * cromático de fondo de acuerdo con la tarjeta central activa.
     */
    function syncActiveMetadata() {
      var total = visibleCards.length;
      if (total === 0) {
        return;
      }

      activeIndex = normalizeIndex(Math.round(targetPos), total);
      var activeCard = visibleCards[activeIndex];
      if (!activeCard) {
        return;
      }

      var trigger = activeCard.querySelector("[data-lightbox-trigger]");
      var title = trigger ? trigger.getAttribute("data-title") : "";
      var catLabel = activeCard.getAttribute("data-category-label") || "Patrimonio Documentado";
      var zoomPill = activeCard.querySelector(".gallery-card__zoom-pill");

      if (activeCounterEl) {
        activeCounterEl.textContent =
          "LÁMINA ACTIVA: " + padTwo(activeIndex + 1) + " / " + padTwo(total);
      }
      if (activeCategoryEl) {
        activeCategoryEl.textContent = catLabel.toUpperCase();
      }
      if (activeTitleEl) {
        activeTitleEl.textContent = title;
      }

      visibleCards.forEach(function (card, idx) {
        var isCurrent = idx === activeIndex;
        var pill = card.querySelector(".gallery-card__zoom-pill");
        card.classList.toggle("is-active", isCurrent);
        card.setAttribute("aria-hidden", isCurrent ? "false" : "false");
        if (pill) {
          pill.textContent = isCurrent ? "Ampliar fotografía" : "Centrar lámina";
        }
      });

      if (zoomPill) {
        zoomPill.textContent = "Ampliar fotografía";
      }

      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll(".gradient-carousel__dot");
        dots.forEach(function (dot, idx) {
          var isCurrent = idx === activeIndex;
          dot.classList.toggle("is-active", isCurrent);
          dot.setAttribute("aria-selected", isCurrent ? "true" : "false");
        });
      }

      // Extraer color dominante de la imagen activa para el tinte de fondo
      var palette = extractCardPalette(activeCard, sampleCanvas, sampleCtx);
      targetTint1 = palette.primary;
      targetTint2 = palette.secondary;

      // Desplazar sutilmente los orbes atmosféricos al cambiar de lámina
      if (orbPrimary && orbSecondary) {
        var shiftX = Math.sin(activeIndex * 1.15) * 7;
        var shiftY = Math.cos(activeIndex * 0.9) * 5;
        orbPrimary.style.transform =
          "translate(calc(-50% + " + shiftX.toFixed(1) + "%), calc(-50% + " + shiftY.toFixed(1) + "%))";
        orbSecondary.style.transform =
          "translate(calc(-50% - " + (shiftX * 0.85).toFixed(1) + "%), calc(-50% - " + (shiftY * 0.85).toFixed(1) + "%))";
      }
    }

    /**
     * Navega suavemente hacia un índice dentro de las tarjetas visibles.
     */
    function goToCard(targetIdx) {
      var total = visibleCards.length;
      if (total <= 1) {
        targetPos = 0;
        syncActiveMetadata();
        requestTick();
        return;
      }

      if (total >= 4) {
        var normalizedCurrent = normalizeIndex(Math.round(targetPos), total);
        var delta = getSignedOffset(targetIdx, normalizedCurrent, total);
        targetPos = Math.round(targetPos) + delta;
      } else {
        targetPos = Math.max(0, Math.min(total - 1, targetIdx));
      }

      syncActiveMetadata();
      requestTick();
    }

    function stepCarousel(direction) {
      var total = visibleCards.length;
      if (total <= 1) {
        return;
      }
      if (total >= 4) {
        targetPos = Math.round(targetPos) + direction;
      } else {
        var nextIdx = Math.max(0, Math.min(total - 1, Math.round(targetPos) + direction));
        targetPos = nextIdx;
      }
      syncActiveMetadata();
      requestTick();
    }

    /**
     * Renderiza la posición 3D (translateX, translateZ, rotateY, scale, opacity)
     * de cada tarjeta y actualiza la interpolación cromática del fondo.
     */
    function renderFrame() {
      var total = visibleCards.length;
      if (total === 0) {
        rafId = null;
        return;
      }

      // Interpolación física hacia la posición objetivo cuando no se está arrastrando
      if (!isPointerDown) {
        currentPos += (targetPos - currentPos) * 0.14;
        if (Math.abs(targetPos - currentPos) < 0.0015) {
          currentPos = targetPos;
        }
      }

      // Interpolación suave de los colores RGB del fondo
      for (var c = 0; c < 3; c++) {
        currentTint1[c] += (targetTint1[c] - currentTint1[c]) * 0.12;
        currentTint2[c] += (targetTint2[c] - currentTint2[c]) * 0.12;
      }

      if (sectionEl) {
        sectionEl.style.setProperty(
          "--gc-tint-1",
          Math.round(currentTint1[0]) + ", " + Math.round(currentTint1[1]) + ", " + Math.round(currentTint1[2])
        );
        sectionEl.style.setProperty(
          "--gc-tint-2",
          Math.round(currentTint2[0]) + ", " + Math.round(currentTint2[1]) + ", " + Math.round(currentTint2[2])
        );
      }

      var sampleCard = visibleCards[0];
      var cardWidth = sampleCard ? sampleCard.offsetWidth : 440;
      var isMobile = window.innerWidth < 768;
      var effectiveSpacing = isMobile
        ? cardWidth * 0.62 + cardGap * 0.5
        : cardWidth * 0.72 + cardGap;

      for (var i = 0; i < total; i++) {
        var card = visibleCards[i];
        var offset = getSignedOffset(i, currentPos, total);
        var absOffset = Math.abs(offset);

        // Desplazamiento lateral no lineal para destacar la lámina central
        var directionSign = offset < 0 ? -1 : 1;
        var compressedOffset =
          absOffset <= 1
            ? offset
            : directionSign * (1 + (absOffset - 1) * 0.72);

        var translateX = compressedOffset * effectiveSpacing;
        var translateZ = -Math.min(absOffset, 2.6) * maxDepthPx;
        var rotateY = Math.max(
          -maxRotationDeg,
          Math.min(maxRotationDeg, -offset * (maxRotationDeg * 0.82))
        );
        var scale = Math.max(
          minScale - 0.08,
          1 - absOffset * (1 - minScale) * 1.15
        );

        var opacity = absOffset > 2.35 ? 0 : Math.max(0.28, 1 - absOffset * 0.32);
        var brightness = Math.max(0.58, 1 - absOffset * 0.18);
        var zIndex = Math.round(100 - absOffset * 25);

        card.style.transform =
          "translate3d(calc(-50% + " +
          translateX.toFixed(2) +
          "px), -50%, " +
          translateZ.toFixed(2) +
          "px) rotateY(" +
          rotateY.toFixed(2) +
          "deg) scale(" +
          scale.toFixed(3) +
          ")";
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = "brightness(" + brightness.toFixed(2) + ")";
        card.style.zIndex = String(zIndex);
        card.style.pointerEvents = absOffset > 2.1 ? "none" : "auto";
      }

      var posSettled = !isPointerDown && Math.abs(targetPos - currentPos) === 0;
      var tintSettled =
        Math.abs(targetTint1[0] - currentTint1[0]) < 0.4 &&
        Math.abs(targetTint1[1] - currentTint1[1]) < 0.4 &&
        Math.abs(targetTint1[2] - currentTint1[2]) < 0.4 &&
        Math.abs(targetTint2[0] - currentTint2[0]) < 0.4;

      if (!posSettled || !tintSettled) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        rafId = null;
      }
    }

    function requestTick() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    // Eventos de clic en cada tarjeta:
    // - Si es una tarjeta lateral -> la centra en el carrusel 3D.
    // - Si ya es la tarjeta activa -> abre el Modal / Lightbox con todos sus datos.
    allCards.forEach(function (card) {
      var trigger = card.querySelector("[data-lightbox-trigger]");
      if (!trigger) {
        return;
      }

      trigger.addEventListener("click", function (event) {
        if (performance.now() < suppressClickUntil) {
          event.preventDefault();
          return;
        }

        var idxInVisible = visibleCards.indexOf(card);
        if (idxInVisible === -1) {
          return;
        }

        if (idxInVisible !== activeIndex) {
          event.preventDefault();
          goToCard(idxInVisible);
        } else {
          openLightboxFromTrigger(trigger, idxInVisible, visibleCards.length, trigger);
        }
      });

      // Si la imagen termina de cargar después, refrescar extracción de color
      var img = card.querySelector("img");
      if (img) {
        img.addEventListener("load", function () {
          card.__cachedPalette = null;
          if (visibleCards[activeIndex] === card) {
            syncActiveMetadata();
            requestTick();
          }
        });
      }
    });

    // Botón inferior dedicado para inspeccionar la lámina activa en el Lightbox
    if (inspectBtn) {
      inspectBtn.addEventListener("click", function () {
        var activeCard = visibleCards[activeIndex];
        if (!activeCard) {
          return;
        }
        var trigger = activeCard.querySelector("[data-lightbox-trigger]");
        if (trigger) {
          openLightboxFromTrigger(trigger, activeIndex, visibleCards.length, inspectBtn);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        stepCarousel(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        stepCarousel(1);
      });
    }

    // Soporte de arrastre (Pointer Drag / Swipe táctil) en el escenario 3D
    if (stageEl) {
      stageEl.addEventListener("pointerdown", function (event) {
        if (event.button !== undefined && event.button !== 0) {
          return;
        }
        isPointerDown = true;
        isDragging = false;
        dragStartX = event.clientX;
        dragStartPos = currentPos;
        dragMovedDistance = 0;
        stageEl.classList.add("is-dragging");
      });

      window.addEventListener(
        "pointermove",
        function (event) {
          if (!isPointerDown) {
            return;
          }
          var dx = event.clientX - dragStartX;
          dragMovedDistance = Math.max(dragMovedDistance, Math.abs(dx));
          if (dragMovedDistance > 7) {
            isDragging = true;
          }

          var stageWidth = Math.max(300, stageEl.clientWidth);
          var deltaCards = -dx / (stageWidth * 0.36);
          var total = visibleCards.length;

          if (total >= 4) {
            currentPos = dragStartPos + deltaCards;
          } else {
            currentPos = Math.max(
              -0.25,
              Math.min(total - 1 + 0.25, dragStartPos + deltaCards)
            );
          }

          requestTick();
        },
        { passive: true }
      );

      window.addEventListener("pointerup", function () {
        if (!isPointerDown) {
          return;
        }
        isPointerDown = false;
        stageEl.classList.remove("is-dragging");

        if (isDragging) {
          suppressClickUntil = performance.now() + 180;
          var total = visibleCards.length;
          if (total >= 4) {
            targetPos = Math.round(currentPos);
          } else {
            targetPos = Math.max(0, Math.min(total - 1, Math.round(currentPos)));
          }
          syncActiveMetadata();
          requestTick();
        }
      });

      // Soporte de rueda horizontal / trackpad en el escenario 3D
      var lastWheelTime = 0;
      stageEl.addEventListener(
        "wheel",
        function (event) {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 14) {
            event.preventDefault();
            var now = performance.now();
            if (now - lastWheelTime > 260) {
              lastWheelTime = now;
              stepCarousel(event.deltaX > 0 ? 1 : -1);
            }
          }
        },
        { passive: false }
      );
    }

    // Navegación con flechas del teclado cuando el foco está en la sección Galería
    document.addEventListener("keydown", function (event) {
      if (modal && modal.open) {
        return;
      }
      if (event.key === "ArrowLeft") {
        stepCarousel(-1);
      } else if (event.key === "ArrowRight") {
        stepCarousel(1);
      }
    });

    window.addEventListener(
      "resize",
      function () {
        requestTick();
      },
      { passive: true }
    );

    // Filtrado documental por categoría integrado con el Gradient Carousel 3D
    var filterButtons = document.querySelectorAll("[data-gallery-filter]");
    var emptyState = document.getElementById("galeria-estado-vacio");

    if (filterButtons.length > 0) {
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var category = button.getAttribute("data-gallery-filter");

          filterButtons.forEach(function (btn) {
            var isCurrent = btn === button;
            btn.setAttribute("aria-pressed", isCurrent ? "true" : "false");
          });

          visibleCards = [];
          allCards.forEach(function (card) {
            var cardCat = card.getAttribute("data-gallery-category");
            var matches = category === "todas" || cardCat === category;
            if (matches) {
              card.removeAttribute("hidden");
              visibleCards.push(card);
            } else {
              card.setAttribute("hidden", "hidden");
              card.classList.remove("is-active");
            }
          });

          if (visibleCards.length === 0) {
            carouselRoot.setAttribute("hidden", "hidden");
            if (emptyState) {
              emptyState.removeAttribute("hidden");
            }
          } else {
            carouselRoot.removeAttribute("hidden");
            if (emptyState) {
              emptyState.setAttribute("hidden", "hidden");
            }
            activeIndex = 0;
            currentPos = 0;
            targetPos = 0;
            renderPaginationDots();
            syncActiveMetadata();
            requestTick();
          }
        });
      });
    }

    // Inicializar estado inicial del carrusel
    renderPaginationDots();
    syncActiveMetadata();
    requestTick();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalleryAndLightbox);
  } else {
    initGalleryAndLightbox();
  }
})();
