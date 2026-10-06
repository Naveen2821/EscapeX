const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const gameBoard = document.getElementById("game-board");

const ROWS = maze.length;
const COLS = maze[0].length;

function createMaze() {

    gameBoard.innerHTML = "";

    const mazeElement = document.createElement("div");

    mazeElement.className = "maze";

    mazeElement.style.gridTemplateColumns =
        `repeat(${COLS}, 1fr)`;

    mazeElement.style.gridTemplateRows =
        `repeat(${ROWS}, 1fr)`;

    maze.forEach((row, r) => {

        row.forEach((cell, c) => {

            const block = document.createElement("div");

            block.classList.add("cell");

            if (cell === 1) {
                block.classList.add("wall");
            } else {
                block.classList.add("path");
            }

            mazeElement.appendChild(block);
        });

    });

    gameBoard.appendChild(mazeElement);
}

createMaze();