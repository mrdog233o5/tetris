var c = document.getElementById("game");
console.log(c);
var ctx = c.getContext("2d");
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
    }
];
const FALLSPEED = 300;
var tick = 0;
var grid = createArray();
var temp;
var pieces = [];

class Piece {
    constructor(type) {
        this.color = BLOCKTYPES[type]["color"];
        this.outlook = BLOCKTYPES[type]["outlook"];
        this.anchor = BLOCKTYPES[type]["anchor"];
        this.rotatable = BLOCKTYPES[type]["rotatable"];
        this.stuck = false;
        this.blocks = [];
        this.anchorCoords = [this.anchor[0] , Math.floor(grid[0].length/2)-1];
        for (var y = 0; y < this.outlook.length; y++) {
            for (var x = 0; x < this.outlook[y].length; x++) {
                if (this.outlook[y][x]) {
                    this.blocks.push([y + this.anchorCoords[0] - this.anchor[0] , x + this.anchorCoords[1] - this.anchor[1] ]);
                }
            }
        }
    }

    render() {
        for (var i = 0; i < this.blocks.length; i++) {
            grid[this.blocks[i][0]][this.blocks[i][1]]["color"] = this.color;
            grid[this.blocks[i][0]][this.blocks[i][1]]["parent"] = this;
            grid[this.blocks[i][0]][this.blocks[i][1]]["block"] = true;
            grid[this.blocks[i][0]][this.blocks[i][1]]["fall"] = true;
        }
        this.checkStuck();
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
        this.stuck = stuck;
    }

    move(yMove, xMove) {
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


        console.log(anchor);
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
}

function gravity() {
    pieces.forEach(piece => {
        piece.move(1,0);
    });
    setTimeout(() => {
        window.requestAnimationFrame(gravity);
    }, FALLSPEED);
}

function clearLine() {
    grid.forEach((line) => {
        lineFilled = true;
        line.forEach((block) => {
            if (!block["block"]) {
                lineFilled = false;
            }
        });
    });
}

function frame() {
    // algorithm stuff
    clearLine();
    pieces.forEach(piece => {
        piece.render();
    });
    if (pieces[pieces.length-1].stuck) {
        pieces.push(new Piece(Math.floor(Math.random() * BLOCKTYPES.length)));
    }

    // render and continue
    ctx.clearRect(0, 0, c.width, c.height); // clear screen
    render(); // draw new grid
    window.requestAnimationFrame(frame); // for next tick
    tick++;
}

pieces.push(new Piece(5));
frame();
gravity();

// block movement
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 37 || event.key === "ArrowLeft") {
        pieces[pieces.length-1].move(0,-1);
    }
});
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 39 || event.key === "ArrowRight") {
        pieces[pieces.length-1].move(0,1);
    }
});
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 38 || event.key === "ArrowUp") {
        pieces[pieces.length-1].spin();
    }
});

