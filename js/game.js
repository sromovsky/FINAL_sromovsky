const canvas = document.getElementById('canvas');
const graphics = canvas.getContext('2d');
const edgeSize = 800;
const tiles = [];

var allTiles = [];

var json;
var size;

function OnInit() {
    canvas.width = edgeSize;
    canvas.height = edgeSize;

    loadJsonFromXml('xml/rollTheBall.xml');
    loadTiles();

    loadGame(0);
    drawTiles();
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
    var game = json.rolltheball.games.game[gameLevel];

    console.log(allTiles);

    size = {verticalTiles: game.size.vertical, horizontalTiles: game.size.horizontal};

    var task = game.task;

    var rows = task.split(';');

    for (var y = 0; y < size.horizontalTiles; y++) {
        var columns = rows[y].split(',');
        for (var x = 0; x < size.verticalTiles; x++) {
            const tile = {x: x, y: y, image: allTiles[columns[x]].image, rotation: allTiles[columns[x]].rotation};
            tiles.push(tile);
        }
    }
}

function drawTiles() {
    for (var i in tiles) {
        const tileEdge = edgeSize / size.verticalTiles;

        var angle = Number(tiles[i].rotation);


        console.log(angle, tiles[i], tiles[i].image.src);

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