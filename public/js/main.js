let client = io();

// System lets
let sendRate = 20;

let frameStart;
let frameEnd;

let currentTime;
let deltaTime;
let lastTime = Date.now();
let lastDataTime;
let timeoutTime = 5000;

let deltaDifference;

//Sound
let chatSound = new Audio('resources/sounds/chat_message.wav');
let serverSound = new Audio('resources/sounds/server_message.wav');

chatSound.volume = 0.2;
serverSound.volume = 0.2;

// Background
let canvasBG = document.getElementById("backgroundCanvas");
let contextBG = canvasBG.getContext("2d");
canvasBG.style.cursor = "default";
contextBG.canvas.width = window.innerWidth;
contextBG.canvas.height = window.innerHeight;
contextBG.imageSmoothingEnabled = false;

// Canvas
let canvas = document.getElementById("mainCanvas");
let context = canvas.getContext("2d");
canvas.style.cursor = "default";
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;
context.imageSmoothingEnabled = false;

function setSkinImg () {
    let index = parseInt($("#skinList").val());
    let side = 0;
    if (spriteNames[index].length > 1) {
        side = Math.floor(spriteNames[index].length / 2) - 1;
    }
    $('#skinImage').attr("src", spriteNames[index][side]);
    let sidesString = "";
    if (spriteNames[index].length > 1) sidesString = "This skin has " + spriteNames[index].length + " sides.";
    else sidesString = "This skin has 1 side.";
    $('#skinSides').html(sidesString);
}
setSkinImg();

// Skin selector
$('#skinList').change(function () {
    setSkinImg()
});

// Quality slider
$('#qualitySlider').change(function () {
    res = Math.floor($(this).val()) * 2;
    scanLineStep = 2 / (context.canvas.width / res);
});

// Regexp
let boldRegexp = /(\*{2}(.*?)\*{2})/gm;
let italicsRegexp = /(\*(.*?)\*)/gm;
let devilRegexp = /(_(.*?)_)/gm;

let messageId = [];
let maxMessages = 50;

let gameState = -1;

let editMode = false;
let editPoint = new Point(0, 0);
let editBlock = -1;

// Local server data
let localServerData = {
    'playerList': [],
    'deltaTime': 0
};

let spawn;
let world = [];
let objects = [];
let portals

// Player object
function Player() {
    this.id = '';
    this.name = '';
    this.skin = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 240;
    this.speedX = 0;
    this.speedY = 0;
    this.admin = 0;
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
    this.side = 0; // side of the wall ray hit
    this.sector = 0; // sector of wall ray hit
    this.coordJumps = [];
}

function ProcessedRay(x, onScreenX, texture, textureX, side, distance, onScreenSize) {
    this.x = x; // position on projected plane
    this.onScreenX = onScreenX; // onscreen position
    this.texture = texture; // texture index
    this.textureX = textureX; // position on texture
    this.side = side; // side of the wall ray hit
    this.distance = distance; // ray length
    this.onScreenSize = onScreenSize; // ray size on screen
}

// Key states
function KeyState() {
    this.w = false;
    this.a = false;
    this.s = false;
    this.d = false;
}

let currentKeyState = new KeyState();

// -Drawing lets-
function Point(x, y) {
    this.x = x;
    this.y = y;
}

let pipeline;

let maxTransparency = 10;

let res = 6;

let drawDistance = 50;

let scanLineStep = 2 / (context.canvas.width / res);

let horizon = canvas.height / 2;

let excludedBlocks = [];

// -Drawing funcs-
function drawBackground() {
    let gradient = contextBG.createRadialGradient(canvasBG.width / 2, horizon - canvasBG.height * 3, canvasBG.height * 1.5, canvasBG.width / 2, horizon - canvasBG.height * 3, canvasBG.height * 3);
    gradient.addColorStop(0, '#9b9595');
    gradient.addColorStop(1, '#696467');
    contextBG.fillStyle = gradient;
    contextBG.fillRect(0, 0, canvasBG.width, horizon);

    gradient = contextBG.createRadialGradient(canvasBG.width / 2, horizon + canvasBG.height * 3, canvasBG.height * 1.5, canvasBG.width / 2, horizon + canvasBG.height * 3, canvasBG.height * 3);
    gradient.addColorStop(0, '#887c7f');
    gradient.addColorStop(1, '#6b6061');
    contextBG.fillStyle = gradient;
    contextBG.fillRect(0, horizon, canvasBG.width, canvasBG.height - horizon);
}

function updateFrame() {
    let onScreenX = 0.5;

    if (res % 2 === 0) {
        onScreenX = 0;
    }

    context.lineWidth = res;

    pipeline = [];

    for (let x = -1; x <= 1;) {
        calculateScanLine(Math.sin(x) * 180 / Math.PI, onScreenX);

        x += scanLineStep;
        onScreenX += res;
    }

    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        let relativeAngle = Math.atan2(object.y - thisPlayer.y, object.x - thisPlayer.x) * 180 / Math.PI - thisPlayer.rotation;
        if (relativeAngle <= -360) relativeAngle += 360;
        relativeAngle *= -1;

        if ((relativeAngle >= 0 && relativeAngle <= 90) || (relativeAngle >= 270 && relativeAngle <= 360) ||
            (relativeAngle <= 0 && relativeAngle >= -90) || (relativeAngle <= -270 && relativeAngle >= -360)) {

            object.relativeAngle = relativeAngle;
            object.distance = Math.abs(Math.sqrt(Math.pow(object.x - thisPlayer.x, 2) + Math.pow(object.y - thisPlayer.y, 2)));

            pipeline.push(object);
        }
    }

    for (let i = 0; i < localServerData.playerList.length; i++) {
        if (localServerData.playerList[i].id !== thisPlayer.id) {
            let object = new GameObject(
                localServerData.playerList[i].name,
                localServerData.playerList[i].x,
                localServerData.playerList[i].y,
                localServerData.playerList[i].rotation,
                localServerData.playerList[i].skin, false);
            let relativeAngle = Math.atan2(object.y - thisPlayer.y, object.x - thisPlayer.x) * 180 / Math.PI - thisPlayer.rotation;
            if (relativeAngle <= -360) relativeAngle += 360;
            relativeAngle *= -1;

            if ((relativeAngle >= 0 && relativeAngle <= 90) || (relativeAngle >= 270 && relativeAngle <= 360) ||
                (relativeAngle <= 0 && relativeAngle >= -90) || (relativeAngle <= -270 && relativeAngle >= -360)) {

                object.relativeAngle = relativeAngle;
                object.distance = Math.abs(Math.sqrt(Math.pow(object.x - thisPlayer.x, 2) + Math.pow(object.y - thisPlayer.y, 2)));

                pipeline.push(object);
            }
        }
    }
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

function calculateScanLine(x, onScreenX) {
    // Create ray, calculate it's position and direction
    let ray = new Ray(
        Math.floor(thisPlayer.x),
        Math.floor(thisPlayer.y),
        Math.cos((thisPlayer.rotation + x) * (Math.PI / 180)),
        Math.sin((thisPlayer.rotation + x) * (Math.PI / 180))
    );

    calculateRayDirection(ray);

    // Perform raycast
    excludedBlocks = [];
    performRaycast(ray, x, onScreenX, 0);
}

function performRaycast(ray, x, onScreenX, layer) {
    let iterations = 0;
    while (ray.hit === 0 && iterations < drawDistance) {
        iterations++;
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
        // Check if ray has hit a wall
        if (ray.y < 0 || ray.y > world.length - 1) break;
        if (ray.x < 0 || ray.x > world[ray.y].length - 1) break;
        if (world[ray.y][ray.x] > 0) {
            let excludedHit = false;
            for (let i = 0; i < excludedBlocks.length; i++) {
                if (ray.x === excludedBlocks[i].x && ray.y === excludedBlocks[i].y) excludedHit = true;
            }
            if (!excludedHit) {
                if (world[ray.y][ray.x] === 10) {
                    let portal = portals.filter(function( a ) {
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
                        excludedBlocks.push(new Point(ray.x, ray.y));
                        ray.hit = world[ray.y][ray.x];
                        rayHit(ray, x, onScreenX);
                        ray.hit = 0;
                    }
                } else {
                    ray.hit = world[ray.y][ray.x];
                    rayHit(ray, x, onScreenX);
                }
            }
        }
    }
}

function rayHit(ray, x, onScreenX) {
    let correction = Math.cos(x * (Math.PI / 180));
    let perpWallDist;

    /*
    // Calculate distance projected on camera direction
    if (ray.side === 0) perpWallDist = (ray.x - thisPlayer.x + (1 - ray.stepX) / 2) / ray.dirX;
    else perpWallDist = (ray.y - thisPlayer.y + (1 - ray.stepY) / 2) / ray.dirY;
    */

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

        for (let i = 1; i < jumps-1; i++) {
            if (ray.side === 0) perpWallDist += (ray.coordJumps[i+1].x - ray.coordJumps[i].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
            else perpWallDist += (ray.coordJumps[i+1].y - ray.coordJumps[i].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
            i++;
        }

        if (ray.side === 0) perpWallDist += (ray.x - ray.coordJumps[jumps-1].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist += (ray.y - ray.coordJumps[jumps-1].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
    }

    // Calculate height of line to draw on screen
    let lineHeight = context.canvas.height / perpWallDist * context.canvas.width / canvas.height / 4 / correction;

    //calculate value of wallX
    if (ray.side === 0) ray.sector = thisPlayer.y + perpWallDist * ray.dirY;
    else ray.sector = thisPlayer.x + perpWallDist * ray.dirX;
    ray.sector -= Math.floor((ray.sector));

    //x coordinate on the texture
    let textureX = ray.sector;
    if (ray.side === 0 && ray.dirX < 0) textureX = 1 - textureX;
    if (ray.side === 1 && ray.dirY > 0) textureX = 1 - textureX;

    let processedRay = new ProcessedRay(x, onScreenX, ray.hit, textureX, ray.side, perpWallDist, lineHeight);

    pipeline.push(processedRay);
}

function drawFrame() {
    context.clearRect(0, 0, canvas.width, canvas.height);

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

    let texture = getWallTexture(ray.texture);

    context.drawImage(texture, Math.floor(ray.textureX * texture.width), 0, 1, texture.height, Math.floor(ray.onScreenX), horizon - ray.onScreenSize, res, ray.onScreenSize * 2);

    // Apply side tint
    if (ray.side === 0 && !transparentBlocks.includes(ray.texture)) {
        context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        context.beginPath();
        context.moveTo(ray.onScreenX + res / 2, Math.round(horizon - ray.onScreenSize));
        context.lineTo(ray.onScreenX + res / 2, Math.round(horizon + ray.onScreenSize));
        context.stroke();
    }

    // Apply distance fog
    if (ray.distance > 5) {
        context.strokeStyle = 'rgba(0, 0, 0, ' + (ray.distance - 5) / drawDistance + ')';
        context.beginPath();
        context.moveTo(ray.onScreenX + res / 2, Math.round(horizon - ray.onScreenSize));
        context.lineTo(ray.onScreenX + res / 2, Math.round(horizon + ray.onScreenSize));
        context.stroke();
    }
}

function drawObject(object) {
    let spriteX = object.x - thisPlayer.x;
    let spriteY = object.y - thisPlayer.y;

    let dirX = Math.cos(thisPlayer.rotation * (Math.PI / 180));
    let dirY = Math.sin(thisPlayer.rotation * (Math.PI / 180));

    let planeX = -Math.sin(thisPlayer.rotation * (Math.PI / 180));
    let planeY = Math.cos(thisPlayer.rotation * (Math.PI / 180));

    let invDet = 1 / (planeX * dirY - dirX * planeY);

    let transformX = invDet * (dirY * spriteX - dirX * spriteY);
    let transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    let spriteScreenX = Math.floor(canvas.width / 2 * (1 + transformX / transformY));

    // Get sprite
    if (object.type >= 0) {
        let spriteGroup = getSprite(object.type);
        let sprite = spriteGroup[0];

        if (spriteGroup.length > 1) {
            let angle = -Math.abs(thisPlayer.rotation) + Math.abs(object.rotation) + object.relativeAngle + 360 / spriteGroup.length / 2;
            if (angle < 0) angle += 360;
            angle = angle % 360;
            let index = Math.floor((360 - angle) / 360 * spriteGroup.length);

            sprite = spriteGroup[index];
        }

        let spriteHeight = Math.abs(Math.floor(canvas.height / (transformY) * canvas.width / canvas.height / 2));
        let spriteWidth = sprite.width / sprite.height * spriteHeight;

        context.drawImage(sprite, spriteScreenX - spriteWidth / 2,
            horizon - spriteHeight / 2,
            spriteWidth,
            spriteHeight);
    }

    if (object.name !== '') {
        let alpha = 0;
        if (object.distance >= 10) alpha = 0;
        else alpha = (10 - object.distance) / 10;
        context.globalAlpha = alpha;
        context.font = '14pt Oswald';
        context.fillStyle = '#ebebeb';
        context.textAlign = 'center';
        context.fillText(object.name, spriteScreenX, horizon - 100 / object.distance);
        context.globalAlpha = 1;
    }
}

function drawMiniMap() {
    context.font = '8pt Oswald';
    context.textAlign = 'left';
    context.fillStyle = 'whitesmoke';

    let offset = 15;
    let cellSize = 5;
    let playerSize = 2;
    let playerFovSize = 20;

    context.lineWidth = 1;

    // Draw wall texture
    for (let y = 0; y < world.length; y++) {
        for (let x = 0; x < world[y].length; x++) {
            context.fillStyle = 'lightgrey';
            if (world[y][x] !== null) {
                if (world[y][x] > 0) {
                    if (transparentBlocks.includes(world[y][x])) context.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
                    context.drawImage(getWallTexture(world[y][x]), offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
                } else if (world[y][x] !== -1) {
                    context.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    if (editMode) {
        context.fillStyle = 'rgba(255,0,0,0.4)';
        context.fillRect(offset + editPoint.x * cellSize, offset + editPoint.y * cellSize, cellSize, cellSize);
    }

    // Draw objects
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        if (object.type >= 0) {
            context.fillStyle = '#5fa0ff';

            context.beginPath();
            context.arc(offset + object.x * cellSize, offset + object.y * cellSize, playerSize, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
        }
    }

    // Draw players fov
    context.globalAlpha = 0.5;

    let fov = 90;

    for (let i = 0; i < localServerData.playerList.length; i++) {
        let player = localServerData.playerList[i];
        if (player.id === thisPlayer.id) {
            player = thisPlayer;
            context.fillStyle = 'darkgrey';
        } else {
            context.fillStyle = 'red';
        }

        let cos = Math.cos((player.rotation - fov / 2) * (Math.PI / 180));
        let sin = Math.sin((player.rotation - fov / 2) * (Math.PI / 180));

        context.beginPath();
        context.moveTo(offset + player.x * cellSize, offset + player.y * cellSize);
        context.lineTo(offset + (player.x + cos) * cellSize, offset + (player.y + sin) * cellSize);

        context.arc(offset + player.x * cellSize, offset + player.y * cellSize, playerFovSize, (player.rotation - fov / 2) * (Math.PI / 180), (player.rotation + fov / 2) * (Math.PI / 180), false);

        cos = Math.cos((player.rotation + fov / 2) * (Math.PI / 180));
        sin = Math.sin((player.rotation + fov / 2) * (Math.PI / 180));
        context.moveTo(offset + player.x * cellSize, offset + player.y * cellSize);
        context.lineTo(offset + (player.x + cos) * cellSize, offset + (player.y + sin) * cellSize);
        context.lineTo(offset + (player.x + cos) * cellSize, offset + (player.y + sin) * cellSize);

        context.fill();
        context.closePath();
    }

    context.globalAlpha = 1;

    // Draw players
    for (let i = 0; i < localServerData.playerList.length; i++) {
        let player = localServerData.playerList[i];
        if (player.id === thisPlayer.id) {
            player = thisPlayer;
            context.fillStyle = 'grey';
        } else {
            context.fillStyle = 'darkred';
        }

        context.beginPath();
        context.arc(offset + player.x * cellSize, offset + player.y * cellSize, playerSize, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
    }

    context.textAlign = 'left';
    context.fillStyle = 'lightgrey';
    context.fillText(
        'x: ' + thisPlayer.x.toFixed(2) +
        ' y: ' + thisPlayer.y.toFixed(2) +
        ' rot: ' + thisPlayer.rotation.toFixed(2),
        5, 12
    );

    if (editMode) {
        context.fillStyle = 'grey';
        context.fillRect(248, 14, 36, 36);
        if (editBlock >= 0) {
            context.drawImage(textures[editBlock], 250, 16, 32, 32);
        } else {
            context.textAlign = 'center';
            context.fillStyle = 'lightgrey';
            context.fillText('VOID', 266, 36);
        }
    }
}

function drawScene() {
    drawBackground();
    drawFrame();
    drawMiniMap();

    if (currentTime - lastDataTime > 5000) $('#connectionState').css('visibility', 'visible');
    else $('#connectionState').css('visibility', 'hidden');
}

// -Physics lets-
let acceleration = 0.0006;
let friction = 1.1;

let playerSize = 0.3;

// -Physics funcs-
function updatePlayerState() {
    if (currentKeyState.w) {
        thisPlayer.speedX += acceleration * Math.cos(thisPlayer.rotation * (Math.PI / 180));
        thisPlayer.speedY += acceleration * Math.sin(thisPlayer.rotation * (Math.PI / 180));
    }
    if (currentKeyState.s) {
        thisPlayer.speedX -= acceleration * Math.cos(thisPlayer.rotation * (Math.PI / 180));
        thisPlayer.speedY -= acceleration * Math.sin(thisPlayer.rotation * (Math.PI / 180));
    }
    if (currentKeyState.a) {
        thisPlayer.speedX += acceleration * Math.cos((thisPlayer.rotation - 90) * (Math.PI / 180));
        thisPlayer.speedY += acceleration * Math.sin((thisPlayer.rotation - 90) * (Math.PI / 180));
    }
    if (currentKeyState.d) {
        thisPlayer.speedX += acceleration * Math.cos((thisPlayer.rotation + 90) * (Math.PI / 180));
        thisPlayer.speedY += acceleration * Math.sin((thisPlayer.rotation + 90) * (Math.PI / 180));
    }
}

function updatePlayerPosition(deltaTime) {
    // Update player states
    updatePlayerState();

    // Perform collision check
    // Collision on x
    // Negative offset
    let nextStep = thisPlayer.x + thisPlayer.speedX * deltaTime;
    if (!nonSolidBlocks.includes(world[Math.floor(thisPlayer.y)][Math.floor(nextStep - playerSize)])) {
        thisPlayer.x += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (!nonSolidBlocks.includes(world[Math.floor(thisPlayer.y)][Math.floor(nextStep + playerSize)])) {
        thisPlayer.x -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }

    // Collision on y
    // Negative offset
    nextStep = thisPlayer.y + thisPlayer.speedY * deltaTime;
    if (!nonSolidBlocks.includes(world[Math.floor(nextStep - playerSize)][Math.floor(thisPlayer.x)])) {
        thisPlayer.y += 1 - ((nextStep - playerSize) - Math.floor(nextStep - playerSize));
    }
    // Positive offset
    if (!nonSolidBlocks.includes(world[Math.floor(nextStep + playerSize)][Math.floor(thisPlayer.x)])) {
        thisPlayer.y -= (nextStep + playerSize) - Math.floor(nextStep + playerSize);
    }

    // Apply player speed
    thisPlayer.x += thisPlayer.speedX * deltaTime;
    thisPlayer.y += thisPlayer.speedY * deltaTime;

    // Apply friction to player speed
    thisPlayer.speedX /= friction;
    thisPlayer.speedY /= friction;

    if (world[Math.floor(thisPlayer.y)][Math.floor(thisPlayer.x)] === 10) {
        let portal = portals.filter(function( a ) {
            return (a[0].x === Math.floor(thisPlayer.x) && a[0].y === Math.floor(thisPlayer.y));
        });
        if (portal.length > 0) {
            portal = portal[0];
            thisPlayer.x += portal[1].x - portal[0].x;
            thisPlayer.y += portal[1].y - portal[0].y;
        }
    }
}

// -Controls-
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
    thisPlayer.rotation += e.movementX / 10;
    if (thisPlayer.rotation < 0) {
        thisPlayer.rotation += 360;
    } else if (thisPlayer.rotation >= 360) {
        thisPlayer.rotation -= 360;
    }
    horizon -= e.movementY * 1.5;
    if (horizon <= canvas.height / 5) {
        horizon = canvas.height / 5;
    } else if (horizon >= canvas.height / 5 * 4) {
        horizon = canvas.height / 5 * 4;
    }
}

// Update keystates on keydown
$(document).on('keydown', function (e) {
    if (e.target.tagName.toLowerCase() !== 'input' && gameState > 0) {
        if (e.keyCode === 87) currentKeyState.w = true;
        if (e.keyCode === 83) currentKeyState.s = true;
        if (e.keyCode === 65) currentKeyState.a = true;
        if (e.keyCode === 68) currentKeyState.d = true;
        if (thisPlayer.admin) {
            if (e.keyCode === 77) editMode = !editMode;
            if (e.keyCode === 37) if (editMode && (editPoint.x >= 0)) editPoint.x -= 1;
            if (e.keyCode === 38) if (editMode && (editPoint.y >= 0)) editPoint.y -= 1;
            if (e.keyCode === 39) if (editMode) editPoint.x += 1;
            if (e.keyCode === 40) if (editMode) editPoint.y += 1;
            if (e.keyCode === 13) if (editMode) client.emit('world change', editPoint.x, editPoint.y, editBlock);
            if (e.keyCode === 33) if (editMode && (editBlock > -1)) editBlock -= 1;
            if (e.keyCode === 34) if (editMode && (editBlock < textures.length - 1)) editBlock += 1;
        }
    }
});

// Update keystates on keyup
$(document).on('keyup', function (e) {
    if (e.keyCode === 87) currentKeyState.w = false;
    if (e.keyCode === 83) currentKeyState.s = false;
    if (e.keyCode === 65) currentKeyState.a = false;
    if (e.keyCode === 68) currentKeyState.d = false;
});

// Recalculate canvas size on window resize
$(window).on('resize', function () {
    contextBG.canvas.width = window.innerWidth;
    contextBG.canvas.height = window.innerHeight;
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    scanLineStep = 2 / (context.canvas.width / res);
    context.imageSmoothingEnabled = false;
    horizon = window.innerHeight / 2;
});

// Server messages
client.on('connect', function () {
    thisPlayer.id = client.io.engine.id;
});

client.on('server data', function (serverData) {
    localServerData = serverData;
    lastDataTime = Date.now();

    updateThisPlayer();
});

client.on('world data', function (worldData) {
    world = worldData.world;
    objects = worldData.objects;
    spawn = worldData.spawn;
    portals = worldData.portals;
    if (gameState === -1) {
        thisPlayer.x = spawn.x;
        thisPlayer.y = spawn.y;
        thisPlayer.rotation = spawn.rotation;
        gameState = 0;
    }
    if (worldData.reSync.x > 0) {
        thisPlayer.x += worldData.reSync.x;
    }
    if (worldData.reSync.y > 0) {
        thisPlayer.y += worldData.reSync.y;
    }
});

client.on('server message', function (msg) {
    let id = 0;
    if (messageId.length > 0) {
        id = messageId[messageId.length - 1] + 1;
    }
    messageId.push(id);
    if (messageId.length > maxMessages) {
        $('#chat' + messageId[0]).remove();
        messageId.shift();
    }

    let output;

    if (msg.type === 0) {
        msg.text = parseModifiers(msg.text);
        output = "<span id='chat" + id + "'><span style='color: #c3c3c3;'>" + msg.name + ": </span>" + msg.text + "<br></span>";
        $('#chatOutput').append(output);
        playChatSound(msg);
    } else if (msg.type === 1) {
        let temp = new Image();
        temp.src = msg.text;
        temp.onload = function () {
            if (temp.width > 0) {
                let width = temp.width;
                if (width > 300) width = 300;
                let height = temp.height / temp.width * width;
                if (height > 300) {
                    height = 300;
                    width = temp.width / temp.height * height;
                }
                output = "<span id='chat" + id + "'><span style='color: #c3c3c3;'>" + msg.name + ": </span><img src='" + msg.text + "' width='" + width + "'><br></span>";
                $('#chatOutput').append(output);
                playChatSound(msg);
            }
        };
    }
});

function parseModifiers(string) {
    string = findBold(string);
    string = findItalics(string);
    string = findDevil(string);
    return string;
}

function findBold(string) {
    let match = boldRegexp.exec(string);
    boldRegexp.lastIndex = 0;
    while (match != null) {
        string = string.replace(match[1], "<b>" + match[2] + "</b>");
        match = boldRegexp.exec(string);
        boldRegexp.lastIndex = 0;
    }
    return string;
}

function findItalics(string) {
    let match = italicsRegexp.exec(string);
    italicsRegexp.lastIndex = 0;
    while (match != null) {
        string = string.replace(match[1], "<i>" + match[2] + "</i>");
        match = italicsRegexp.exec(string);
        italicsRegexp.lastIndex = 0;
    }
    return string;
}

function findDevil(string) {
    let match = devilRegexp.exec(string);
    devilRegexp.lastIndex = 0;
    while (match != null) {
        string = string.replace(match[1], "<span style='color:red; font-size: xx-large; letter-spacing: 5px;'>" + match[2] + "</span>");
        match = devilRegexp.exec(string);
        devilRegexp.lastIndex = 0;
    }
    return string;
}

function playChatSound(msg) {
    if (msg.name === '<i>server</i>') {
        serverSound.play();
    } else {
        chatSound.play();
    }
}

function updateThisPlayer() {
    let found = localServerData.playerList.find(function (a) {
        return a.id === thisPlayer.id;
    });

    thisPlayer.admin = found.admin;
}

function sendData() {
    client.emit('client data', thisPlayer);
}

function beginGame() {
    sendData();
    client.emit('player joined');
    gameState = 1;
}

//Pre-game functions
$('#loginForm').submit(function () {
    let name = $('#nickField').val();
    let skin = $('#skinList').val();
    if (name !== '' && name.length <= 15) {
        thisPlayer.name = name;
        thisPlayer.skin = skin;
        $('#loginCard').hide();
        $('#modifiersCard').hide();
        $('#skinCard').hide();
        $('#mainCanvas').css('display', 'block');
        $('#chatForm').css('display', 'block');
        beginGame();
    }
    return false;
});

$('#chatForm').submit(function () {
    let chatBox = $('#chatBox');
    let msg = chatBox.val();
    if (msg !== '' && msg.length <= 300) {
        chatBox.val('');
        client.emit('client message', msg);
    }
    return false;
});

function drawFps() {
    context.textAlign = "right";
    context.fillStyle = 'lightgrey';
    context.fillText(
        'frame time: ' + (frameEnd - frameStart) + 'ms',
        canvas.width - 10, 45
    );
}

function drawingLoop() {
    currentTime = Date.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    deltaDifference = deltaTime / localServerData.deltaTime;

    frameStart = Date.now();

    if (gameState >= 0) {
        updatePlayerPosition(deltaTime);

        updateFrame();

        drawScene();
    }

    frameEnd = Date.now();

    drawFps();

    requestAnimationFrame(drawingLoop);
}

requestAnimationFrame(drawingLoop);

window.setInterval(function () {
    sendData();
}, sendRate);
