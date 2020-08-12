import { DEBUG_SOUND } from "./constants.js";

// Canvas
const canvas = document.getElementById("canvas");
canvas.width = 400;
const context = canvas.getContext("2d", { alpha: false });
context.lineWidth = 1;
context.imageSmoothingEnabled = false;

// Sound
const debugSound = new Audio(DEBUG_SOUND);

debugSound.volume = 0.2;

//FPS label
const fpsLabel = document.getElementById("fps-label");

// Rendering settings
const maxTransparency = 10;

const drawDistance = 50;

const tintStrength = 0.4;

const fogStartDistance = 20;

const maxHorizonSkew = 80;

// Minimap settings

const minimapOffset = 50;
const minimapCellSize = 4;
const minimapObjectSize = 1.5;
const minimapFovSize = 15;
const minimapFloorColor = 'lightgrey';

export { canvas, context, debugSound, fpsLabel, maxTransparency, drawDistance, tintStrength, fogStartDistance, maxHorizonSkew, minimapOffset, minimapCellSize, minimapObjectSize, minimapFovSize, minimapFloorColor }