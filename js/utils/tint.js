function tintImage(image, color, context, opacity = 0.5) {
    context.canvas.width = image.width;
    context.canvas.height = image.height;

    context.save();
    context.fillStyle = color;
    context.globalAlpha = opacity;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalCompositeOperation = "destination-atop";
    context.globalAlpha = 1;
    context.drawImage(image, 0, 0);
    context.restore();

    return context.canvas;
}

export { tintImage };
