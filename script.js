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

function createArray() {
    // Create a 20x10 2D array
    const rows = 20;
    const columns = 10;
    var map = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push({
                block: Boolean(Math.round(Math.random())),
                color: BLOCKTYPES[Math.floor(Math.random() * BLOCKTYPES.length)]["color"],
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
    for (var y = grid.length-1; y >= 0; y--) {
        for (var x = 0; x < grid[y].length; x++) {
            if (grid[y][x]["block"] && grid[y][x]["fall"] && y + 1 < grid.length && !grid[y + 1][x]["block"]) {
                temp = grid[y][x];
                grid[y][x] = grid[y + 1][x];
                grid[y + 1][x] = temp;
            }
        }
    }
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

    // render and continue
    ctx.clearRect(0, 0, c.width, c.height); // clear screen
    render(); // draw new grid
    window.requestAnimationFrame(frame); // for next tick
    tick++;
}

frame();
gravity();