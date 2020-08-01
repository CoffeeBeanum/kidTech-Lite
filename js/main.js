import { context, canvas, debugSound, fpsLabel } from './startSettings.js'

// System lets
let frameStart;
let frameEnd;

let currentTime;
let deltaTime;
let lastTime = Date.now();

let gameState = 1;

let editMode = false;
let editPoint = new Point(0, 0);
let editBlock = -1;

let world = [];
let objects = [];
let portals = [];

// Preset default world
world = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1,1,1,1],[1,9,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],[1,8,0,0,0,0,0,0,0,0,2,0,2,0,0,0,4,0,0,6,1,4,4,4,4,4,1],[1,7,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],[1,6,0,0,0,0,0,0,0,0,0,9,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],[1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],[1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,1,1,1,4,1,1,1],[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,3,1,0,0,0,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,0,0,9,0,2,1,1],[1,1,0,0,0,0,2,0,0,5,0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,1],[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,1,4,1,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,1,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,1],[null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,2,0,0,0,1],[null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,1],[null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1],[null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,0,2],[null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,5,7],[null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,0,3],[null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,2,0,0,0,0,0,0,0,0,0,0,3],[null,null,1,1,1,2,4,2,1,1,1,1,4,1,1,1,1,null,10,0,0,0,0,0,0,0,0,0,5,9],[null,null,null,null,null,1,0,1,null,null,null,1,0,1,null,null,null,null,2,0,0,0,0,0,0,0,0,0,0,3],[null,null,null,null,null,1,4,1,null,1,1,1,4,1,1,1,null,null,1,0,0,0,0,0,0,0,0,0,0,3],[null,null,null,null,null,1,0,1,null,10,0,0,0,0,0,10,null,null,1,0,0,0,0,0,0,0,0,0,5,7],[null,null,null,null,null,1,4,1,null,1,1,1,1,1,1,1,null,null,1,0,0,0,0,0,0,0,0,0,0,2],[null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1,1,1,1,1,1,1,1,1,1],[null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],[null,null,null,1,1,2,4,2,1,1,1,1,1,1,1,1,1,1,1,0,1],[null,null,null,1,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,1],[null,null,null,1,0,0,0,0,0,5,0,0,0,1,1,1,1,1,1,1,1],[null,null,null,1,0,0,0,0,0,5,0,0,0,7],[null,null,null,1,0,0,0,0,0,5,0,0,0,8],[null,null,null,1,0,0,0,0,0,4,0,0,0,1],[null,null,null,1,1,1,1,1,1,1,1,1,1,1]];
objects = [{"name":"Cat","x":6.5,"y":11.5,"rotation":0,"type":5,"solid":0,"distance":0,"relativeAngle":0},{"name":"Blood ghoul","x":6.5,"y":12.5,"rotation":0,"type":4,"solid":0,"distance":0,"relativeAngle":0},{"name":"The Shpee","x":6.5,"y":13.5,"rotation":0,"type":3,"solid":0,"distance":0,"relativeAngle":0},{"name":"Orman Ablo","x":6.5,"y":14.5,"rotation":0,"type":2,"solid":0,"distance":0,"relativeAngle":0},{"name":"Nazi dude","x":6.5,"y":15.5,"rotation":0,"type":1,"solid":0,"distance":0,"relativeAngle":0},{"name":"Doom boi","x":6.5,"y":16.5,"rotation":0,"type":0,"solid":0,"distance":0,"relativeAngle":0},{"name":"Hi there!","x":18,"y":16.5,"rotation":0,"type":-1,"solid":0,"distance":0,"relativeAngle":0},{"name":"Welcome to Raycaster alpha!","x":19,"y":16.5,"rotation":0,"type":-1,"solid":0,"distance":0,"relativeAngle":0},{"name":"Have fun!","x":20,"y":16.5,"rotation":0,"type":-1,"solid":0,"distance":0,"relativeAngle":0},{"name":"THE LAG ROOM","x":23.5,"y":9.3,"rotation":0,"type":-1,"solid":0,"distance":0,"relativeAngle":0},{"name":"Sneaky engie","x":21.5,"y":5.5,"rotation":315,"type":6,"solid":0,"distance":0,"relativeAngle":0},{"name":"Portal experiment","x":18,"y":24.5,"rotation":0,"type":-1,"solid":0,"distance":0,"relativeAngle":0}];
portals = [[{"x":20,"y":24},{"x":19,"y":34}],[{"x":18,"y":34},{"x":19,"y":24}],[{"x":9,"y":37},{"x":14,"y":37}],[{"x":15,"y":37},{"x":10,"y":37}]];

// Player object
function Player() {
    this.x = 19;
    this.y = 20;
    this.rotation = 260;
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

// Drawing lets
function Point(x, y) {
    this.x = x;
    this.y = y;
}

let pipeline;

let maxTransparency = 10;

let resolution = 6;

let drawDistance = 50;

let scanLineStep = 2 / (context.canvas.width / resolution);

let horizon = canvas.height / 2;

let excludedBlocks = [];

// Drawing funcs
function drawBackground() {
    let gradient = context.createRadialGradient(canvas.width / 2, horizon - canvas.height * 3, canvas.height * 1.5, canvas.width / 2, horizon - canvas.height * 3, canvas.height * 3);
    gradient.addColorStop(0, '#9b9595');
    gradient.addColorStop(1, '#696467');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, horizon);

    gradient = context.createRadialGradient(canvas.width / 2, horizon + canvas.height * 3, canvas.height * 1.5, canvas.width / 2, horizon + canvas.height * 3, canvas.height * 3);
    gradient.addColorStop(0, '#887c7f');
    gradient.addColorStop(1, '#6b6061');
    context.fillStyle = gradient;
    context.fillRect(0, horizon, canvas.width, canvas.height - horizon);
}

function updateFrame() {
    let onScreenX = 0.5;

    if (resolution % 2 === 0) {
        onScreenX = 0;
    }

    context.lineWidth = resolution;

    pipeline = [];

    for (let x = -1; x <= 1;) {
        calculateScanLine(Math.sin(x) * 180 / Math.PI, onScreenX);

        x += scanLineStep;
        onScreenX += resolution;
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

    // for (let i = 0; i < localServerData.playerList.length; i++) {
    //     if (localServerData.playerList[i].id !== thisPlayer.id) {
    //         let object = new GameObject(
    //             localServerData.playerList[i].name,
    //             localServerData.playerList[i].x,
    //             localServerData.playerList[i].y,
    //             localServerData.playerList[i].rotation,
    //             localServerData.playerList[i].skin, false);
    //         let relativeAngle = Math.atan2(object.y - thisPlayer.y, object.x - thisPlayer.x) * 180 / Math.PI - thisPlayer.rotation;
    //         if (relativeAngle <= -360) relativeAngle += 360;
    //         relativeAngle *= -1;

    //         if ((relativeAngle >= 0 && relativeAngle <= 90) || (relativeAngle >= 270 && relativeAngle <= 360) ||
    //             (relativeAngle <= 0 && relativeAngle >= -90) || (relativeAngle <= -270 && relativeAngle >= -360)) {

    //             object.relativeAngle = relativeAngle;
    //             object.distance = Math.abs(Math.sqrt(Math.pow(object.x - thisPlayer.x, 2) + Math.pow(object.y - thisPlayer.y, 2)));

    //             pipeline.push(object);
    //         }
    //     }
    // }
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

        for (let i = 1; i < jumps - 1; i++) {
            if (ray.side === 0) perpWallDist += (ray.coordJumps[i + 1].x - ray.coordJumps[i].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
            else perpWallDist += (ray.coordJumps[i + 1].y - ray.coordJumps[i].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
            i++;
        }

        if (ray.side === 0) perpWallDist += (ray.x - ray.coordJumps[jumps - 1].x - modifierX + (1 - ray.stepX) / 2) / ray.dirX;
        else perpWallDist += (ray.y - ray.coordJumps[jumps - 1].y - modifierY + (1 - ray.stepY) / 2) / ray.dirY;
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

    context.drawImage(texture, Math.floor(ray.textureX * texture.width), 0, 1, texture.height, Math.floor(ray.onScreenX), horizon - ray.onScreenSize, resolution, ray.onScreenSize * 2);

    // Apply side tint
    if (ray.side === 0 && !transparentBlocks.includes(ray.texture)) {
        context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        context.beginPath();
        context.moveTo(ray.onScreenX + resolution / 2, Math.round(horizon - ray.onScreenSize));
        context.lineTo(ray.onScreenX + resolution / 2, Math.round(horizon + ray.onScreenSize));
        context.stroke();
    }

    // Apply distance fog
    if (ray.distance > 5) {
        context.strokeStyle = 'rgba(0, 0, 0, ' + (ray.distance - 5) / drawDistance + ')';
        context.beginPath();
        context.moveTo(ray.onScreenX + resolution / 2, Math.round(horizon - ray.onScreenSize));
        context.lineTo(ray.onScreenX + resolution / 2, Math.round(horizon + ray.onScreenSize));
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

// FIXME: REALLY 
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

    // Draw player fov
    context.globalAlpha = 0.5;

    let fov = 90;

    context.fillStyle = 'darkgrey';

    let cos = Math.cos((thisPlayer.rotation - fov / 2) * (Math.PI / 180));
    let sin = Math.sin((thisPlayer.rotation - fov / 2) * (Math.PI / 180));

    context.beginPath();
    context.moveTo(offset + thisPlayer.x * cellSize, offset + thisPlayer.y * cellSize);
    context.lineTo(offset + (thisPlayer.x + cos) * cellSize, offset + (thisPlayer.y + sin) * cellSize);

    context.arc(offset + thisPlayer.x * cellSize, offset + thisPlayer.y * cellSize, playerFovSize, (thisPlayer.rotation - fov / 2) * (Math.PI / 180), (thisPlayer.rotation + fov / 2) * (Math.PI / 180), false);

    cos = Math.cos((thisPlayer.rotation + fov / 2) * (Math.PI / 180));
    sin = Math.sin((thisPlayer.rotation + fov / 2) * (Math.PI / 180));
    context.moveTo(offset + thisPlayer.x * cellSize, offset + thisPlayer.y * cellSize);
    context.lineTo(offset + (thisPlayer.x + cos) * cellSize, offset + (thisPlayer.y + sin) * cellSize);
    context.lineTo(offset + (thisPlayer.x + cos) * cellSize, offset + (thisPlayer.y + sin) * cellSize);

    context.fill();
    context.closePath();

    context.globalAlpha = 1;

    // Draw thisPlayer
    context.fillStyle = 'grey';

    context.beginPath();
    context.arc(offset + thisPlayer.x * cellSize, offset + thisPlayer.y * cellSize, playerSize, 0, Math.PI * 2, true);
    context.fill();
    context.closePath();

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
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawFrame();
    drawMiniMap();
}

// Physics lets
let acceleration = 0.0006;
let friction = 1.1;

let playerSize = 0.3;

// Physics funcs
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
document.addEventListener('keydown', e => {
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
window.addEventListener('keyup', e => {
    if (e.keyCode === 87) currentKeyState.w = false;
    if (e.keyCode === 83) currentKeyState.s = false;
    if (e.keyCode === 65) currentKeyState.a = false;
    if (e.keyCode === 68) currentKeyState.d = false;
});

// Recalculate canvas size on window resize
window.onresize = function() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    scanLineStep = 2 / (context.canvas.width / resolution);
    context.imageSmoothingEnabled = false;
    horizon = window.innerHeight / 2;
}

function updateFps() {
    fpsLabel.innerHTML = `FPS: ${(1000/deltaTime).toFixed(2)}<br>Frametime: ${(frameEnd - frameStart).toFixed(2)}ms`;
}

function renderLoop() {
    currentTime = performance.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    frameStart = performance.now();

    if (gameState >= 0) {
        updatePlayerPosition(deltaTime);

        updateFrame();

        drawScene();
    }

    frameEnd = performance.now();

    updateFps();

    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);