var DEBUG_SOUND = 'resources/sounds/server_message.wav';

var piRatio = Math.PI / 180;

// Preset default world
var presetWorld = {
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
        [0,3,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],
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
    'lightmap': [],
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
        {'type':9,'x':23,'y':0,'face':3},
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
        {'type':8,'x':23,'y':0,'face':3}
    ],
    'objects': [
        {'name':'Doom guy','x':2.5,'y':15.5,'rotation':0,'type':0},
        {'name':'Nazi dude','x':2.5,'y':14.5,'rotation':0,'type':1},
        {'name':'Orman Ablo','x':2.5,'y':13.5,'rotation':0,'type':2},
        {'name':'The Famous Shpee','x':2.5,'y':12.5,'rotation':0,'type':3},
        {'name':'Engineer TF2','x':2.5,'y':11.5,'rotation':0,'type':6},
        {'name':'Cat','x':2.5,'y':10.5,'rotation':0,'type':5},
        {'name':'','x':24.7,'y':7.7,'rotation':225,'type':6},
        {'name':'','x':21.5,'y':5.5,'rotation':315,'type':4},
        {'name':'','x':9.5,'y':13.5,'rotation':0,'sound':{'name':'vague_voices', 'volume': 0.4}},
        {'name':'','x':23.5,'y':1,'rotation':0,'sound':{'name':'radio_creepy', 'volume': 0.1, 'rolloffFactor': 2.5}}
    ],
    'portals': [
        [{'x':20,'y':24},{'x':19,'y':34}],
        [{'x':18,'y':34},{'x':19,'y':24}],
        [{'x':9,'y':37},{'x':14,'y':37}],
        [{'x':15,'y':37},{'x':10,'y':37}],
        [{'x':9,'y':1},{'x':18,'y':1}],
        [{'x':17,'y':1},{'x':8,'y':1}],
        [{'x':10,'y':1},{'x':15,'y':1}],
        [{'x':16,'y':1},{'x':11,'y':1}]
    ],
    'lights': [
        {'intensity':{'r':0,'g':0,'b':1.5},'x':2,'y':0,'face':3},
        {'intensity':{'r':1.5,'g':0,'b':0},'x':5,'y':0,'face':3},
        {'intensity':{'r':1,'g':1,'b':1},'x':1,'y':8,'face':2},
        {'intensity':{'r':0.4,'g':0,'b':0.4},'x':6,'y':1,'face':2},
        {'intensity':{'r':0.4,'g':0,'b':0.4},'x':20,'y':1,'face':0},
        {'intensity':{'r':1,'g':0,'b':1},'x':13,'y':2,'face':3},
        {'intensity':{'r':0.4,'g':0.4,'b':0.4},'x':20,'y':6,'face':0},
        {'intensity':{'r':0.5,'g':1,'b':0.5},'x':1,'y':16,'face':2},
        // {'intensity':{'r':1,'g':0,'b':0},'x':20,'y':13,'face':2},
        {'intensity':{'r':1.5,'g':0,'b':0},'x':8,'y':13,'face':0},
        {'intensity':{'r':0,'g':0,'b':1.5},'x':9,'y':12,'face':1},
        {'intensity':{'r':0,'g':1.5,'b':0},'x':10,'y':13,'face':2},
        {'intensity':{'r':1,'g':0,'b':0},'x':23,'y':0,'face':3}
    ],
    'music': [
        {'name':'vague_voices', 'x':23.5,'y':1},
        {'name':'radio_creepy', 'x':5.5,'y':3.5},
    ]
}

var Sound = function() {
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
    
                // Tweak the attributes to get the desired effect.
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

var world = {
    'cells': [],
    'objects': [],
    'audio': new Sound(),
    'width': 0,
    'height': 0
}

function initializeWorld() {
    world.height = presetWorld.walls.length;
    world.width = presetWorld.walls[0].length;

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

    simulateLightPropagation();

    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            let cell = getWorldCell(x, y);

            cell.lightmap = {
                0: getPresetLightmapCell(x,   y),
                1: getPresetLightmapCell(x+1, y),
                2: getPresetLightmapCell(x+1, y+1),
                3: getPresetLightmapCell(x,   y+1),
                'average': {'r':0,'g':0,'b':0},
                'uniform': true
            };

            calculateAverageLightmap(cell.lightmap);

            setWorldCell(x, y, cell);
        }
    }

    world.objects = presetWorld.objects;

    for (let i = 0; i < world.objects.length; i++) {
        let object = world.objects[i];
        if (object.sound !== undefined && object.sound.name !== undefined) {
            world.audio.speaker(object.x, object.y, object.sound.name, object.sound.volume, object.sound.rolloffFactor);
        }
    }
}

const maxLightRefineIterations = 10;
const lightCellFalloff = 0.7;
const lightDiagonalFalloffFactor = 0.8;
const baseLightLevel = {'r':0,'g':0,'b':0};
const ambientLightLevel = {'r':0.1,'g':0.1,'b':0.15};
let tempLightmap = [];

function simulateLightPropagation() {
    const lightmapHeight = presetWorld.walls.length + 1;
    const lightmapWidth = presetWorld.walls[0].length + 1;

    presetWorld.lightmap = Array(lightmapHeight * lightmapWidth).fill(baseLightLevel);

    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            let cell = getWorldCell(x, y);
            if (cell.transparent && cell.ceiling === 0) {
                setPresetLightmapCell(x,   y,   ambientLightLevel);
                setPresetLightmapCell(x+1, y,   ambientLightLevel);
                setPresetLightmapCell(x+1, y+1, ambientLightLevel);
                setPresetLightmapCell(x,   y+1, ambientLightLevel);
            }
        }
    }

    for (let i = 0; i < presetWorld.lights.length; i++) {
        let light = presetWorld.lights[i];
        let lightVertices = faceToVertices(light.face);

        for (let v = 0; v < lightVertices.length; v++) {
            switch(lightVertices[v]) {
                case 0: setPresetLightmapCell(light.x,   light.y,   light.intensity); break;
                case 1: setPresetLightmapCell(light.x+1, light.y,   light.intensity); break;
                case 2: setPresetLightmapCell(light.x+1, light.y+1, light.intensity); break;
                case 3: setPresetLightmapCell(light.x,   light.y+1, light.intensity); break;
            }
        }
    }

    for (let i = 0; i < maxLightRefineIterations; i++) {
        tempLightmap = JSON.parse(JSON.stringify(presetWorld.lightmap));
    
        for (let y = 0; y < lightmapHeight; y++) {
            for (let x = 0; x < lightmapWidth; x++) {
                let lightmapCell = { ...getPresetLightmapCell(x, y) };
    
                if (lightmapCell.r <= ambientLightLevel.r && lightmapCell.g <= ambientLightLevel.g && lightmapCell.b <= ambientLightLevel.b) continue;

                if (x - 1 >= 0 && x < world.width && y - 1 >= 0 && y < world.height) {
                    // Direct propagation
                    lightmapCell.r *= lightCellFalloff;
                    lightmapCell.g *= lightCellFalloff;
                    lightmapCell.b *= lightCellFalloff;

                    // Up
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y - 1).transparent) updateLightingCell(x, y - 1, lightmapCell);

                    // Left
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x - 1, y).transparent) updateLightingCell(x - 1, y, lightmapCell);

                    // Right
                    if (getWorldCell(x, y - 1).transparent || getWorldCell(x, y).transparent) updateLightingCell(x + 1, y, lightmapCell);

                    // Down
                    if (getWorldCell(x - 1, y).transparent || getWorldCell(x, y).transparent) updateLightingCell(x, y + 1, lightmapCell);

                    // Diagonal propagation
                    lightmapCell.r *= lightDiagonalFalloffFactor;
                    lightmapCell.g *= lightDiagonalFalloffFactor;
                    lightmapCell.b *= lightDiagonalFalloffFactor;

                    // Left-Up
                    if (getWorldCell(x - 1, y - 1).transparent && (getWorldCell(x - 1, y).transparent || getWorldCell(x, y - 1).transparent)) updateLightingCell(x - 1, y - 1, lightmapCell);

                    // Right-Up
                    if (getWorldCell(x, y - 1).transparent && (getWorldCell(x, y).transparent || getWorldCell(x - 1, y - 1).transparent)) updateLightingCell(x + 1, y - 1, lightmapCell);

                    // Left-Down
                    if (getWorldCell(x - 1, y).transparent && (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y).transparent)) updateLightingCell(x - 1, y - 1, lightmapCell);

                    // Right-Down
                    if (getWorldCell(x, y).transparent && (getWorldCell(x, y - 1).transparent || getWorldCell(x - 1, y).transparent)) updateLightingCell(x + 1, y + 1, lightmapCell);
                }
            }
        }
    
        presetWorld.lightmap = tempLightmap;
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

function getPresetLightmapCell(x, y) {
    return presetWorld.lightmap[y * presetWorld.walls[0].length + x];
}

function setPresetLightmapCell(x, y, value) {
    presetWorld.lightmap[y * presetWorld.walls[0].length + x] = value;
}

function getWorldCell(x, y) {
    return world.cells[y * world.width + x];
}

function setWorldCell(x, y, cell) {
    world.cells[y * world.width + x] = cell;
}

function calculateAverageLightmap(lightmap) {
    lightmap.average.r = (lightmap[0].r + lightmap[1].r + lightmap[2].r + lightmap[3].r) / 4;
    lightmap.average.g = (lightmap[0].g + lightmap[1].g + lightmap[2].g + lightmap[3].g) / 4;
    lightmap.average.b = (lightmap[0].b + lightmap[1].b + lightmap[2].b + lightmap[3].b) / 4;

    lightmap.uniform = (
        (lightmap[0].r === lightmap[1].r && lightmap[1].r === lightmap[2].r && lightmap[2].r === lightmap[3].r) &&
        (lightmap[0].g === lightmap[1].g && lightmap[1].g === lightmap[2].g && lightmap[2].g === lightmap[3].g) &&
        (lightmap[0].b === lightmap[1].b && lightmap[1].b === lightmap[2].b && lightmap[2].b === lightmap[3].b)
    );
}

function updateLightingCell(x, y, value) {
    let referenceCell = getPresetLightmapCell(x, y);
    let cell = tempLightmap[(y) * presetWorld.walls[0].length + x];

    if (referenceCell.r < value.r) cell.r = value.r;
    if (referenceCell.g < value.g) cell.g = value.g;
    if (referenceCell.b < value.b) cell.b = value.b;
}

export { world, faceToVertices, DEBUG_SOUND, piRatio }
