/**
 * content.js
 * Script de conteúdo para a extensão Chrome Gemini.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "INIT_CROP") {
    initCrop();
  }
});

function initCrop() {
  if (document.getElementById("gemini-crop-overlay")) return; // Previne duplicatas
  if (!document.body) return;

  document.body.style.cursor = "crosshair";

  const overlay = document.createElement("div");
  overlay.id = "gemini-crop-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: "2147483647",
  });
  document.body.appendChild(overlay);

  let startX, startY;
  const selection = document.createElement("div");
  Object.assign(selection.style, {
    border: "2px dashed #fff",
    position: "fixed",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  });
  overlay.appendChild(selection);

  function onMouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    Object.assign(selection.style, {
      left: startX + "px",
      top: startY + "px",
      width: "0px",
      height: "0px",
    });
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    const currentX = e.clientX;
    const currentY = e.clientY;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);
    Object.assign(selection.style, {
      width: width + "px",
      height: height + "px",
      left: left + "px",
      top: top + "px",
    });
  }

  function onMouseUp(e) {
    overlay.removeEventListener("mousemove", onMouseMove);
    overlay.removeEventListener("mouseup", onMouseUp);
    overlay.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("keydown", onKeyDown);
    const rect = selection.getBoundingClientRect();
    document.body.removeChild(overlay);
    document.body.style.cursor = "default";

    if (rect.width > 0 && rect.height > 0) {
      // Aguarda o repaint para garantir que o overlay sumiu antes de capturar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chrome.runtime.sendMessage({
            type: "CROP_DATA",
            data: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
              devicePixelRatio: window.devicePixelRatio,
            },
          });
        });
      });
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      overlay.removeEventListener("mousemove", onMouseMove);
      overlay.removeEventListener("mouseup", onMouseUp);
      overlay.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      document.body.style.cursor = "default";
    }
  }

  overlay.addEventListener("mousedown", onMouseDown);
  document.addEventListener("keydown", onKeyDown);
}
