// Name lists
const baseTexturePath = 'resources/textures/walls';
const baseDecalPath = 'resources/textures/decals';
const baseSpritePath = 'resources/sprites';
const baseViewModelPath = 'resources/viewmodels';

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
    {'name': 'doomguy', 'groups': 8, 'frames': 1, 'speed': 0},
    {'name': 'nazi', 'groups': 8, 'frames': 1, 'speed': 0},
    {'name': 'spessman', 'groups': 1, 'frames': 1, 'speed': 0},
    {'name': 'shpee', 'groups': 1, 'frames': 1, 'speed': 0},
    {'name': 'blood', 'groups': 1, 'frames': 1, 'speed': 0},
    {'name': 'cat', 'groups': 8, 'frames': 1, 'speed': 0},
    {'name': 'engie', 'groups': 24, 'frames': 1, 'speed': 0},
    {'name': 'explosion', 'groups': 1, 'frames': 3, 'speed': 0.1, 'fullBright': true},
    {'name': 'rocket', 'groups': 8, 'frames': 1, 'speed': 0, 'fullBright': true},
    {'name': 'engie-dance', 'groups': 1, 'frames': 7, 'speed': 0.1}
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

const materials = {
    'default': function(data, textureIndex) {
        return [data[textureIndex], 
                data[textureIndex + 1], 
                data[textureIndex + 2], 
                data[textureIndex + 3]]
    },
    'cyberpunk': function(data, textureIndex) {
        return [data[textureIndex] + Math.round(Math.random() * 100), 
                data[textureIndex + 1] + Math.round(Math.random() * 25), 
                data[textureIndex + 2], 
                data[textureIndex + 3]]
    },
    'hologram': function(data, textureIndex) {
        return [data[textureIndex] - 50, 
                data[textureIndex + 1], 
                data[textureIndex + 2], 
                data[textureIndex + 3] - Math.round(Math.random() * 150)]
    },
    'inverted': function(data, textureIndex) {
        return [255 - data[textureIndex], 
                255 - data[textureIndex + 1], 
                255 - data[textureIndex + 2], 
                data[textureIndex + 3]]
    }
}

const tempCanvas = document.getElementById("temp-canvas");
const tempContext = tempCanvas.getContext("2d", { alpha: true });

function Texture(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;

    this.material = materials.default;

    this.getPixel = function(textureIndex) {
        return this.material(data, textureIndex);
    }
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
    numberOfResources += element.groups * element.frames;
});
viewModelNames.forEach(function (element) {
    numberOfResources += element.length;
});

let downloadProgress = 0;
const maxDownloadProgress = 1 + numberOfResources;

// Load missing texture first
const errorImage = new Image();
errorImage.src = `${baseTexturePath}/${textureNames[0].name}/${0}.png`;
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
    viewModels = new Array(viewModelNames.length).fill([texture]);

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

        for (let frame = 0; frame < textureName.frames; frame++) {
            let tempImage = new Image();
            tempImage.src = `${baseTexturePath}/${textureName.name}/${frame}.png`;
        
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

        for (let frame = 0; frame < decalName.frames; frame++) {
            let tempImage = new Image();
            tempImage.src = `${baseDecalPath}/${decalName.name}/${frame}.png`;
            
            tempImage.onload = function() {
                tempCanvas.width = tempImage.width;
                tempCanvas.height = tempImage.height;
                tempContext.drawImage(tempImage, 0, 0);
        
                let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
                let texture = new Texture(imageData.data, imageData.width, imageData.height);
        
                decals[i][frame] = texture;

                downloadProgress++;
            }
        }
    }
}

function loadSprites() {
    for (let i = 0; i < spriteNames.length; i++) {
        
        let spriteName = spriteNames[i];

        sprites[i] = {};
        sprites[i].groups = spriteName.groups;
        sprites[i].fullBright = spriteName.fullBright != undefined ? spriteName.fullBright : false;

        for (let group = 0; group < spriteName.groups; group++) {
            
            sprites[i][group] = {};
            sprites[i][group].frames = spriteName.frames;
            sprites[i][group].speed = spriteName.speed;

            for (let frame = 0; frame < spriteName.frames; frame++) {
                let tempImage = new Image();
                tempImage.src = `${baseSpritePath}/${spriteName.name}/${group}/${frame}.png`;
    
                tempImage.onload = function() {
                    tempCanvas.width = tempImage.width;
                    tempCanvas.height = tempImage.height;
                    tempContext.drawImage(tempImage, 0, 0);
        
                    let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
                    let texture = new Texture(imageData.data, imageData.width, imageData.height);
        
                    sprites[i][group][frame] = texture;
                    if (group == 0) console.log(i);

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
            tempImage.src = `${baseViewModelPath}/${viewModelNames[i][frame]}`;
            
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
