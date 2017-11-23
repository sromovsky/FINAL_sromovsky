const canvas = document.getElementById('canvas');
const graphics = canvas.getContext('2d');
const edgeSize = 800;
const tiles = [];

var allTiles = [];
var json;
var size;

var selectedTile;

var solutions;
var actual;


function OnInit() {
    canvas.width = edgeSize;
    canvas.height = edgeSize;

    loadJsonFromXml('xml/rollTheBall.xml');
    loadTiles();

    loadGame(0);
    drawTiles();


    canvas.onmousedown = function (event) {
        selectedTile = getPosition(event.layerX, event.layerY);
    };

    document.onmouseup = function (event) {
        if (isWinner()) {
            console.log('WINNER!');
            document.getElementById('display').innerHTML = 'Winner!';
        }
        selectedTile = undefined;
    };

    canvas.onmousemove = function (event) {
        if (selectedTile !== undefined) {
            var newPosition = getPosition(event.layerX, event.layerY);
            if (canChange(tiles[newPosition.index], tiles[selectedTile.index])) {
                changeTiles(newPosition.index, selectedTile.index);
                drawTiles();
                selectedTile = getPosition(event.layerX, event.layerY);
            }
        }
    };
}

function isWinner() {
    getActual();
    return actual === solutions.replace(/;/g,',') + ',';
}

function getActual() {
    actual = '';
    for (var i in tiles) {
        actual += tiles[i].type + ',';
    }
}

function canChange(newTile, oldTile) {
    if ((newTile !== oldTile && newTile.type[0] === 'E' &&
            oldTile.type[0] !== 'S' && oldTile.type[0] !== 'F' && oldTile.type[0] !== 'E')
        && ((newTile.x === oldTile.x) || (newTile.y === oldTile.y))) {
        return (newTile.x - oldTile.x === -1 || newTile.x - oldTile.x === 1)
            || (newTile.y - oldTile.y === -1 || newTile.y - oldTile.y === 1)
    } else {
        return false;
    }
}

function changeTiles(indexA, indexB) {
    const tmpImg = tiles[indexA].image;
    tiles[indexA].image = tiles[indexB].image;
    tiles[indexB].image = tmpImg;

    const tmpRot = tiles[indexA].rotation;
    tiles[indexA].rotation = tiles[indexB].rotation;
    tiles[indexB].rotation = tmpRot;

    const tmpType = tiles[indexA].type;
    tiles[indexA].type = tiles[indexB].type;
    tiles[indexB].type = tmpType;
}

function getPosition(x, y) {
    var realEdge = canvas.offsetWidth / size.verticalTiles;
    var tile = {x: Math.ceil(x / realEdge) - 1, y: Math.ceil(y / realEdge) - 1};

    for (var i in tiles) {
        if (tiles[i].x === tile.x && tiles[i].y === tile.y) {
            tile.index = Number(i);
            return tile;
        }
    }
}

function loadJsonFromXml(url) {
    $.ajax({
        async: false,
        type: 'GET',
        url: url,
        success: function (xml) {
            json = xml2json(xml);
        }
    });
}

function loadTiles() {
    var blocks = json.rolltheball.blocks.block;

    for (var i in blocks) {
        const img = new Image;
        const regExp = new RegExp('^\\.|\\.jpg$|\\.gif$|.png$');

        if (regExp.test(blocks[i].img)) {
            img.src = 'img/tiles/' + blocks[i].img;
        }

        allTiles[blocks[i].name] = {image: img, rotation: blocks[i].rotation};
    }
}

function loadGame(gameLevel) {
    const game = json.rolltheball.games.game[gameLevel];
    const task = game.task;
    const rows = task.split(';');

    solutions = game.solution;

    size = {verticalTiles: game.size.vertical, horizontalTiles: game.size.horizontal};

    for (var y = 0; y < size.horizontalTiles; y++) {
        var columns = rows[y].split(',');
        for (var x = 0; x < size.verticalTiles; x++) {
            const tile = {x: x, y: y, image: allTiles[columns[x]].image,
                rotation: allTiles[columns[x]].rotation, type: columns[x]};
            tiles.push(tile);
        }
    }
}

function drawTiles() {
    for (var i in tiles) {
        const tileEdge = edgeSize / size.verticalTiles;
        const angle = Number(tiles[i].rotation);

        var x = tiles[i].x * tileEdge;
        var y = tiles[i].y * tileEdge;

        if (angle === 90 || angle === 180) {
            x += tileEdge;
        }
        if (angle === 180 || angle === 270) {
            y += tileEdge;
        }

        graphics.save();
        graphics.translate(x, y);
        graphics.rotate(angle * Math.PI/180);
        graphics.drawImage(tiles[i].image, 0, 0, tileEdge, tileEdge);
        //graphics.strokeRect(tiles[i].x * tileEdge, tiles[i].y * tileEdge, tileEdge, tileEdge);
        graphics.restore();
    }
}

function xml2json(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) === "undefined") {
                    obj[nodeName] = xml2json(item);
                } else {
                    if (typeof (obj[nodeName].push) === "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2json(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}

OnInit();