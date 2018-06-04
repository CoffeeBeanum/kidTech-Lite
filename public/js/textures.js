// Name lists
const textureNames = [
    'resources/textures/0.png',
    'resources/textures/1.png',
    'resources/textures/2.png',
    'resources/textures/3.png',
    'resources/textures/door.png',
    'resources/textures/bars.png',
    'resources/textures/vobla.png',
    'resources/textures/face.png',
    'resources/textures/text1.png',
    'resources/textures/engie.png'
];

const spriteNames = [
    [
        'resources/sprites/doomguy/0.png',
        'resources/sprites/doomguy/1.png',
        'resources/sprites/doomguy/2.png',
        'resources/sprites/doomguy/3.png',
        'resources/sprites/doomguy/4.png',
        'resources/sprites/doomguy/5.png',
        'resources/sprites/doomguy/6.png',
        'resources/sprites/doomguy/7.png'
    ],
    [
        'resources/sprites/nazi/0.png',
        'resources/sprites/nazi/1.png',
        'resources/sprites/nazi/2.png',
        'resources/sprites/nazi/3.png',
        'resources/sprites/nazi/4.png',
        'resources/sprites/nazi/5.png',
        'resources/sprites/nazi/6.png',
        'resources/sprites/nazi/7.png',
    ],
    ['resources/sprites/spessman.png'],
    ['resources/sprites/shpee.png'],
    ['resources/sprites/blood.png'],
    [
        'resources/sprites/cat/0.png',
        'resources/sprites/cat/1.png',
        'resources/sprites/cat/2.png',
        'resources/sprites/cat/3.png',
        'resources/sprites/cat/4.png',
        'resources/sprites/cat/5.png',
        'resources/sprites/cat/6.png',
        'resources/sprites/cat/7.png',
    ],
    [
        ['resources/sprites/engie/0.png'],
        ['resources/sprites/engie/1.png'],
        ['resources/sprites/engie/2.png'],
        ['resources/sprites/engie/3.png'],
        ['resources/sprites/engie/4.png'],
        ['resources/sprites/engie/5.png'],
        ['resources/sprites/engie/6.png'],
        ['resources/sprites/engie/7.png'],
        ['resources/sprites/engie/8.png'],
        ['resources/sprites/engie/9.png'],
        ['resources/sprites/engie/10.png'],
        ['resources/sprites/engie/11.png'],
        ['resources/sprites/engie/12.png'],
        ['resources/sprites/engie/13.png'],
        ['resources/sprites/engie/14.png'],
        ['resources/sprites/engie/15.png'],
        ['resources/sprites/engie/16.png'],
        ['resources/sprites/engie/17.png'],
        ['resources/sprites/engie/18.png'],
        ['resources/sprites/engie/19.png'],
        ['resources/sprites/engie/20.png'],
        ['resources/sprites/engie/21.png'],
        ['resources/sprites/engie/22.png'],
        ['resources/sprites/engie/23.png'],
    ]
];

// Load textures
let textures = [];

for (let i = 0; i < textureNames.length; i++) {
    let temp = new Image();
    temp.src = textureNames[i];
    textures.push(temp);
}

function getWallTexture(type) {
    if (type > textures.length-1) {
        type = 0;
    }
    return textures[type];
}


// Load sprites
let sprites = [];

for (let i = 0; i < spriteNames.length; i++) {
    let tempList = [];
    for (let index = 0; index < spriteNames[i].length; index++) {
        let temp = new Image();
        temp.src = spriteNames[i][index];
        tempList.push(temp);
    }
    sprites.push(tempList);
}

function getSprite(type) {
    if (type > sprites.length) {
        type = 0;
    }
    return sprites[type];
}