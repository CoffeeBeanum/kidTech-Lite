const DEBUG_SOUND = 'resources/sounds/server_message.wav';

const piRatio = Math.PI / 180;

// Preset default world
const world = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1,1,1,1],
    [1,9,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],
    [1,8,0,0,0,0,0,0,0,0,2,0,2,0,0,0,4,0,0,6,1,4,4,4,4,4,1],
    [1,7,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],
    [1,6,0,0,0,0,0,0,0,0,0,9,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],
    [1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,1,4,4,4,4,4,1],
    [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,1,1,1,4,1,1,1],
    [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,3,3,1,0,0,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0,0,0,9,0,2,1,1],
    [1,1,0,0,0,0,2,0,0,5,0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,1,4,1,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,1,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,1],
    [null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,2,0,0,0,1],
    [null,null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,1],
    [null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,0,2],
    [null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,5,7],
    [null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,1,0,0,0,0,0,0,0,0,0,0,3],
    [null,null,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,null,2,0,0,0,0,0,0,0,0,0,0,3],
    [null,null,1,1,1,2,4,2,1,1,1,1,4,1,1,1,1,null,10,0,0,0,0,0,0,0,0,0,5,9],
    [null,null,null,null,null,1,0,1,null,null,null,1,0,1,null,null,null,null,2,0,0,0,0,0,0,0,0,0,0,3],
    [null,null,null,null,null,1,4,1,null,1,1,1,4,1,1,1,null,null,1,0,0,0,0,0,0,0,0,0,0,3],
    [null,null,null,null,null,1,0,1,null,10,0,4,0,4,0,10,null,null,1,0,0,0,0,0,0,0,0,0,5,7],
    [null,null,null,null,null,1,4,1,null,1,1,1,1,1,1,1,null,null,1,0,0,0,0,0,0,0,0,0,0,2],
    [null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1,1,1,1,1,1,1,1,1,1],
    [null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,null,null,1,4,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,null,null,1,0,1,null,null,null,null,null,null,null,null,null,null,1,0,1],
    [null,null,null,1,1,2,4,2,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [null,null,null,1,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,1],
    [null,null,null,1,0,0,0,0,0,5,0,0,0,1,1,1,1,1,1,1,1],
    [null,null,null,1,0,0,0,0,0,5,0,0,0,7],
    [null,null,null,1,0,0,0,0,0,5,0,0,0,8],
    [null,null,null,1,0,0,0,0,0,4,0,0,0,1],
    [null,null,null,1,1,1,1,1,1,1,1,1,1,1]
];
const objects = [
    {"name":"Cat","x":6.5,"y":11.5,"rotation":0,"type":5,"solid":0,"distance":0},
    {"name":"Blood ghoul","x":6.5,"y":12.5,"rotation":0,"type":4,"solid":0,"distance":0},
    {"name":"The Shpee","x":6.5,"y":13.5,"rotation":0,"type":3,"solid":0,"distance":0},
    {"name":"Orman Ablo","x":6.5,"y":14.5,"rotation":0,"type":2,"solid":0,"distance":0},
    {"name":"Nazi dude","x":6.5,"y":15.5,"rotation":0,"type":1,"solid":0,"distance":0},
    {"name":"Doom boi","x":6.5,"y":16.5,"rotation":0,"type":0,"solid":0,"distance":0},
    {"name":"Welcome to kidTech-Lite alpha!","x":19,"y":16.5,"rotation":0,"type":-1,"solid":0,"distance":0},
    {"name":"THE LAG ROOM","x":23.5,"y":9.3,"rotation":0,"type":-1,"solid":0,"distance":0},
    {"name":"Sneaky engie","x":21.5,"y":5.5,"rotation":315,"type":6,"solid":0,"distance":0},
    {"name":"Portal experiment","x":18,"y":24.5,"rotation":0,"type":-1,"solid":0,"distance":0}
];
const portals = [
    [{"x":20,"y":24},{"x":19,"y":34}],
    [{"x":18,"y":34},{"x":19,"y":24}],
    [{"x":9,"y":37},{"x":14,"y":37}],
    [{"x":15,"y":37},{"x":10,"y":37}]
];

export { world, objects, portals, DEBUG_SOUND, piRatio }