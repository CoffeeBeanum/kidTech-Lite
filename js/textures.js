// Name lists
const textureNames = [
    'resources/textures/walls/error.png',
    'resources/textures/walls/brick_wall.png',
    'resources/textures/walls/metal_arch.png',
    'resources/textures/walls/metal_window.png',
    'resources/textures/walls/concrete.png'
];

const decalNames = [
    'resources/textures/decals/art_landscape.png',
    'resources/textures/decals/art_vobla.png',
    'resources/textures/decals/art_engie.png',
    'resources/textures/decals/warning.png',
    'resources/textures/decals/metal_plate.png',
    'resources/textures/decals/lag_room.png',
    'resources/textures/decals/epic_decals.png',
    'resources/textures/decals/test_alpha.png'
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
        'resources/sprites/nazi/7.png'
    ],
    ['resources/sprites/spessman.png'],
    ['resources/sprites/shpee.png'],
    [
        'resources/sprites/blood/0.png',
        'resources/sprites/blood/1.png',
        'resources/sprites/blood/2.png',
        'resources/sprites/blood/3.png',
        'resources/sprites/blood/4.png'
    ],
    [
        'resources/sprites/cat/0.png',
        'resources/sprites/cat/1.png',
        'resources/sprites/cat/2.png',
        'resources/sprites/cat/3.png',
        'resources/sprites/cat/4.png',
        'resources/sprites/cat/5.png',
        'resources/sprites/cat/6.png',
        'resources/sprites/cat/7.png'
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
        ['resources/sprites/engie/23.png']
    ]
];

const tempCanvas = document.getElementById("tempCanvas");
const tempContext = tempCanvas.getContext("2d", { alpha: true });

let skybox = new Image();
skybox.src = "resources/skybox.jpg";

function Texture(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
}

// Texture loading
let textures = [];

for (let i = 0; i < textureNames.length; i++) {
    let tempImage = new Image();
    tempImage.src = textureNames[i];

    let index = i;

    tempImage.onload = function() {
        tempCanvas.width = tempImage.width;
        tempCanvas.height = tempImage.height;
        tempContext.drawImage(tempImage, 0, 0);

        let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        let texture = new Texture(imageData.data, imageData.width, imageData.height);

        textures[index] = texture;
    }
}

function getWallTexture(index) {
    if (index > textures.length - 1) { index = 0; }
    return textures[index];
}

// Decal loading
let decals = [];

for (let i = 0; i < decalNames.length; i++) {
    let tempImage = new Image();
    tempImage.src = decalNames[i];

    let index = i;
    
    tempImage.onload = function() {
        tempCanvas.width = tempImage.width;
        tempCanvas.height = tempImage.height;
        tempContext.drawImage(tempImage, 0, 0);

        let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        let texture = new Texture(imageData.data, imageData.width, imageData.height);

        decals[index] = texture;
    }
}

function getDecal(index) {
    if (index > decals.length - 1) { index = 0; }
    return decals[index];
}

// Sprite loading
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

function getSprite(index) {
    if (index > sprites.length - 1) { index = 0; }
    return sprites[index];
}