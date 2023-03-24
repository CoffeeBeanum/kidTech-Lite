/**
 * Handles raycasting and rasterisation of the scene
 * @module Renderer
 */

import { piRatio } from './constants.js'
import { canvas, context, fovFactor, drawDistance } from "./gameSettings.js"
import { world, getWorldCell } from './world.js'

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
    this.side = 0; // x or y side of the wall ray hit
    this.sector = 0; // sector of wall ray hit
    this.coordJumps = []; // list of coordinate jumps
    this.face = 0; // face of the wall ray hit
    this.correction = 1;
}

function ProcessedRay(onScreenX, cell, textureX, side, distance, onScreenSize, face) {
    this.onScreenX = onScreenX; // onscreen position
    this.cell = cell; // texture index
    this.textureX = textureX; // position on texture
    this.side = side; // x or y side of the wall ray hit
    this.distance = distance; // ray length
    this.onScreenSize = onScreenSize; // ray size on screen
    this.face = face; // face of the wall ray hit
}

// Drawing lets
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Performs raycasting and rasterisation of the scene outputting to given 2D context
 * @param {CanvasRenderingContext2D} The context to output final frame onto
 * @returns {Number[]} Array of performance probe timestamps
 */
function drawFrame(buffer, player) {
    let frame = context.getImageData(0, 0, canvas.width, canvas.height);

    getRaycastData(buffer, player);

    context.putImageData(frame, 0, 0);
}

function getRaycastData(buffer, player) {
    // Prepare all wall rays
    for (let onScreenX = 0; onScreenX < canvas.width; onScreenX++) {
        let ray = initializeRay(player, onScreenX);

        performRaycast(buffer, player, ray, onScreenX);
    }
}

function initializeRay(player, onScreenX) {
    let x = calculateRelativeRayAngle(onScreenX);

    // Create ray, calculate it's position and direction
    let ray = new Ray(
        player.x + (player.x < 0 ? -1 : 0) >> 0,
        player.y + (player.y < 0 ? -1 : 0) >> 0,
        Math.cos((player.rotation + x) * piRatio),
        Math.sin((player.rotation + x) * piRatio)
    );

    calculateRayDirection(player, ray);
    
    ray.correction = Math.cos(x * piRatio);

    return ray
}

function calculateRelativeRayAngle(onScreenX) {
    return Math.atan((onScreenX - canvas.width / 2) / (canvas.height * fovFactor)) * 180 / Math.PI;
}

function calculateRayDirection(player, ray) {
    ray.deltaX = Math.abs(1 / ray.dirX);
    ray.deltaY = Math.abs(1 / ray.dirY);

    // Calculate ray's step and initial offset
    if (ray.dirX < 0) {
        ray.stepX = -1;
        ray.offX = (player.x - ray.x) * ray.deltaX;
    } else {
        ray.stepX = 1;
        ray.offX = (ray.x + 1.0 - player.x) * ray.deltaX;
    }
    if (ray.dirY < 0) {
        ray.stepY = -1;
        ray.offY = (player.y - ray.y) * ray.deltaY;
    } else {
        ray.stepY = 1;
        ray.offY = (ray.y + 1.0 - player.y) * ray.deltaY;
    }
}

function performRaycast(buffer, player, ray, onScreenX) {
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
            if (cell.portal !== null) {
                ray.coordJumps.push(new Point(ray.x, ray.y));
                ray.x += cell.portal.x;
                ray.y += cell.portal.y;
                ray.coordJumps.push(new Point(ray.x, ray.y));
                continue;
            }
            
            if (cell.transparent) {
                let skipHit = (ray.hit !== undefined && ray.hit.mergeable) ? cell.wall === ray.hit.wall : false;
                ray.hit = cell;
                if (iterations > 1 && !skipHit) rayHit(buffer, player, ray, onScreenX);
                performBackwardsRaycast(buffer, player, ray, onScreenX);
            } else {
                ray.hit = cell;
                rayHit(buffer, player, ray, onScreenX);
                ray.done = true;
                break;
            }
        } else {
            ray.hit = undefined;
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

    if (!ray.done) processFloorForRay(ray, onScreenX, 0);
}

// Launches a simple, one-step, fixed block type raycast in given rays opposite direction (used to draw other side of transparent blocks).
function performBackwardsRaycast(buffer, player, refRay, onScreenX) {
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

    calculateRayDirection(player, ray);
    
    // Check if ray is in world bounds
    if (ray.y < 0 || ray.y > world.height - 1) return;
    if (ray.x < 0 || ray.x > world.width - 1) return;

    // Check if ray has hit a wall
    if (getWorldCell(ray.x, ray.y).wall === ray.hit.wall) {
        ray.backward = true;
        rayHit(buffer, player, ray, onScreenX);
    }
}

function rayHit(buffer, player, ray, onScreenX) {
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
        if (ray.side === 0) perpWallDist = (ray.x - player.x + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist = (ray.y - player.y + (1 - ray.stepY) / 2) / ray.dirY;
    } else {
        if (ray.side === 0) perpWallDist = (ray.coordJumps[0].x - player.x + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist = (ray.coordJumps[0].y - player.y + (1 - ray.stepY) / 2) / ray.dirY;

        for (let i = 1; i < jumps - 1; i++) {
            if (ray.side === 0) perpWallDist += (ray.coordJumps[i + 1].x - ray.coordJumps[i].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
            else perpWallDist += (ray.coordJumps[i + 1].y - ray.coordJumps[i].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
            i++;
        }

        if (ray.side === 0) perpWallDist += (ray.x - ray.coordJumps[jumps - 1].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist += (ray.y - ray.coordJumps[jumps - 1].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
    }

    // Calculate height of line to draw on screen
    let screenRatio = canvas.height / canvas.width;
    let lineHeight = canvas.height / perpWallDist / screenRatio * fovFactor / ray.correction;

    if (lineHeight > 0 && ray.hit) {
        // Calculate value of wallX
        if (ray.side === 0) ray.sector = player.y + perpWallDist * ray.dirY;
        else ray.sector = player.x + perpWallDist * ray.dirX;
        ray.sector -= ray.sector >> 0;

        // X coordinate on the texture
        let textureX = ray.sector;
        if (ray.side === 0 && ray.dirX < 0) textureX = 1 - textureX;
        if (ray.side === 1 && ray.dirY > 0) textureX = 1 - textureX;
        if (ray.backward) textureX = 1 - textureX;

        let processedRay = new ProcessedRay(onScreenX, ray.hit, textureX, ray.side, Math.abs(perpWallDist), lineHeight, ray.face);

        buffer.push(processedRay);

        if (!ray.hit.transparent) {
            processFloorForRay(ray, onScreenX, lineHeight / 2);
        }
    }
}

function processFloorForRay(player, ray, world, onScreenX, horizon, posZ, occlusionArea) {
    // let coordOffset = new Point(0, 0);
    // let portalIndex = 0;
    // let portalPrevious = undefined;
    // let enteredPortal = ray.coordJumps.length > 0;

    // let topPrimary = horizon > context.canvas.clientHeight / 2;

    // for (let onScreenY = topPrimary ? 0 : context.canvas.clientHeight; 
    //     topPrimary ? onScreenY < horizon - occlusionArea : onScreenY > horizon + occlusionArea; 
    //     topPrimary ? onScreenY++ : onScreenY--) {

    //     let floorHeight = Math.abs(onScreenY - horizon) * ray.correction;
    //     let rowDistance = posZ / floorHeight;
    
    //     let floorX = player.x + rowDistance * ray.dirX + coordOffset.x;
    //     let floorY = player.y + rowDistance * ray.dirY + coordOffset.y;

    //     if (enteredPortal) {
    //         let coordJump1 = ray.coordJumps[portalIndex];
    //         let coordJump2 = ray.coordJumps[portalIndex + 1];

    //         if (floorX >> 0 == coordJump1.x && floorY >> 0 == coordJump1.y) {
    //             if (portalPrevious == undefined) { 
    //                 coordOffset.x += coordJump2.x - coordJump1.x;
    //                 coordOffset.y += coordJump2.y - coordJump1.y;

    //                 if (portalIndex == 0) {
    //                     floorX += coordOffset.x;
    //                     floorY += coordOffset.y;
    //                 }

    //                 if (portalIndex < ray.coordJumps.length - 2) portalIndex += 2;
    //             }
    //         } else {
    //             portalPrevious = undefined;
    //         }
    //     }

    //     let cellX = floorX >> 0;
    //     let cellY = floorY >> 0;

    //     if (cellY >= 0 && cellX >= 0 && cellY < world.height && cellX < world.width) {

    //         let cell = getWorldCell(cellX, cellY);

    //         let offsetX = floorX - cellX;
    //         let offsetY = floorY - cellY;

    //         let floorScreenY = 0;
    //         let ceilingScreenY = 0;

    //         if (topPrimary) {
    //             floorScreenY = horizon + (horizon - onScreenY);
    //             ceilingScreenY = onScreenY;
    //         } else {
    //             floorScreenY = onScreenY;
    //             ceilingScreenY = horizon - (onScreenY - horizon);
    //         }

    //         // Draw floor
    //         if (cell.floor > 0 && floorScreenY < canvas.height) {
    //             preparePlanarPixel(cell.floor, onScreenX, floorScreenY, offsetX, offsetY, cell.lightmap);
    //         }

    //         // Draw ceiling
    //         if (cell.ceiling > 0 && ceilingScreenY >= 0) {
    //             preparePlanarPixel(cell.ceiling, onScreenX, ceilingScreenY, offsetX, offsetY, cell.lightmap);
    //         }
    //     }
    // }
}

function preparePlanarPixel(textureType ,onScreenX, onScreenY, offsetX, offsetY, lightmap) {
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
    if (currentControlState.debug) probeRenderRaycast = performance.now();
}

export { drawFrame, ProcessedRay }
