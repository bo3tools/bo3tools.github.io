/* jshint node: true, esversion: 8 */

var fs = require("fs");

function criticalError(message) {
    console.log(message);
    process.exit(0);
}

function loadJSON(file) {
    return JSON.parse(fs.readFileSync(file));
}

function blockData(id, data, name, title) {
    return {id, data, name, title};
}

function fixLegacyItem(item) {
    if (item.name == "minecraft:log") {
        item.title = item.title.replace(/Wood/, "Log");
    }
    else if (item.name == "minecraft:bed") {
        item.title = "Red Bed";
    }
    else if (item.name == "minecraft:piston_head") {
        item.title = "Piston";
    }
    else if (item.title == "Dead Shrub") {
        item.title = "Dead Bush";
    }
    else if (item.title == "Brown Mushroom" || item.title == "Red Mushroom") {
        item.title += " Block";
    }
    else if (["Redstone Block", "Quartz Block", "Emerald Block", "Gold Block", "Iron Block", "Diamond Block", "Coal Block", "Melon Block"].indexOf(item.title) !== -1) {
        item.title = item.title.replace(/^(\w+) Block$/, function(match, p1) {
            return "Block of " + p1;
        });
    }
    else if (item.title == "Double Stone Slab") {
        item.title = "Smooth Stone Slab";
    }
    else if (item.title == "Double Sandstone Slab") {
        item.title = "Smooth Sandstone Slab";
    }
    else if (item.title == "Double Wooden Slab") {
        item.title = "Petrified Oak Slab";
    }
    else if (item.title == "Wooden Slab") {
        item.title = "Petrified Oak Slab";
    }
    else if (item.title == "Moss Stone") {
        item.title = "Mossy Cobblestone";
    }
    else if (item.title == "Wheat Crops") {
        item.title = "Wheat";
    }
    else if (item.name == "minecraft:stained_hardened_clay") {
        item.title = item.title.replace(/^(.+) Hardened Clay$/, function(match, p1) {
            return p1 + " Terracotta";
        });
    }
    else if (item.name == "minecraft:double_wooden_slab") {
        item.title = item.title.replace(/^Double (.+) Slab$/, function(match, p1) {
            return p1 + " Plank";
        });
    }
    else if (item.name == "minecraft:heavy_weighted_pressure_plate") {
        item.title = "Heavy Weighted Pressure Plate";
    }
    else if (item.name == "minecraft:light_weighted_pressure_plate") {
        item.title = "Light Weighted Pressure Plate";
    }
    else if (item.name == "minecraft:monster_egg") {
        item.title = item.title.replace(/^(.+) Monster Egg$/, function(match, p1) {
            return p1 + " Monster Egg (Silverfish " + p1 + ")";
        });
    }
    else if (item.title == "Standing Sign Block" || item.title == "Wall-mounted Sign Block") {
        item.title = "Oak Sign";
    }
    else if (["Acacia Door Block", "Dark Oak Door Block", "Oak Door Block", "Spruce Door Block", "Jungle Door Block", "Birch Door Block", "Iron Door Block"].indexOf(item.title) !== -1) {
        item.title = item.title.replace(/^(.+) Block$/, function(match, p1) {
            return p1;
        });
    }
    else if (item.title == "Wooden Pressure Plate") {
        item.title = "Oak Pressure Plate";
    }
    else if (item.title == "Glowing Redstone Ore") {
        item.title = "Redstone Ore";
    }
    else if (item.title.startsWith("Redstone Torch")) {
        item.title = "Redstone Torch";
    }
    else if (item.title.startsWith("Redstone Repeater")) {
        item.title = "Redstone Repeater";
    }
    else if (item.title.startsWith("Redstone Comparator")) {
        item.title = "Redstone Comparator";
    }
    else if (item.title.startsWith("Redstone Lamp")) {
        item.title = "Redstone Lamp";
    }
    else if (item.title == "Cake Block") {
        item.title = "Cake";
    }
    else if (item.title == "Enchantment Table") {
        item.title = "Enchanting Table";
    }
    else if (item.title == "Wooden Trapdoor") {
        item.title = "Oak Trapdoor";
    }
    else if (item.title.search(/Rail$/) !== -1) {
        item.title = item.title.replace(/Rail/, "Rails");
    }
    else if (item.name == "minecraft:spawn_egg") {
        return null;
    }
    else if (item.name == "minecraft:skull") {
        return null;
    }
    else if (item.name.startsWith("minecraft:record")) {
        return null;
    }
    else if ([295, 298, 302, 303, 304, 305, 323, 335, 349, 349, 350, 351, 351, 351, 351, 351, 360, 373, 384, 395, 402, 418, 425, 438, 440, 441, 453].indexOf(item.id) !== -1) {
        return null;
    }

    return item;
}

function substituteItem(item) {
    if (item.title == "Flowing Water" || item.title == "Still Water") {
        item.name = "minecraft:water";
        return item;
    }
    else if (item.title == "Burning Furnace") {
        item.name = "minecraft:furnace";
        return item;
    }
    else if (item.title == "Melon Stem") {
        item.name = "minecraft:melon_stem";
        return item;
    }
    else if (item.title == "Pumpkin Stem") {
        item.name = "minecraft:pumpkin_stem";
        return item;
    }
    else if (item.title == "Nether Portal") {
        item.name = "minecraft:nether_portal";
        return item;
    }
    else if (item.title == "Redstone Wire") {
        item.name = "minecraft:redstone_dust";
        return item;
    }
    else if (item.title == "Fire") {
        item.name = "minecraft:fire";
        return item;
    }
    else if (item.title == "Double Cobblestone Slab") {
        item.name = "minecraft:cobblestone";
        return item;
    }
    else if (item.title == "Double Brick Slab") {
        item.name = "minecraft:bricks";
        return item;
    }
    else if (item.title == "Double Stone Brick Slab") {
        item.name = "minecraft:stone_bricks";
        return item;
    }
    else if (item.title == "Double Nether Brick Slab") {
        item.name = "minecraft:nether_bricks";
        return item;
    }
    else if (item.title == "Double Quartz Slab") {
        item.name = "minecraft:quartz_block";
        return item;
    }
    else if (item.title == "Flowing Lava" || item.title == "Still Lava") {
        item.name = "minecraft:lava";
        return item;
    }

    return null;
}

function annotateItem(item) {
    var short = item.name.split(":")[1];

    function is(name) {
        return short == name;
    }

    function ends(name) {
        return short.endsWith(name);
    }

    function any() {
        for (var i = 0; i < arguments.length; i++) {
            if (short == arguments[i]) return true;
        }

        return false;
    }

    if (is("air")) {
        item.model = "none*";
    }
    else if (ends("slab")) {
        item.model = "slab";
    }
    else if (ends("sapling") || any("dandelion", "poppy", "blue_orchid", "allium", "azure_bluet", "red_tulip", "orange_tulip", "white_tulip", "pink_tulip", "oxeye_daisy", "brown_mushroom_block", "red_mushroom_block")) {
        item.model = "plant*";
    }
    else if (ends("torch")) {
        item.model = "torch*";
    }
    else if (is("fire")) {
        item.model = "fire*";
    }
    else if (any("dead_bush", "grass", "fern", "sugar_cane")) {
        item.model = "plant*";
    }
    else if (ends("water")) {
        item.model = "liquid*";
    }
    else if (ends("lava")) {
        item.model = "liquid";
    }
    else if (ends("log")) {
        item.model = "block/add_data";
    }
    else if (ends("leaves") || ends("glass") || is("spawner") || ends("ice")) {
        item.model = "block*";
    }
    else if (ends("pane") || is("iron_bars")) {
        item.model = "pane*";
    }
    else if (ends("bed")) {
        item.model = "bed*";
    }
    else if (ends("rail")) {
        item.model = "rail*";
    }
    else if (is("cobweb")) {
        item.model = "web*";
    }
    else if (ends("stairs")) {
        item.model = "stairs";
    }
    else if (ends("sign")) {
        item.model = "sign*";
    }
    else if (is("chest")) {
        item.model = "chest";
    }
    else if (is("farmland")) {
        item.model = "farmland";
    }
    else if (any("wheat")) {
        item.model = "crops*";
    }
    else if (is("lever")) {
        item.model = "lever*";
    }
    else if (is("ladder")) {
        item.model = "ladder*";
    }
    else if (ends("button")) {
        item.model = "button";
    }
    else if (ends("carpet")) {
        item.model = "floor"; 
    }
    else if (ends("carpet")) { // dust!
        item.model = "floor"; 
    }
    else if (ends("pressure_plate")) {
        item.model = "plate";
    }
    else if (ends("door")) {
        item.model = "door*";
    }
    else if (is("cactus")) {
        item.model = "cactus";
    }
    else if (ends("gate")) {
        item.model = "gate*";
    }
    else if (item.id > 255) {
        return null;
    }
    else {
        item.model = "--";
    }

    return item;
}

async function generateBlocks() {
    var legacyData = loadJSON("./legacy.json");
    var modernData = loadJSON("./modern.json");
    var mergedData = [];

    for (var i = 0; i < legacyData.length; i++) {
        var legacyItem = fixLegacyItem(legacyData[i]);
        if (!legacyItem) {
            continue;
        }

        var matchingItem = substituteItem(legacyItem);

        for (var j = 0; j < modernData.length; j++) {
            var modernItem = modernData[j];

            if (legacyItem.title == modernItem.title) {
                matchingItem = modernItem;
                break;
            }
        }

        if (!matchingItem) {
            console.log("Can't find \"" + legacyItem.title + "\" (" + legacyItem.name + ")");
            continue;
        }

        var block = annotateItem(blockData(legacyItem.id, legacyItem.data, matchingItem.name, matchingItem.title));
        if (block) {
            mergedData.push(block);
        }
    }

    writeMergedData("./merged.txt", mergedData);
}

function writeMergedData(file, mergedData) {
    var data = [];
    for (var i = 0; i < mergedData.length; i++) {
        var values = [];
        var currentItem = mergedData[i];

        var legacyId = currentItem.id.toString();
        if (currentItem.data) {
            legacyId += ":" + currentItem.data;
        }

        var bukkitEnum = "ENUM";
        var minecraftName = currentItem.name;
        var modelType = currentItem.model || "--";

        values.push(legacyId.padEnd(7, " "));
        values.push(bukkitEnum.padEnd(5, " "));
        values.push(minecraftName.padEnd(40, " "));
        values.push(modelType.padEnd(6, " "));
        values.push(currentItem.title);
        data.push(values.join(" "));
    }

    fs.writeFileSync(file, data.join("\n"));
}

generateBlocks();