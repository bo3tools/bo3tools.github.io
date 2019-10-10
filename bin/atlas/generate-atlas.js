/* jshint node: true, esversion: 8 */

var HTMLParser = require("fast-html-parser");
var request = require("request");
var {createCanvas, loadImage} = require("canvas");
var fs = require("fs");

function criticalError(message) {
    console.log(message);
    process.exit(0);
}

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

async function getMinecraftIds() {
    return new Promise(function(resolve) {
        request("https://minecraft-ids.grahamedgecombe.com", function(error, response, body) {
            if (error) {
                criticalError("Can't load minecraft-ids.grahamedgecombe.com: " + error);
            }

            var root = HTMLParser.parse(body);
            var table = root.querySelector("#rows");

            if (!table) {
                criticalError("Can't find IDs table on minecraft-ids.grahamedgecombe.com, did the structure change?");
            }

            var ids = {};
            var items = table.querySelectorAll("tr");
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                var id = item.querySelector(".id").text.match(/(\d+)(?:\:(\d+))?/);
                if (!id) {
                    criticalError("Can't find numerical ID from a table on minecraft-ids.grahamedgecombe.com, did the structure change?");
                }

                var name = item.querySelector(".text-id").text.match(/\(minecraft\:(\w+)\)/i);
                if (!name) {
                    criticalError("Can't read textual ID from a table on minecraft-ids.grahamedgecombe.com, did the structure change?");
                }

                ids[id[1]] = name[1]; 
            }

            resolve(ids);
        });
    });
}

function readBlockConfig(configFile) {
    var text, json = null;
    try {
        text = fs.readFileSync(configFile);
    }
    catch (e) {
        criticalError("Can't load block config from " + configFile);
    }

    try {
        json = JSON.parse(text);
    }
    catch (e) {
        criticalError("Can't parse config from " + configFile);
    }

    return json;
}

// Expensive due to excess canvas instructions
function drawCheckerboardTexture(ctx) {
    var size = 8;
    for (var i = 0, odd = true; i < 2; i++) {    
        for (var j = 0; j < 6; j++) {    
            if (odd) ctx.fillStyle = "#ff00ff"; 
            else ctx.fillStyle = "#000000"; 

            odd = !odd; 
            ctx.fillRect(16 + i * size, j * size, size, size); 
        }   
    }   
}


function substituteTextureName(name) {
    if (name.endsWith("_leaves")) {
        name = name + "_recolored";
    }
    else if (name == "grass" || name == "fern" || name == "water" || name == "vine") {
        name = name + "_recolored";
    }
    else if (name.endsWith("_wood")) {
        name = name.replace(/_wood$/, "_log");
    }
    else if (name.startsWith("infested_")) {
        name = name.replace(/^infested_/, "");
    }
    else if (name.endsWith("_piston") || name.startsWith("piston_")) {
        name = "piston";
    }
    else if (name == "snow_block") {
        name = "snow";
    }
    else if (name.startsWith("smooth_quartz")) {
        name = "quartz_block";
    }
    else if (name.startsWith("smooth_")) {
        name = name.replace(/^smooth_/, "");
    }
    else if (name == "frosted_ice") {
        name = "frosted_ice_0";
    }
    else if (name == "magma_block") {
        name = "magma";
    }
    else if (name == "dried_kelp_block") {
        name = "dried_kelp";
    }

    return name;
}

var missingTexture = null;

async function loadTextureSides(name) {
    var file = "./blocks/" + substituteTextureName(name);
    var sideTextures = (await Promise.all([file + ".png", file + "_top.png", file + "_side.png", file + "_bottom.png", file + "_front.png"].map(file => loadImage(file).catch(e => e)))).map(result => result instanceof Error ? null : result);
    
    var mainTexture   = sideTextures[0];
    var topTexture    = sideTextures[1];
    var sideTexture   = sideTextures[2];
    var bottomTexture = sideTextures[3];
    var frontTexture  = sideTextures[4];

    var anyTexture = mainTexture || topTexture || sideTexture || bottomTexture || frontTexture;

    if (!anyTexture) {
        anyTexture = missingTexture;
        console.log("Warning: Can't find any textures for block minecraft:" + name + " from " + file);
    }

    return {
        top: topTexture || anyTexture,
        side: sideTexture || frontTexture || anyTexture,
        bottom: bottomTexture || topTexture || anyTexture
    };
}

async function writeCanvasToFile(canvas, file) {
    return new Promise(function(resolve) {
        var out = fs.createWriteStream(file);
        var stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", resolve);
    });
}

function drawTexture(ctx, image, size, index, row, padding) {
    var dx = (size + padding * 2) * index;
    var dy = (size + padding * 2) * row;

    ctx.drawImage(image, 0, 0, size, size, dx + padding, dy + padding, size, size);

    ctx.drawImage(image, 0, 0, padding, size, dx, dy + padding, padding, size);
    ctx.drawImage(image, size - padding, 0, padding, size, dx + padding + size, dy + padding, padding, size);

    ctx.drawImage(image, 0, 0, size, padding, dx + padding, dy, size, padding);
    ctx.drawImage(image, 0, size - padding, size, padding, dx + padding, dy + padding + size, size, padding);

    ctx.drawImage(image, 0, 0, padding, padding, dx, dy, padding, padding);
    ctx.drawImage(image, size - padding, 0, padding, padding, dx + padding + size, dy, padding, padding);

    ctx.drawImage(image, size - padding, size - padding, padding, padding, dx + padding + size, dy + padding + size, padding, padding);
    ctx.drawImage(image, 0, size - padding, padding, padding, dx, dy + padding + size, padding, padding);
}


var excludeBlocks = ["air"];

async function generateAtlas() {
    var allBlocks = readBlockConfig("./data.json").filter(block => excludeBlocks.indexOf(block.name) === -1);

    var blockNames = allBlocks.map(block => block.name);
    var blockIds = allBlocks.reduce((obj, item) => {
        obj[item.name] = item.id;
        return obj;
    }, {});

    if (!fs.existsSync("./minecraft-ids.json")) {
        fs.writeFileSync("./minecraft-ids.json", JSON.stringify(await getMinecraftIds()));
    }

    var minecraftIds = JSON.parse(fs.readFileSync("./minecraft-ids.json"));

    var legacyIdMap = Object.filter(minecraftIds, name => blockNames.indexOf(name) !== -1);
    Object.keys(legacyIdMap).map(function(key) {
        legacyIdMap[key] = blockIds[legacyIdMap[key]] + 1;
    });

    console.log("Generating legacy ID map...");
    fs.writeFileSync("./legacy-ids.json", JSON.stringify(legacyIdMap));

    var tileSize = 16;
    var tilePadding = 1;
    var blockSides = 4;
    var perEachTile = (tileSize + tilePadding * 2);

    var totalBlocks = allBlocks.length;

    console.log("Generating atlas of " + totalBlocks + " blocks");

    missingTexture = await loadImage("./blocks/__missing_texture.png");

    var canvasWidth = perEachTile * (totalBlocks + 1);
    var canvasHeight = perEachTile * blockSides;
    var canvas = createCanvas(canvasWidth, canvasHeight);
    var ctx = canvas.getContext("2d");
    ctx.font = '8px "Terminal"';

    //drawCheckerboardTexture(ctx);

    var blockNameMap = [];

    for (var i = 0; i < totalBlocks; i++) {
        var blockName = blockNames[i];
        var sides = await loadTextureSides(blockName);
        blockNameMap.push((i+1) + " " + blockName);
        drawTexture(ctx, sides.side, tileSize, i + 1, 0, tilePadding);
        drawTexture(ctx, sides.bottom, tileSize, i + 1, 1, tilePadding);
        drawTexture(ctx, sides.top, tileSize, i + 1, 2, tilePadding);
        ctx.fillText(i + 1, 2 + (i + 1) * tileSize + 2 * i, 67);
    }

    fs.writeFileSync("./block-map.txt", blockNameMap.join("\n"));

    await writeCanvasToFile(canvas, "../../texture.png");
    console.log("Written atlas to file.");
}

generateAtlas();