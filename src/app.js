const video = document.getElementById("camera");
const freezeCanvas = document.getElementById("freezeCanvas");
const freezeCtx = freezeCanvas.getContext("2d");
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const infoButton = document.getElementById("infoButton");
const infoPanel = document.getElementById("infoPanel");

const modeSelect = document.getElementById("modeSelect");
const reloadButton = document.getElementById("reloadButton");
const contrastButton = document.getElementById("contrastButton");

const audioButton = document.getElementById("audioButton");
const torchButton = document.getElementById("torchButton");
const freezeButton = document.getElementById("freezeButton");
const shareButton = document.getElementById("shareButton");

const zoomValues = [100, 115, 130, 150, 175, 200, 230, 260, 300, 340, 380];
const levels = document.getElementById("levels");

let videoTrack = null;
let torchOn = false;
let audioOn = true;
let frozen = false;

let mode = "normal";
let highContrast = false;
let dynamicBrightness = 1.2;
let zoomLevel = 0;

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("viewerSettings") || "{}");
  } catch {
    return {};
  }
}

function clampZoomLevel(value) {
  if (!Number.isInteger(value)) return 0;
  return Math.max(0, Math.min(zoomValues.length - 1, value));
}

const saved = loadSettings();
const allowedModes = ["normal", "invert", "mono"];

if (allowedModes.includes(saved.mode)) mode = saved.mode;
if (typeof saved.highContrast === "boolean") highContrast = saved.highContrast;
if (typeof saved.audioOn === "boolean") audioOn = saved.audioOn;
if (saved.zoomLevel !== undefined) zoomLevel = clampZoomLevel(saved.zoomLevel);

modeSelect.value = mode;
audioButton.classList.toggle("off", !audioOn);
contrastButton.classList.toggle("high", highContrast);

function save() {
  localStorage.setItem(
    "viewerSettings",
    JSON.stringify({
      mode,
      highContrast,
      audioOn,
      zoomLevel,
    }),
  );
}

function speak(text) {
  if (!audioOn) return;

  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}

/* Camera */

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        frameRate: { ideal: 24, max: 24 },
      },

      audio: false,
    });

    video.srcObject = stream;
    videoTrack = stream.getVideoTracks()[0];

    try {
      videoTrack.applyConstraints({ advanced: [{ torch: false }] });
    } catch {}

    speak("Camera ready");

    videoTrack.addEventListener("ended", () => {
      speak("Camera stopped. Please reopen the app.");
    });
  } catch {
    speak("Camera access denied");
  }
}

startCamera();

function pauseCamera() {
  if (videoTrack) videoTrack.enabled = false;
}

function resumeCamera() {
  if (videoTrack) videoTrack.enabled = true;
}

/* Freeze */

function prepareFreezeCanvas(width, height) {
  const dpr = window.devicePixelRatio || 1;

  freezeCanvas.width = Math.round(width * dpr);
  freezeCanvas.height = Math.round(height * dpr);
  freezeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  freezeCtx.clearRect(0, 0, width, height);
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

function processFrozenPixels() {
  const image = freezeCtx.getImageData(0, 0, freezeCanvas.width, freezeCanvas.height);
  const data = image.data;
  const contrastLevel = highContrast ? 3.2 : 1.35;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (mode === "invert") {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    if (mode === "mono") {
      const gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = gray;
      g = gray;
      b = gray;
    }

    r = (r - 128) * contrastLevel + 128;
    g = (g - 128) * contrastLevel + 128;
    b = (b - 128) * contrastLevel + 128;

    data[i] = clampColor(r * dynamicBrightness);
    data[i + 1] = clampColor(g * dynamicBrightness);
    data[i + 2] = clampColor(b * dynamicBrightness);
  }

  freezeCtx.putImageData(image, 0, 0);
}

function drawCurrentViewToFreezeCanvas() {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    return false;
  }

  const rect = video.getBoundingClientRect();
  const viewWidth = rect.width;
  const viewHeight = rect.height;
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const viewAspect = viewWidth / viewHeight;
  const sourceAspect = sourceWidth / sourceHeight;
  const zoom = zoomValues[zoomLevel] / 100;

  let fittedWidth;
  let fittedHeight;

  if (sourceAspect > viewAspect) {
    fittedHeight = sourceHeight;
    fittedWidth = sourceHeight * viewAspect;
  } else {
    fittedWidth = sourceWidth;
    fittedHeight = sourceWidth / viewAspect;
  }

  const cropWidth = fittedWidth / zoom;
  const cropHeight = fittedHeight / zoom;
  const sourceX = (sourceWidth - cropWidth) / 2;
  const sourceY = (sourceHeight - cropHeight) / 2;

  prepareFreezeCanvas(viewWidth, viewHeight);

  freezeCtx.drawImage(
    video,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    viewWidth,
    viewHeight,
  );

  processFrozenPixels();

  return true;
}

function showFrozenControls() {
  freezeButton.classList.add("on");
  freezeButton.style.display = "block";
  shareButton.style.display = "block";
  menuButton.style.display = "none";
  infoButton.style.display = "none";
}

function hideFrozenControls() {
  freezeButton.classList.remove("on");
  freezeButton.style.display = "none";
  shareButton.style.display = "none";
}

function freezeFrame() {
  if (!drawCurrentViewToFreezeCanvas()) return;

  video.style.display = "none";
  freezeCanvas.style.display = "block";
  pauseCamera();

  frozen = true;

  showFrozenControls();

  speak("Image frozen");
}

function unfreezeFrame() {
  resumeCamera();

  video.style.display = "block";
  freezeCanvas.style.display = "none";

  frozen = false;

  hideFrozenControls();

  speak("Image unfrozen");
}

/* Torch */

function toggleTorch() {
  if (!videoTrack) return;

  try {
    const nextTorchState = !torchOn;

    videoTrack.applyConstraints({
      advanced: [{ torch: nextTorchState }],
    });

    torchOn = nextTorchState;

    torchButton.classList.toggle("off", !torchOn);

    speak(torchOn ? "Torch on" : "Torch off");
  } catch {
    speak("Torch unavailable");
  }
}

/* Zoom */

function applyZoom(i) {
  zoomLevel = i;

  document.querySelectorAll(".level").forEach((el, index) => {
    el.classList.toggle("active", index <= i);
  });

  video.style.transform = `scale(${zoomValues[i] / 100})`;
}

function setZoom(i) {
  applyZoom(i);

  speak("Zoom " + i);

  save();
}

/* Filters */

function applyFilters() {
  const contrastLevel = highContrast ? 3.2 : 1.35;

  let filter = `contrast(${contrastLevel}) brightness(${dynamicBrightness})`;

  if (mode === "invert") filter = "invert(1) " + filter;
  if (mode === "mono") filter = "grayscale(1) " + filter;

  video.style.filter = filter;
}

/* Brightness */

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 32;
canvas.height = 32;

let lastBrightness = 0;

function analyseBrightness() {
  if (video.readyState < 2) return;

  ctx.drawImage(video, 0, 0, 32, 32);

  const d = ctx.getImageData(0, 0, 32, 32).data;

  let total = 0;

  for (let i = 0; i < d.length; i += 4) {
    total += d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
  }

  const avg = total / (d.length / 4);

  if (Math.abs(avg - lastBrightness) < 10) return;

  lastBrightness = avg;

  dynamicBrightness = avg < 80 ? 1.5 : 1.2;

  applyFilters();
}

setInterval(analyseBrightness, 3000);

/* Events */

freezeButton.onclick = (e) => {
  e.stopPropagation();

  if (frozen) {
    unfreezeFrame();
  } else {
    freezeFrame();
  }
};

shareButton.onclick = (e) => {
  e.stopPropagation();

  speak("Share pressed");

  freezeCanvas.toBlob(async (blob) => {
    if (!blob) {
      speak("Image not ready");
      return;
    }

    const file = new File([blob], "simple-camera-viewer-freeze.png", {
      type: "image/png",
    });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Simple Camera Viewer freeze" });
      } else if (navigator.share) {
        speak("Image sharing not supported");
      }
    } catch {}
  }, "image/png");
};

torchButton.onclick = (e) => {
  e.stopPropagation();
  toggleTorch();
};

audioButton.onclick = (e) => {
  e.stopPropagation();

  if (audioOn) {
    speak("Audio off");
    audioOn = false;
  } else {
    audioOn = true;
    speak("Audio on");
  }

  audioButton.classList.toggle("off", !audioOn);

  save();
};

zoomValues.forEach((z, i) => {
  const b = document.createElement("div");
  b.className = "level";
  b.textContent = i;
  b.onclick = (e) => {
    e.stopPropagation();
    setZoom(i);
  };
  levels.appendChild(b);
});

applyZoom(zoomLevel);

modeSelect.onchange = () => {
  mode = modeSelect.value;
  speak(modeSelect.options[modeSelect.selectedIndex].text + " mode");
  applyFilters();
  save();
};

contrastButton.onclick = (e) => {
  e.stopPropagation();

  highContrast = !highContrast;

  contrastButton.classList.toggle("high", highContrast);

  speak(highContrast ? "High contrast on" : "High contrast off");

  applyFilters();
  save();
};

menuButton.onclick = (e) => {
  e.stopPropagation();

  const open = menu.style.display === "block";

  if (open) {
    menu.style.display = "none";
    menuButton.textContent = "OPTIONS";

    resumeCamera();

    menuButton.style.display = "none";
    infoButton.style.display = "none";
    freezeButton.style.display = "none";

    speak("Resume camera view");
  } else {
    menu.style.display = "block";
    menuButton.textContent = "RESUME";

    infoButton.style.display = "none";
    freezeButton.style.display = "none";

    pauseCamera();

    speak("Options menu");
  }
};

infoButton.onclick = (e) => {
  e.stopPropagation();

  const open = infoPanel.style.display === "block";

  if (open) {
    infoPanel.style.display = "none";
    infoButton.textContent = "INFO";

    resumeCamera();

    menuButton.style.display = "block";
    freezeButton.style.display = "block";

    speak("Information closed");
  } else {
    infoPanel.style.display = "block";
    infoButton.textContent = "CLOSE";

    menuButton.style.display = "none";
    freezeButton.style.display = "none";

    pauseCamera();

    speak("Information open");
  }
};

reloadButton.onclick = (e) => {
  e.stopPropagation();

  speak("Reloading app in three seconds");

  setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("reload", Date.now());
    window.location.href = url.toString();
  }, 3000);
};

document.body.addEventListener("click", () => {
  if (frozen) return;

  if (menu.style.display !== "block" && infoPanel.style.display !== "block") {
    menuButton.style.display = "block";
    infoButton.style.display = "block";
    freezeButton.style.display = "block";
  }
});

applyFilters();
