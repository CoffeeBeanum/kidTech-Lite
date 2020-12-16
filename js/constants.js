var DEBUG_SOUND = 'resources/sounds/server_message.wav';

var piRatio = Math.PI / 180;

// Preset default world
var presetWorld = {
    'walls': [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,0,0,5,5,0,0,0,0,0,5,5,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,1,3,3,3,3,2,3,3,3,3,1,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,1,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0],
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0],
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
        {'type':2,'x':1,'y':1},
        {'type':1,'x':1,'y':2},
        {'type':0,'x':1,'y':3},
        {'type':6,'x':1,'y':4},
        {'type':4,'x':1,'y':5},
        {'type':3,'x':11,'y':2},
        {'type':3,'x':15,'y':2},
        {'type':7,'x':10,'y':2},
        {'type':2,'x':21,'y':8},
        {'type':4,'x':6,'y':2},
        {'type':4,'x':8,'y':2},
        {'type':4,'x':18,'y':2},
        {'type':4,'x':20,'y':10},
        {'type':5,'x':23,'y':8},
        {'type':7,'x':3,'y':0},
        // Lights
        {'type':8,'x':2,'y':0,'face':3},
        {'type':8,'x':5,'y':0,'face':3},
        {'type':8,'x':20,'y':6,'face':0},
        {'type':8,'x':19,'y':17,'face':1},
        {'type':8,'x':1,'y':16,'face':2},
        {'type':8,'x':20,'y':13,'face':0},
        {'type':8,'x':9,'y':12,'face':1}
    ],
    'objects': [
        {'name':'Doom guy','x':2.5,'y':15.5,'rotation':0,'type':0},
        {'name':'Nazi dude','x':2.5,'y':14.5,'rotation':0,'type':1},
        {'name':'Orman Ablo','x':2.5,'y':13.5,'rotation':0,'type':2},
        {'name':'The Famous Shpee','x':2.5,'y':12.5,'rotation':0,'type':3},
        {'name':'Blood ghoul','x':2.5,'y':11.5,'rotation':0,'type':4},
        {'name':'Cat','x':2.5,'y':10.5,'rotation':0,'type':5},
        {'name':'','x':21.5,'y':5.5,'rotation':315,'type':6},
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
        {'intensity':1,'x':2,'y':0,'face':3},
        {'intensity':1,'x':5,'y':0,'face':3},
        {'intensity':1,'x':20,'y':6,'face':0},
        {'intensity':1,'x':19,'y':17,'face':1},
        {'intensity':1,'x':1,'y':16,'face':2},
        {'intensity':1,'x':20,'y':13,'face':0},
        {'intensity':1,'x':9,'y':12,'face':1}
    ]
}

var world = {
    'cells': [],
    'objects': [],
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
                'average': 0,
                'uniform': true
            };
        
            cell.lightmap.average = (cell.lightmap[0] + cell.lightmap[1] + cell.lightmap[2] + cell.lightmap[3]) / 4;
            cell.lightmap.uniform = (cell.lightmap[0] === cell.lightmap[1] && cell.lightmap[0] === cell.lightmap[2] && cell.lightmap[0] === cell.lightmap[3]);

            setWorldCell(x, y, cell);
        }
    }

    world.objects = presetWorld.objects;
}

const maxLightRefineIterations = 10;
const lightCellFalloff = 0.7;
const lightDiagonalFalloffFactor = 0.8;
const ambientLightLevel = 0;
let tempLightmap = [];

function simulateLightPropagation() {
    const lightmapHeight = presetWorld.walls.length + 1;
    const lightmapWidth = presetWorld.walls[0].length + 1;

    presetWorld.lightmap = Array(lightmapHeight * lightmapWidth).fill(ambientLightLevel);

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
        tempLightmap = { ...presetWorld.lightmap };
    
        for (let y = 0; y < lightmapHeight; y++) {
            for (let x = 0; x < lightmapWidth; x++) {
                let lightmapCell = getPresetLightmapCell(x, y);
    
                if (lightmapCell <= ambientLightLevel) continue;

                if (x - 1 >= 0 && x < world.width && y - 1 >= 0 && y < world.height) {
                    let directIntensity =  lightmapCell * lightCellFalloff;
                    let diagonalIntensity =  lightmapCell * lightCellFalloff * lightDiagonalFalloffFactor;

                    // Direct propagation

                    // Up
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y - 1).transparent) {
                        if (getPresetLightmapCell(x, y - 1) < directIntensity) setTempLightmapCell(x, y - 1, directIntensity);
                    }

                    // Left
                    if (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x - 1, y).transparent) {
                        if (getPresetLightmapCell(x - 1, y) < directIntensity) setTempLightmapCell(x - 1, y, directIntensity);
                    }

                    // Right
                    if (getWorldCell(x, y - 1).transparent || getWorldCell(x, y).transparent) {
                        if (getPresetLightmapCell(x + 1, y) < directIntensity) setTempLightmapCell(x + 1, y, directIntensity);
                    }

                    // Down
                    if (getWorldCell(x - 1, y).transparent || getWorldCell(x, y).transparent) {
                        if (getPresetLightmapCell(x, y + 1) < directIntensity) setTempLightmapCell(x, y + 1, directIntensity);
                    }

                    // Diagonal propagation

                    // Left-Up
                    if (getWorldCell(x - 1, y - 1).transparent && (getWorldCell(x - 1, y).transparent || getWorldCell(x, y - 1).transparent)) {
                        if (getPresetLightmapCell(x - 1, y - 1) < diagonalIntensity) setTempLightmapCell(x - 1, y - 1, diagonalIntensity);
                    }

                    // Right-Up
                    if (getWorldCell(x, y - 1).transparent && (getWorldCell(x, y).transparent || getWorldCell(x - 1, y - 1).transparent)) {
                        if (getPresetLightmapCell(x + 1, y - 1) < diagonalIntensity) setTempLightmapCell(x + 1, y - 1, diagonalIntensity);
                    }

                    // Left-Down
                    if (getWorldCell(x - 1, y).transparent && (getWorldCell(x - 1, y - 1).transparent || getWorldCell(x, y).transparent)) {
                        if (getPresetLightmapCell(x - 1, y + 1) < diagonalIntensity) setTempLightmapCell(x - 1, y + 1, diagonalIntensity);
                    }

                    // Right-Down
                    if (getWorldCell(x, y).transparent && (getWorldCell(x, y - 1).transparent || getWorldCell(x - 1, y).transparent)) {
                        if (getPresetLightmapCell(x + 1, y + 1) < diagonalIntensity) setTempLightmapCell(x + 1, y + 1, diagonalIntensity);
                    }
                }

                // for (var offY = -1; offY <= 1; offY++) {
                //     for (var offX = -1; offX <= 1; offX++) {
                //         if (offX === 0 && offY === 0) continue;
                //         if (y + offY < 0 || y + offY > lightmapHeight-1) continue;
                //         if (x + offX < 0 || x + offX > lightmapWidth-1) continue;


                //     }
                // }
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

function getTempLightmapCell(x, y) {
    return tempLightmap[y * presetWorld.walls[0].length + x];
}

function setTempLightmapCell(x, y, value) {
    tempLightmap[y * presetWorld.walls[0].length + x] = value;
}

function getWorldCell(x, y) {
    return world.cells[y * world.width + x];
}

function setWorldCell(x, y, cell) {
    world.cells[y * world.width + x] = cell;
}

export { world, faceToVertices, DEBUG_SOUND, piRatio }