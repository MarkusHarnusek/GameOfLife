let currentTickSpeed = 0;

class Game {
    private startTime: number;
    private startFrame: number;

    constructor() {
        this.startTime = 0;
        this.startFrame = 0;
    }

    setup() {
        this.startTime = millis();
        this.startFrame = frameCount;
    }

    fps(): number {
        let elapsedTime = (millis() - this.startTime) / 1000;
        let framesElapsed = frameCount - this.startFrame;
        return framesElapsed / elapsedTime;
    }
}

class DragTool {
    currentDragCircleVal: number;

    constructor() {
        this.currentDragCircleVal = 0;
    }

    drawDragTool(x: number, y: number, w: number, h: number, desc: string, valMul: number) {
        let currentDragVal = Math.floor(Math.floor(this.currentDragCircleVal - (x + h / 2 + 2)));

        if (currentDragVal < 0) {
            currentDragVal = 0;
        }
        if (this.currentDragCircleVal === 0) {
            this.currentDragCircleVal = x + h / 2;
        }

        currentDragVal *= valMul;

        fill("#444444");
        rect(x, y - 15, w, 14);
        textSize(10);
        fill("white");
        text(desc + ": " + Math.round(currentDragVal), x, y - 5);


        fill("white");
        rect(x, y, w, h, h / 2, h / 2, h / 2, h / 2);
        fill("gray");
        circle(this.currentDragCircleVal, y + h / 2, h);

        if (
            mouseIsPressed &&
            mouseButton === LEFT &&
            mouseX > x + h / 2 - 2 &&
            mouseX < x + w - h / 2 + 2 &&
            mouseY > y &&
            mouseY < y + h
        ) {
            this.currentDragCircleVal = mouseX;
        }

        return Math.floor(currentDragVal);
    }
}

class Grid {
    cells: boolean[][];
    previousTickCells: boolean[][];

    constructor() {
        this.cells = Array.from({ length: 100 }, () => Array(100).fill(false));
        this.previousTickCells = Array.from({ length: 100 }, () => Array(100).fill(false));
    }

    setup(numOfRandCells: number) {
        this.changeRandomCellStatus(numOfRandCells);
        this.drawGrid();
    }

    draw(renderFrameModulo: number) {
        if (frameCount % renderFrameModulo == 0) {
            this.updateCells();
            this.updateGrid();
        }
    }

    drawGrid() {
        stroke("white");
        strokeWeight(0);

        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                if (this.cells[i][j]) {
                    fill("black");
                } else {
                    fill("white");
                }
                rect(i * 5, j * 5, 5, 5);
            }
        }

        this.previousTickCells = this.cells.map(row => [...row]);
    }

    getCurrentCellNumber() {
        let num = 0;
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                if (this.cells[i][j]) {
                    num++;
                }
            }
        }
        return num;
    }

    updateGrid() {
        stroke("white");
        strokeWeight(0);

        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                if (this.previousTickCells[i][j] !== this.cells[i][j]) {
                    if (this.cells[i][j]) {
                        fill("black");
                    } else {
                        fill("white");
                    }
                    rect(i * 5, j * 5, 5, 5);
                }
            }
        }

        this.previousTickCells = this.cells.map(row => [...row]);
    }

    changeRandomCellStatus(numberOfGenerations: number) {
        for (let i = 0; i < numberOfGenerations; i++) {
            let x = floor(random(0, 100));
            let y = floor(random(0, 100));
            this.cells[x][y] = !this.cells[x][y];
        }
    }

    updateCells() {
        let newCells = Array.from({ length: 100 }, () => Array(100).fill(false));

        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                let neighbors = this.numberOfNeighbors(i, j);

                if (this.cells[i][j]) {
                    newCells[i][j] = neighbors === 2 || neighbors === 3;
                } else {
                    newCells[i][j] = neighbors === 3;
                }
            }
        }

        this.cells = newCells;
    }

    numberOfNeighbors(x: number, y: number) {
        let num = 0;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (
                    x + i >= 0 && x + i < 100 &&
                    y + j >= 0 && y + j < 100 &&
                    !(i === 0 && j === 0) &&
                    this.cells[x + i][y + j]
                ) {
                    num++;
                }
            }
        }

        return num;
    }
}

class ControlPage1 {
    ui = new Ui;
    randomGeneratedCells = new DragTool;
    tickSpeed = new DragTool;

    restartSimBtnCoords: number[] = [560, 460, 710, 490];
    randomCellCount: number = 2000;
    generationTickCount: number = 1;

    constructor() { }

    setup() {
        ui.drawButton(560, 460, 150, 30, 15, "Restart Simulation");
        this.randomCellCount = this.randomGeneratedCells.drawDragTool(560, 410, 150, 30, "Randomly generated cells", 25);
        this.generationTickCount = this.tickSpeed.drawDragTool(560, 360, 150, 30, "Frames / Tick: ", 1);
    }

    draw() {
        if (ui.buttonClickedCheck(this.restartSimBtnCoords[0],
            this.restartSimBtnCoords[1],
            this.restartSimBtnCoords[2],
            this.restartSimBtnCoords[3])) {
            grid.cells = Array.from({ length: 100 }, () => Array(100).fill(false));
            grid.previousTickCells = Array.from({ length: 100 }, () => Array(100).fill(false));
            grid.drawGrid();
            grid.setup(this.randomCellCount);
        }

        this.randomCellCount = this.randomGeneratedCells.drawDragTool(560, 410, 150, 30, "Randomly generated cells", 25);
        this.generationTickCount = this.tickSpeed.drawDragTool(560, 360, 150, 30, "Frames / Tick: ", 0.25);
        currentTickSpeed = this.generationTickCount;
    }
}

class Ui {
    private isButtonClicked: boolean;
    currentDragCircleVal: number;

    constructor() {
        this.isButtonClicked = false;
        this.currentDragCircleVal = 0;
    }

    draw() {
        if (!mouseIsPressed) {
            this.isButtonClicked = false;
        }
    }

    drawButton(x: number, y: number, w: number, h: number, cr: number, content: string) {
        fill("white");
        rect(x, y, w, h, cr, cr, cr, cr);
        textSize(15);
        fill("black");
        text(content, x + h / 2, y + h / 1.5);
    }

    buttonClickedCheck(minX: number, minY: number, maxX: number, maxY: number) {
        if (mouseIsPressed
            && mouseButton === LEFT
            && mouseX > minX
            && mouseY > minY
            && mouseX < maxX
            && mouseY < maxY
            && !this.isButtonClicked) {
            this.isButtonClicked = true;
            return true;
        } else {
            return false;
        }
    }
}

const grid = new Grid;
const ui = new Ui;
const controlPage1 = new ControlPage1;
const game = new Game;

let oldF = 0;
let newF = 0;
let totalFps = 0;
let totalFrameCount = 0;
let oldFrameCount = 0;

function setup() {
    createCanvas(750, 500);
    background("#444444");
    grid.setup(2000);
    controlPage1.setup();
    game.setup();

}

function draw() {
    grid.draw(currentTickSpeed);
    ui.draw();
    controlPage1.draw();
    getFps();
    if (frameCount % 50 === 0) {
        console.log(getAvgFps());
    }
}

function getFps(): number {
    newF = game.fps();
    let fps = newF - oldF;
    oldF = newF;
    let trueFps = Math.abs(Math.floor(60 / fps));
    totalFps += trueFps;
    return trueFps;
}

function getAvgFps(): number {
    totalFrameCount = frameCount - oldFrameCount;
    oldFrameCount = frameCount;
    let avg = Math.floor(totalFps / frameCount);
    totalFps = 0;
    totalFrameCount = 0;
    return avg;
}
