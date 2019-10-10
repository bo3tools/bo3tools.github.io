/* jshint node: true, esversion: 8 */

var {createCanvas, loadImage} = require("canvas");
var fs = require("fs");

async function writeCanvasToFile(canvas, file) {
    return new Promise(function(resolve) {
        var out = fs.createWriteStream(file);
        var stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", resolve);
    });
}

async function recolorTexture(name, colorMultiplier) {
    var file = "./blocks/" + name;
    var image = await loadImage(file + ".png").catch(e => e);

    var width = image.width;
    var height = image.height;

    var redMultiplier = (colorMultiplier >> 16 & 255) / 255;
    var greenMultiplier = (colorMultiplier >> 8 & 255) / 255;
    var blueMultiplier = (colorMultiplier & 255) / 255;

    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    var imageData = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] == 0) {
            continue;
        }

        imageData.data[i + 0] *= redMultiplier;
        imageData.data[i + 1] *= greenMultiplier;
        imageData.data[i + 2] *= blueMultiplier;
    }

    ctx.putImageData(imageData, 0, 0);
    await writeCanvasToFile(canvas, file + "_recolored.png");
}

async function recolorAllTextures() {
    var colorsMap = {
        "acacia_leaves": 0xaea42a,
        "birch_leaves": 0x80a755,
        "dark_oak_leaves": 0x59ae30,
        "jungle_leaves": 0x30bb0b,
        "oak_leaves": 0x59ae30,
        "spruce_leaves": 0x619961,
        "grass_block_top": 0x59ae30,
        "grass_block_side_overlay": 0x59ae30,
        "water": 0x3f76e4,
        "vine": 0x59ae30,
        "fern": 0x59ae30,
        "grass": 0x59ae30
    };

    await Promise.all(Object.keys(colorsMap).map(name => recolorTexture(name, colorsMap[name])));
}


recolorAllTextures();