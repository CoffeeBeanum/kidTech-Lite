import { world, decals, objects, portals, piRatio } from './constants.js'
import { context, canvas, debugSound, fpsLabel, maxTransparency, drawDistance, minimapOffset, minimapCellSize, minimapObjectSize, minimapFovSize, minimapFloorColor } from './startSettings.js'

// System lets
let frameStart;
let frameEnd;

let currentTime;
let deltaTime;
let lastTime = Date.now();

let gameState = 1;

let editMode = false;
let editPoint = new Point(0, 0);
let editBlock = 0;

// Player object
function Player() {
    this.x = 12;
    this.y = 6;
    this.rotation = 150;
    this.speedX = 0;
    this.speedY = 0;
}

let thisPlayer = new Player();

// Game object
function GameObject(name, x, y, rotation, type, solid) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.type = type;
    this.solid = solid;
    this.distance = 0;
    this.relativeAngle = 0;
}

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
    this.transparent = false;
    this.done = false;
    this.side = 0; // side of the wall ray hit
    this.sector = 0; // sector of wall ray hit
    this.coordJumps = [];
}

function ProcessedRay(x, onScreenX, textureIndex, textureX, side, distance, onScreenSize, decalIndex, transparent) {
    this.x = x; // position on projected plane
    this.onScreenX = onScreenX; // onscreen position
    this.textureIndex = textureIndex; // texture index
    this.textureX = textureX; // position on texture
    this.side = side; // side of the wall ray hit
    this.distance = distance; // ray length
    this.onScreenSize = onScreenSize; // ray size on screen
    this.decalIndex = decalIndex;
    this.transparent = transparent;
}

// Key states
function KeyState() {
    this.w = false;
    this.a = false;
    this.s = false;
    this.d = false;
    this.m = false;
}

let currentKeyState = new KeyState();

// Drawing lets
function Point(x, y) {
    this.x = x;
    this.y = y;
}

let pipeline;

let screenRatio = canvas.height / canvas.width;

let horizon = canvas.height / 2;

// Drawing funcs
function drawScene() {
    updateFrame();

    drawFastBackground();
    drawFrame();
    
    if (currentKeyState.m) drawMiniMap();
}

function drawFastBackground() {
    context.fillStyle = "lightblue";
    context.fillRect(0, 0, canvas.width, horizon);

    context.fillStyle = "#695b5a";
    context.fillRect(0, horizon, canvas.width, canvas.height - horizon);
}

function updateFrame() {
    pipeline = [];

    // Prepare all rays
    for (let onScreenX = 0; onScreenX < canvas.width; onScreenX++) {
        let relativeRayAngle = Math.atan((onScreenX - canvas.width / 2) / (canvas.width / 2.14)) * 180 / Math.PI;

        calculateScanLine(relativeRayAngle, onScreenX);
    }

    // Prepare all objects
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        let relativeAngle = Math.atan2(object.y - thisPlayer.y, object.x - thisPlayer.x) * 180 / Math.PI - thisPlayer.rotation;
        if (relativeAngle <= -360) relativeAngle += 360;
        relativeAngle *= -1;

        if ((relativeAngle >= 0 && relativeAngle <= 70) || (relativeAngle >= 290 && relativeAngle <= 360) ||
            (relativeAngle <= 0 && relativeAngle >= -70) || (relativeAngle <= -290 && relativeAngle >= -360)) {

            object.relativeAngle = relativeAngle;
            object.distance = Math.abs(Math.sqrt(Math.pow(object.x - thisPlayer.x, 2) + Math.pow(object.y - thisPlayer.y, 2)));

            pipeline.push(object);
        }
    }
}

function calculateScanLine(x, onScreenX) {
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

function performRaycast(ray, x, onScreenX, layer) {
    let iterations = 0;

    while (!ray.done && iterations < drawDistance) {
        iterations++;

        // Check if ray is in world bounds
        if (ray.y < 0 || ray.y > world.length - 1) break;
        if (ray.x < 0 || ray.x > world[ray.y].length - 1) break;
        
        ray.transparent = false;

        // Check if ray has hit a wall
        if (world[ray.y][ray.x] > 0) {
            // Portal check
            if (world[ray.y][ray.x] === 5) {
                let portal = portals.filter(function (a) {
                    return (a[0].x === ray.x && a[0].y === ray.y);
                });
                if (portal.length > 0) {
                    portal = portal[0][1];
                    ray.coordJumps.push(new Point(ray.x, ray.y));
                    ray.x = portal.x;
                    ray.y = portal.y;
                    ray.coordJumps.push(new Point(ray.x, ray.y));
                    continue;
                }
            }
            
            if (transparentBlocks.includes(world[ray.y][ray.x])) {
                if (layer <= maxTransparency) {
                    let skipHit = mergeableBlocks.includes(ray.hit) ? world[ray.y][ray.x] === ray.hit : false;
                    ray.hit = world[ray.y][ray.x];
                    ray.transparent = true;
                    if (iterations > 1 && !skipHit) rayHit(ray, x, onScreenX);
                    performBackwardsRaycast(ray, x, onScreenX);
                }
            } else {
                ray.hit = world[ray.y][ray.x];
                rayHit(ray, x, onScreenX);
                ray.done = true;
            }
        } else {
            ray.hit = 0;
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

// Launches a simple one-step, fixed block type raycast in given rays opposite direction (used to draw other side of transparent blocks).
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
    if (ray.y < 0 || ray.y > world.length - 1) return;
    if (ray.x < 0 || ray.x > world[Math.round(ray.y)].length - 1) return;

    // Check if ray has hit a wall
    if (world[Math.round(ray.y)][Math.round(ray.x)] == ray.hit) return;
    if (ray.decal && (world[Math.round(ray.y)][Math.round(ray.x)] === 0 || decalBlocks.includes(world[Math.round(ray.y)][Math.round(ray.x)]))) return;

    ray = { ...refRay };

    ray.dirX *= -1;
    ray.dirY *= -1;

    if (ray.offX < ray.offY) {
        ray.x -= ray.stepX * 0.0001;
        ray.side = 0;
    } else {
        ray.y -= ray.stepY * 0.0001;
        ray.side = 1;
    }

    calculateRayDirection(ray);
    
    // Check if ray is in world bounds
    if (ray.y < 0 || ray.y > world.length - 1) return;
    if (ray.x < 0 || ray.x > world[Math.round(ray.y)].length - 1) return;
    
    // Check if ray has hit a wall
    if (world[Math.round(ray.y)][Math.round(ray.x)] == ray.hit) {
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
    let lineHeight = canvas.height / perpWallDist / screenRatio / 4.5 / correction;

    //calculate value of wallX
    if (ray.side === 0) ray.sector = thisPlayer.y + perpWallDist * ray.dirY;
    else ray.sector = thisPlayer.x + perpWallDist * ray.dirX;
    ray.sector -= Math.floor((ray.sector));

    //x coordinate on the texture
    let textureX = ray.sector;
    if (ray.side === 0 && ray.dirX < 0) textureX = 1 - textureX;
    if (ray.side === 1 && ray.dirY > 0) textureX = 1 - textureX;
    if (ray.decal) textureX = 1 - textureX;

    let decalTexture = -1;
    let decal = decals.filter(function (a) {
        return (a.x === Math.round(ray.x) && a.y === Math.round(ray.y));
    });
    if (decal.length > 0) {
        decalTexture = decal[0].type;
    }

    let processedRay = new ProcessedRay(x, onScreenX, ray.hit, textureX, ray.side, Math.abs(perpWallDist), lineHeight, decalTexture, ray.transparent);

    pipeline.push(processedRay);
}

function drawFrame() {
    pipeline.sort(function (a, b) {
        return b.distance - a.distance;
    });

    for (let i = 0; i < pipeline.length; i++) {
        let temp = pipeline[i];
        if (temp instanceof ProcessedRay) drawScanLine(temp);
        else drawObject(temp);
    }
}

function drawScanLine(ray) {

    let texture = getWallTexture(ray.textureIndex);

    let cropX = Math.floor(ray.textureX * texture.width);
    let cropHeight = texture.height;

    let x = Math.floor(ray.onScreenX);
    let y = Math.round(horizon - ray.onScreenSize);
    let height = Math.floor(ray.onScreenSize * 2);

    context.drawImage(texture, cropX, 0, 1, cropHeight, x, y, 1, height);

    if (ray.decalIndex >= 0) {
        let decal = getDecal(ray.decalIndex);
        let cropX = Math.floor(ray.textureX * decal.width);
        let cropHeight = decal.height;
        context.drawImage(decal, cropX, 0, 1, cropHeight, x, y, 1, height);
    }

    // Apply side tint
    if (ray.side === 0 && !ray.transparent) {
        context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        context.beginPath();
        context.moveTo(x + 0.5, y);
        context.lineTo(x + 0.5, y + height);
        context.stroke();
    }

    // Apply distance fog
    if (ray.distance > 5 && !ray.decal) {
        context.strokeStyle = 'rgba(0, 0, 0, ' + (ray.distance - 5) / drawDistance + ')';
        context.beginPath();
        context.moveTo(x + 0.5, y);
        context.lineTo(x + 0.5, y + height);
        context.stroke();
    }
}

function drawObject(object) {
    let spriteX = object.x - thisPlayer.x;
    let spriteY = object.y - thisPlayer.y;

    let dirX = Math.cos(thisPlayer.rotation * piRatio);
    let dirY = Math.sin(thisPlayer.rotation * piRatio);

    let planeX = -Math.sin(thisPlayer.rotation * piRatio);
    let planeY = Math.cos(thisPlayer.rotation * piRatio);

    let invDet = 1 / (planeX * dirY - dirX * planeY);

    let transformX = invDet * (dirY * spriteX - dirX * spriteY);
    let transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    let spriteScreenX = Math.floor(canvas.width / 2 * (1 + transformX / transformY));

    let spriteHeight = Math.floor(canvas.height / transformY / screenRatio / 2.1);

    // Draw sprite
    if (object.type >= 0) {
        let spriteGroup = getSprite(object.type);
        let sprite = spriteGroup[0];

        if (spriteGroup.length > 1) {
            let angle = -Math.abs(thisPlayer.rotation) + Math.abs(object.rotation) + object.relativeAngle + 360 / spriteGroup.length / 2;
            angle = angle % 360;
            if (angle < 0) angle += 360;
            let index = Math.floor((360 - angle) / 360 * spriteGroup.length);

            sprite = spriteGroup[index];
        }

        let spriteWidth = sprite.width / sprite.height * spriteHeight;

        context.drawImage(sprite, spriteScreenX - spriteWidth / 2,
            horizon - spriteHeight / 2,
            spriteWidth,
            spriteHeight);
    }

    // Draw name
    if (object.name !== '' && spriteHeight > 20) {
        context.font = `${spriteHeight / 16}pt Oswald`;
        context.fillStyle = '#ebebeb';
        context.textAlign = 'center';
        context.shadowColor="black";
        context.shadowBlur=5;
        context.fillText(object.name, spriteScreenX, horizon - 0.15 * spriteHeight);
        context.shadowBlur=0;
    }
}

function drawMiniMap() {
    context.imageSmoothingEnabled = true;

    // Draw map blocks
    drawMinimapBlocks();

    // Draw objects
    context.fillStyle = '#5fa0ff';
    drawMinimapObjects();

    // Draw player fov
    context.fillStyle = 'darkgrey';
    drawMinimapObjectFov(thisPlayer);

    // Draw thisPlayer
    context.fillStyle = 'grey';
    drawMinimapObject(thisPlayer);

    context.imageSmoothingEnabled = false;
}

function drawMinimapBlocks() {
    for (let y = 0; y < world.length; y++) {
        for (let x = 0; x < world[y].length; x++) {
            context.fillStyle = minimapFloorColor;
            if (world[y][x] !== null) {
                drawMinimapBlock(x, y);
            }
        }
    }
}

function drawMinimapBlock(x, y) {
    if (world[y][x] > 0) {
        if (transparentBlocks.includes(world[y][x])) context.fillRect(minimapOffset + x * minimapCellSize, minimapOffset + y * minimapCellSize, minimapCellSize, minimapCellSize);
        context.drawImage(getWallTexture(world[y][x]), minimapOffset + x * minimapCellSize, minimapOffset + y * minimapCellSize, minimapCellSize, minimapCellSize);
    } else if (world[y][x] !== -1) {
        context.fillRect(minimapOffset + x * minimapCellSize, minimapOffset + y * minimapCellSize, minimapCellSize, minimapCellSize);
    }
}

function drawMinimapObjects() {
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        if (object.type >= 0) {
            drawMinimapObject(object);
        }
    }
}

function drawMinimapObject(object) {
    if (minimapObjectSize > 1) {
        context.beginPath();
        context.arc(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), minimapObjectSize, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
    } else {
        context.fillRect(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), 1, 1);
    }
}

function drawMinimapObjectFov(object) {
    context.globalAlpha = 0.5;

    let fov = 90;

    context.beginPath();
    context.moveTo(minimapOffset + object.x * minimapCellSize, minimapOffset + object.y * minimapCellSize);

    context.arc(minimapOffset + Math.floor(object.x * minimapCellSize), minimapOffset + Math.floor(object.y * minimapCellSize), minimapFovSize, (object.rotation - fov / 2) * piRatio, (object.rotation + fov / 2) * piRatio, false);

    context.fill();
    context.closePath();

    context.globalAlpha = 1;
}

// Physics lets
let acceleration = 0.001;
let friction = 1.2;

let playerSize = 0.3;

// Physics funcs
function updatePlayerPosition(deltaTime) {
    // Apply user-produced state updates
    updateUserInput();

    // Perform collision check
    performCollisionCheck();

    // Apply player speed
    thisPlayer.x += thisPlayer.speedX * deltaTime;
    thisPlayer.y += thisPlayer.speedY * deltaTime;

    // Apply friction to player speed
    thisPlayer.speedX /= friction;
    thisPlayer.speedY /= friction;

    // Reset precision
    thisPlayer.x = thisPlayer.x.toFixedNumber(3);
    thisPlayer.y = thisPlayer.y.toFixedNumber(3);
    thisPlayer.rotation = thisPlayer.rotation.toFixedNumber(1);
    horizon = Math.round(horizon);

    if (world[Math.floor(thisPlayer.y)][Math.floor(thisPlayer.x)] === 5) {
        let portal = portals.filter(function (a) {
            return (a[0].x === Math.floor(thisPlayer.x) && a[0].y === Math.floor(thisPlayer.y));
        });
        if (portal.length > 0) {
            portal = portal[0];
            thisPlayer.x += portal[1].x - portal[0].x;
            thisPlayer.y += portal[1].y - portal[0].y;
        }
    }
}

function performCollisionCheck() {
    // Collision on x
    let nextStep = thisPlayer.x + thisPlayer.speedX * deltaTime;
    // Negative offset
    if (!nonSolidBlocks.includes(world[Math.floor(thisPlayer.y)][Math.floor(nextStep - playerSize)])) {
        thisPlayer.x += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (!nonSolidBlocks.includes(world[Math.floor(thisPlayer.y)][Math.floor(nextStep + playerSize)])) {
        thisPlayer.x -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }

    // Collision on y
    nextStep = thisPlayer.y + thisPlayer.speedY * deltaTime;
    // Negative offset
    if (!nonSolidBlocks.includes(world[Math.floor(nextStep - playerSize)][Math.floor(thisPlayer.x)])) {
        thisPlayer.y += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (!nonSolidBlocks.includes(world[Math.floor(nextStep + playerSize)][Math.floor(thisPlayer.x)])) {
        thisPlayer.y -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }
}

function updateUserInput() {
    if (currentKeyState.w) {
        thisPlayer.speedX += acceleration * Math.cos(thisPlayer.rotation * piRatio);
        thisPlayer.speedY += acceleration * Math.sin(thisPlayer.rotation * piRatio);
    }
    if (currentKeyState.s) {
        thisPlayer.speedX -= acceleration * Math.cos(thisPlayer.rotation * piRatio);
        thisPlayer.speedY -= acceleration * Math.sin(thisPlayer.rotation * piRatio);
    }
    if (currentKeyState.a) {
        thisPlayer.speedX += acceleration * Math.cos((thisPlayer.rotation - 90) * piRatio);
        thisPlayer.speedY += acceleration * Math.sin((thisPlayer.rotation - 90) * piRatio);
    }
    if (currentKeyState.d) {
        thisPlayer.speedX += acceleration * Math.cos((thisPlayer.rotation + 90) * piRatio);
        thisPlayer.speedY += acceleration * Math.sin((thisPlayer.rotation + 90) * piRatio);
    }
}

// Controls
// Lock pointer on click
canvas.onclick = function () {
    canvas.requestPointerLock();
};

// Add listener for pointer lock
document.addEventListener('pointerlockchange', lockChangeAlert, false);

// Add and remove listener for mouse movement on pointer lock
function lockChangeAlert() {
    if (document.pointerLockElement === canvas && gameState === 1) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", cameraMove, false);
    } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", cameraMove, false);
    }
}

// Get mouse movement and apply it to player rotation
function cameraMove(e) {
    thisPlayer.rotation += e.movementX / 5;
    if (thisPlayer.rotation < 0) {
        thisPlayer.rotation += 360;
    } else if (thisPlayer.rotation >= 360) {
        thisPlayer.rotation -= 360;
    }
    horizon -= e.movementY;
    if (horizon <= canvas.height / 5) {
        horizon = canvas.height / 5;
    } else if (horizon >= canvas.height / 5 * 4) {
        horizon = canvas.height / 5 * 4;
    }
}

// Update keystates on keydown
document.addEventListener('keydown', e => {
    if (e.target.tagName.toLowerCase() !== 'input' && gameState > 0) {
        if (e.keyCode === 87) currentKeyState.w = true;
        if (e.keyCode === 83) currentKeyState.s = true;
        if (e.keyCode === 65) currentKeyState.a = true;
        if (e.keyCode === 68) currentKeyState.d = true;
        if (e.keyCode === 77) currentKeyState.m = true;
    }
});

// Update keystates on keyup
window.addEventListener('keyup', e => {
    if (e.keyCode === 87) currentKeyState.w = false;
    if (e.keyCode === 83) currentKeyState.s = false;
    if (e.keyCode === 65) currentKeyState.a = false;
    if (e.keyCode === 68) currentKeyState.d = false;
    if (e.keyCode === 77) currentKeyState.m = false;
});

// Recalculate canvas size on window resize
window.onresize = function() {
    screenRatio = window.innerHeight / window.innerWidth;

    canvas.height = canvas.width * screenRatio;
    
    context.imageSmoothingEnabled = false;

    horizon = canvas.height / 2;
}
window.onresize();

function updateFps() {
    fpsLabel.innerHTML = `FPS: ${(1000/deltaTime).toFixed(2)}<br>
    Frametime: ${(frameEnd - frameStart).toFixed(2)}ms<br>
    Resolution: ${canvas.width}x${canvas.height}`;
}

function renderLoop() {
    currentTime = performance.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    frameStart = performance.now();

    if (gameState >= 0) {
        updatePlayerPosition(deltaTime);

        drawScene();
    }

    frameEnd = performance.now();

    updateFps();

    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);

Number.prototype.toFixedNumber = function(digits, base){
    var pow = Math.pow(base||10, digits);
    return Math.round(this*pow) / pow;
}