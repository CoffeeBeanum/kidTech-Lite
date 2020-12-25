// Canvas
const canvas = document.getElementById('canvas');
canvas.width = 400;
const context = canvas.getContext('2d', { alpha: false });
context.lineWidth = 1;

const uiScaleFactor = 2;

// Label canvas
const labelCanvas = document.getElementById('label-canvas');
labelCanvas.width = canvas.width * uiScaleFactor;
const labelContext = labelCanvas.getContext('2d');
labelContext.lineWidth = 1;

// UI canvas
const uiCanvas = document.getElementById('ui-canvas');
uiCanvas.width = canvas.width * uiScaleFactor;
const uiContext = uiCanvas.getContext('2d');
uiContext.lineWidth = 1;
uiContext.imageSmoothingEnabled = false;

//Labels
const debugLabel = document.getElementById('fps-label');
const secondaryInfoContainer = document.getElementById('secondary-info-container');

// Rendering settings
const drawDistance = 100;
const maxHorizonSkew = 120;

// Minimap settings
const minimapOffset = 50;
const minimapCellSize = 5;
const minimapObjectSize = 1.5;
const minimapFovSize = 15;

// Player settings
const playerMaxSpeed = 0.3;
const playerAcceleration = 0.001;
const playerFriction = 1.2;
const playerSize = 0.3;
const playerInteractionRange = 0.5;

// View Model settings
const viewModelSizeRatio = 0.2;
const viewModelBobAmplitude = 1000;
const viewModelBobSpeed = 0.005;
const viewModelLightFactor = 50;

// Camera settings
const cameraMouseSensitivity = 0.2;
const cameraArrowsSensitivity = 0.15;
const fovFactor = 2.14;

export { 
    canvas, context, uiCanvas, uiContext, labelCanvas, labelContext, uiScaleFactor, 
    debugLabel, secondaryInfoContainer, 
    drawDistance, maxHorizonSkew, 
    minimapOffset, minimapCellSize, minimapObjectSize, minimapFovSize,
    playerMaxSpeed, playerAcceleration, playerFriction, playerSize, playerInteractionRange,
    viewModelSizeRatio, viewModelBobAmplitude, viewModelBobSpeed, viewModelLightFactor,
    cameraMouseSensitivity, cameraArrowsSensitivity, fovFactor
}
