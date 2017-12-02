document.getElementById('undoBtn').disabled = true;
var canvas = document.getElementById('canvas');
var mockScoreInput = document.getElementById('mockScore');
var dateDisplay = document.getElementById('dateDisplay');
var levelSelect = document.getElementById('levelSelect');
var loader = document.getElementById('loader');
var graphics = canvas.getContext('2d');
var edgeSize = 800;

var tiles = [];
var allLevels, actualLevel;
var historyOfMoves = [];

var allTiles = [], selectedTile;
var json, size;

var solutions, actual;
var movesCount = 0;

var touchActive;


canvas.addEventListener('touchstart', function(e) {
    document.documentElement.style.overflow = 'hidden';
});

document.addEventListener('touchend', function(e) {
    document.documentElement.style.overflow = 'auto';
});

loadJsonFromXml('xml/rollTheBall.xml');
loadTiles();

function delayLoadTiles() {
    setTimeout(OnInit, 1000);
}

function OnInit() {
    canvas.width = edgeSize;
    canvas.height = edgeSize;

    document.getElementById('saveBtn').disabled = true;

    var date = new Date();
    dateDisplay.innerHTML = date.getDate() + '. ' + (date.getMonth() + 1) + '. ' + date.getFullYear();

    var storedGame = localStorage['savedGame'];
    var lastPlayedGame = localStorage['lastPlayedGame'];

    if (storedGame) {
        storedGame = JSON.parse(storedGame);
    }

    if (storedGame && storedGame.actualLevel >= lastPlayedGame) {
        actualLevel = storedGame.actualLevel;
        actual = storedGame.actual;
        size = storedGame.size;

        historyOfMoves = storedGame.historyOfMoves;

        loadGame(actualLevel);

        movesCount = storedGame.movesCount;
        setMovesCount(movesCount);

        loadGameFromHistoryString(actual);
    } else {
        if (lastPlayedGame) {
            loadGame(Number(lastPlayedGame));
        } else {
            loadGame(0);
        }
    }

    canvas.onmousedown = function(event) {
        selectedTile = getPosition(event.layerX, event.layerY);
    };

    document.onmouseup = function(event) {
        getActual();
        selectedTile = undefined;
        testIsWinner();
    };

    canvas.onmousemove = function(event) {
        if (selectedTile !== undefined) {
            moveTile(event.layerX, event.layerY);
        }
    };

    function moveTile(x, y) {
        var newPosition = getPosition(x, y);
        if (newPosition && canChange(tiles[newPosition.index], tiles[selectedTile.index])) {
            changeTiles(newPosition.index, selectedTile.index);
            drawTiles();
            selectedTile = getPosition(x, y);
        }
    }

    $('#canvas').on("touchstart", function (e, touch) {
        touchActive = true;
        var touchX = e.originalEvent.touches[0].pageX - canvas.offsetLeft;
        var touchY = e.originalEvent.touches[0].pageY - canvas.offsetTop;
        selectedTile = getPosition(touchX, touchY);
    }).on("touchend", function (e, touch) {
        selectedTile = undefined;
        testIsWinner();
    }).on("touchmove", function (e, touch) {
        var touchX = e.originalEvent.touches[0].pageX - canvas.offsetLeft;
        var touchY = e.originalEvent.touches[0].pageY - canvas.offsetTop;
        moveTile(touchX, touchY);
    });

    loader.style.display = 'none';
}

function nextLevel() {
    if (actualLevel + 1 === allLevels) {
        alert('Gratulujeme, prešli ste všetky levely.');
        loadGame(0);
    } else {
        if (actualLevel < allLevels) {
            actualLevel++;
        }
        loadGame(actualLevel);
    }
}

function newMoveToHistory() {
    getActual();
    historyOfMoves.push(actual);
    if (historyOfMoves.length > 3) {
        historyOfMoves.shift();
    }
}

function isWinner() {
    getActual();
    if (Array.isArray(solutions)) {
        for (var s in solutions) {
            if (actualIsSolution(actual, solutions[s].replace(/;/g,',') + ',')) {
                return true;
            }
        }
    } else {
        var solution = solutions.replace(/;/g,',') + ',';
        if (actualIsSolution(actual, solution)) {
            return true;
        }
    }
    return false;
}

function actualIsSolution(act, sol) {
    var actualArray = act.split(',');
    var solutionArray = sol.split(',');

    for (var tile in actualArray) {
        if (solutionArray[tile][0] === 'T' || solutionArray[tile][0] === 'D') {
            if (actualArray[tile] !== solutionArray[tile]) {
                return false;
            }
        }
    }
    return true;
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
    newMoveToHistory();

    movesCount++;
    setMovesCount(movesCount);

    document.getElementById('saveBtn').disabled = false;

    var tmpImg = tiles[indexA].image;
    tiles[indexA].image = tiles[indexB].image;
    tiles[indexB].image = tmpImg;

    var tmpRot = tiles[indexA].rotation;
    tiles[indexA].rotation = tiles[indexB].rotation;
    tiles[indexB].rotation = tmpRot;

    var tmpType = tiles[indexA].type;
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
        var img = new Image;
        var regExp = new RegExp('^\\.|\\.jpg$|\\.gif$|.png$');

        if (regExp.test(blocks[i].img)) {
            img.src = 'img/tiles/' + blocks[i].img;
        }

        allTiles[blocks[i].name] = {image: img, rotation: blocks[i].rotation};
    }
}

function loadGame(gameLevel) {
    document.getElementById('nextBtn').disabled = true;
    try {
        var game = json.rolltheball.games.game[gameLevel];
        var task = game.task;
        var rows = task.split(';');

        loadScore(gameLevel);

        actualLevel = gameLevel;
        allLevels = json.rolltheball.games.game.length;
        document.getElementById('displayLevel').innerHTML = (actualLevel + 1) + '/' + allLevels;


        levelSelect.innerHTML = '';

        var opt = document.createElement('option');
        opt.value = -1;
        opt.innerHTML = 'Last game';
        levelSelect.appendChild(opt);

        for (var l = 1; l <= allLevels; l++) {
            opt = document.createElement('option');
            opt.value = l - 1;
            opt.innerHTML = 'Level ' + l;
            levelSelect.appendChild(opt);
        }

        movesCount = 0;
        setMovesCount(movesCount);

        solutions = game.solution;

        size = {verticalTiles: game.size.vertical, horizontalTiles: game.size.horizontal};

        tiles = [];
        for (var y = 0; y < size.horizontalTiles; y++) {
            var columns = rows[y].split(',');
            for (var x = 0; x < size.verticalTiles; x++) {
                var tile = {x: x, y: y, image: allTiles[columns[x]].image,
                    rotation: allTiles[columns[x]].rotation, type: columns[x]};
                tiles.push(tile);
            }
        }

        localStorage['lastPlayedGame'] = gameLevel;

        if (actualLevel + 1 === allLevels) {
            document.getElementById('nextBtn').innerHTML = 'Level 1';
        } else {
            document.getElementById('nextBtn').innerHTML = 'Ďalej';
        }

        drawTiles();
    } catch(err) {
        console.error('Invalid game format! (XML file)');
    }
}

function undo() {
    if (historyOfMoves.length > 0) {
        movesCount--;
        setMovesCount(movesCount);
        loadGameFromHistoryString(historyOfMoves[historyOfMoves.length - 1]);
        historyOfMoves.pop();
    }
    document.getElementById('nextBtn').disabled = !isWinner();
}

function setMovesCount(movesCount) {
    document.getElementById('displayMoves').innerHTML = movesCount;
    document.getElementById('undoBtn').disabled = movesCount === 0;
}

function loadGameFromHistoryString(string) {
    tiles = [];
    for (var y = 0; y < size.horizontalTiles; y++) {
        var tmpTiles = string.split(',');
        for (var x = 0; x < size.verticalTiles; x++) {
            var tile = {x: x, y: y, image: allTiles[tmpTiles[size.horizontalTiles* y + x]].image,
                rotation: allTiles[tmpTiles[size.horizontalTiles * y + x]].rotation,
                type: tmpTiles[size.horizontalTiles * y + x]};
            tiles.push(tile);
        }
    }
    drawTiles();
    testIsWinner();
}

function drawTiles() {
    for (var i in tiles) {
        var tileEdge = edgeSize / size.verticalTiles;
        var angle = Number(tiles[i].rotation);

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
        graphics.restore();
    }
}

function testIsWinner() {
    if (isWinner()) {
        document.getElementById('nextBtn').disabled = false;
        setScore();
    } else {
        document.getElementById('nextBtn').disabled = true;
    }
}

function setScore() {
    var storedScore = localStorage['scoreLevel' + actualLevel];
    if (storedScore) {
        if (Number(storedScore) > movesCount) {
            localStorage['scoreLevel' + actualLevel] = movesCount;
        }
    } else {
        localStorage['scoreLevel' + actualLevel] = movesCount;
    }
    loadScore(actualLevel);
}

function loadScore(level) {
    var storedScore = localStorage['scoreLevel' + level];
    if (storedScore) {
        document.getElementById('displayScore').innerHTML = storedScore;
    } else {
        document.getElementById('displayScore').innerHTML = '---';
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

function resetGame() {
    loadGame(actualLevel);
    historyOfMoves = [];
    testIsWinner();
    document.getElementById('saveBtn').disabled = false;
}

function saveGame() {
    var lastGame = {};
    getActual();

    lastGame.actualLevel = actualLevel;
    lastGame.actual = actual;
    lastGame.size = size;
    lastGame.historyOfMoves = historyOfMoves;
    lastGame.movesCount = movesCount;

    localStorage['savedGame'] = JSON.stringify(lastGame);

    document.getElementById('saveBtn').disabled = true;
}

function setMockScore() {
    if (mockScoreInput.value !== '') {
        localStorage['scoreLevel' + actualLevel] = mockScoreInput.value;
        mockScoreInput.value = '';
    }
    loadScore(actualLevel);

    if (levelSelect.value !== '-1') {
        localStorage['lastPlayedGame'] = levelSelect.value;
        localStorage['savedGame'] = '';
        levelSelect.value = '-1';
    }
}

function getActualString() {
    getActual();
    console.log(actual);
}

delayLoadTiles();