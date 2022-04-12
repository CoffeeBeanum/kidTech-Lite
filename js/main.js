import { piRatio, radians90Deg } from './constants.js'
import { world, faceToVertices } from './world.js'
import { 
    context, canvas, uiContext, uiCanvas, labelContext, labelCanvas, uiScaleFactor, 
    debugContainer, debugPerformanceLabel, debugStateLabel, secondaryInfoContainer, 
    probe1, probe2, probe3, probe4, probe5, probe6, probe7, 
    drawDistance, maxHorizonSkew, 
    minimapOffset, minimapCellSize, minimapObjectSize, minimapFovSize,
    playerMaxSpeed, playerAcceleration, playerFriction, playerSize, playerInteractionRange,
    viewModelSizeRatio, viewModelBobAmplitude, viewModelBobSpeed, viewModelLightFactor,
    cameraMouseSensitivity, cameraArrowsSensitivity, fovFactor
} from './gameSettings.js'
import { tintImage } from './utils/tint.js'

// System lets
let frameStart;
let frameEnd;

let probeCompute;
let probePrepareFrame;
let probeRenderFloor;
let probePrepareRaycast;
let probeRenderRaycast;
let probeRenderUI;

let currentTime;
let deltaTime;
let lastTime = performance.now();

let animationFrameCounter = performance.now();

let debugMonitorCounter = 0;
let debugMonitorTimeout = 100;

let performanceProbe = 0;

let gameState = 0;

let slowLoad = false;

// Player object
function Player() {
    this.x = 12;
    this.y = 6;
    this.rotation = 150;
    this.speedX = 0;
    this.speedY = 0;
    this.currentWeapon = null;
}

let thisPlayer = new Player();

// Game object
// function GameObject(name, x, y, rotation, type, solid) {
//     this.name = name;
//     this.x = x;
//     this.y = y;
//     this.rotation = rotation;
//     this.type = type;
//     this.solid = solid;
//     this.distance = 0;
//     this.relativeAngle = 0;
// }

// Ray object
function Ray(x, y, dirX, dirY) {
    this.x = x; // ray coords
    this.y = y;
    this.dirX = dirX; // ray direction
    this.dirY = dirY;
    this.offX = 0; // ray offset to next side
    this.offY = 0;
    this.deltaX = 0; // ray length from side to side
    this.deltaY = 0;
    this.stepX = 0; // ray step direction
    this.stepY = 0;
    this.hit = 0; // type of wall ray hit
    this.backward = false;
    this.done = false;
    this.side = 0; // side of the wall ray hit
    this.sector = 0; // sector of wall ray hit
    this.coordJumps = [];
    this.face = 0;
}

function ProcessedRay(onScreenX, cell, textureX, side, distance, onScreenSize, face) {
    this.onScreenX = onScreenX; // onscreen position
    this.cell = cell; // texture index
    this.textureX = textureX; // position on texture
    this.side = side; // side of the wall ray hit
    this.distance = distance; // ray length
    this.onScreenSize = onScreenSize; // ray size on screen
    this.face = face;
}

// Key states
function ControlState() {
    this.moveForward = false;
    this.moveLeft = false;
    this.moveBackward = false;
    this.moveRight = false;
    this.showMap = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.lookUp = false;
    this.lookDown = false;
    this.use = false;
    this.useCooldown = false;
    this.shoot = false;
    this.shootCooldown = false;
    this.info = true;
    this.debug = true;
    this.perspective = false;
    this.noclip = false;
    this.viewModel = {'texture': getViewModel(0), 'bobFactor': 0, 'bobCounter': 0};
}

let currentControlState = new ControlState();

// Drawing lets
function Point(x, y) {
    this.x = x;
    this.y = y;
}

let buffer;

let screenRatio = canvas.height / canvas.width;

let canvasHalfHeight = canvas.height / 2;
let canvasHalfWidth = canvas.width / 2;
let horizon = canvasHalfHeight;

let uiCanvasHalfWidth = uiCanvas.width / 2;

let frame = context.createImageData(canvas.width, canvas.height);

// Drawing funcs
function drawScene() {
    labelContext.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    uiContext.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    drawSkybox();

    drawFrame();

    drawUI();
}

function drawSkybox() {
    const canvasWidthFactor = canvas.width / 360;
    const playerRotationFactor = thisPlayer.rotation * 2;
    const skyboxWidthFactor = canvasWidthFactor * playerRotationFactor;
    const canvasDoubleWidth = canvas.width * 2;
    const horizonLowerLimit = canvas.height + maxHorizonSkew * 2;
    const horizonUpperLimit = Math.floor(-maxHorizonSkew + horizon - canvasHalfHeight);

    context.drawImage(skybox, Math.floor(-skyboxWidthFactor),                    horizonUpperLimit, canvasDoubleWidth, horizonLowerLimit);
    context.drawImage(skybox, Math.floor(canvasDoubleWidth - skyboxWidthFactor), horizonUpperLimit, canvasDoubleWidth, horizonLowerLimit);
}

function drawFrame() {
    frame = context.getImageData(0, 0, canvas.width + 1, canvas.height);

    // DEBUG PROBE
    if (currentControlState.debug) { probePrepareFrame = performance.now(); }

    drawFloorFrame();

    // DEBUG PROBE
    if (currentControlState.debug) { probeRenderFloor = performance.now(); }

    prepareWallFrame();
    prepareObjects();

    // DEBUG PROBE
    if (currentControlState.debug) { probePrepareRaycast = performance.now(); }

    processBuffer();

    context.putImageData(frame, 0, 0);
}

function drawFloorFrame() {
    let relativeRayAngle0 = calculateRelativeRayAngle(0);
    let relativeRayAngle1 = calculateRelativeRayAngle(canvas.width);

    // Create ray, calculate it's position and direction
    let ray0 = new Ray(
        Math.floor(thisPlayer.x),
        Math.floor(thisPlayer.y),
        Math.cos((thisPlayer.rotation + relativeRayAngle0) * piRatio),
        Math.sin((thisPlayer.rotation + relativeRayAngle0) * piRatio)
    );
    let ray1 = new Ray(
        Math.floor(thisPlayer.x),
        Math.floor(thisPlayer.y),
        Math.cos((thisPlayer.rotation + relativeRayAngle1) * piRatio),
        Math.sin((thisPlayer.rotation + relativeRayAngle1) * piRatio)
    );

    calculateRayDirection(ray0);
    calculateRayDirection(ray1);
    
    let posZ = 0.325 * canvas.height / screenRatio;

    for (let onScreenY = 0; onScreenY < canvas.height; onScreenY++) {
        drawFloorScanLine(onScreenY, ray0, ray1, posZ);
    }
}

function drawFloorScanLine(onScreenY, ray0, ray1, posZ) {
    let p = Math.abs(onScreenY - horizon + 1);
    let rowDistance = posZ / p;

    let stepFactor = rowDistance / canvas.width;

    let floorStepX = stepFactor * (ray1.dirX - ray0.dirX);
    let floorStepY = stepFactor * (ray1.dirY - ray0.dirY);

    let floorX = thisPlayer.x + rowDistance * ray0.dirX;
    let floorY = thisPlayer.y + rowDistance * ray0.dirY;

    for (let onScreenX = 0; onScreenX < canvas.width; onScreenX++) {
        let cellX = Math.floor(floorX);
        let cellY = Math.floor(floorY);

        let offsetX = floorX - cellX;
        let offsetY = floorY - cellY;

        if (cellY >= 0 && cellX >= 0 && cellY < world.height && cellX < world.width) {

            // Draw floor
            let cell = getWorldCell(cellX, cellY);

            let floor = cell.floor
            if (onScreenY > horizon && floor > 0) {
                let textureFrames = getTexture(floor);

                let textureFrame = 0;
                if (textureFrames.frames > 1) textureFrame = Math.floor(animationFrameCounter * textureFrames.speed) % textureFrames.frames;

                let texture = textureFrames[textureFrame];

                if (texture !== undefined && texture.width !== undefined) drawFloorPixel(texture, onScreenX, onScreenY, offsetX, offsetY, cell);
            }

            // Draw ceiling
            let ceiling = cell.ceiling
            if (onScreenY < horizon && ceiling > 0) {
                let textureFrames = getTexture(ceiling);

                let textureFrame = 0;
                if (textureFrames.frames > 1) textureFrame = Math.floor(animationFrameCounter * textureFrames.speed) % textureFrames.frames;

                let texture = textureFrames[textureFrame];
                
                if (texture !== undefined && texture.width !== undefined) drawFloorPixel(texture, onScreenX, onScreenY, offsetX, offsetY, cell);
            }
        }
        
        floorX += floorStepX;
        floorY += floorStepY;
    }
}

function drawFloorPixel(texture, onScreenX, onScreenY, offsetX, offsetY, cell) {
    let textureX = Math.floor(texture.width * offsetX);
    let textureY = Math.floor(texture.height * offsetY);

    let canvasIndex = Math.floor((canvas.width + 1) * onScreenY + onScreenX) * 4;
    let textureIndex = Math.floor(texture.width * textureY + textureX) * 4;
    
    let [finalR, finalG, finalB, finalA] = texture.material(textureIndex);

    let alpha = finalA / 255;
        
    // Don't draw if resulting alpha is 0
    if (alpha > 0) {
        // Apply lighting
        if (cell.lightmap.uniform) {
            finalR *= cell.lightmap.average.r;
            finalG *= cell.lightmap.average.g;
            finalB *= cell.lightmap.average.b;
        } else {
            let inverseOffsetX = (1 - offsetX);
            let inverseOffsetY = (1 - offsetY);
            let offsetiXiY = inverseOffsetX * inverseOffsetY;
            let offsetXiY = offsetX * inverseOffsetY;
            let offsetXY = offsetX * offsetY;
            let offsetiXY = inverseOffsetX * offsetY;
            
            let lightmap0 = cell.lightmap[0];
            let lightmap1 = cell.lightmap[1];
            let lightmap2 = cell.lightmap[2];
            let lightmap3 = cell.lightmap[3];

            finalR *= (
                lightmap0.r * offsetiXiY +
                lightmap1.r * offsetXiY +
                lightmap2.r * offsetXY +
                lightmap3.r * offsetiXY
            );
            finalG *= (
                lightmap0.g * offsetiXiY +
                lightmap1.g * offsetXiY +
                lightmap2.g * offsetXY +
                lightmap3.g * offsetiXY
            );
            finalB *= (
                lightmap0.b * offsetiXiY +
                lightmap1.b * offsetXiY +
                lightmap2.b * offsetXY +
                lightmap3.b * offsetiXY
            );
        }

        // Don't blend if alpha is 1
        if (alpha < 1) {
            let inverseAlpha = 1 - alpha;

            finalR = finalR * alpha + frame.data[canvasIndex] * inverseAlpha;
            finalG = finalG * alpha + frame.data[canvasIndex + 1] * inverseAlpha;
            finalB = finalB * alpha + frame.data[canvasIndex + 2] * inverseAlpha;
        }

        frame.data[canvasIndex] = Math.floor(finalR);
        frame.data[canvasIndex + 1] = Math.floor(finalG);
        frame.data[canvasIndex + 2] = Math.floor(finalB);
    }
}

function prepareWallFrame() {
    buffer = [];

    // Prepare all wall rays
    for (let onScreenX = 0; onScreenX <= canvas.width; onScreenX++) {
        calculateScanLine(onScreenX);
    }
}

function prepareObjects() {
    // Prepare all objects
    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];
        let relativeAngle = Math.atan2(object.y - thisPlayer.y, object.x - thisPlayer.x) * 180 / Math.PI - thisPlayer.rotation;
        if (relativeAngle <= -360) relativeAngle += 360;
        relativeAngle *= -1;

        if ((relativeAngle >= 0 && relativeAngle <= 70) || (relativeAngle >= 290 && relativeAngle <= 360) ||
            (relativeAngle <= 0 && relativeAngle >= -70) || (relativeAngle <= -290 && relativeAngle >= -360)) {

            object.relativeAngle = relativeAngle;
            object.distance = Math.abs(Math.sqrt(Math.pow(object.x - thisPlayer.x, 2) + Math.pow(object.y - thisPlayer.y, 2)));

            buffer.push(object);
        }
    }
}

function calculateScanLine(onScreenX) {
    let x = calculateRelativeRayAngle(onScreenX);

    // Create ray, calculate it's position and direction
    let ray = new Ray(
        Math.floor(thisPlayer.x),
        Math.floor(thisPlayer.y),
        Math.cos((thisPlayer.rotation + x) * piRatio),
        Math.sin((thisPlayer.rotation + x) * piRatio)
    );

    calculateRayDirection(ray);

    performRaycast(ray, x, onScreenX, 0);
}

function calculateRelativeRayAngle(onScreenX) {
    return Math.atan((onScreenX - canvasHalfWidth) / (canvas.width / fovFactor)) * 180 / Math.PI;
}

function calculateRayDirection(ray) {
    ray.deltaX = Math.abs(1 / ray.dirX);
    ray.deltaY = Math.abs(1 / ray.dirY);

    // Calculate ray's step and initial offset
    if (ray.dirX < 0) {
        ray.stepX = -1;
        ray.offX = (thisPlayer.x - ray.x) * ray.deltaX;
    } else {
        ray.stepX = 1;
        ray.offX = (ray.x + 1.0 - thisPlayer.x) * ray.deltaX;
    }
    if (ray.dirY < 0) {
        ray.stepY = -1;
        ray.offY = (thisPlayer.y - ray.y) * ray.deltaY;
    } else {
        ray.stepY = 1;
        ray.offY = (ray.y + 1.0 - thisPlayer.y) * ray.deltaY;
    }
}

function performRaycast(ray, x, onScreenX) {
    let iterations = 0;

    while (!ray.done && iterations < drawDistance) {
        iterations++;

        // Check if ray is in world bounds
        if (ray.y < 0 || ray.y >= world.height) break;
        if (ray.x < 0 || ray.x >= world.width) break;

        let cell = getWorldCell(ray.x, ray.y);

        // Check if ray has hit a wall
        if (cell.wall > 0) {
            // Portal check
            if (cell.portal != null) {
                ray.coordJumps.push(new Point(ray.x, ray.y));
                ray.x += cell.portal.x;
                ray.y += cell.portal.y;
                ray.coordJumps.push(new Point(ray.x, ray.y));
                continue;
            }
            
            if (cell.transparent) {
                let skipHit = (ray.hit != null && ray.hit.mergeable) ? cell.wall === ray.hit.wall : false;
                ray.hit = cell;
                if (iterations > 1 && !skipHit) rayHit(ray, x, onScreenX);
                performBackwardsRaycast(ray, x, onScreenX);
            } else {
                ray.hit = cell;
                rayHit(ray, x, onScreenX);
                ray.done = true;
            }
        } else {
            ray.hit = null;
        }

        // Jump to next map square in x-direction or in y-direction
        if (ray.offX < ray.offY) {
            ray.offX += ray.deltaX;
            ray.x += ray.stepX;
            ray.side = 0;
        } else {
            ray.offY += ray.deltaY;
            ray.y += ray.stepY;
            ray.side = 1;
        }
    }
}

// Launches a simple, one-step, fixed block type raycast in given rays opposite direction (used to draw other side of transparent blocks).
function performBackwardsRaycast(refRay, x, onScreenX) {
    let ray = { ...refRay };

    // Check if next visible block is of the same type - stop raycast if it is
    if (ray.offX < ray.offY) {
        ray.offX += ray.deltaX;
        ray.x += ray.stepX;
        ray.side = 0;
    } else {
        ray.offY += ray.deltaY;
        ray.y += ray.stepY;
        ray.side = 1;
    }

    // Check if ray is within world bounds
    if (ray.y < 0 || ray.y > world.height - 1) return;
    if (ray.x < 0 || ray.x > world.width - 1) return;

    // Check if ray has hit a wall
    if (getWorldCell(ray.x, ray.y).wall === ray.hit.wall) return;

    ray = { ...refRay };

    ray.dirX *= -1;
    ray.dirY *= -1;

    if (ray.offX < ray.offY) ray.side = 0;
    else                     ray.side = 1;

    calculateRayDirection(ray);
    
    // Check if ray is in world bounds
    if (ray.y < 0 || ray.y > world.height - 1) return;
    if (ray.x < 0 || ray.x > world.width - 1) return;

    // Check if ray has hit a wall
    if (getWorldCell(ray.x, ray.y).wall === ray.hit.wall) {
        ray.backward = true;
        rayHit(ray, x, onScreenX);
    }
}

function rayHit(ray, x, onScreenX) {
    let correction = Math.cos(x * piRatio);
    let perpWallDist;

    let jumps = ray.coordJumps.length;

    let modifierX = 0, modifierY = 0;
    if (ray.dirX < 0) modifierX = 1;
    if (ray.dirY < 0) modifierY = 1;

    if (ray.side > 0) {
        if (ray.dirY > 0) ray.face = 1;
        else              ray.face = 3;
    } else {
        if (ray.dirX > 0) ray.face = 0;
        else              ray.face = 2;
    }

    // Reverse ray direction if backwards cast (fixes portal transitions)
    if (ray.backward) {
        ray.x += ray.stepX * 0.00001;
        ray.y += ray.stepY * 0.00001;

        ray.dirX *= -1;
        ray.dirY *= -1;
    }

    if (jumps === 0) {
        if (ray.side === 0) perpWallDist = (ray.x - thisPlayer.x + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist = (ray.y - thisPlayer.y + (1 - ray.stepY) / 2) / ray.dirY;
    } else {
        if (ray.side === 0) perpWallDist = (ray.coordJumps[0].x - thisPlayer.x + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist = (ray.coordJumps[0].y - thisPlayer.y + (1 - ray.stepY) / 2) / ray.dirY;

        for (let i = 1; i < jumps - 1; i++) {
            if (ray.side === 0) perpWallDist += (ray.coordJumps[i + 1].x - ray.coordJumps[i].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
            else perpWallDist += (ray.coordJumps[i + 1].y - ray.coordJumps[i].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
            i++;
        }

        if (ray.side === 0) perpWallDist += (ray.x - ray.coordJumps[jumps - 1].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist += (ray.y - ray.coordJumps[jumps - 1].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
    }

    // Calculate height of line to draw on screen
    let lineHeight = canvas.height / perpWallDist / screenRatio / 2.25 / correction;

    if (lineHeight > 0) {
        // Calculate value of wallX
        if (ray.side === 0) ray.sector = thisPlayer.y + perpWallDist * ray.dirY;
        else ray.sector = thisPlayer.x + perpWallDist * ray.dirX;
        ray.sector -= Math.floor((ray.sector));

        // X coordinate on the texture
        let textureX = ray.sector;
        if (ray.side === 0 && ray.dirX < 0) textureX = 1 - textureX;
        if (ray.side === 1 && ray.dirY > 0) textureX = 1 - textureX;
        if (ray.backward) textureX = 1 - textureX;

        let processedRay = new ProcessedRay(onScreenX, ray.hit, textureX, ray.side, Math.abs(perpWallDist), lineHeight, ray.face);

        buffer.push(processedRay);
    }
}

function processBuffer() {
    buffer.sort(function (a, b) {
        return b.distance - a.distance;
    });

    for (let i = 0, limit = buffer.length; i < limit; i++) {
        let temp = buffer[i];
        if (temp instanceof ProcessedRay) drawScanLine(temp);
        else drawObject(temp);
    }
    
    // DEBUG PROBE
    if (currentControlState.debug) { probeRenderRaycast = performance.now(); }
}

function drawScanLine(ray) {

    let textureFrames = getTexture(ray.cell.wall);

    let textureFrame = 0;

    if (textureFrames.frames > 1) textureFrame = Math.floor(animationFrameCounter * textureFrames.speed) % textureFrames.frames;

    let texture = textureFrames[textureFrame];

    let textureX = Math.floor(ray.textureX * texture.width);

    let halfScreenSize = ray.onScreenSize / 2;

    let scanStartY = Math.floor(horizon - halfScreenSize);
    let scanEndY = Math.floor(horizon + halfScreenSize);

    // Discard offscreen values
    if (scanStartY < 0) scanStartY = 0;
    if (scanEndY > canvas.height) scanEndY = canvas.height;

    for (let onScreenY = scanStartY; onScreenY < scanEndY; onScreenY++) {
        let textureY = Math.ceil(onScreenY - horizon + halfScreenSize) / ray.onScreenSize;

        // Get imageData array indexes
        let canvasIndex = Math.floor((canvas.width + 1) * onScreenY + ray.onScreenX) * 4;
        let textureIndex = Math.floor(texture.width * Math.floor(textureY * texture.height) + textureX) * 4;

        let [finalR, finalG, finalB, finalA] = texture.material(textureIndex);

        // Draw decal if present
        if (ray.cell.decals.length > 0) {
            for (let i = 0; i < ray.cell.decals.length; i++) {
                let decalObject = ray.cell.decals[i];
                if (decalObject.face === undefined || decalObject.face === ray.face) {
                    let decal = getDecal(ray.cell.decals[i].type);

                    // Don't draw if decal hasn't loaded yet
                    if (decal !== undefined && decal.width !== undefined) {
                        let textureX = Math.floor(ray.textureX * decal.width);

                        let decalIndex = Math.floor(decal.width * Math.floor(textureY * decal.height) + textureX) * 4;

                        let decalA = decal.data[decalIndex + 3];

                        // Don't draw if invisible
                        if (decalA > 0) {
                            
                            let decalR = decal.data[decalIndex];
                            let decalG = decal.data[decalIndex + 1];
                            let decalB = decal.data[decalIndex + 2];

                            let alpha = decal.data[decalIndex + 3] / 255;

                            // Don't blend if resulting alpha is 1
                            if (alpha < 1) {
                                let inverseAlpha = 1 - alpha;

                                finalR = decalR * alpha + finalR * inverseAlpha;
                                finalG = decalG * alpha + finalG * inverseAlpha;
                                finalB = decalB * alpha + finalB * inverseAlpha;
                                finalA += decalA * alpha;
                                if (finalA > 255) finalA = 255;
                            } else {
                                finalR = Math.floor(decalR);
                                finalG = Math.floor(decalG);
                                finalB = Math.floor(decalB);
                                finalA = 255;
                            }
                        }
                    }
                }
            }
        }

        
        // Don't draw if invisible
        if (finalA > 0) {
            let alpha = finalA / 255;

            // Apply lighting
            let faceVertices = faceToVertices(ray.face);

            if (ray.cell.lightmap.uniform) {
                finalR *= ray.cell.lightmap.average.r;
                finalG *= ray.cell.lightmap.average.g;
                finalB *= ray.cell.lightmap.average.b;
            } else {
                let inverseTextureX = (1 - ray.textureX);

                let lightmapVertice0 = ray.cell.lightmap[faceVertices[0]];
                let lightmapVertice1 = ray.cell.lightmap[faceVertices[1]];

                finalR *= lightmapVertice0.r * ray.textureX + lightmapVertice1.r * inverseTextureX;
                finalG *= lightmapVertice0.g * ray.textureX + lightmapVertice1.g * inverseTextureX;
                finalB *= lightmapVertice0.b * ray.textureX + lightmapVertice1.b * inverseTextureX;
            }

            // Don't blend if opaque
            if (alpha < 1) {
                let inverseAlpha = 1 - alpha;

                finalR = finalR * alpha + frame.data[canvasIndex] * inverseAlpha;
                finalG = finalG * alpha + frame.data[canvasIndex + 1] * inverseAlpha;
                finalB = finalB * alpha + frame.data[canvasIndex + 2] * inverseAlpha;
            }

            frame.data[canvasIndex] = Math.floor(finalR);
            frame.data[canvasIndex + 1] = Math.floor(finalG);
            frame.data[canvasIndex + 2] = Math.floor(finalB);
        }
    }
}

function drawObject(object) {
    let spriteX = object.x - thisPlayer.x;
    let spriteY = object.y - thisPlayer.y;

    let dirX = Math.cos(thisPlayer.radians);
    let dirY = Math.sin(thisPlayer.radians);

    let planeX = -Math.sin(thisPlayer.radians);
    let planeY = Math.cos(thisPlayer.radians);

    let invDet = 1 / (planeX * dirY - dirX * planeY);

    let transformX = invDet * (dirY * spriteX - dirX * spriteY);
    let transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    let spriteScreenX = Math.floor(canvasHalfWidth * (1 + transformX / transformY));

    let scale = 1;
    if (object.scale != undefined) scale = object.scale;

    let baseScreenHeight = canvas.height / transformY / screenRatio / fovFactor;
    let onScreenHeight = baseScreenHeight * scale;

    let lightmap = getWorldCell(object.x, object.y).lightmap;

    if (object.spriteGroup != undefined) {
        let sprite = object.spriteGroup[0][0];

        if (sprite !== undefined && sprite.width !== undefined) {
            let groupIndex = 0;
            let spriteFrame = 0;
            
            if (object.spriteGroup.length > 1) {
                let angle = -Math.abs(thisPlayer.rotation) + Math.abs(object.rotation) + object.relativeAngle + 360 / object.spriteGroup.length / 2;
                angle = angle % 360;
                if (angle < 0) angle += 360;
                groupIndex = Math.floor((360 - angle) / 360 * object.spriteGroup.length);
            }

            let spriteFrames = object.spriteGroup[groupIndex];
            let animationOffset = object.animationOffset != undefined ? object.animationOffset : 0;

            if (spriteFrames.frames > 1) spriteFrame = Math.floor((animationFrameCounter - animationOffset) * spriteFrames.speed) % spriteFrames.frames;

            sprite = spriteFrames[spriteFrame];

            if (sprite == undefined) return;

            let onScreenWidth = Math.floor(sprite.width / sprite.height * onScreenHeight);
            
            let spriteHalfWidth = onScreenWidth / 2;
            let spriteHalfHeight = onScreenHeight / 2;

            let center = horizon - ((baseScreenHeight / 2) - spriteHalfHeight) * object.origin;

            let startY = Math.floor(center - spriteHalfHeight);
            let stopY = Math.floor(startY + onScreenHeight);

            for (let onScreenY = (startY > 0 ? startY : 0); onScreenY <= (stopY < canvas.height ? stopY : canvas.height); onScreenY++) {
                let spriteY = (onScreenY - startY) / onScreenHeight;

                let startX = Math.ceil(spriteScreenX - spriteHalfWidth);
                let stopX = Math.ceil(spriteScreenX + spriteHalfWidth) - 1;

                for (let onScreenX = (startX > 0 ? startX : 0); onScreenX <= (stopX < canvas.width ? stopX : canvas.width); onScreenX++) {

                    let spriteX = (onScreenX - (spriteScreenX - spriteHalfWidth)) / onScreenWidth;

                    // Get imageData array indexes
                    let canvasIndex = ((canvas.width + 1) * onScreenY + onScreenX) * 4;
                    let spriteIndex = (sprite.width * Math.floor(spriteY * sprite.height) + Math.floor(spriteX * sprite.width)) * 4;

                    let finalA = sprite.data[spriteIndex + 3];

                    // Don't draw if invisible
                    if (finalA > 0) {
                        let finalR = sprite.data[spriteIndex];
                        let finalG = sprite.data[spriteIndex + 1];
                        let finalB = sprite.data[spriteIndex + 2];

                        let alpha = finalA / 255;
                    
                        if (!object.spriteGroup.fullBright) {
                            // Apply lighting
                            finalR *= lightmap.average.r;
                            finalG *= lightmap.average.g;
                            finalB *= lightmap.average.b;
                        }

                        // Don't blend if opaque
                        if (alpha < 1) {
                            let inverseAlpha = 1 - alpha;

                            finalR = finalR * alpha + frame.data[canvasIndex] * inverseAlpha;
                            finalG = finalG * alpha + frame.data[canvasIndex + 1] * inverseAlpha;
                            finalB = finalB * alpha + frame.data[canvasIndex + 2] * inverseAlpha;
                        }   

                        frame.data[canvasIndex] = Math.floor(finalR);
                        frame.data[canvasIndex + 1] = Math.floor(finalG);
                        frame.data[canvasIndex + 2] = Math.floor(finalB);
                    }
                }
            }
        }
    }

    // Draw name
    if (object.name !== undefined && object.name !== '' && onScreenHeight > 30) {
        labelContext.font = `${onScreenHeight * uiScaleFactor / 32}pt Oswald`;
        labelContext.fillStyle = '#ebebeb';
        labelContext.textAlign = 'center';
        labelContext.shadowColor = 'black';
        labelContext.shadowBlur = 5;
        labelContext.fillText(object.name, spriteScreenX * uiScaleFactor, horizon * uiScaleFactor - onScreenHeight / 4);
    }
}

function drawUI() {
    if (currentControlState.viewModel.texture != undefined) drawViewModel();

    if (currentControlState.showMap) drawMiniMap();

    // DEBUG PROBE
    if (currentControlState.debug) { probeRenderUI = performance.now(); }
}

function drawViewModel() {
    let viewModel = currentControlState.viewModel;

    let currentFrame = currentControlState.viewModel.texture[0];

    let viewModelWidth = viewModelSizeRatio * uiCanvas.width;
    let viewModelHeight = viewModelWidth / currentFrame.width * currentFrame.height;

    let xBob = Math.sin(performance.now() * viewModelBobSpeed) * viewModel.bobFactor * viewModelBobAmplitude;
    let yBob = Math.abs(Math.sin(performance.now() * viewModelBobSpeed)) * viewModel.bobFactor * viewModelBobAmplitude;

    let x = uiCanvasHalfWidth - viewModelWidth / 2 + xBob;
    let y = uiCanvas.height - viewModelHeight + yBob;

    let cell = getWorldCell(thisPlayer.x, thisPlayer.y);
    if (cell != undefined) {
        let lightmapAverage = cell.lightmap.average;
        let tintColor = `rgb(
            ${lightmapAverage.r * viewModelLightFactor},
            ${lightmapAverage.g * viewModelLightFactor},
            ${lightmapAverage.b * viewModelLightFactor})`;
        currentFrame = tintImage(currentFrame, tintColor, tempContext);
    }
    uiContext.drawImage(currentFrame, x, y, viewModelWidth, viewModelHeight);
}

function drawMiniMap() {
    uiContext.imageSmoothingEnabled = true;

    // Draw map cells
    drawMinimapCells();

    // Draw objects
    uiContext.fillStyle = '#5fa0ff';
    drawMinimapObjects();

    // Draw player fov
    uiContext.fillStyle = 'darkgrey';
    drawMinimapObjectFov(thisPlayer);

    // Draw thisPlayer
    uiContext.fillStyle = 'grey';
    drawMinimapObject(thisPlayer);

    uiContext.imageSmoothingEnabled = false;
}

function drawMinimapCells() {
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            drawMinimapCell(x, y);
        }
    }
}

function drawMinimapCell(x, y) {
    let cell = getWorldCell(x, y);
    if (cell.floor !== null && cell.floor !== 0) uiContext.drawImage(getMinimapTexture(cell.floor), minimapOffset + x * minimapCellSize, minimapOffset + y * minimapCellSize, minimapCellSize, minimapCellSize);
    if (cell.wall !== null && cell.wall !== 0) uiContext.drawImage(getMinimapTexture(cell.wall), minimapOffset + x * minimapCellSize, minimapOffset + y * minimapCellSize, minimapCellSize, minimapCellSize);
}

function drawMinimapObjects() {
    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];
        if (object.type >= 0) {
            drawMinimapObject(object);
        }
    }
}

function drawMinimapObject(object) {
    if (minimapObjectSize > 1) {
        uiContext.beginPath();
        uiContext.arc(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), minimapObjectSize, 0, Math.PI * 2, true);
        uiContext.fill();
        uiContext.closePath();
    } else {
        uiContext.fillRect(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), 1, 1);
    }
}

function drawMinimapObjectFov(object) {
    uiContext.globalAlpha = 0.5;

    let fov = 90;

    uiContext.beginPath();
    uiContext.moveTo(minimapOffset + object.x * minimapCellSize, minimapOffset + object.y * minimapCellSize);

    uiContext.arc(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), minimapFovSize, (object.rotation - fov / 2) * piRatio, (object.rotation + fov / 2) * piRatio, false);

    uiContext.fill();
    uiContext.closePath();

    uiContext.globalAlpha = 1;
}

// Physics funcs
function updatePlayerPosition(deltaTime) {
    // Apply user-produced state updates
    updateUserInput();

    validatePlayerValues();

    // Perform collision check
    if (!currentControlState.noclip) performCollisionCheck();

    // Apply player speed
    thisPlayer.x += thisPlayer.speedX * deltaTime;
    thisPlayer.y += thisPlayer.speedY * deltaTime;

    // Apply friction to player speed
    thisPlayer.speedX /= playerFriction;
    thisPlayer.speedY /= playerFriction;

    // Reset precision
    thisPlayer.x = thisPlayer.x.toFixedNumber(3);
    thisPlayer.y = thisPlayer.y.toFixedNumber(3);
    thisPlayer.rotation = thisPlayer.rotation.toFixedNumber(1);
    horizon = Math.round(horizon);

    let cell = getWorldCell(thisPlayer.x, thisPlayer.y);

    if (cell != undefined && cell.portal != null) {
        thisPlayer.x += cell.portal.x;
        thisPlayer.y += cell.portal.y;
    }
}

function updateUserInput() {
    thisPlayer.radians = thisPlayer.rotation * piRatio;

    if (currentControlState.moveForward) {
        thisPlayer.speedX += playerAcceleration * Math.cos(thisPlayer.radians);
        thisPlayer.speedY += playerAcceleration * Math.sin(thisPlayer.radians);
    }
    if (currentControlState.moveBackward) {
        thisPlayer.speedX -= playerAcceleration * Math.cos(thisPlayer.radians);
        thisPlayer.speedY -= playerAcceleration * Math.sin(thisPlayer.radians);
    }
    if (currentControlState.moveLeft) {
        thisPlayer.speedX += playerAcceleration * Math.cos(thisPlayer.radians - radians90Deg);
        thisPlayer.speedY += playerAcceleration * Math.sin(thisPlayer.radians - radians90Deg);
    }
    if (currentControlState.moveRight) {
        thisPlayer.speedX += playerAcceleration * Math.cos(thisPlayer.radians + radians90Deg);
        thisPlayer.speedY += playerAcceleration * Math.sin(thisPlayer.radians + radians90Deg);
    }

    let turnDelta = cameraArrowsSensitivity * deltaTime;

    if (currentControlState.turnLeft) thisPlayer.rotation -= turnDelta;
    if (currentControlState.turnRight) thisPlayer.rotation += turnDelta;
    if (currentControlState.lookDown) horizon -= turnDelta;
    if (currentControlState.lookUp) horizon += turnDelta;

    // Perspective distortion compensation
    if (currentControlState.perspective) {
        canvas.style.transform = `perspective(1000px) rotateX(${(horizon - canvasHalfHeight) / 10}deg) scale(1.165)`;
        labelCanvas.style.transform = `perspective(1000px) rotateX(${(horizon - canvasHalfHeight) / 10}deg) scale(1.165)`;
    }

    // Update Howler listener position
    Howler.pos(thisPlayer.x, -0.5, thisPlayer.y);
    Howler.orientation(Math.cos(thisPlayer.radians), 0, Math.sin(thisPlayer.radians), 0, 1, 0);

    // Update viewmodel bob factor
    currentControlState.viewModel.bobFactor = (Math.abs(thisPlayer.speedX) + Math.abs(thisPlayer.speedY)) / playerMaxSpeed / 2;

    // Use
    if (!currentControlState.use) currentControlState.useCooldown = false;
    else if (!currentControlState.useCooldown) {
        let object = world.objects.find(function (a) {
            return (
                a.onPress !== undefined &&
                a.x < thisPlayer.x + playerInteractionRange && a.x > thisPlayer.x - playerInteractionRange && 
                a.y < thisPlayer.y + playerInteractionRange && a.y > thisPlayer.y - playerInteractionRange
            );
        });

        if (object != undefined) object.onPress();

        currentControlState.useCooldown = true;
    }

    // Shoot
    if (!currentControlState.shoot) currentControlState.shootCooldown = false;
    else if (!currentControlState.shootCooldown) {
        const projectileSpeed = 0.01;

        let object = {
            'x': thisPlayer.x,
            'y': thisPlayer.y,
            'speedX': projectileSpeed * Math.cos(thisPlayer.radians) + thisPlayer.speedX / 10,
            'speedY': projectileSpeed * Math.sin(thisPlayer.radians) + thisPlayer.speedY / 10,
            'rotation': thisPlayer.rotation,
            'type': 8,
            'spriteGroup': getSprite(8),
            'origin': -0.3,
            'scale': 0.2,
            'projectile': true
        }

        world.objects.push(object);

        currentControlState.shootCooldown = true;
    }
}

function validatePlayerValues() {
    // Validate rotation
    if (thisPlayer.rotation < 0) {
        thisPlayer.rotation += 360;
    } else if (thisPlayer.rotation >= 360) {
        thisPlayer.rotation -= 360;
    }

    // Validate player speed
    if (thisPlayer.speedX > playerMaxSpeed) thisPlayer.speedX = playerMaxSpeed;
    if (thisPlayer.speedY > playerMaxSpeed) thisPlayer.speedY = playerMaxSpeed;

    // Validate horizon level
    if (horizon <= canvasHalfHeight - maxHorizonSkew) {
        horizon = canvasHalfHeight - maxHorizonSkew;
    } else if (horizon >= canvasHalfHeight + maxHorizonSkew) {
        horizon = canvasHalfHeight + maxHorizonSkew;
    }
}

function performCollisionCheck() {
    // Skip check if out of bounds
    if (thisPlayer.x < 0 || thisPlayer.y < 0 || thisPlayer.x >= world.width-1 || thisPlayer.y >= world.height-1) return;

    // Collision on x
    let nextStep = thisPlayer.x + thisPlayer.speedX * deltaTime;
    // Negative offset
    if (getWorldCell(nextStep - playerSize, thisPlayer.y).solid) {
        thisPlayer.x += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (getWorldCell(nextStep + playerSize, thisPlayer.y).solid) {
        thisPlayer.x -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }

    // Collision on y
    nextStep = thisPlayer.y + thisPlayer.speedY * deltaTime;
    // Negative offset
    if (getWorldCell(thisPlayer.x, nextStep - playerSize).solid) {
        thisPlayer.y += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (getWorldCell(thisPlayer.x, nextStep + playerSize).solid) {
        thisPlayer.y -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }
}

function updateObjects() {
    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];

        if (object.lifetime > 0) {
            object.lifetime -= deltaTime;
            if (object.lifetime <= 0) {
                world.objects.splice(i, 1);
                return;
            }
        }

        // Apply object speed
        object.x += object.speedX * deltaTime;
        object.y += object.speedY * deltaTime;

        if (object.x < 0 || object.y < 0 || object.x >= world.width || object.y >= world.height) {
            world.objects.splice(i, 1);
            return;
        }

        if (object.projectile) {
            if (getWorldCell(object.x, object.y).solid) {
                world.objects.splice(i, 1);

                let explosion = {
                    'x': object.x - object.speedX * deltaTime,
                    'y': object.y - object.speedY * deltaTime,
                    'speedX': 0,
                    'speedY': 0,
                    'rotation': 0,
                    'type': 7,
                    'spriteGroup': getSprite(7),
                    'origin': 0,
                    'scale': 1,
                    'animationOffset': animationFrameCounter,
                    'lifetime': 300
                }
        
                world.objects.push(explosion);

                return;
            }
        } else {
            // Apply friction to object speed
            object.speedX /= playerFriction;
            object.speedY /= playerFriction;
        }
    }
}

// Controls
// Lock pointer on click
canvas.onclick = function () {
    canvas.requestPointerLock();
};

// Add mouse event listeners
document.addEventListener('pointerlockchange', lockChangeAlert, false);

// Add and remove listener for mouse movement on pointer lock
function lockChangeAlert() {
    if (document.pointerLockElement === canvas && gameState === 1) {
        console.log('The pointer lock status is now locked');
        document.body.requestFullscreen();
        document.addEventListener("mousemove", cameraMove, false);
        document.addEventListener('mousedown', mouseDown, false);
        document.addEventListener('mouseup', mouseUp, false);
    } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", cameraMove, false);
        document.removeEventListener('mousedown', mouseDown, false);
        document.removeEventListener('mouseup', mouseUp, false);
    }
}

// Get mouse movement and apply it to player rotation
function cameraMove(e) {
    thisPlayer.rotation += e.movementX * cameraMouseSensitivity;
    horizon -= e.movementY * cameraMouseSensitivity * 5;
}

function mouseDown(e) {
    if (gameState === 1) {
        currentControlState.shoot = true;
    }
}

function mouseUp(e) {
    if (gameState === 1) {
        currentControlState.shoot = false;
    }
}

// Update keystates on keydown
document.addEventListener('keydown', e => {
    if (e.target.tagName.toLowerCase() !== 'input' && gameState > 0) {
        if (e.code === "KeyW") currentControlState.moveForward = true;
        if (e.code === "KeyS") currentControlState.moveBackward = true;
        if (e.code === "KeyA") currentControlState.moveLeft = true;
        if (e.code === "KeyD") currentControlState.moveRight = true;
        if (e.code === "KeyM") currentControlState.showMap = true;
        if (e.code === "ArrowLeft") currentControlState.turnLeft = true;
        if (e.code === "ArrowRight") currentControlState.turnRight = true;
        if (e.code === "ArrowUp") currentControlState.lookUp = true;
        if (e.code === "ArrowDown") currentControlState.lookDown = true;
        if (e.code === "KeyE") currentControlState.use = true;
        if (e.code === "KeyV") currentControlState.noclip = !currentControlState.noclip;
        if (e.code === "KeyP") {
            currentControlState.perspective = !currentControlState.perspective;
            canvas.style.transform = '';
            labelCanvas.style.transform = '';
        }
        if (e.code === "KeyI") {
            currentControlState.info = !currentControlState.info;
            if (currentControlState.info) {
                secondaryInfoContainer.style.visibility = "visible";
            } else {
                secondaryInfoContainer.style.visibility = "hidden";
            }
        }
        if (e.code === "Backquote") {
            currentControlState.debug = !currentControlState.debug;
            if (currentControlState.debug) {
                debugContainer.style.visibility = "visible";
            } else {
                debugContainer.style.visibility = "hidden";
            }
        }
    }
});

// Update keystates on keyup
window.addEventListener('keyup', e => {
    if (e.code === "KeyW") currentControlState.moveForward = false;
    if (e.code === "KeyS") currentControlState.moveBackward = false;
    if (e.code === "KeyA") currentControlState.moveLeft = false;
    if (e.code === "KeyD") currentControlState.moveRight = false;
    if (e.code === "KeyM") currentControlState.showMap = false;
    if (e.code === "ArrowLeft") currentControlState.turnLeft = false;
    if (e.code === "ArrowRight") currentControlState.turnRight = false;
    if (e.code === "ArrowUp") currentControlState.lookUp = false;
    if (e.code === "ArrowDown") currentControlState.lookDown = false;
    if (e.code === "KeyE") currentControlState.use = false;
});

// Recalculate canvas size on window resize
window.onresize = function() {
    screenRatio = window.innerHeight / window.innerWidth;

    canvas.height = canvas.width * screenRatio;
    labelCanvas.height = labelCanvas.width * screenRatio;
    uiCanvas.height = uiCanvas.width * screenRatio;

    canvasHalfHeight = canvas.height / 2;
    horizon = canvasHalfHeight;
    
    uiCanvasHalfWidth = uiCanvas.width / 2;

    uiContext.imageSmoothingEnabled = false;
}
window.onresize();

function updateDebugMonitor() {
    let totalFrameTime = frameEnd - frameStart

    debugPerformanceLabel.innerHTML = `FPS: ${(1000/deltaTime).toFixed(2)}<br>
    Frametime: ${totalFrameTime.toFixed(1)}ms<br>
    Position: ${thisPlayer.x.toFixed(1)} ${thisPlayer.y.toFixed(1)}<br>
    ${performanceProbe > 0 ? '<br>Probe: ' + performanceProbe + 'ms<br>' : ''}`;

    debugStateLabel.innerHTML = `${currentControlState.perspective ? 'PERSPECTIVE FIX<br>' : ''}
    ${currentControlState.noclip ? 'NOCLIP<br>' : ''}`


    let probe1Value = (probeCompute - frameStart)
    let probe2Value = (probePrepareFrame - frameStart) - probe1Value
    let probe3Value = (probeRenderFloor - frameStart) - probe1Value - probe2Value
    let probe4Value = (probePrepareRaycast - frameStart) - probe1Value - probe2Value - probe3Value
    let probe5Value = (probeRenderRaycast - frameStart) - probe1Value - probe2Value - probe3Value - probe4Value
    let probe6Value = (probeRenderUI - frameStart) - probe1Value - probe2Value - probe3Value - probe4Value - probe5Value
    let probe7Value = totalFrameTime - probe1Value - probe2Value - probe3Value - probe4Value - probe5Value - probe6Value

    let probe1Percent = probe1Value / totalFrameTime * 100
    let probe2Percent = probe2Value / totalFrameTime * 100
    let probe3Percent = probe3Value / totalFrameTime * 100
    let probe4Percent = probe4Value / totalFrameTime * 100
    let probe5Percent = probe5Value / totalFrameTime * 100
    let probe6Percent = probe6Value / totalFrameTime * 100
    let probe7Percent = probe7Value / totalFrameTime * 100

    probe1.style.width = `${probe1Percent}%`
    probe2.style.width = `${probe2Percent}%`
    probe3.style.width = `${probe3Percent}%`
    probe4.style.width = `${probe4Percent}%`
    probe5.style.width = `${probe5Percent}%`
    probe6.style.width = `${probe6Percent}%`
    probe7.style.width = `${probe7Percent}%`

    probe1.innerText = probe1Percent >= 10 ? `${probe1Value.toFixed(1)}ms` : ''
    probe2.innerText = probe2Percent >= 10 ? `${probe2Value.toFixed(1)}ms` : ''
    probe3.innerText = probe3Percent >= 10 ? `${probe3Value.toFixed(1)}ms` : ''
    probe4.innerText = probe4Percent >= 10 ? `${probe4Value.toFixed(1)}ms` : ''
    probe5.innerText = probe5Percent >= 10 ? `${probe5Value.toFixed(1)}ms` : ''
    probe6.innerText = probe6Percent >= 10 ? `${probe6Value.toFixed(1)}ms` : ''
    probe7.innerText = probe7Percent >= 10 ? `${probe7Value.toFixed(1)}ms` : ''
}

function updateLoadingProgress() {
    if (performance.now() > 2000) {
        if (!slowLoad) {
            slowLoad = true;
            document.getElementById("loading-popup").classList.add("appear-loading");
        }
    }

    if (downloadProgress < maxDownloadProgress) {
        document.getElementById("progress-bar").style.width = `${downloadProgress / maxDownloadProgress * 100}%`;
    } else {
        document.getElementById("progress-text").innerText = "Download complete";
        document.getElementById("progress-bar").style.width = "100%";
        
        document.getElementById("loading-popup").classList.remove("appear-loading");
        document.getElementById("loading-popup").classList.add("dismiss-loading");

        document.getElementById("info-label-container").classList.add("appear-debug");

        document.getElementById("canvas-container").classList.add("visible");

        gameState = 1;
    }
}

function renderLoop() {
    currentTime = performance.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    frameStart = performance.now();

    if (gameState > 0) {
        updatePlayerPosition(deltaTime);

        updateObjects();

        // DEBUG PROBE
        if (currentControlState.debug) { probeCompute = performance.now(); }

        drawScene();

        animationFrameCounter = performance.now() / 10;
    } else {
        updateLoadingProgress();
    }

    frameEnd = performance.now();

    if (currentControlState.debug && frameEnd - debugMonitorCounter > debugMonitorTimeout) { 
        debugMonitorCounter = performance.now()
        updateDebugMonitor();
    }

    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);

Number.prototype.toFixedNumber = function(digits, base){
    let pow = Math.pow(base||10, digits);
    return Math.round(this*pow) / pow;
}

function getWorldCell(x, y) {
    return world.cells[Math.trunc(y) * world.width + Math.trunc(x)];
}
