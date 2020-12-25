Number.prototype.toFixedNumber = function(digits, base){
    let pow = Math.pow(base||10, digits);
    return Math.round(this*pow) / pow;
}

let presetWorld = {};

// Common trigger functions
function lightSwitch(name) {
    let light = presetWorld.lights.find(function (a) { return a.name === name });
    light.disabled = !light.disabled;
    simulateLightPropagation([light.layer]);
    updateWorldLightmap();
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
        [0,3,0,0,0,0,0,0,3,1,3,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
    ],
    'floor': [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,4,4,4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,0,4,0,4,4,4,4,4,4,4,4,4,0,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4,4,4,0],
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
        {'x':9.5,'y':13.5,'rotation':0,'sound':{'name':'vague_voices', 'volume': 0.4}},
        {'x':23.5,'y':1,'rotation':0,'sound':{'name':'radio_creepy', 'volume': 0.1, 'rolloffFactor': 2.5}},
        // Triggers
        {'name':'','x':20,'y':9.2, 'onPress': () => { lightSwitch('test', {'r':0.4,'g':0.4,'b':0.4}) }},
        {'name':'','x':23,'y':10.7, 'onPress': () => { lightSwitch('tunnel', {'r':0.1,'g':0.1,'b':0.1}) }},
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
          vague_voices: [0, 131814, true],
          radio_creepy: [132814, 39789, true]
        }
    });
};

Sound.prototype = {
    speaker: function(x, y, sprite, volume = 1, rolloffFactor = 1) {
        let soundId = world.audio.sound.play(sprite);
        if (soundId !== undefined) {
            this.sound.once('play', function() {
                // Set the position of the speaker in 3D space.
                this.sound.pos(x, -0.3, y, soundId);
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

    console.log(`Lightmap generated in ${(performance.now() - startLightmap).toFixed(0)}ms`);

    updateWorldLightmap();

    // Load objects
    world.objects = presetWorld.objects;

    // Process objects
    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];

        if (object.speedX == undefined) object.speedX = 0;
        if (object.speedY == undefined) object.speedY = 0;

        if (object.type != undefined) {
            object.spriteGroup = getSprite(object.type);

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

const lightmapHeight = presetWorld.walls.length + 1;
const lightmapWidth = presetWorld.walls[0].length + 1;

let bufferLightmap = [];
let tempLightmap = [];
let finalLightmap = JSON.parse(JSON.stringify(new Array(lightmapHeight * lightmapWidth).fill(baseLightLevel)));

function simulateLightPropagation(layers) {
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

    // Simulate proparation for every light separately
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
    return world.cells[y * world.width + x];
}

function setWorldCell(x, y, cell) {
    world.cells[y * world.width + x] = cell;
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

export { world, faceToVertices, initializeWorld }