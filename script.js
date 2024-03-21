var c = document.getElementById("game");
console.log(c);
var ctx = c.getContext("2d");
const size = 25;
const blockTypes = ["yellow", "green", "orange", "blue", "lightgreen"];
const gravityCD = 30;
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
                color: blockTypes[Math.floor(Math.random() * blockTypes.length)],
                belongsTo: 0,
            });
        }
        map.push(row);
        console.log("newRow");
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
                ctx.fillRect(x * size, y * size, size, size); // draw block
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
            if (grid[y][x]["block"] && y + 1 < grid.length && !grid[y + 1][x]["block"]) {
                temp = grid[y][x];
                grid[y][x] = grid[y + 1][x];
                grid[y + 1][x] = temp;
            }
        }
    }
}

function frame() {
    // algorithm stuff
    if (tick % gravityCD == 0) {
        gravity();
    }

    // render and continue
    ctx.clearRect(0, 0, c.width, c.height); // clear screen
    render(); // draw new grid
    window.requestAnimationFrame(frame); // for next tick
    tick++;
}

frame();