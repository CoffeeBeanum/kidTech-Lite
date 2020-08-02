import { DEBUG_SOUND } from "./constants.js";

// Canvas
const finalCanvas = document.getElementById("canvas");
const finalContext = finalCanvas.getContext("2d", { alpha: false });
finalCanvas.style.cursor = "default";
finalContext.canvas.width = window.innerWidth;
finalContext.canvas.height = window.innerHeight;
finalContext.imageSmoothingEnabled = false;

// Offscreen canvas
const canvas = new OffscreenCanvas(300, 300);
const context = canvas.getContext("2d", { alpha: false });
context.lineWidth = 1;
context.imageSmoothingEnabled = false;

// Sound
const debugSound = new Audio(DEBUG_SOUND);

debugSound.volume = 0.2;

//FPS label
const fpsLabel = document.getElementById("fps-label");

export { canvas, context, finalCanvas, finalContext, debugSound, fpsLabel }