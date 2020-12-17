import { DEBUG_SOUND } from "./constants.js";

// Canvas
const canvas = document.getElementById("canvas");
canvas.width = 400;
const context = canvas.getContext("2d", { alpha: false });
context.lineWidth = 1;
context.imageSmoothingEnabled = false;

// UI Canvas
const uiScaleFactor = 2;
const uiCanvas = document.getElementById("uiCanvas");
uiCanvas.width = canvas.width * uiScaleFactor;
const uiContext = uiCanvas.getContext("2d");
uiContext.lineWidth = 1;

//Labels
const debugLabel = document.getElementById("fps-label");
const changelogLabel = document.getElementById("changelog-label");

// Rendering settings
const drawDistance = 50;

const fogTintStrength = 0.4;
const fogStartDistance = 20;

const maxHorizonSkew = 120;

// Minimap settings
const minimapOffset = 50;
const minimapCellSize = 4;
const minimapObjectSize = 1.5;
const minimapFovSize = 15;

export { canvas, context, uiCanvas, uiContext, uiScaleFactor, debugLabel, changelogLabel, drawDistance, fogTintStrength, fogStartDistance, maxHorizonSkew, minimapOffset, minimapCellSize, minimapObjectSize, minimapFovSize }
