Number.prototype.toFixedNumber = function(digits, base){
    let pow = Math.pow(base||10, digits);
    return Math.round(this*pow) / pow;
}

let presetWorld = {};

// Common trigger functions
function lightSwitch(name) {
    let light = presetWorld.lights.find(function (a) { return a.name === name });
    light.disabled = !light.disabled;

    rebakeLight(light);
}

function rebakeLight(light) {
    let startLightmap = performance.now();

    simulateLightPropagation([light.layer]);
    updateWorldLightmap();

    console.log(`Lightmap updated in ${(performance.now() - startLightmap).toFixed(0)}ms`);
}

// Raw preset world
presetWorld = {
    'walls': [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,0,0,2,2,0,0,0,0,0,2,2,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,1,3,3,3,3,2,3,3,3,3,1,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,1,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0],
        [0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,1,0],
        [0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,3,6,3,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
    ],
    'floor': [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,4,4,4,4,0,4,4,9,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,4,0,4,4,4,4,4,4,4,4,4,0,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,4,0,0,0],
        [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,0,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,0,0,0,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,0,0],
        [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,4,0,0,0],
        [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,4,4,4,4,4,4,4,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,4,4,4,4,4,4,4,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,4,4,4,4,4,4,4,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'ceiling': [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,4,4,4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,5,0,3,3,3,3,2,3,3,3,3,0,5,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0],
        [0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0],
        [0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'decals': [
        {'type':7,'x':3,'y':0}, // alpha-test
        {'type':3,'x':3,'y':0}, // warning
        {'type':2,'x':1,'y':1}, // art-engie
        {'type':1,'x':1,'y':2}, // art-vobla
        {'type':0,'x':1,'y':3}, // art-landscape
        {'type':6,'x':1,'y':4}, // epic_decals
        {'type':3,'x':11,'y':2}, // warning
        {'type':3,'x':15,'y':2}, // warning
        {'type':7,'x':10,'y':2}, // alpha-test
        {'type':2,'x':21,'y':8}, // art-engie
        {'type':5,'x':22,'y':10,'face':3}, // lag-room
        {'type':9,'x':23,'y':0,'face':3}, // old-intercom
        {'type':10,'x':20,'y':9,'face':0}, // button
        {'type':10,'x':22,'y':10,'face':2}, // button
        // metal-plates
        {'type':4,'x':1,'y':5},
        {'type':4,'x':6,'y':2},
        {'type':4,'x':8,'y':2},
        {'type':4,'x':18,'y':2},
        {'type':4,'x':20,'y':10},
        // lamps
        {'type':8,'x':2,'y':0,'face':3},
        {'type':8,'x':5,'y':0,'face':3},
        {'type':8,'x':1,'y':8,'face':2},
        {'type':8,'x':6,'y':1,'face':2},
        {'type':8,'x':20,'y':1,'face':0},
        {'type':8,'x':13,'y':2,'face':3},
        {'type':8,'x':20,'y':6,'face':0},
        {'type':8,'x':1,'y':16,'face':2},
        {'type':8,'x':20,'y':13,'face':2},
        {'type':8,'x':8,'y':13,'face':0},
        {'type':8,'x':9,'y':12,'face':1},
        {'type':8,'x':10,'y':13,'face':2},
        {'type':8,'x':23,'y':0,'face':3},
        {'type':8,'x':23,'y':8,'face':0}
    ],
    'lightmap': [],
    'lights': [
        {'intensity':{'r':0,'g':0,'b':1.5},'x':2,'y':0,'face':3},
        {'intensity':{'r':1.5,'g':0,'b':0},'x':5,'y':0,'face':3},
        {'intensity':{'r':1,'g':1,'b':1},'x':1,'y':8,'face':2},
        {'intensity':{'r':0.4,'g':0,'b':0.4},'x':6,'y':1,'face':2},
        {'intensity':{'r':0.4,'g':0,'b':0.4},'x':20,'y':1,'face':0},
        {'intensity':{'r':1,'g':0,'b':1},'x':13,'y':2,'face':3},
        {'intensity':{'r':0.4,'g':0.4,'b':0.4},'x':20,'y':6,'face':0,'name':'test'},
        {'intensity':{'r':0.5,'g':1,'b':0.5},'x':1,'y':16,'face':2},
        {'intensity':{'r':1.5,'g':0,'b':0},'x':8,'y':13,'face':0},
        {'intensity':{'r':0,'g':0,'b':1.5},'x':9,'y':12,'face':1},
        {'intensity':{'r':0,'g':1.5,'b':0},'x':10,'y':13,'face':2},
        {'intensity':{'r':1.2,'g':0,'b':0},'x':23,'y':0,'face':3},
        {'intensity':{'r':0.1,'g':0.1,'b':0.1},'x':23,'y':8,'face':0,'name':'tunnel','disabled':true}
    ],
    'lightmapOverrides': [
        {'value':{'r':0,'g':0,'b':0},'x':21,'y':6}
    ],
    'objects': [
        // Sprites
        {'name':'Doom guy','x':2.5,'y':15.5,'rotation':0,'type':0},
        {'name':'Nazi dude','x':2.5,'y':14.5,'rotation':0,'type':1},
        {'name':'Orman Ablo','x':2.5,'y':13.5,'rotation':0,'type':2},
        {'name':'The Famous Shpee','x':2.5,'y':12.5,'rotation':0, 'type':3},
        {'name':'Engineer TF2','x':2.5,'y':11.5,'rotation':0,'type':6},
        {'name':'Cat','x':2.5,'y':10.5,'rotation':0,'type':5},
        {'name':'Explosion','x':2.5,'y':9.5,'rotation':0,'type':7},
        {'name':'Rocket','x':2.5,'y':8.5,'rotation':0,'type':8},
        {'x':24.7,'y':7.7,'rotation':225,'type':6},
        {'x':21.3,'y':5.7,'rotation':315,'type':4},
        {'x':23.5,'y':1.5,'rotation':0,'type':9},
        // Music
        {'x':9.5,'y':13.5,'rotation':0,'sound':{'name':'vague_voices', 'volume': 0.4}},
        {'x':23.5,'y':1,'rotation':0,'sound':{'name':'radio_creepy', 'volume': 0.1, 'rolloffFactor': 2.5}},
        // Triggers
        {'x':20,'y':9.2, 'onPress': () => { lightSwitch('test') }},
        {'x':23,'y':10.7, 'onPress': () => { lightSwitch('tunnel') }}
    ],
    'portals': [
        {0:{'x':9,'y':1},1:{'x':18,'y':1}},
        {0:{'x':17,'y':1},1:{'x':8,'y':1}},
        {0:{'x':10,'y':1},1:{'x':15,'y':1}},
        {0:{'x':16,'y':1},1:{'x':11,'y':1}}
    ],
    'music': [
        {'name':'vague_voices', 'x':23.5,'y':1},
        {'name':'radio_creepy', 'x':5.5,'y':3.5},
    ]
}

const Sound = function() {
    // Setup the shared Howl.
    this.sound = new Howl({
        src: ['resources/sounds/sprite.mp3'],
        sprite: {
          vague_voices: [0, 102582.85714285713, true],
          radio_creepy: [104000, 329012.2448979592, true]
        }
    });
};

Sound.prototype = {
    speaker: function(x, y, sprite, volume = 1, rolloffFactor = 1) {
        let soundId = world.audio.sound.play(sprite);
        if (soundId !== undefined) {
            this.sound.once('play', function() {
                // Set the position of the speaker in 3D space.
                this.sound.pos(x, -0.5, y, soundId);
                this.sound.volume(volume, soundId);
                
                this.sound.pannerAttr({
                    panningModel: 'HRTF',
                    refDistance: 1,
                    rolloffFactor: rolloffFactor,
                    distanceModel: 'exponential'
                }, soundId);
            }.bind(this), soundId);
        }
    }   
}

function contactNodeAvailable(chunks) {
    let nodeAvailable = false;

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        let chunk = chunks[chunkIndex];
        if (hasFreeContactNode(chunk)) {
            nodeAvailable = true;
        }
    }

    return nodeAvailable;
}

function hasFreeContactNode(chunk) {
    let hasFreeNode = false;

    for (let nodeIndex = 0; nodeIndex < chunk.contactNodes.length; nodeIndex++) {
        let node = chunk.contactNodes[nodeIndex];
        if (node.connected == undefined) {
            hasFreeNode = true;
        }
    }

    return hasFreeNode;
}

const getJSON = async url => {
    const response = await fetch(url);
    return response.json(); // get JSON from the response 
}

function shuffle(array) {
    let i = array.length;
    while (i--) {
        const ri = Math.floor(Math.random() * i);
        [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
}

function rotateCW(array) {
    var result = [];
    array.forEach(function (a, i, aa) {
        a.forEach(function (b, j, bb) {
            result[bb.length - j - 1] = result[bb.length - j - 1] || [];
            result[bb.length - j - 1][i] = b;
        });
    });
    return result;
}

function rotateCCW(array) {
    var result = [];
    array.forEach(function (a, i, aa) {
        a.forEach(function (b, j, bb) {
            result[j] = result[j] || [];
            result[j][aa.length - i - 1] = b;
        });
    });
    return result;
}

function rotatePoint(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function rotateChunk(chunk, targetSide, side) {
    let rotations = 0;

    while (Math.abs(targetSide - side) != 2) {
        chunk.walls = rotateCCW(chunk.walls);
        chunk.floor = rotateCCW(chunk.floor);
        chunk.ceiling = rotateCCW(chunk.ceiling);

        rotations++;
        side++;
        if (side > 3) side = 0;
    }

    let angle = -90 * rotations;
    let centerX = chunk.walls[0].length / 2 - 0.5;
    let centerY = chunk.walls.length / 2 - 0.5;

    for (let nodeIndex = 0; nodeIndex < chunk.contactNodes.length; nodeIndex++) {
        let node = chunk.contactNodes[nodeIndex];

        let coordinates = rotatePoint(centerX, centerY, node.x, node.y, angle);
        node.x = Math.round(coordinates[0]);
        node.y = Math.round(coordinates[1]);

        node.side = (node.side + rotations) % 4;

        chunk.contactNodes[nodeIndex] = node;
    }
    
    for (let decalIndex = 0; decalIndex < chunk.decals.length; decalIndex++) {
        let decal = chunk.decals[decalIndex];

        let coordinates = rotatePoint(centerX, centerY, decal.x, decal.y, angle);
        decal.x = Math.round(coordinates[0]);
        decal.y = Math.round(coordinates[1]);

        decal.face = (decal.face + rotations) % 4;

        chunk.decals[decalIndex] = decal;
    }
    
    for (let lightIndex = 0; lightIndex < chunk.lights.length; lightIndex++) {
        let light = chunk.lights[lightIndex];

        let coordinates = rotatePoint(centerX, centerY, light.x, light.y, angle);
        light.x = Math.round(coordinates[0]);
        light.y = Math.round(coordinates[1]);

        light.face = (light.face + rotations) % 4;

        chunk.lights[lightIndex] = light;
    }

    console.log(rotations);

    return chunk;
}

function generateWorld() {
    getJSON("js/chunks.json")
    .then(presetChunks => {
        let startWorldGen = performance.now();

        let chunks = [];

        let initialChunk = presetChunks[0];
        initialChunk.x = 0;
        initialChunk.y = 0;
        chunks.push(initialChunk);

        let generationDone = false;

        while (!generationDone) {
            let addedChunk = false;

            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                let chunk = JSON.parse(JSON.stringify(chunks[chunkIndex]));

                for (let nodeIndex = 0; nodeIndex < chunk.contactNodes.length; nodeIndex++) {
                    let node = chunk.contactNodes[nodeIndex];

                    if (node.connected == undefined) {
                        // let shuffledChunks = shuffle(presetChunks);
                        let shuffledChunks = [presetChunks[1]];

                        for (let newChunkIndex = 0; newChunkIndex < shuffledChunks.length; newChunkIndex++) {
                            let newChunk = JSON.parse(JSON.stringify(shuffledChunks[newChunkIndex]));

                            for (let newNodeIndex = 0; newNodeIndex < newChunk.contactNodes.length; newNodeIndex++) {
                                let newNode = newChunk.contactNodes[newNodeIndex];

                                if (newNode.size == node.size) {

                                    if (Math.abs(node.side - newNode.side) != 2) {
                                        console.log(`Pre-rotation: ${node.side}:${newNode.side}`);

                                        newChunk = rotateChunk(newChunk, node.side, newNode.side);

                                        console.log(`Post-rotation: ${node.side}:${newNode.side}`);
                                    }

                                    node.connected = newChunk.name;
                                    newNode.connected = chunk.name;

                                    chunk.contactNodes[nodeIndex] = node;
                                    chunks[chunkIndex] = chunk;
                                    newChunk.contactNodes[newNodeIndex] = newNode;

                                    newChunk.x = chunk.x + node.x - newNode.x;
                                    newChunk.y = chunk.y + node.y - newNode.y;

                                    switch (newNode.side) {
                                        case 0: newChunk.x += 1; break;
                                        case 1: newChunk.y += 1; break;
                                        case 2: newChunk.x -= 1; break;
                                        case 3: newChunk.y -= 1; break;
                                        default: break;
                                    }

                                    console.log(newChunk);

                                    chunks.push(newChunk);

                                    addedChunk = true;
                                }

                                if (addedChunk) break;
                            }

                            if (addedChunk) break;
                        }
                    }

                    if (addedChunk || generationDone) break;
                }

                if (addedChunk || generationDone) break;
            }

            if (!addedChunk) {
                generationDone = true;
            }
        }

        presetWorld.walls = [];
        presetWorld.floor = [];
        presetWorld.ceiling = [];
        presetWorld.decals = [];
        presetWorld.portals = [];
        // presetWorld.objects = [];
        presetWorld.lights = [];
        presetWorld.lightmapOverrides = [];

        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            let chunk = chunks[chunkIndex];

            if (chunk.x < minX) minX = chunk.x;
            if (chunk.y < minY) minY = chunk.y;
            if (chunk.x + chunk.walls[0].length > maxX) maxX = chunk.x + chunk.walls[0].length;
            if (chunk.y + chunk.walls.length > maxY) maxY = chunk.y + chunk.walls.length;
        }

        maxX -= minX;
        maxY -= minY;

        for (let y = 0; y < maxY; y++) {
                presetWorld.walls[y] = new Array(maxX).fill(0);
                presetWorld.floor[y] = new Array(maxX).fill(0);
                presetWorld.ceiling[y] = new Array(maxX).fill(0);
        }

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            let chunk = chunks[chunkIndex];

            for (let y = 0; y < chunk.walls.length; y++) {
                for (let x = 0; x < chunk.walls[0].length; x++) {
                    let worldX = chunk.x + x - minX;
                    let worldY = chunk.y + y - minY;

                    presetWorld.walls[worldY][worldX] = chunk.walls[y][x];
                    presetWorld.floor[worldY][worldX] = chunk.floor[y][x];
                    presetWorld.ceiling[worldY][worldX] = chunk.ceiling[y][x];
                }
            }

            for (let decalIndex = 0; decalIndex < chunk.decals.length; decalIndex++) {
                let decal = chunk.decals[decalIndex];

                decal.x += chunk.x - minX;
                decal.y += chunk.y - minY;

                presetWorld.decals.push(decal);
            }

            for (let lightIndex = 0; lightIndex < chunk.lights.length; lightIndex++) {
                let light = chunk.lights[lightIndex];

                light.x += chunk.x - minX;
                light.y += chunk.y - minY;

                presetWorld.lights.push(light);
            }
        }

        console.log(`World generated in ${(performance.now() - startWorldGen).toFixed(0)}ms`);

        initializeWorld();
    });
}

// Optimized world object used in-game
var world = {
    'cells': [],
    'objects': [],
    'audio': new Sound(),
    'width': 0,
    'height': 0
}

function initializeWorld() {
    let start = performance.now();

    world.height = presetWorld.walls.length;
    world.width = presetWorld.walls[0].length;

    // Load world cells
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            let wall = presetWorld.walls[y][x];
            let floor = presetWorld.floor[y][x];
            let ceiling = presetWorld.ceiling[y][x];
            let solid = !nonSolidBlocks.includes(presetWorld.walls[y][x]);
            let transparent = transparentBlocks.includes(presetWorld.walls[y][x]);
            let mergeable = mergeableBlocks.includes(presetWorld.walls[y][x]);
            let decals = presetWorld.decals.filter(function (a) {
                return (a.x === x && a.y === y);
            });
            
            let portal = null;
            let portalObjects = presetWorld.portals.filter(function (a) {
                return (a[0].x === x && a[0].y === y);
            });
            if (portalObjects.length > 0) {
                portal = {
                    'x': portalObjects[0][1].x - portalObjects[0][0].x, 
                    'y': portalObjects[0][1].y - portalObjects[0][0].y
                };
            }
    
            let worldCell = {
                'wall': wall,
                'floor': floor,
                'ceiling': ceiling,
                'solid': solid,
                'transparent': transparent,
                'mergeable': mergeable,
                'decals': decals,
                'portal': portal,
                'lightmap': null
            };
    
            world.cells.push(worldCell);
        }
    }

    let startLightmap = performance.now();

    simulateLightPropagation();

    updateWorldLightmap();

    console.log(`Lightmap generated in ${(performance.now() - startLightmap).toFixed(0)}ms`);

    // Load objects
    world.objects = presetWorld.objects;

    // Process objects
    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];

        if (object.speedX == undefined) object.speedX = 0;
        if (object.speedY == undefined) object.speedY = 0;

        if (object.type != undefined) {
            object.sprites = getSprite(object.type);

            if (object.origin == undefined && object.scale == undefined) {
                switch(object.type) {
                    case 0: object.origin = -1.05; object.scale = 0.6; break; // Doom guy
                    case 1: object.origin = -1;    object.scale = 0.6; break; // Nazi
                    case 2: object.origin = -1;    object.scale = 0.6; break; // Spessman
                    case 3: object.origin = -1;    object.scale = 0.6; break; // Spy
                    case 4: object.origin = -1;    object.scale = 0.6; break; // Blood
                    case 5: object.origin = -1;    object.scale = 0.3; break; // Cat
                    case 6: object.origin = -1.05; object.scale = 0.6; break; // Engie
                    case 7: object.origin = 0;     object.scale = 1;   break; // Explosion
                    case 8: object.origin = -1;    object.scale = 0.2; break; // Rocket
                    case 9: object.origin = -1;    object.scale = 0.7; break; // Engie-dance
    
                    default: object.origin = -1; object.scale = 0.3;
                }
            } else {
                if (object.origin == undefined) object.origin = -1;
                if (object.scale == undefined) object.scale = 1;
            }
        }

        if (object.sound !== undefined && object.sound.name !== undefined) {
            world.audio.speaker(object.x, object.y, object.sound.name, object.sound.volume, object.sound.rolloffFactor);
        }
    }

    console.log(`World initialized in ${(performance.now() - start).toFixed(0)}ms`);
}

function updateWorldLightmap() {
    // Load final lightmap
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            let cell = getWorldCell(x, y);

            cell.lightmap = {
                0: getFinalLightmapCell(x,   y),
                1: getFinalLightmapCell(x+1, y),
                2: getFinalLightmapCell(x+1, y+1),
                3: getFinalLightmapCell(x,   y+1),
                'average': {'r':0,'g':0,'b':0},
                'uniform': true
            };

            calculateBakedAverage(cell.lightmap, 2);

            setWorldCell(x, y, cell);
        }
    }
}

// Lightmap propagation settings
const maxLightRefineIterations = 10;
const lightFalloffFactor = 0.6;
const lightDiagonalFalloffFactor = 0.8;
const baseLightLevel = {'r':0,'g':0,'b':0};
const ambientLightLevel = {'r':0.1,'g':0.1,'b':0.15};

let lightmapHeight = 0;
let lightmapWidth = 0;

let bufferLightmap = [];
let tempLightmap = [];
let finalLightmap = [];

function simulateLightPropagation(layers) {
    lightmapHeight = presetWorld.walls.length + 1;
    lightmapWidth = presetWorld.walls[0].length + 1;

    finalLightmap = JSON.parse(JSON.stringify(new Array(lightmapHeight * lightmapWidth).fill(baseLightLevel)));

    if (layers === undefined) bufferLightmap = [...Array(presetWorld.lights.length)].map(() => new Array(lightmapHeight * lightmapWidth).fill({'r':0,'g':0,'b':0}));

    // Apply ambient light to exposed cells
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            let cell = getWorldCell(x, y);
            if (cell.transparent && cell.ceiling === 0) {
                addFinalLightmapCell(x,   y,   ambientLightLevel);
                addFinalLightmapCell(x+1, y,   ambientLightLevel);
                addFinalLightmapCell(x+1, y+1, ambientLightLevel);
                addFinalLightmapCell(x,   y+1, ambientLightLevel);
            }
        }
    }

    // Simulate proparation for every light source separately
    for (let i = 0; i < presetWorld.lights.length; i++) {
        if (layers !== undefined) {
            if (layers.includes(i)) {
                bufferLightmap[i] = new Array(lightmapHeight * lightmapWidth).fill({'r':0,'g':0,'b':0});
                simulateLightPropagationFor(i);
            }
        } else simulateLightPropagationFor(i);

        // Apply light to final lightmap
        for (let y = 0; y < world.height; y++) {
            for (let x = 0; x < world.width; x++) {
                addFinalLightmapCell(x, y, getBufferLightmapCell(i, x, y));
            }
        }
    }

    // Apply lightmap overrides
    for (let i = 0; i < presetWorld.lightmapOverrides.length; i++) {
        let override = presetWorld.lightmapOverrides[i];
        setFinalLightmapCell(override.x, override.y, override.value);
    }
}

function simulateLightPropagationFor(i) {
    let light = presetWorld.lights[i];
    light.layer = i;

    if (light.disabled) return;

    let lightVertices = faceToVertices(light.face);

    for (let v = 0; v < lightVertices.length; v++) {
        switch(lightVertices[v]) {
            case 0: setBufferLightmapCell(i, light.x,   light.y,   light.intensity); break;
            case 1: setBufferLightmapCell(i, light.x+1, light.y,   light.intensity); break;
            case 2: setBufferLightmapCell(i, light.x+1, light.y+1, light.intensity); break;
            case 3: setBufferLightmapCell(i, light.x,   light.y+1, light.intensity); break;
        }
    }

    for (let refine = 0; refine < maxLightRefineIterations; refine++) {
        tempLightmap = JSON.parse(JSON.stringify(bufferLightmap[i]));

        for (let y = 0; y < lightmapHeight; y++) {
            for (let x = 0; x < lightmapWidth; x++) {
                let lightmapCell = { ...getBufferLightmapCell(i, x, y) };

                // Skip propagation for empty cells
                if (lightmapCell.r <= baseLightLevel.r && lightmapCell.g <= baseLightLevel.g && lightmapCell.b <= baseLightLevel.b) continue;

                if (x - 1 >= 0 && x < world.width && y - 1 >= 0 && y < world.height) {

                    // Direct propagation
                    applyLightmapCellMultiplier(lightmapCell, lightFalloffFactor);

                    // Up
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y - 1).transparent) updateTempLightmapCell(i, x, y - 1, lightmapCell);

                    // Left
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x - 1, y).transparent) updateTempLightmapCell(i, x - 1, y, lightmapCell);

                    // Right
                    if (getWorldCell(x, y - 1).transparent || getWorldCell(x, y).transparent) updateTempLightmapCell(i, x + 1, y, lightmapCell);

                    // Down
                    if (getWorldCell(x - 1, y).transparent || getWorldCell(x, y).transparent) updateTempLightmapCell(i, x, y + 1, lightmapCell);

                    // Diagonal propagation
                    applyLightmapCellMultiplier(lightmapCell, lightDiagonalFalloffFactor);

                    // Left-Up
                    if (getWorldCell(x - 1, y - 1).transparent && (getWorldCell(x - 1, y).transparent || getWorldCell(x, y - 1).transparent)) updateTempLightmapCell(i, x - 1, y - 1, lightmapCell);

                    // Right-Up
                    if (getWorldCell(x, y - 1).transparent && (getWorldCell(x, y).transparent || getWorldCell(x - 1, y - 1).transparent)) updateTempLightmapCell(i, x + 1, y - 1, lightmapCell);

                    // Left-Down
                    if (getWorldCell(x - 1, y).transparent && (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y).transparent)) updateTempLightmapCell(i, x - 1, y - 1, lightmapCell);

                    // Right-Down
                    if (getWorldCell(x, y).transparent && (getWorldCell(x, y - 1).transparent || getWorldCell(x - 1, y).transparent)) updateTempLightmapCell(i, x + 1, y + 1, lightmapCell);
                }
            }
        }

        bufferLightmap[i] = tempLightmap;
    }
}

initializeWorld();
// generateWorld();

function faceToVertices(face) {
    switch (face) {
        case 0: return [3, 0];
        case 1: return [0, 1];
        case 2: return [1, 2];
        case 3: return [2, 3];
        default: return [0, 1, 2, 3];
    }
}

// Final lightmap functions
function addFinalLightmapCell(x, y, value) {
    finalLightmap[y * lightmapWidth + x].r += value.r;
    finalLightmap[y * lightmapWidth + x].g += value.g;
    finalLightmap[y * lightmapWidth + x].b += value.b;
}

function setFinalLightmapCell(x, y, value) {
    finalLightmap[y * lightmapWidth + x] = value;
}

function getFinalLightmapCell(x, y) {
    return finalLightmap[y * lightmapWidth + x];
}

// Buffer lightmap functions
function getBufferLightmapCell(i, x, y) {
    return bufferLightmap[i][y * lightmapWidth + x];
}

function setBufferLightmapCell(i, x, y, value) {
    bufferLightmap[i][y * lightmapWidth + x] = value;
}

// World cell functions
function getWorldCell(x, y) {
    return world.cells[Math.trunc(y) * world.width + Math.trunc(x)];
}

function setWorldCell(x, y, cell) {
    world.cells[Math.trunc(y) * world.width + Math.trunc(x)] = cell;
}

// Lightmap cell functions
function calculateBakedAverage(lightmap) {
    lightmap.average.r = (lightmap[0].r + lightmap[1].r + lightmap[2].r + lightmap[3].r) / 4;
    lightmap.average.g = (lightmap[0].g + lightmap[1].g + lightmap[2].g + lightmap[3].g) / 4;
    lightmap.average.b = (lightmap[0].b + lightmap[1].b + lightmap[2].b + lightmap[3].b) / 4;

    lightmap.uniform = (
        (lightmap[0].r === lightmap[1].r && lightmap[1].r === lightmap[2].r && lightmap[2].r === lightmap[3].r) &&
        (lightmap[0].g === lightmap[1].g && lightmap[1].g === lightmap[2].g && lightmap[2].g === lightmap[3].g) &&
        (lightmap[0].b === lightmap[1].b && lightmap[1].b === lightmap[2].b && lightmap[2].b === lightmap[3].b)
    );
}

function applyLightmapCellMultiplier(cell, multiplier) {
    cell.r *= multiplier;
    cell.g *= multiplier;
    cell.b *= multiplier;

    return cell;
}

function updateTempLightmapCell(i, x, y, value, threshold) {
    let referenceCell = getBufferLightmapCell(i, x, y);
    let cell = tempLightmap[(y) * lightmapWidth + x];

    if (referenceCell.r < value.r) cell.r = value.r;
    if (referenceCell.g < value.g) cell.g = value.g;
    if (referenceCell.b < value.b) cell.b = value.b;
}

Number.prototype.toFixedNumber = function(digits, base){
    let pow = Math.pow(base||10, digits);
    return Math.round(this*pow) / pow;
}

export { world, getWorldCell, faceToVertices, initializeWorld }