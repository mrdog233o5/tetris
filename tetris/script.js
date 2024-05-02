const c = document.getElementById("game");
const ctx = c.getContext("2d");
const scoreElements = Array.from(document.getElementsByClassName("score"));
const highscoreElement = document.getElementById("highscore");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");
const SIZE = 25;
const BLOCKTYPES = [
    {
        "color": "yellow",
        "outlook": [
            [1,1,0],
            [0,1,1]
        ],
        "anchor": [0,1],
        "rotatable": true
    },
    {
        "color": "green",
        "outlook": [
            [0,1,1],
            [1,1,0]
        ],
        "anchor":[0,1],
        "rotatable": true
    },
    {
        "color": "orange",
        "outlook": [
            [1,1,1],
            [1,0,0]
        ],
        "anchor":[0,1],
        "rotatable": true
    },
    {
        "color": "pink",
        "outlook": [
            [1,1,1],
            [0,0,1]
        ],
        "anchor":[0,1],
        "rotatable": true
    },
    {
        "color": "blue",
        "outlook": [
            [1,1],
            [1,1]
        ],
        "anchor":[0,1],
        "rotatable": false
    },
    {
        "color": "lightgreen",
        "outlook": [
            [1,1,1,1]
        ],
        "anchor":[0,1],
        "rotatable": true
    },
    {
        "color": "red",
        "outlook": [
            [0,1,0],
            [1,1,1]
        ],
        "anchor":[0,1],
        "rotatable": true
    }
];
const DEATHMSG = `EZ
SKILL ISSUE
GET BETTER
TRASH
NOOB`.split("\n");
const FALLSPEED = 350;
const KEYSPEED = 80;
const STUCKCD = 300;
const AFTERSTUCKCD = 1000;
const DEATHROW = 1
const settingsDefault = {
    "grid": true,
    "offensive death message": true,
    "keep progrress when closed": true,
};
var settings = settingsDefault;
var readyToSpawn = true;
var grid = createArray();
var temp;
var pieces = [];
var keys = [false, false, false, false];
var keysLoop = [false, false, false, false];
var score = 0;
var dead = false;
var pause = false;
var displayPause = false;

class Piece {
    constructor(type) {
        this.type = type;
        this.color = BLOCKTYPES[type]["color"];
        this.outlook = BLOCKTYPES[type]["outlook"];
        this.anchor = BLOCKTYPES[type]["anchor"];
        this.rotatable = BLOCKTYPES[type]["rotatable"];
        this.stuck = false;
        this.blocks = [];
        this.keyDuringStuck = false;
        this.stuckDetected = false;
        this.addedScore = false;
        this.anchorCoords = [this.anchor[0] , Math.floor(grid[0].length/2)-1];
        for (var y = 0; y < this.outlook.length; y++) {
            for (var x = 0; x < this.outlook[y].length; x++) {
                if (this.outlook[y][x]) {
                    this.blocks.push([y + this.anchorCoords[0] - this.anchor[0] , x + this.anchorCoords[1] - this.anchor[1] ]);
                }
            }
        }
    }
    
    applyData(json) {
        Object.assign(this, json);
    }

    render() {
        for (var i = 0; i < this.blocks.length; i++) {
            grid[this.blocks[i][0]][this.blocks[i][1]]["color"] = this.color;
            grid[this.blocks[i][0]][this.blocks[i][1]]["parent"] = this;
            grid[this.blocks[i][0]][this.blocks[i][1]]["block"] = true;
            grid[this.blocks[i][0]][this.blocks[i][1]]["fall"] = true;
        }
        if (this.stuck) {
            this.blocks.forEach((pos) => {
                grid[pos[0]][pos[1]]["fall"] = false;
            });
        }
    }

    checkStuck() {
        var stuck = false;
        this.blocks.forEach(block => {
            var y = block[0], x = block[1];
            if (
                grid[y][x]["block"] &&
                grid[y][x]["fall"] &&
                (
                    y + 1 >= grid.length ||
                    (
                        grid[y + 1][x]["block"] &&
                        !(grid[y + 1][x]["parent"] == grid[y][x]["parent"])
                    )
                )
            ) {
                stuck = true;
            }
        });
        
        // delay after land
        if (stuck) {
            this.stuckDetected = true;
            setTimeout(() => {
                if (this.keyDuringStuck) {
                    setTimeout(() => {
                        var nowStuck = false;
                        this.blocks.forEach(block => {
                            var y = block[0], x = block[1];
                            if (
                                grid[y][x]["block"] &&
                                grid[y][x]["fall"] &&
                                (
                                    y + 1 >= grid.length ||
                                    (
                                        grid[y + 1][x]["block"] &&
                                        !(grid[y + 1][x]["parent"] == grid[y][x]["parent"])
                                    )
                                )
                            ) {
                                nowStuck = true;
                            }
                        });
                        if (nowStuck) {
                            this.stuck = stuck;
                            clearLine();
                            if (!this.addedScore) {
                                score += 10;
                                this.addedScore = true;
                            }
                        }
                    }, AFTERSTUCKCD);
                } else {
                    this.stuck = stuck;
                    clearLine();
                    if (!this.addedScore) {
                        score += 10;
                        this.addedScore = true;
                    }
                }
            }, STUCKCD);
        }
    }

    move(yMove, xMove, autoCheckStuck = true) {
        if (this.stuck) {
            return;
        }
        var i = 0;
        var fall = true;
        this.blocks.forEach(block => {
            var y = block[0], x = block[1];
            if (
                grid[y][x]["block"] && 
                grid[y][x]["fall"] &&
                x + xMove >= 0 &&
                x + xMove < grid[0].length &&
                y + yMove >= 0 &&
                y + yMove < grid.length &&
                (
                    !grid[y + yMove][x + xMove]["block"] ||
                    grid[y + yMove][x + xMove]["parent"] == grid[y][x]["parent"]
                )
            ) {} else {
                fall = false;
            }


        });
        if (fall) {
            this.anchorCoords[0] = this.anchorCoords[0] + yMove;
            this.anchorCoords[1] = this.anchorCoords[1] + xMove;
            this.blocks.forEach(block => {
                var y = block[0], x = block[1];
                temp = grid[y][x];
                grid[y][x] = {
                    block: false,
                    color: null,
                    parent: null,
                    fall: true
                };
                grid[y + yMove][x + xMove] = temp;
                this.blocks[i][0] = this.blocks[i][0] + yMove;
                this.blocks[i][1] = this.blocks[i][1] + xMove;
                i++;
            });
        }
        if (autoCheckStuck) {
            this.checkStuck();
        }
        if (fall) {
            return true;
        }
    }

    spin() {
        // exit if not rotatable
        if (this.stuck || !this.rotatable) {
            return;
        }
        var anchorArr = [];
        var newAnchorArr = [];
        var newblocks = [];
        var row = [];
        var anchor;
        var anchorCoords;
        var coords = [];

        // create array
        for (var i = 0; i < this.outlook.length; i++) {
            for (var j = 0; j < this.outlook[0].length; j++) {
                if (i == this.anchor[0] && j == this.anchor[1]) {
                    row.push(true);
                    continue;
                }
                row.push(false);
            }
            anchorArr.push(row);
            row = [];
        }

        // flip the anchor array
        for (var i = 0; i < anchorArr[0].length; i++) {
            for (var j = anchorArr.length - 1; j >= 0; j--) {
                row.push(anchorArr[j][i]);
            }
            newAnchorArr.push(row);
            row = [];
        }

        // update the anchor position
        for (var i = 0; i < newAnchorArr.length; i++) {
            for (var j = 0; j < newAnchorArr[0].length; j++) {
                if (newAnchorArr[i][j]) {
                    anchor = [i,j];
                }
            }
        }


        // flip the piece
        for (var i = 0; i < this.outlook[0].length; i++) {
            for (var j = this.outlook.length - 1; j >= 0; j--) {
                row.push(this.outlook[j][i]);
            }
            newblocks.push(row);
            row = [];
        }

        // calculate new position

        anchorCoords = this.anchorCoords;
        
        for (var i = 0; i < newblocks.length; i++) {
            for (var j = 0; j < newblocks[0].length; j++) {
                if (newblocks[i][j]) {
                    coords.push([anchorCoords[0] + this.anchor[0] - 1 + i, anchorCoords[1] + this.anchor[1] + j]);
                }
            }
        }

        // check if new pos is valid, quit if not
        for (var i = 0; i < coords.length; i++) {
            var pos = coords[i];
            if (pos[0] >= grid.length || pos[0] < 0 || pos[1] >= grid[0].length || pos[1] < 0) {
                return;
            }
            if (grid[pos[0]][pos[1]]["block"] && grid[pos[0]][pos[1]]["parent"] != this) {
                return;
            }
        };

        // spin this piece


        this.blocks.forEach((pos) => {
            grid[pos[0]][pos[1]] = {
                block: false,
                color: null,
                parent: null,
                fall: true
            };
        });

        this.anchor = anchor;
        this.blocks = coords;
        this.outlook = newblocks;
        this.checkStuck();
    }

    left() {
        keysLoop[0] = true;
        this.move(0,-1);

        setTimeout(() => {
            keysLoop[0] = false;
        }, KEYSPEED);
    }

    right() {
        keysLoop[2] = true;
        this.move(0,1);

        setTimeout(() => {
            keysLoop[2] = false;
        }, KEYSPEED);
    }

    down() {
        keysLoop[3] = true;
        if (this.move(1,0)  ) {
            score ++;
        }

        setTimeout(() => {
            keysLoop[3] = false;
        }, KEYSPEED);
    }

    bottom() {
        var moves = 0;
        while (!this.stuck) {
            this.move(1, 0, false);
            this.blocks.forEach(block => {
            var y = block[0], x = block[1];
            if (
                grid[y][x]["block"] &&
                grid[y][x]["fall"] &&
                (
                    y + 1 >= grid.length ||
                    (
                        grid[y + 1][x]["block"] &&
                        !(grid[y + 1][x]["parent"] == grid[y][x]["parent"])
                    )
                )
                ) {
                    this.stuck = true;
                }
            });
            this.render();
            render();
            moves++;
        }
        score += 3 * moves;
        clearLine();
    }
}

function createArray() {
    // Create a 20x10 2D array
    const rows = 20;
    const columns = 10;
    var map = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push({
                block: false,
                color: null,
                parent: null,
                fall: true
            });
        }
        map.push(row);
    }
    return map;
}

function render() {
    var y = 0;
    var x = 0;
    grid.forEach((row) => {
        row.forEach((block) => {
            if (block["block"]) {
                ctx.fillStyle = block["color"]; // set color
                ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE); // draw block
            }
            x++;
        });
        x = 0;
        y++;
    });
    if (settings["grid"]) {
        ctx.strokeStyle = "#FFFFFF50";
        for (var i = 0; i < grid[0].length; i++) {
            ctx.beginPath(); // Start a new path
            ctx.moveTo(i * SIZE, 0); // Move the pen to (30, 50)
            ctx.lineTo(i * SIZE, grid.length * SIZE); // Draw a line to (150, 100)
            ctx.stroke(); // Render the path
        }
        for (var i = 0; i < grid.length; i++) {
            ctx.beginPath(); // Start a new path
            ctx.moveTo(0, i * SIZE); // Move the pen to (30, 50)
            ctx.lineTo(grid[0].length * SIZE, i * SIZE); // Draw a line to (150, 100)
            ctx.stroke(); // Render the path
        }
    }
}

function gravity() {
    pieces.forEach(piece => {
        if (!piece.stuck) {
            piece.move(1,0);
        }
    });
    setTimeout(() => {
        window.requestAnimationFrame(gravity);
    }, FALLSPEED);
}

function clearLine() {
    if (pieces.length > 0 && pieces[pieces.length - 1].stuck) {
        pieces.push(new Piece(Math.floor(Math.random() * BLOCKTYPES.length)));
    } else {
        return;
    }
    var line;
    var lineCleared;
    var lineFilled;
    for (var i = 0; i < grid.length; i++) {
        line = grid[i];
        lineFilled = true;
        line.forEach((block) => {
            if (!block["block"]) {
                lineFilled = false;
            }
        });

        if (lineFilled) {
            lineCleared = i;

            // clear the line
            for (var j = 0; j < line.length; j++) {
                for (var k = 0; k < grid[i][j]["parent"].blocks.length; k++) {
                    if (grid[i][j]["parent"].blocks[k][0] == i && grid[i][j]["parent"].blocks[k][1] == j) {
                        grid[i][j]["parent"].blocks.splice(k, 1);
                    }
                }
                grid[i][j]["block"] = false;
                grid[i][j]["parent"] = null;
            }

            // move blocks down
            for (var j = lineCleared; j > 0; j--) {
                for (var k = 0; k < grid[0].length; k++) {
                    if (
                        (
                            !grid[j][k]["block"] ||
                            grid[j][k]["parent"].stuck
                        ) && (
                            !grid[j - 1][k]["block"] ||
                            grid[j - 1][k]["parent"].stuck
                        )
                    ) {
                        if (grid[j - 1][k]["block"]) {
                            grid[j - 1][k]["parent"].blocks.push([j, k]);
                            for (var l = 0; l < grid[j - 1][k]["parent"].blocks.length; l++) {
                                if (grid[j - 1][k]["parent"].blocks[l][0] == j - 1 && grid[j - 1][k]["parent"].blocks[l][1] == k) {
                                    grid[j - 1][k]["parent"].blocks.splice(l, 1);
                                }
                            }
                            grid[j - 1][k]["block"] = false;
                            grid[j - 1][k]["parent"] = null;
                        }
                    }
                }
            }
            pieces.forEach(piece => {
                piece.render();
            });
            score += 75;
        }
    }
}

function controls() {

    if (keys[0] && !keysLoop[0]) {
        pieces[pieces.length - 1].left();
    }
    if (keys[2] && !keysLoop[2]) {
        pieces[pieces.length - 1].right();
    }
    if (keys[3] && !keysLoop[3]) {
        pieces[pieces.length - 1].down();
    }

}

function saveData() {
    if (score > localStorage["highscore"] || localStorage["highscore"] == undefined) {
        localStorage["highscore"] = score;
    }
    localStorage["pieces"] = JSON.stringify(pieces);
    localStorage["score"] = score;
    var resetSettings = false;

    if (Object.keys(JSON.parse(localStorage["settings"])).length != Object.keys(settingsDefault).length) resetSettings = true;

    if (resetSettings) localStorage["settings"] = JSON.stringify(settingsDefault);
}

function readData() {
    if (localStorage["highscore"] == undefined) localStorage["highscore"] = 0;
    if (localStorage["pieces"] == undefined) localStorage["pieces"] = "[]";
    if (localStorage["score"] == undefined) localStorage["score"] = 0;
    if (localStorage["settings"] == undefined) localStorage["settings"] = JSON.stringify(settings);
    highscoreElement.innerHTML = "high score: " + localStorage["highscore"]
    settings = JSON.parse(localStorage["settings"]);
    if (settings["keep progrress when closed"]) {
        var localPieces = JSON.parse(localStorage["pieces"]);
        localPieces.forEach((piece) => {
            pieces.push(new Piece(piece.type));
            pieces[pieces.length - 1].applyData(piece);
        });
        score = parseInt(localStorage["score"]);
    }
}

function checkDeath() {
    for (var i = 0; i < grid.length; i++) {
        grid[i].forEach((block) => {
            if (!block.fall) {
                dead = true;
            }
        })
        if (i > DEATHROW) break;
    }
}

function restart() {
    grid = createArray();
    dead = false;
    pause = false;
    displayPause = false;
    temp = null;
    pieces = [];
    keys = [false, false, false, false];
    keysLoop = [false, false, false, false];
    score = 0;
    saveData();
}

function frame() {
    document.getElementById("dead").style.display = 'none';
    document.getElementById("alive").style.display = '';
    if (pause) {
        if (displayPause) {
            document.getElementById("dead").style.display = '';
            document.getElementById("alive").style.display = 'none';
            if (!dead) document.getElementById("msg").innerText = "PAUSED";
        }
        window.requestAnimationFrame(frame); // for next tick
        return;
    }

    if (pieces.length == 0) {
        pieces.push(new Piece(Math.floor(Math.random() * BLOCKTYPES.length)));
    }

    // algorithm stuff
    controls();
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        if (piece.blocks.length == 0) {
            pieces.splice(i, 1);
        }
        piece.render();
    }

    // render and continue
    // check alive or dead
    if (dead) {
        document.getElementById("msg").innerText = DEATHMSG[Math.floor(Math.random() * DEATHMSG.length)];
        pause = true;
        displayPause = true;
    }
    // display score
    scoreElements.forEach((element) => {
        element.innerHTML = score;
    });
    // display highscore
    highscoreElement.innerHTML = localStorage["highscore"];

    ctx.clearRect(0, 0, c.width, c.height); // clear screen
    render(); // draw new grid
    checkDeath();
    saveData();
    window.requestAnimationFrame(frame); // for next tick
}

readData();
document.getElementById("dead").style.display = 'none';
document.getElementById("alive").style.display = '';
frame();
gravity();

// block movement
// left up right down
document.onkeydown = event => {
    if (pause) return;
    if (event.keyCode === 32) {
        pieces[pieces.length - 1].bottom();
    } else {
        if (pieces[pieces.length - 1].stuckDetected) {
            pieces[pieces.length - 1].keyDuringStuck = true;
        }
        for (var i = 0; i < keys.length; i++) {;
            if (event.keyCode === 37 + i) {
                keys[i] = true;
            }
        }
        if (event.keyCode === 38) {
            pieces[pieces.length - 1].spin();
        }
    }
};
document.onkeyup = event => {
    for (var i = 0; i < keys.length; i++) {;
        if (event.keyCode === 37 + i) {
            keys[i] = false;
        }
    }
};
restartBtn.onclick = event => {
    restart();
};
pauseBtn.onclick = event => {
    if (dead) return;
    pause = !pause;
    displayPause = !displayPause;
};
