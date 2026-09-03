/**
 * Video Game Page Transitions
 * Each function accepts a renderNewPage callback and animates using a canvas overlay.
 */

let canvas, ctx;

function initCanvas() {
  canvas = document.getElementById("pixel-transition-canvas");
  if (!canvas) return false;
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  return true;
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

async function captureScreenshot() {
  const html2canvas = await import("https://cdn.skypack.dev/html2canvas");
  return await html2canvas.default(document.body, {
    backgroundColor: null,
    scale: 1,
  });
}

// ============================================================
//   1. PIXEL DISSOLVE — random chunks jitter and fade
// ============================================================

export async function pixelDissolve(renderNewPage) {
  if (!ctx && !initCanvas()) {
    await renderNewPage();
    return;
  }

  const oldSnap = await captureScreenshot();
  await renderNewPage();
  const newSnap = await captureScreenshot();

  const cols = 40;
  const rows = 25;
  const tileW = canvas.width / cols;
  const tileH = canvas.height / rows;

  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({ x, y, delay: Math.random() * 500 });
    }
  }

  const start = performance.now();

  return new Promise((resolve) => {
    function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let finished = 0;
      for (const tile of tiles) {
        const local = t - tile.delay;
        if (local <= 0) {
          ctx.drawImage(oldSnap, tile.x * tileW, tile.y * tileH, tileW, tileH, tile.x * tileW, tile.y * tileH, tileW, tileH);
          continue;
        }
        const p = Math.min(1, local / 400);
        if (p < 1) {
          const jx = (Math.random() - 0.5) * 6 * (1 - p);
          const jy = (Math.random() - 0.5) * 6 * (1 - p);
          ctx.globalAlpha = 1 - p;
          ctx.drawImage(oldSnap, tile.x * tileW, tile.y * tileH, tileW, tileH, tile.x * tileW + jx, tile.y * tileH + jy, tileW, tileH);
          ctx.globalAlpha = p;
          ctx.drawImage(newSnap, tile.x * tileW, tile.y * tileH, tileW, tileH, tile.x * tileW, tile.y * tileH, tileW, tileH);
          ctx.globalAlpha = 1;
        } else {
          finished++;
          ctx.drawImage(newSnap, tile.x * tileW, tile.y * tileH, tileW, tileH, tile.x * tileW, tile.y * tileH, tileW, tileH);
        }
      }
      if (finished < tiles.length) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ============================================================
//   2. LOADING BAR — retro progress bar fills, then wipes
// ============================================================

export async function loadingBar(renderNewPage) {
  if (!ctx && !initCanvas()) {
    await renderNewPage();
    return;
  }

  const w = canvas.width;
  const h = canvas.height;

  // Phase 1: capture old page, render new, show loading bar
  const oldSnap = await captureScreenshot();
  await renderNewPage();
  const newSnap = await captureScreenshot();

  const barHeight = Math.max(4, h * 0.04);
  const barY = h / 2 - barHeight / 2;
  const duration = 900;
  const start = performance.now();

  return new Promise((resolve) => {
    function frame(now) {
      const t = now - start;
      const progress = Math.min(1, t / duration);

      ctx.clearRect(0, 0, w, h);

      // Draw old page
      ctx.drawImage(oldSnap, 0, 0, w, h);

      // Darken overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, w, h);

      // "LOADING..." text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(14, w * 0.018)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("LOADING...", w / 2, barY - barY * 0.3);

      // Bar background
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(w * 0.2, barY, w * 0.6, barHeight);

      // Bar fill
      const fillW = w * 0.6 * progress;
      const gradient = ctx.createLinearGradient(w * 0.2, 0, w * 0.2 + fillW, 0);
      gradient.addColorStop(0, "#ff9b69");
      gradient.addColorStop(1, "#ffcc33");
      ctx.fillStyle = gradient;
      ctx.fillRect(w * 0.2, barY, fillW, barHeight);

      // Bar border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.2, barY, w * 0.6, barHeight);

      // Percentage text
      ctx.fillStyle = "#ffffff";
      ctx.font = `${Math.max(12, w * 0.014)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${Math.floor(progress * 100)}%`, w / 2, barY + barHeight + barHeight * 1.8);

      // Phase 2: after bar full, wipe to new page
      if (progress >= 1) {
        const wipeStart = now;
        const wipeDuration = 400;

        function wipeFrame(wipeNow) {
          const wt = Math.min(1, (wipeNow - wipeStart) / wipeDuration);
          ctx.clearRect(0, 0, w, h);
          // Reveal new page from left to right
          ctx.drawImage(newSnap, 0, 0, w * wt, h, 0, 0, w * wt, h);
          // Fill remaining with old state (will be hidden)
          if (wt < 1) {
            ctx.drawImage(newSnap, w * wt, 0, w * (1 - wt), h, w * wt, 0, w * (1 - wt), h);
          }

          if (wt < 1) {
            requestAnimationFrame(wipeFrame);
          } else {
            ctx.clearRect(0, 0, w, h);
            resolve();
          }
        }
        requestAnimationFrame(wipeFrame);
        return;
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

// ============================================================
//   3. SCREEN WIPE — horizontal bar sweeps across
// ============================================================

export async function screenWipe(renderNewPage) {
  if (!ctx && !initCanvas()) {
    await renderNewPage();
    return;
  }

  const w = canvas.width;
  const h = canvas.height;

  const oldSnap = await captureScreenshot();
  await renderNewPage();
  const newSnap = await captureScreenshot();

  const barHeight = h * 0.15;
  const duration = 700;
  const start = performance.now();

  return new Promise((resolve) => {
    function frame(now) {
      const t = now - start;
      const progress = Math.min(1, t / duration);

      ctx.clearRect(0, 0, w, h);

      // Draw new page as base
      ctx.drawImage(newSnap, 0, 0, w, h);

      // Old page visible above the wipe bar
      const barY = -barHeight + (h + barHeight * 2) * progress;

      // Old page above the bar
      ctx.drawImage(oldSnap, 0, 0, w, Math.max(0, barY), 0, 0, w, Math.max(0, barY));

      // Wipe bar itself (glowing edge)
      const barGradient = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
      barGradient.addColorStop(0, "rgba(255, 155, 105, 0.0)");
      barGradient.addColorStop(0.3, "rgba(255, 155, 105, 0.9)");
      barGradient.addColorStop(0.5, "rgba(255, 204, 51, 1)");
      barGradient.addColorStop(0.7, "rgba(255, 155, 105, 0.9)");
      barGradient.addColorStop(1, "rgba(255, 155, 105, 0.0)");
      ctx.fillStyle = barGradient;
      ctx.fillRect(0, barY, w, barHeight);

      // Scanline effect on the bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let sy = barY; sy < barY + barHeight; sy += 4) {
        ctx.fillRect(0, sy, w, 2);
      }

      // Old page below the bar (if not yet wiped)
      const belowY = barY + barHeight;
      if (belowY < h) {
        ctx.drawImage(oldSnap, 0, belowY, w, h - belowY, 0, belowY, w, h - belowY);
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ============================================================
//   4. GLITCH STATIC — TV noise fills screen, clears to new
// ============================================================

export async function glitchStatic(renderNewPage) {
  if (!ctx && !initCanvas()) {
    await renderNewPage();
    return;
  }

  const w = canvas.width;
  const h = canvas.height;

  const oldSnap = await captureScreenshot();
  await renderNewPage();
  const newSnap = await captureScreenshot();

  const duration = 800;
  const start = performance.now();

  // Pre-generate static noise pattern
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = w;
  noiseCanvas.height = h;
  const nctx = noiseCanvas.getContext("2d");

  return new Promise((resolve) => {
    function frame(now) {
      const t = now - start;
      const progress = Math.min(1, t / duration);

      ctx.clearRect(0, 0, w, h);

      if (progress < 0.4) {
        // Phase 1: static noise builds up
        const noiseIntensity = progress / 0.4;

        // Generate random noise
        const imageData = nctx.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = Math.floor(noiseIntensity * 255);
        }
        nctx.putImageData(imageData, 0, 0);

        // Draw old page
        ctx.drawImage(oldSnap, 0, 0, w, h);

        // Overlay noise
        ctx.globalAlpha = noiseIntensity * 0.7;
        ctx.drawImage(noiseCanvas, 0, 0);
        ctx.globalAlpha = 1;

        // Glitch color shift lines
        if (noiseIntensity > 0.3) {
          const numLines = Math.floor(noiseIntensity * 8);
          for (let i = 0; i < numLines; i++) {
            const ly = Math.random() * h;
            const lh = Math.random() * h * 0.05 + 2;
            const shift = (Math.random() - 0.5) * 40;
            ctx.globalAlpha = 0.4;
            ctx.drawImage(oldSnap, 0, ly, w, lh, shift, ly, w, lh);
            ctx.globalAlpha = 1;
          }
        }
      } else if (progress < 0.6) {
        // Phase 2: full static (peak noise)
        const imageData = nctx.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
        nctx.putImageData(imageData, 0, 0);
        ctx.drawImage(noiseCanvas, 0, 0);

        // Horizontal glitch bands
        for (let i = 0; i < 5; i++) {
          const by = Math.random() * h;
          const bh = Math.random() * h * 0.08 + 4;
          const shift = (Math.random() - 0.5) * 80;
          ctx.globalAlpha = 0.6;
          ctx.drawImage(newSnap, 0, by, w, bh, shift, by, w, bh);
          ctx.globalAlpha = 1;
        }
      } else {
        // Phase 3: static clears, new page reveals
        const clearProgress = (progress - 0.6) / 0.4;
        const eased = 1 - Math.pow(1 - clearProgress, 3);

        // Static fading out
        const remainingNoise = 1 - eased;
        if (remainingNoise > 0) {
          const imgData = nctx.createImageData(w, h);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = Math.floor(remainingNoise * 255 * 0.5);
          }
          nctx.putImageData(imgData, 0, 0);
        }

        // New page
        ctx.drawImage(newSnap, 0, 0, w, h);

        // Fading noise overlay
        if (remainingNoise > 0) {
          ctx.globalAlpha = remainingNoise * 0.5;
          ctx.drawImage(noiseCanvas, 0, 0);
          ctx.globalAlpha = 1;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ============================================================
//   TRANSITION REGISTRY
// ============================================================

export const transitions = {
  pixel: pixelDissolve,
  loading: loadingBar,
  wipe: screenWipe,
  glitch: glitchStatic,
};

/**
 * Run the named transition, falling back to pixelDissolve.
 */
export async function runTransition(name, renderNewPage) {
  const fn = transitions[name] || transitions.pixel;
  await fn(renderNewPage);
}
