// Name lists
const baseTexturePath = 'resources/textures/walls/';
const baseDecalPath = 'resources/textures/decals/';
const baseSpritePath = 'resources/sprites/';
const baseViewModelPath = 'resources/viewmodels/';

const textureNames = [
    {'name': 'error', 'frames': 1, 'speed': 0},
    {'name': 'brick_wall', 'frames': 1, 'speed': 0},
    {'name': 'metal_arch', 'frames': 1, 'speed': 0},
    {'name': 'metal_window', 'frames': 1, 'speed': 0},
    {'name': 'concrete', 'frames': 1, 'speed': 0},
    {'name': 'metal_window_frame', 'frames': 1, 'speed': 0},
    {'name': 'gman', 'frames': 116, 'speed': 0.5}
];

const decalNames = [
    {'name': 'art_landscape', 'frames': 1, 'speed': 0},
    {'name': 'art_vobla', 'frames': 1, 'speed': 0},
    {'name': 'art_engie', 'frames': 1, 'speed': 0},
    {'name': 'warning', 'frames': 1, 'speed': 0},
    {'name': 'metal_plate', 'frames': 1, 'speed': 0},
    {'name': 'lag_room', 'frames': 1, 'speed': 0},
    {'name': 'epic_decals', 'frames': 1, 'speed': 0},
    {'name': 'test_alpha', 'frames': 1, 'speed': 0},
    {'name': 'lamp', 'frames': 1, 'speed': 0},
    {'name': 'old_intercom', 'frames': 1, 'speed': 0},
    {'name': 'button', 'frames': 1, 'speed': 0}
];

const spriteNames = [
    [
        ['doomguy/0.png'],
        ['doomguy/1.png'],
        ['doomguy/2.png'],
        ['doomguy/3.png'],
        ['doomguy/4.png'],
        ['doomguy/5.png'],
        ['doomguy/6.png'],
        ['doomguy/7.png']
    ],
    [
        ['nazi/0.png'],
        ['nazi/1.png'],
        ['nazi/2.png'],
        ['nazi/3.png'],
        ['nazi/4.png'],
        ['nazi/5.png'],
        ['nazi/6.png'],
        ['nazi/7.png']
    ],
    [['spessman.png']],
    [['shpee.png']],
    [['blood.png']],
    [
        ['cat/0.png'],
        ['cat/1.png'],
        ['cat/2.png'],
        ['cat/3.png'],
        ['cat/4.png'],
        ['cat/5.png'],
        ['cat/6.png'],
        ['cat/7.png']
    ],
    [
        ['engie/0.png'],
        ['engie/1.png'],
        ['engie/2.png'],
        ['engie/3.png'],
        ['engie/4.png'],
        ['engie/5.png'],
        ['engie/6.png'],
        ['engie/7.png'],
        ['engie/8.png'],
        ['engie/9.png'],
        ['engie/10.png'],
        ['engie/11.png'],
        ['engie/12.png'],
        ['engie/13.png'],
        ['engie/14.png'],
        ['engie/15.png'],
        ['engie/16.png'],
        ['engie/17.png'],
        ['engie/18.png'],
        ['engie/19.png'],
        ['engie/20.png'],
        ['engie/21.png'],
        ['engie/22.png'],
        ['engie/23.png']
    ],
    [
        [
        'explosion/0.png',
        'explosion/1.png',
        'explosion/2.png'
        ]
    ],
    [
        ['rocket/0.png'],
        ['rocket/1.png'],
        ['rocket/2.png'],
        ['rocket/3.png'],
        ['rocket/4.png'],
        ['rocket/5.png'],
        ['rocket/6.png'],
        ['rocket/7.png']
    ]
];

const viewModelNames = [
    [
        'rocketlauncher/0.png',
        'rocketlauncher/1.png',
        'rocketlauncher/2.png',
        'rocketlauncher/3.png',
        'rocketlauncher/4.png',
    ]
];

const tempCanvas = document.getElementById("temp-canvas");
const tempContext = tempCanvas.getContext("2d", { alpha: true });

function Texture(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
}

// Texture loading
const skybox = new Image();
let textures = [];
let minimapTextures = [];
let decals = [];
let sprites = [];
let viewModels = [];

skybox.src = "resources/skybox_night.jpg";
skybox.onload = function() { 
    downloadProgress++;
}

let numberOfResources = 0;
textureNames.forEach(function (element) {
    numberOfResources += element.frames;
});
decalNames.forEach(function (element) {
    numberOfResources += element.frames;
});
spriteNames.forEach(function (element) {
    numberOfResources += element.length;
});
viewModelNames.forEach(function (element) {
    numberOfResources += element.length;
});

let downloadProgress = 0;
const maxDownloadProgress = 1 + numberOfResources;

// Load missing texture first
const errorImage = new Image();
errorImage.src = `${baseTexturePath}${textureNames[0].name}/${0}.png`;
errorImage.onload = function() { 

    minimapTextures = new Array(textureNames.length).fill(errorImage);

    tempCanvas.width = errorImage.width;
    tempCanvas.height = errorImage.height;
    tempContext.drawImage(errorImage, 0, 0);

    let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    let texture = new Texture(imageData.data, imageData.width, imageData.height);

    textures = new Array(textureNames.length).fill([texture]);
    decals = new Array(decalNames.length).fill([texture]);
    sprites = new Array(spriteNames.length).fill([[texture]]);
    viewmodels = new Array(viewModelNames.length).fill([texture]);

    loadTextures();
    loadDecals();
    loadSprites();
    loadViewModels();
}

// Loading functions
function loadTextures() {
    for (let i = 0; i < textureNames.length; i++) {
        
        let textureName = textureNames[i];
        
        textures[i] = {};
        textures[i].frames = textureName.frames;
        textures[i].speed = textureName.speed;

        for (let frame = 0; frame < textures[i].frames; frame++) {
            let tempImage = new Image();
            tempImage.src = `${baseTexturePath}${textureName.name}/${frame}.png`;
        
            tempImage.onload = function() { 
                minimapTextures[i] = tempImage;
        
                tempCanvas.width = tempImage.width;
                tempCanvas.height = tempImage.height;
                tempContext.drawImage(tempImage, 0, 0);
        
                let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
                let texture = new Texture(imageData.data, imageData.width, imageData.height);
        
                textures[i][frame] = texture;

                downloadProgress++;
            }
        }
    }
}

function loadDecals() {
    for (let i = 0; i < decalNames.length; i++) {
        
        let decalName = decalNames[i];

        decals[i] = {};
        decals[i].frames = decalName.frames;
        decals[i].speed = decalName.speed;

        for (let frame = 0; frame < decals[i].frames; frame++) {
            let tempImage = new Image();
            tempImage.src = `${baseDecalPath}${decalName.name}/${frame}.png`;
            
            tempImage.onload = function() {
                tempCanvas.width = tempImage.width;
                tempCanvas.height = tempImage.height;
                tempContext.drawImage(tempImage, 0, 0);
        
                let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
                let texture = new Texture(imageData.data, imageData.width, imageData.height);
        
                decals[i] = texture;

                downloadProgress++;
            }
        }
    }
}

function loadSprites() {
    for (let i = 0; i < spriteNames.length; i++) {

        sprites[i] = [];

        if (i === 7 || i === 8) sprites[i].fullBright = true;

        for (let group = 0; group < spriteNames[i].length; group++) {

            sprites[i][group] = {};
            sprites[i][group].frames = spriteNames[i][group].length;
            sprites[i][group].speed = 0.1;

            for (let frame = 0; frame < sprites[i][group].frames; frame++) {
                let tempImage = new Image();
                tempImage.src = baseSpritePath + spriteNames[i][group][frame];
    
                tempImage.onload = function() {
                    tempCanvas.width = tempImage.width;
                    tempCanvas.height = tempImage.height;
                    tempContext.drawImage(tempImage, 0, 0);
        
                    let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
                    let texture = new Texture(imageData.data, imageData.width, imageData.height);
        
                    sprites[i][group][frame] = texture;

                    downloadProgress++;
                }
            }
        }
    }
}

function loadViewModels() {
    for (let i = 0; i < viewModelNames.length; i++) {
        
        viewModels[i] = {};
        viewModels[i].frames = viewModelNames[i].length;
        viewModels[i].speed = 0.01;

        for (let frame = 0; frame < viewModels[i].frames; frame++) {
            let tempImage = new Image();
            tempImage.src = baseViewModelPath + viewModelNames[i][frame];
            
            viewModels[i][frame] = tempImage;
    
            tempImage.onload = function() {
                downloadProgress++;
            }
        }
    }
}

function getTexture(index) {
    if (index > textures.length - 1) { index = 0; }
    return textures[index];
}

function getMinimapTexture(index) {
    if (index > minimapTextures.length - 1) { index = 0; }
    return minimapTextures[index];
}

function getDecal(index) {
    if (index > decals.length - 1) { index = 0; }
    return decals[index];
}

function getSprite(index) {
    if (index > sprites.length - 1) { index = 0; }
    return sprites[index];
}

function getViewModel(index) {
    if (index > viewModels.length - 1) { index = 0; }
    return viewModels[index];
}
