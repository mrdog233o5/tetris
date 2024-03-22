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
        this.blocks = [];
        for (var y = 0; y < this.outlook.length; y++) {
            for (var x = 0; x < this.outlook[y].length; x++) {
                if (this.outlook[y][x]) {
                    this.blocks.push([y,x + Math.floor(grid[0].length/2) - this.anchor[1] - 1 ]);
                }
            }
        }
        console.log(this.blocks);
    }

    render() {
        for (var i = 0; i < this.blocks.length; i++) {
            grid[this.blocks[i][0]][this.blocks[i][1]]["color"]= this.color;
            grid[this.blocks[i][0]][this.blocks[i][1]]["parent"] = this;
            grid[this.blocks[i][0]][this.blocks[i][1]]["block"] = true;
            grid[this.blocks[i][0]][this.blocks[i][1]]["fall"] = true;
        }
    }

    fall() {
        var i = 0;
        var fall = true;
        this.blocks.forEach(block => {
            var y = block[0], x = block[1];
            if (
                grid[y][x]["block"] && 
                grid[y][x]["fall"] && 
                y + 1 < grid.length &&
                (
                    !grid[y + 1][x]["block"] ||
                    grid[y + 1][x]["parent"] == grid[y][x]["parent"]
                )
            ) {} else {
                fall = false;
            }
        });
        if (fall) {
            this.blocks.forEach(block => {
                var y = block[0], x = block[1];
                console.log("test")
                temp = grid[y][x];
                grid[y][x] = {
                    block: false,
                    color: null,
                    parent: null,
                    fall: true
                };
                grid[y + 1][x] = temp;
                this.blocks[i][0] = this.blocks[i][0] + 1;
                i++;
            });
        }
    }

    left() {
        var i = 0;
        var fall = true;
        this.blocks.forEach(block => {
            var y = block[0], x = block[1];
            if (
                grid[y][x]["block"] && 
                grid[y][x]["fall"] && 
                y + 1 < grid.length &&
                (
                    !grid[y][x-1]["block"] ||
                    grid[y][x-1]["parent"] == grid[y][x]["parent"]
                )
            ) {} else {
                fall = false;
            }
        });
        if (fall) {
            this.blocks.forEach(block => {
                var y = block[0], x = block[1];
                console.log("test")
                temp = grid[y][x];
                grid[y][x] = {
                    block: false,
                    color: null,
                    parent: null,
                    fall: true
                };
                grid[y][x-1] = temp;
                this.blocks[i][0] = this.blocks[i][0] + 1;
                i++;
            });
        }
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
        piece.fall();
    });
    setTimeout(() => {
        window.requestAnimationFrame(gravity);
    }, FALLSPEED);
}

function clearLine() {
    var lineClear;
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

    // render and continue
    ctx.clearRect(0, 0, c.width, c.height); // clear screen
    render(); // draw new grid
    window.requestAnimationFrame(frame); // for next tick
    tick++;
}

frame();
gravity();

pieces.push(new Piece(0))