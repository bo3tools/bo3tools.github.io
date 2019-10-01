/* jshint browser: true */
/* globals THREE, Stats, console, bo3 */
window.addEventListener("load", init);

var textureLoader = new THREE.TextureLoader();
var aoMap = textureLoader.load("lightmap.png");
var texture = textureLoader.load("texture.png");

function parseAndShowModel(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var content = bo3.read(e.target.result);
        if (content.errors.length > 0) {
            window.alert("Malformed block object");
            return;
        }
        
        var blocks = bo3.parse(content).filter(function(block) {
            return block.block != "AIR";
        });

        var model = createModel(blocks);
        setMainModel(model);
        
    };
    reader.readAsText(file);
}

function attachDragAndDropHandlers() {
    var element = document.getElementById("window");
    element.addEventListener("drop", function(e) {
        e.preventDefault();
        element.dataset.isDragging = false;
        var files = e.dataTransfer.files;

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var ext = file.name.toLowerCase().slice(-4);
            if (ext == ".bo3" || ext == ".bo2") {
                parseAndShowModel(file);
                return;
            }
        }

        if (files.length > 0) {
            window.alert("No .bo3 files found");
        }
    });
    element.addEventListener("dragover", function(e) {
        element.dataset.isDragging = true;
        e.preventDefault();
    });
    element.addEventListener("dragexit", function(e) {
        element.dataset.isDragging = false;
        e.preventDefault();
    });
    element.addEventListener("dragend", function(e) {
        element.dataset.isDragging = false;
        e.preventDefault();
    });
}

function init() {
    three();
    attachDragAndDropHandlers();
}

function createModel(blocks) {
    var data = blocksTo3dArray(blocks);
    var geometry = generateNewGeometry(data.blocks, data.voxels);

    var group = new THREE.Group();

    var model = new THREE.Mesh(geometry, window.material);
    model.doubleSided = false;
    group.add(model);

    var box = new THREE.BoxHelper(model, 0x000000);
    group.add(box);

    return group;
}

function setMainModel(model) {
    window.scene.remove(window.mainModel);
    window.mainModel = model;
    window.scene.add(window.mainModel);
}

function blocksTo3dArray(blocks) {
    var ln = blocks.length;
    var block = null;
    var i = 0;

    var min = {x: 0, y: 0, z: 0};
    var max = {x: 0, y: 0, z: 0};
    var names = {
        "AIR": 0,
        "STONE": 1,
        "STEP:3": 12,
        "FIRE:15": 141,
        "COBBLESTONE": 12,
        "MOSSY_COBBLESTONE": 135,
        "EMERALD_BLOCK": 204,
        "WOOL": 88,
        "WOOL:5": 88 + 5,
        "OBSIDIAN": 118,

        "LEAVES:0": 58,
        "LEAVES:1": 58 + 1,
        "LEAVES:3": 58 + 3,

        "SANDSTONE": 62,
        "LOG": 34,
        "LOG:12": 34,
        "LOG:1": 34 + 1,
        "LOG:5": 34 + 1,
        "LOG:3": 34 + 3,
        "LOG:13": 34 + 1,

        "BROWN_MUSHROOM": 128,
        "RED_MUSHROOM": 129,
        "DEAD_BUSH": 96,

        "COAL_ORE": 33,

        "LOG_2:5": 34 + 4,
        "LOG_2:9": 34 + 8,
        "NETHERRACK": 141,

        "VINE:1": 228,
        "VINE:2": 228,
        "VINE:3": 228,
        "VINE:4": 228,
        "VINE:8": 228,
        "VINE:9": 228,

        "RAILS": 153,
        "RAILS:5": 153,
        "RAILS:4": 153,

        "GRAVEL": 30,

        "SMOOTH_BRICK": 214,
        "MOB_SPAWNER": 140,

        "COBWEB": 93,
        "WEB": 93,

        "LONG_GRASS:1": 95,

        "GRASS": 8,
        "DIRT": 9,
        "DIRT:1": 10,
        "CARPET:14": 102,
        "STAINED_CLAY:5": 260 + 5,
        "FENCE": 13,
        "WOOD:5": 17
    };

    var voxels = {};
    for (i = 0; i < ln; i++) {
        block = blocks[i];

        if (block.x < min.x) min.x = block.x;
        if (block.y < min.y) min.y = block.y;
        if (block.z < min.z) min.z = block.z;

        if (block.x > max.x) max.x = block.x;
        if (block.y > max.y) max.y = block.y;
        if (block.z > max.z) max.z = block.z;

        if (typeof names[block.block] === "undefined") {
            console.log(block.block);
        }

        block.id = names[block.block];
        voxels[block.x + "," + block.y + "," + block.z] = block;
    }
    
    return {voxels: voxels, offset: min, blocks: blocks};
}

var Faces = [

    // Left face
    {
        uvRow: 0,
        shadows: [
            [-1, 1, 0],
            [-1, 0, -1],
            [-1, -1, 0],
            [-1, 0, 1]
        ],
        dir: [-1, 0, 0],
        corners: [{
                pos: [0, 1, 0],
                uv: [0, 1]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 0]
            },
            {
                pos: [0, 1, 1],
                uv: [1, 1]
            },
            {
                pos: [0, 0, 1],
                uv: [1, 0]
            },
        ]
    },

    // Right face
    {
        uvRow: 0,
        shadows: [
            [1, 1, 0],
            [1, 0, 1],
            [1, -1, 0],
            [1, 0, -1]
        ],
        dir: [1, 0, 0],
        corners: [{
                pos: [1, 1, 1],
                uv: [0, 1]
            },
            {
                pos: [1, 0, 1],
                uv: [0, 0]
            },
            {
                pos: [1, 1, 0],
                uv: [1, 1]
            },
            {
                pos: [1, 0, 0],
                uv: [1, 0]
            },
        ]
    },

    // Bottom face
    {
        uvRow: 1,
        shadows: [
            [0, -1, -1],
            [-1, -1, 0],
            [0, -1, 1],
            [1, -1, 0]
        ],
        dir: [0, -1, 0],
        corners: [{
                pos: [1, 0, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 0, 1],
                uv: [0, 0]
            },
            {
                pos: [1, 0, 0],
                uv: [1, 1]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 1]
            },
        ]
    },

    // Top face
    {
        uvRow: 2,
        shadows: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 1, -1],
            [-1, 1, 0]
        ],
        dir: [0, 1, 0],
        corners: [{
                pos: [0, 1, 1],
                uv: [1, 1]
            },
            {
                pos: [1, 1, 1],
                uv: [0, 1]
            },
            {
                pos: [0, 1, 0],
                uv: [1, 0]
            },
            {
                pos: [1, 1, 0],
                uv: [0, 0]
            },
        ]
    },

    // Back face
    {
        uvRow: 0,
        shadows: [
            [0, 1, -1],
            [1, 0, -1],
            [0, -1, -1],
            [-1, 0, -1]
        ],
        dir: [0, 0, -1],
        corners: [{
                pos: [1, 0, 0],
                uv: [0, 0]
            },
            {
                pos: [0, 0, 0],
                uv: [1, 0]
            },
            {
                pos: [1, 1, 0],
                uv: [0, 1]
            },
            {
                pos: [0, 1, 0],
                uv: [1, 1]
            },
        ]
    },

    // Front face
    {
        uvRow: 0,
        shadows: [
            [0, 1, 1],
            [-1, 0, 1],
            [0, -1, 1],
            [1, 0, 1]
        ],
        dir: [0, 0, 1],
        corners: [{
                pos: [0, 0, 1],
                uv: [0, 0]
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 1, 1],
                uv: [0, 1]
            },
            {
                pos: [1, 1, 1],
                uv: [1, 1]
            },
        ]
    }
];

var CrossFaces = [
    {
        uvRow: 0,
        dir: [0, 0, 0],
        corners: [{
                pos: [1, 1, 0],
                uv: [0, 1]
            },
            {
                pos: [1, 0, 0],
                uv: [0, 0]
            },
            {
                pos: [0, 1, 1],
                uv: [1, 1]
            },
            {
                pos: [0, 0, 1],
                uv: [1, 0]
            },
        ]
    },
    {
        uvRow: 0,
        dir: [0, 0, 0],
        corners: [{
                pos: [0, 1, 0],
                uv: [0, 1]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 0]
            },
            {
                pos: [1, 1, 1],
                uv: [1, 1]
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0]
            },
        ]
    }
];

var RailFaces = [
    {
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [
            {
                pos: [1, 0, 0],
                uv: [1, 1]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 1]
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 0, 1],
                uv: [0, 0]
            }
        ]
    },
    {
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [
            {
                pos: [1, 0, 0],
                uv: [0, 0]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 1]
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 0, 1],
                uv: [1, 1]
            }
        ]
    },
    {},
    {},
    {
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [
            {
                pos: [1, 1, 0],
                uv: [1, 1]
            },
            {
                pos: [0, 1, 0],
                uv: [0, 1]
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 0, 1],
                uv: [0, 0]
            }
        ]
    },
    {
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [
            {
                pos: [1, 0, 0],
                uv: [1, 1]
            },
            {
                pos: [0, 0, 0],
                uv: [0, 1]
            },
            {
                pos: [1, 1, 1],
                uv: [1, 0]
            },
            {
                pos: [0, 1, 1],
                uv: [0, 0]
            }
        ]
    }
];

var tileSize = 16 + 2;
var tileTextureWidth = 10764;
var tileTextureHeight = 72;

var uOffset = 1 / tileTextureWidth;
var vOffset = 1 / tileTextureHeight;

var lightmapSize = 32;
var lightmapWidth = 512;

var lightmapOffset = {
    u: 1 / lightmapWidth,
    v: 1 / lightmapSize
};

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function generateNewGeometry(blocks, voxels) {
    var geometry = new THREE.BufferGeometry();

    function isBlockAir(block) {
        return block.block == "air" || block.block == "none";
    }

    function getFlatFaces(block) {
        var blockAbove = getBlock(block.x, block.y + 1, block.z);
        var data = block.block.toLowerCase().split(":");
        var name = data[0];
        var textures = [];
        var faces = [];
        data = parseInt(data[1] || "0");
        
        if (name == "vine") {
            if (data == 0 || isBlockSolid(blockAbove)) {
                faces.push(Faces[3]);
            }

            if (data & 1) {
                faces.push(Faces[5]);
            }

            if (data & 2) {
                faces.push(Faces[0]);
            }

            if (data & 4) {
                faces.push(Faces[4]);
            }

            if (data & 8) {
                faces.push(Faces[1]);
            }
        }

        else if (name == "rails") {
            if (data == 0) {
                faces.push(RailFaces[0]);
            }

            if (data == 1) {
                faces.push(RailFaces[1]);
            }

            if (data == 4) {
                faces.push(RailFaces[4]);
            }
            if (data == 5) {
                faces.push(RailFaces[5]);
            }
        }

        return {
            faces: faces,
            textures: textures
        };
    }

    function isSealedOff(block) {
        for (var f = 0; f < Faces.length; f++) {
            var dir = Faces[f].dir;
            var next = getBlock(block.x + dir[0], block.y + dir[1], block.z + dir[2]);
            if (!isBlockSolid(next)) {
                return false;
            }
        }

        return true;
    }

    function isModelCrossFaced(block) {
        var crossFaced = ["long_grass", "brown_mushroom", "red_mushroom", "dead_bush", "web", "cobweb"];

        var name = block.block.toLowerCase().split(":")[0];
        return crossFaced.indexOf(name) !== -1;
    }

    function isPlant(block) {
        var plants = ["long_grass", "brown_mushroom", "red_mushroom"];

        var name = block.block.toLowerCase().split(":")[0];
        return plants.indexOf(name) !== -1;
    }

    function isModelFlat(block) {
        var wallHanging = ["vine", "rails"];

        var name = block.block.toLowerCase().split(":")[0];
        return wallHanging.indexOf(name) !== -1;
    }

    function isBlockTransparent(block) {
        var transparentBlocks = ["leaves", "mob_spawner"];

        var name = block.block.toLowerCase().split(":")[0];
        return transparentBlocks.indexOf(name) !== -1;
    }

    function isBlockSolid(block) {
        return !isBlockAir(block) && !isModelFlat(block) && !isModelCrossFaced(block);
    }

    function getBlock(i, j, k) {
        var data = voxels[i + "," + j + "," + k];
        if (typeof data !== "undefined") {
            return data;
        }

        return {block: "none"};
    }

    function getShadowTexture(x, y, z, face) {
        var blocks = [];
        if (!face.shadows) {
            return 0;
        }

        for (var i = 0; i < face.shadows.length; i++) {
            var pos = face.shadows[i];
            var block = getBlock(x + pos[0], y + pos[1], z + pos[2]);

            blocks.push(isBlockSolid(block));
        }
        
        var top    = blocks[0] << 0;
        var left   = blocks[1] << 1;
        var right  = blocks[2] << 2;
        var bottom = blocks[3] << 3;

        return top | left | right | bottom;
    }

    var dir, corners, uvRow, idx, c, n, pos, uv = null;
    var ln = blocks.length;
    var positions = [];
    var normals = [];
    var indices = [];
    var uvs = [];
    var uv2 = [];

    // For every block that is set in the model
    for (var i = 0; i < ln; i++) {
        var block = blocks[i];
        var uvVoxel = block.id;
        var x = block.x;
        var y = block.y;
        var z = block.z;

        if (isBlockSolid(block)) {

            // For every face of the block
            for (var f = 0; f < Faces.length; f++) {
                var face = Faces[f];
                dir = face.dir;
                corners = face.corners;
                uvRow = face.uvRow;

                // Get the block next to this face
                var next = getBlock(x + dir[0], y + dir[1], z + dir[2]);

                // If next block is air
                if (!isBlockSolid(next) || (isBlockTransparent(next) && !isBlockTransparent(block))) {
                    idx = positions.length / 3;
                    for (c = 0; c < corners.length; c++) {
                        pos = corners[c].pos;
                        uv  = corners[c].uv;

                        positions.push(x + pos[0], y + pos[1], z + pos[2]);
                        uvs.push(
                            (uvVoxel +   uv[0]) * tileSize / tileTextureWidth + uOffset - (2 * uOffset * uv[0]),
                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight + vOffset - (2 * vOffset * uv[1]));

                        uv2.push((getShadowTexture(x, y, z, face) + uv[0]) * lightmapSize / lightmapWidth + lightmapOffset.u - (2 * lightmapOffset.u * uv[0]), uv[1] + lightmapOffset.v - (2 * lightmapOffset.v * uv[1]));

                        for (n = 0; n < dir.length; n++) {
                            normals.push(dir[n]);
                        }
                    }

                    indices.push(idx, idx+1, idx+2, idx+2, idx+1, idx+3);
                }
            }
        }

        // Grass, cobwebs, plants draw the same face like a cross
        else if (isModelCrossFaced(block) && !isSealedOff(block)) {

            if (isPlant(block)) {
                x += randomFloat(-0.15, 0.15);
                y += randomFloat(-0.15, 0);
                z += randomFloat(-0.15, 0.15);
            }

            for (var f = 0; f < CrossFaces.length; f++) {
                var face = CrossFaces[f];
                dir = face.dir;
                corners = face.corners;
                uvRow = face.uvRow;

                idx = positions.length / 3;
                for (c = 0; c < corners.length; c++) {
                    pos = corners[c].pos;
                    uv  = corners[c].uv;

                    positions.push(x + pos[0], y + pos[1], z + pos[2]);
                    uvs.push(
                        (uvVoxel +   uv[0]) * tileSize / tileTextureWidth + uOffset - (2 * uOffset * uv[0]),
                    1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight + vOffset - (2 * vOffset * uv[1]));

                    // These kinds of blocks receive no shadows
                    uv2.push(0, 0);

                    for (n = 0; n < dir.length; n++) {
                        normals.push(dir[n]);
                    }
                }

                indices.push(idx, idx+1, idx+2, idx+2, idx+1, idx+3);
            }
        }

        // Vines, ladders, rails only draw one face (vines might draw 1+)
        else if (isModelFlat(block) && !isSealedOff(block)) {
            var faceData = getFlatFaces(block);
            var faces = faceData.faces;
            for (var f = 0; f < faces.length; f++) {
                var face = faces[f];
                var faceTexture = faceData.textures[i] || uvVoxel;

                dir = face.dir;
                corners = face.corners;
                uvRow = face.uvRow;

                // Offset this block depending on its direction
                var offsetValue = 0.05;
                x += dir[0] * -offsetValue;
                y += dir[1] * -offsetValue;
                z += dir[2] * -offsetValue;

                idx = positions.length / 3;
                for (c = 0; c < corners.length; c++) {
                    pos = corners[c].pos;
                    uv  = corners[c].uv;

                    positions.push(x + pos[0], y + pos[1], z + pos[2]);
                    uvs.push(
                        (faceTexture +   uv[0]) * tileSize / tileTextureWidth + uOffset - (2 * uOffset * uv[0]),
                    1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight + vOffset - (2 * vOffset * uv[1]));

                    // These kinds of blocks receive no shadows
                    uv2.push(0, 0);

                    for (n = 0; n < dir.length; n++) {
                        normals.push(dir[n]);
                    }
                }

                indices.push(idx, idx+1, idx+2, idx+2, idx+1, idx+3);
            }
        }
    }

    geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.addAttribute("uv2", new THREE.BufferAttribute(new Float32Array(uv2), 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    return geometry;
}

function createTextMesh(text, color) {
    return new THREE.Mesh(new THREE.TextGeometry(text, {
        size: 5,
        height: 0,
        curveSegments: 6,
        font: window.fontTexture,
        style: "normal"
    }), new THREE.MeshBasicMaterial({color: color}));
}

function setupExperimental(scene) {
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    var ambientLight = new THREE.AmbientLight(0xf0f0f0);
    scene.add(ambientLight);

    var chunkGrid = new THREE.GridHelper(16*16, 16);
    chunkGrid.material.opacity = 0.25;
    chunkGrid.material.transparent = true;
    scene.add(chunkGrid);

    window.material = new THREE.MeshLambertMaterial({
        map: texture,
        aoMap: aoMap,
        side: THREE.DoubleSide,
        alphaTest: 1.0,
        transparent: true
    });

    var axisHelper = new THREE.AxesHelper(16*8);
    scene.add(axisHelper);

    var textX = createTextMesh("+X", 0xee4433);
    textX.position.x = 16*7.25;
    textX.position.y = 5;
    scene.add(textX);

    var textZ = createTextMesh("+Z", 0x3344ee);
    textZ.rotation.y = 1.571;
    textZ.position.y = 5;
    textZ.position.z = 16*7.75;
    scene.add(textZ);
}

function three() {
    var screenElement = document.getElementById("screen");

    var scene  = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    window.scene = scene;
    
    var camera = new THREE.PerspectiveCamera( 70, screenElement.clientWidth / screenElement.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 10);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(screenElement.clientWidth, screenElement.clientHeight);

    screenElement.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.rotateUp(-20 * Math.PI / 180);
    controls.rotateLeft(-45 * Math.PI / 180);
    controls.update();

    window.addEventListener("resize", resize, false);

    setupExperimental(scene);

    var stats = new Stats();
    stats.showPanel(0);
    document.getElementById("fps").appendChild(stats.dom);

    function render() {
        stats.begin();

        window.requestAnimationFrame(render);
        renderer.render(scene, camera);

        stats.end();
    }

    function resize() {
        camera.aspect = screenElement.clientWidth / screenElement.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(screenElement.clientWidth, screenElement.clientHeight);
    }

    render();
}