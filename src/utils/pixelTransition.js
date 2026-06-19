let canvas, ctx;

const cols = 40;
const rows = 25;

function init() {
  canvas = document.getElementById("pixel-transition-canvas");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  resize();

  window.addEventListener("resize", resize);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* SCREEN CAPTURE */
async function capture() {
  const html2canvas = await import("https://cdn.skypack.dev/html2canvas");

  return await html2canvas.default(document.body, {
    backgroundColor: null,
    scale: 1
  });
}

/* MAIN TRANSITION */
export async function pixelChunkTransition(renderNewPage) {
  if (!ctx) init();

  const oldSnap = await capture();

  await renderNewPage();

  const newSnap = await capture();

  const tileW = canvas.width / cols;
  const tileH = canvas.height / rows;

  const tiles = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({
        x,
        y,
        delay: Math.random() * 500
      });
    }
  }

  const start = performance.now();

  function frame(now) {
    const t = now - start;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let finished = 0;

    for (const tile of tiles) {
      const local = t - tile.delay;

      if (local <= 0) {
        ctx.drawImage(
          oldSnap,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH
        );
        continue;
      }

      const p = Math.min(1, local / 400);

      if (p < 1) {
        const jx = (Math.random() - 0.5) * 6 * (1 - p);
        const jy = (Math.random() - 0.5) * 6 * (1 - p);

        ctx.globalAlpha = 1 - p;
        ctx.drawImage(
          oldSnap,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH,
          tile.x * tileW + jx,
          tile.y * tileH + jy,
          tileW,
          tileH
        );

        ctx.globalAlpha = p;
        ctx.drawImage(
          newSnap,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH
        );

        ctx.globalAlpha = 1;
      } else {
        finished++;

        ctx.drawImage(
          newSnap,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH,
          tile.x * tileW,
          tile.y * tileH,
          tileW,
          tileH
        );
      }
    }

    if (finished < tiles.length) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
}