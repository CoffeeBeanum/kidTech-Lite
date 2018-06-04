// Name lists
const textureNames = [
    'resources/textures/0.png',
    'resources/textures/blood.png',
    'resources/textures/vulps.png',
    'resources/textures/3.png',
    'resources/textures/door.png',
    'resources/textures/bars.png',
    'resources/textures/vobla.png',
    'resources/textures/face.png',
    'resources/textures/text1.png',
    'resources/textures/engie.png'
];

const spriteNames = [
    'resources/sprites/cat.png',
    'resources/sprites/doomguy.png',
    'resources/sprites/spessman.png',
    'resources/sprites/shpee.png'
];

// Load textures
let textures = [];

for (let i = 0; i < textureNames.length; i++) {
    let temp = new Image();
    temp.src = textureNames[i];
    textures.push(temp);
}

function getWallTexture(type) {
    if (type > textures.length) {
        type = 0;
    }
    return textures[type];
}


// Load sprites
let sprites = [];

for (let i = 0; i < spriteNames.length; i++) {
    let temp = new Image();
    temp.src = spriteNames[i];
    sprites.push(temp);
}

function getSprite(type) {
    if (type > sprites.length) {
        type = 0;
    }
    return sprites[type];
}