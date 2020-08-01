import { DEBUG_SOUND } from "./constants.js";

// Canvas
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.style.cursor = "default";
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;
context.imageSmoothingEnabled = false;

// Sound
const debugSound = new Audio(DEBUG_SOUND);

debugSound.volume = 0.2;

//FPS label
const fpsLabel = document.getElementById("fps-label");

export { canvas, context, debugSound, fpsLabel }