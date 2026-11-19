/**
 * ============================================================================
 * EFECTO ANIMADO "CHROMA WAVES" (React Bits Pro — chroma-waves-tw)
 * Archivo: js/chroma-waves.js
 * Propósito: Recreación en WebGL (GLSL Fragment Shader) del componente
 *            "Chroma Waves" de React Bits Pro exclusivamente para la sección
 *            Hero principal de la página de inicio (index.html).
 *
 * Parámetros obligatorios configurados:
 *   - Color 1 (Luz / Cresta): #ffffff
 *   - Color 2 (Ámbar / Dorado cálido): #f69d41
 *   - Fondo base oscuro: #0a0806
 *   - Speed: 0.5
 *   - Wave Frequency: 0.2
 *   - Wave Amplitude: 0.3
 *   - Distortion: 1.5
 *   - Flatness: 0.25
 *   - Noise Level (Grano): 0.10
 * ============================================================================
 */

(function () {
  "use strict";

  var DEFAULT_CONFIG = {
    color1: "#ffffff",
    color2: "#f69d41",
    backgroundColor: "#0a0806",
    speed: 0.5,
    waveFrequency: 0.2,
    waveAmplitude: 0.3,
    distortion: 1.5,
    flatness: 0.25,
    chromaShift: 0.25,
    noiseLevel: 0.10
  };

  /**
   * Convierte un color hexadecimal (#rrggbb) a una tupla RGB normalizada [0..1].
   */
  function hexToRgbNormalized(hex) {
    var clean = String(hex || "#ffffff").replace("#", "").trim();
    if (clean.length === 3) {
      clean =
        clean.charAt(0) + clean.charAt(0) +
        clean.charAt(1) + clean.charAt(1) +
        clean.charAt(2) + clean.charAt(2);
    }
    var num = parseInt(clean, 16);
    if (isNaN(num)) {
      return [1.0, 1.0, 1.0];
    }
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    ];
  }

  /**
   * Compila un shader WebGL (Vertex o Fragment).
   */
  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("ChromaWaves shader error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Crea y enlaza el programa WebGL.
   */
  function createProgram(gl, vertexSource, fragmentSource) {
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("ChromaWaves program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  var VERTEX_SHADER_SOURCE = [
    "attribute vec2 aPosition;",
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = aPosition * 0.5 + 0.5;",
    "  gl_Position = vec4(aPosition, 0.0, 1.0);",
    "}"
  ].join("\n");

  /**
   * Fragment Shader GLSL de "Chroma Waves" (chroma-waves-tw):
   * Genera ondas suaves de luz con distorsión armónica, aplanamiento de cresta,
   * resplandor cromático (mezcla entre #f69d41 y #ffffff sobre #0a0806)
   * y textura de grano cinematográfico (noiseLevel = 0.10).
   */
  var FRAGMENT_SHADER_SOURCE = [
    "precision highp float;",
    "varying vec2 vUv;",
    "uniform vec2 uResolution;",
    "uniform float uTime;",
    "uniform vec3 uColor1;",
    "uniform vec3 uColor2;",
    "uniform vec3 uBgColor;",
    "uniform float uSpeed;",
    "uniform float uWaveFrequency;",
    "uniform float uWaveAmplitude;",
    "uniform float uDistortion;",
    "uniform float uFlatness;",
    "uniform float uChromaShift;",
    "uniform float uNoiseLevel;",
    "",
    "// Ruido pseudoaleatorio sin artefactos de banda para el grano (noiseLevel)",
    "float hash12(vec2 p) {",
    "  vec3 p3 = fract(vec3(p.xyx) * 0.1031);",
    "  p3 += dot(p3, p3.yzx + 33.33);",
    "  return fract((p3.x + p3.y) * p3.z);",
    "}",
    "",
    "// Campo de ondas suaves con distorsión armónica iterativa",
    "float evaluateWaveField(vec2 uv, float t) {",
    "  float freq = max(uWaveFrequency, 0.05) * 10.0;",
    "  float amp = uWaveAmplitude;",
    "  float dist = uDistortion;",
    "",
    "  vec2 p = (uv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);",
    "  p.x *= freq * 0.55;",
    "  p.y *= 1.65;",
    "",
    "  // Deformación de dominio suave controlada por uDistortion (1.5)",
    "  for (int i = 1; i <= 4; i++) {",
    "    float fi = float(i);",
    "    p.x += (amp * dist * 0.38 / fi) * sin(fi * p.y * 1.6 + t * (0.75 + 0.18 * fi));",
    "    p.y += (amp * dist * 0.42 / fi) * cos(fi * p.x * 1.15 - t * (0.55 + 0.15 * fi));",
    "  }",
    "",
    "  // Superposición de cintas de luz ondulantes",
    "  float waveA = sin(p.y * 2.4 + sin(p.x * 1.3 + t * 0.8) * dist);",
    "  float waveB = cos(p.x * 1.7 - cos(p.y * 1.9 - t * 0.65) * (dist * 0.85));",
    "  float waveC = sin((p.x + p.y) * 1.35 - t * 0.45);",
    "",
    "  float combined = (waveA * 0.48 + waveB * 0.34 + waveC * 0.18);",
    "  float ribbon = 1.0 - abs(combined);",
    "",
    "  // Control de flatness (0.25): suaviza y ensancha las crestas luminosas",
    "  float exponent = mix(1.15, 3.6, clamp(uFlatness, 0.0, 2.0) * 0.5);",
    "  ribbon = pow(clamp(ribbon, 0.0, 1.0), exponent);",
    "",
    "  // Envolvente espacial suave para integrar el flujo en el Hero",
    "  float vignette = smoothstep(1.35, 0.15, length((uv - vec2(0.52, 0.5)) * vec2(0.9, 1.05)));",
    "  return ribbon * (0.65 + 0.35 * vignette);",
    "}",
    "",
    "void main() {",
    "  float t = uTime * uSpeed;",
    "  vec2 uv = vUv;",
    "",
    "  // Desplazamiento cromático (chromatic shimmer) a través de las crestas de onda",
    "  vec2 shiftDir = vec2(",
    "    cos(uv.y * 4.0 + t * 0.6),",
    "    sin(uv.x * 4.0 - t * 0.5)",
    "  ) * (0.022 * uChromaShift * (0.5 + 0.5 * uDistortion));",
    "",
    "  float wR = evaluateWaveField(uv + shiftDir * 1.15, t + 0.06);",
    "  float wG = evaluateWaveField(uv, t);",
    "  float wB = evaluateWaveField(uv - shiftDir * 1.15, t - 0.06);",
    "",
    "  // Perfil energético principal y separación cromática en los bordes",
    "  float coreEnergy = (wR * 0.30 + wG * 0.48 + wB * 0.22);",
    "  float shimmerDelta = abs(wR - wB) * 1.65 + abs(wG - wB) * 0.85;",
    "",
    "  // Mezcla entre fondo oscuro (#0a0806), Color 2 ámbar/dorado (#f69d41) y Color 1 blanco cálido (#ffffff)",
    "  float amberMask = smoothstep(0.08, 0.78, coreEnergy + shimmerDelta * 0.45);",
    "  float whiteCrestMask = pow(smoothstep(0.46, 0.98, wG), 1.45);",
    "",
    "  vec3 waveColor = mix(uBgColor, uColor2, amberMask);",
    "  // Resplandor cromático cálido en los flancos de las ondas",
    "  vec3 chromaGlow = vec3(wR, wG * 0.88, wB * 0.58) * uColor2 * 0.55;",
    "  waveColor += chromaGlow * smoothstep(0.12, 0.85, coreEnergy);",
    "  // Cresta de luz blanca cálida (#ffffff)",
    "  waveColor = mix(waveColor, uColor1, whiteCrestMask * 0.88);",
    "  waveColor += uColor1 * (shimmerDelta * 0.26 * smoothstep(0.25, 0.9, coreEnergy));",
    "",
    "  // Textura de grano / ruido granulado (uNoiseLevel = 0.10)",
    "  float grain = hash12(gl_FragCoord.xy + fract(uTime * 60.0) * 100.0) - 0.5;",
    "  waveColor += grain * uNoiseLevel;",
    "",
    "  gl_FragColor = vec4(clamp(waveColor, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  /**
   * Fallback en Canvas 2D por si el navegador tiene WebGL deshabilitado.
   */
  function initCanvas2DFallback(canvas, config) {
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    var rafId = null;
    var startTime = performance.now();

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }

    function render(now) {
      var w = canvas.width;
      var h = canvas.height;
      var t = ((now - startTime) * 0.001) * config.speed;

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (var i = 0; i < 4; i++) {
        var yOffset = h * (0.28 + i * 0.16) + Math.sin(t + i * 1.3) * (h * config.waveAmplitude * 0.35);
        var grad = ctx.createRadialGradient(
          w * (0.45 + 0.2 * Math.cos(t * 0.7 + i)),
          yOffset,
          w * 0.04,
          w * 0.5,
          yOffset,
          w * 0.65
        );
        grad.addColorStop(0, i % 2 === 0 ? "rgba(255, 255, 255, 0.34)" : "rgba(246, 157, 65, 0.42)");
        grad.addColorStop(0.45, "rgba(246, 157, 65, 0.22)");
        grad.addColorStop(1, "rgba(10, 8, 6, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
      rafId = window.requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    rafId = window.requestAnimationFrame(render);
  }

  function parseContainerConfig(container) {
    return {
      color1: container.getAttribute("data-color-1") || DEFAULT_CONFIG.color1,
      color2: container.getAttribute("data-color-2") || DEFAULT_CONFIG.color2,
      backgroundColor: container.getAttribute("data-bg-color") || DEFAULT_CONFIG.backgroundColor,
      speed: parseFloat(container.getAttribute("data-speed") || DEFAULT_CONFIG.speed),
      waveFrequency: parseFloat(container.getAttribute("data-wave-frequency") || DEFAULT_CONFIG.waveFrequency),
      waveAmplitude: parseFloat(container.getAttribute("data-wave-amplitude") || DEFAULT_CONFIG.waveAmplitude),
      distortion: parseFloat(container.getAttribute("data-distortion") || DEFAULT_CONFIG.distortion),
      flatness: parseFloat(container.getAttribute("data-flatness") || DEFAULT_CONFIG.flatness),
      chromaShift: parseFloat(container.getAttribute("data-chroma-shift") || DEFAULT_CONFIG.chromaShift),
      noiseLevel: parseFloat(container.getAttribute("data-noise-level") || DEFAULT_CONFIG.noiseLevel)
    };
  }

  function initChromaWaves() {
    var container = document.getElementById("chroma-waves-hero");
    if (!container) {
      return;
    }

    var canvas = container.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "chroma-waves__canvas";
      container.appendChild(canvas);
    }

    var config = parseContainerConfig(container);

    var gl =
      canvas.getContext("webgl", { alpha: false, antialias: true, powerPreference: "high-performance" }) ||
      canvas.getContext("experimental-webgl", { alpha: false, antialias: true });

    if (!gl) {
      initCanvas2DFallback(canvas, config);
      return;
    }

    var program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    if (!program) {
      initCanvas2DFallback(canvas, config);
      return;
    }

    gl.useProgram(program);

    // Geometría de pantalla completa (2 triángulos)
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]),
      gl.STATIC_DRAW
    );

    var aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Localización de uniforms
    var uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    var uTimeLoc = gl.getUniformLocation(program, "uTime");
    var uColor1Loc = gl.getUniformLocation(program, "uColor1");
    var uColor2Loc = gl.getUniformLocation(program, "uColor2");
    var uBgColorLoc = gl.getUniformLocation(program, "uBgColor");
    var uSpeedLoc = gl.getUniformLocation(program, "uSpeed");
    var uWaveFrequencyLoc = gl.getUniformLocation(program, "uWaveFrequency");
    var uWaveAmplitudeLoc = gl.getUniformLocation(program, "uWaveAmplitude");
    var uDistortionLoc = gl.getUniformLocation(program, "uDistortion");
    var uFlatnessLoc = gl.getUniformLocation(program, "uFlatness");
    var uChromaShiftLoc = gl.getUniformLocation(program, "uChromaShift");
    var uNoiseLevelLoc = gl.getUniformLocation(program, "uNoiseLevel");

    var rgb1 = hexToRgbNormalized(config.color1);
    var rgb2 = hexToRgbNormalized(config.color2);
    var rgbBg = hexToRgbNormalized(config.backgroundColor);

    gl.uniform3f(uColor1Loc, rgb1[0], rgb1[1], rgb1[2]);
    gl.uniform3f(uColor2Loc, rgb2[0], rgb2[1], rgb2[2]);
    gl.uniform3f(uBgColorLoc, rgbBg[0], rgbBg[1], rgbBg[2]);
    gl.uniform1f(uSpeedLoc, config.speed);
    gl.uniform1f(uWaveFrequencyLoc, config.waveFrequency);
    gl.uniform1f(uWaveAmplitudeLoc, config.waveAmplitude);
    gl.uniform1f(uDistortionLoc, config.distortion);
    gl.uniform1f(uFlatnessLoc, config.flatness);
    gl.uniform1f(uChromaShiftLoc, config.chromaShift);
    gl.uniform1f(uNoiseLevelLoc, config.noiseLevel);

    function resizeCanvas() {
      var rect = container.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, Math.floor(rect.width * dpr));
      var height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uResolutionLoc, width, height);
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    var startTime = performance.now();
    var isVisible = true;
    var rafId = null;

    function renderFrame(now) {
      if (!isVisible) {
        rafId = null;
        return;
      }
      var elapsedSeconds = (now - startTime) * 0.001;
      gl.uniform1f(uTimeLoc, elapsedSeconds);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = window.requestAnimationFrame(renderFrame);
    }

    function startLoop() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    // Optimización de rendimiento manteniendo 60fps cuando el Hero está en pantalla
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isVisible = entry.isIntersecting;
            if (isVisible) {
              resizeCanvas();
              startLoop();
            }
          });
        },
        { threshold: 0.01 }
      );
      observer.observe(container);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        isVisible = false;
      } else {
        isVisible = true;
        resizeCanvas();
        startLoop();
      }
    });

    startLoop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChromaWaves);
  } else {
    initChromaWaves();
  }
})();
