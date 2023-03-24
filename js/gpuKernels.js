const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 225;
const gl = canvas.getContext('webgl2');

const gpu = new GPU({canvas, context: gl});

const prepareRays = gpu.createKernel(function(playerX, playerY, playerAngle, onScreenX, canvasWidth, fovFactor) {
    let angle = Math.atan((onScreenX[this.thread.x] - canvasWidth / 2) / (canvasWidth * fovFactor)) * 180 / Math.PI;

    // Create ray, calculate it's position and direction
    let x = playerX + (playerX < 0 ? -1 : 0) >> 0;
    let y = playerY + (playerY < 0 ? -1 : 0) >> 0;
    let dirX = Math.cos((playerAngle + angle) * Math.PI / 180);
    let dirY = Math.sin((playerAngle + angle) * Math.PI / 180);

    return [ x, y, dirX, dirY ]
}).setOutput([400]);

const render = gpu.createKernel(function(horizon, arrayFirstScanIndex, arrayTextureX, arrayOnScreenSize, arrayMegaTextureIndex, arrayTextureIndex, arrayFace, arrayLightmap) {
    let finalR = 0;
    let finalG = 0;
    let finalB = 0; 
    let finalA = 0;
    
    let index = arrayFirstScanIndex[this.thread.x];

    while (index < arrayFirstScanIndex[this.thread.x + 1]) {

        let onScreenSize = arrayOnScreenSize[index] >> 0;

        let halfScreenSize = onScreenSize / 2;

        let scanStartY = (horizon - halfScreenSize + 1) >> 0;
        let scanEndY = (horizon + halfScreenSize + 1) >> 0;

        // Mask wall size
        let isOutsideMask = false;
        let onScreenY = this.constants.height - this.thread.y;
        if (onScreenY < scanStartY) isOutsideMask = true;
        if (onScreenY >= scanEndY) isOutsideMask = true;

        if (!isOutsideMask) {

            let rayTextureX = arrayTextureX[index];
            let megaTextureIndex = arrayMegaTextureIndex[index];
            let textureIndex = arrayTextureIndex[index] * 2;
            let face = arrayFace[index];
        
            let textureWidth = this.constants.textureDimentions[textureIndex];
            let textureHeight = this.constants.textureDimentions[textureIndex + 1];
        
            let textureX = (rayTextureX * textureWidth) >> 0;

            let textureY = (onScreenY - horizon + halfScreenSize) / onScreenSize;

            let textureDataIndex = megaTextureIndex + ((textureWidth * ((textureY * textureHeight) >> 0) + textureX)) * 4;

            let R = this.constants.textureData[textureDataIndex] / 255;
            let G = this.constants.textureData[textureDataIndex + 1] / 255;
            let B = this.constants.textureData[textureDataIndex + 2] / 255; 
            let A = this.constants.textureData[textureDataIndex + 3] / 255;

            // Draw decal if present
            // if (ray.cell.decals.length > 0) {
            //     for (let i = 0; i < ray.cell.decals.length; i++) {
            //         let decalObject = ray.cell.decals[i];
                    
            //         // Don't draw if face not matching
            //         if (decalObject.face === undefined || decalObject.face === ray.face) {
            //             let decalFrames = getDecal(ray.cell.decals[i].type);

            //             let decalFrame = 0;

            //             if (decalFrames.frames > 1) decalFrame = ((animationFrameCounter * decalFrames.speed) >> 0) % decalFrames.frames;

            //             let decalTexture = decalFrames[decalFrame];

            //             let textureX = (ray.textureX * decalTexture.width) >> 0;

            //             let decalIndex = ((decalTexture.width * ((textureY * decalTexture.height) >> 0) + textureX) >> 0) * 4;

            //             let decalA = decalTexture.data[decalIndex + 3];

            //             // Don't draw if invisible
            //             if (decalA > 0) {
                            
            //                 let decalR = decalTexture.data[decalIndex];
            //                 let decalG = decalTexture.data[decalIndex + 1];
            //                 let decalB = decalTexture.data[decalIndex + 2];

            //                 let alpha = decalTexture.data[decalIndex + 3] / 255;

            //                 // Don't blend if resulting alpha is 1
            //                 if (alpha < 1) {
            //                     let inverseAlpha = 1 - alpha;

            //                     finalR = decalR * alpha + finalR * inverseAlpha;
            //                     finalG = decalG * alpha + finalG * inverseAlpha;
            //                     finalB = decalB * alpha + finalB * inverseAlpha;
            //                     finalA += decalA * alpha;
            //                     if (finalA > 255) finalA = 255;
            //                 } else {
            //                     finalR = decalR >> 0;
            //                     finalG = decalG >> 0;
            //                     finalB = decalB >> 0;
            //                     finalA = 255;
            //                 }
            //             }
            //         }
            //     }
            // }

            // Don't draw if invisible
            if (A > 0) {
                let vertex0Index = 0;
                let vertex1Index = 0;

                    if (face == 0) { vertex0Index = 3; vertex1Index = 0; }
                else if (face == 1) { vertex0Index = 0; vertex1Index = 1; }
                else if (face == 2) { vertex0Index = 1; vertex1Index = 2; }
                else if (face == 3) { vertex0Index = 2; vertex1Index = 3; }

                let inverseTextureX = (1 - rayTextureX);

                let vertex0R = arrayLightmap[index * 4 * 3 + vertex0Index * 3];
                let vertex0G = arrayLightmap[index * 4 * 3 + vertex0Index * 3 + 1];
                let vertex0B = arrayLightmap[index * 4 * 3 + vertex0Index * 3 + 2];
                
                let vertex1R = arrayLightmap[index * 4 * 3 + vertex1Index * 3];
                let vertex1G = arrayLightmap[index * 4 * 3 + vertex1Index * 3 + 1];
                let vertex1B = arrayLightmap[index * 4 * 3 + vertex1Index * 3 + 2];

                R *= vertex0R * rayTextureX + vertex1R * inverseTextureX;
                G *= vertex0G * rayTextureX + vertex1G * inverseTextureX;
                B *= vertex0B * rayTextureX + vertex1B * inverseTextureX;

                // Don't blend if opaque
                if (A < 1) {
                    let inverseAlpha = 1 - A;

                    finalR = R * A + finalR * inverseAlpha;
                    finalG = G * A + finalG * inverseAlpha;
                    finalB = B * A + finalB * inverseAlpha;
                } else {
                    finalR = R;
                    finalG = G;
                    finalB = B;
                    finalA = A;
                }
            }
        }
        
        index++;
    }
                                       
    this.color(finalR, finalG, finalB, finalA);
}, 
{ 
    argumentTypes: { horizon: 'Float', arrayFirstScanIndex: 'Array', arrayTextureX: 'Array', arrayOnScreenSize: 'Array', arrayCellType: 'Array', arrayMegaTextureIndex: 'Array', arrayTextureIndex: 'Array', arrayFace: 'Array', arrayLightmap: 'Array' }, 
    graphical: true,
    dynamicArguments: true,
    dynamicOutput: true
})

render.canvas.id = 'gpu-canvas';
document.getElementById("canvas").parentNode.insertBefore(render.canvas, document.getElementById("canvas").nextSibling);
