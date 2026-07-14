const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('score-text');
const highScoreText = document.getElementById('high-score-text');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreText = document.getElementById('final-score');

const GRID_SIZE = 12;
const TILE_COUNT_X = 20;
const TILE_COUNT_Y = 24;

canvas.width = TILE_COUNT_X * GRID_SIZE;
canvas.height = TILE_COUNT_Y * GRID_SIZE;

const COLOR_SNAKE = '#0f380f';
const COLOR_FOOD = '#0f380f';

let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop = null;
let speed = 100;
let lastRenderTime = 0;

highScoreText.innerText = `REKORD: ${highScore}`;

let nextDx = 0;
let nextDy = 0;

function initGame() {
    snake = [
        { x: 10, y: 12 },
        { x: 10, y: 13 },
        { x: 10, y: 14 }
    ];
    score = 0;
    scoreText.innerText = `BALL: ${score}`;
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    placeFood();
    gameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (gameLoop) cancelAnimationFrame(gameLoop);
    lastRenderTime = performance.now();
    requestAnimationFrame(mainLoop);
}

function mainLoop(currentTime) {
    if (!gameRunning) return;

    window.requestAnimationFrame(mainLoop);

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < speed / 1000) return;

    lastRenderTime = currentTime;

    update();
    draw();
}

function update() {
    if (nextDx !== 0 && dx === 0) {
        dx = nextDx;
        dy = 0;
    } else if (nextDy !== 0 && dy === 0) {
        dy = nextDy;
        dx = 0;
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0) head.x = TILE_COUNT_X - 1;
    if (head.x >= TILE_COUNT_X) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT_Y - 1;
    if (head.y >= TILE_COUNT_Y) head.y = 0;

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreText.innerText = `BALL: ${score}`;
        if (speed > 50) speed -= 1;
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLOR_FOOD;
    let fx = food.x * GRID_SIZE;
    let fy = food.y * GRID_SIZE;
    ctx.fillRect(fx + 2, fy, GRID_SIZE - 4, GRID_SIZE);
    ctx.fillRect(fx, fy + 2, GRID_SIZE, GRID_SIZE - 4);

    ctx.fillStyle = COLOR_SNAKE;
    for (let i = 0; i < snake.length; i++) {
        let part = snake[i];
        ctx.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * TILE_COUNT_X);
        food.y = Math.floor(Math.random() * TILE_COUNT_Y);

        valid = true;
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                valid = false;
                break;
            }
        }
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreText.innerText = `REKORD: ${highScore}`;
    }
    finalScoreText.innerText = `BALL: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) {
        if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
            initGame();
            return;
        }
    }

    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { nextDx = 1; nextDy = 0; }
            break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    if (!gameRunning) {
        if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
            initGame();
        }
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (!gameRunning) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
            if (diffX > 0 && dx === 0) { nextDx = 1; nextDy = 0; }
            else if (diffX < 0 && dx === 0) { nextDx = -1; nextDy = 0; }
        }
    } else {
        if (Math.abs(diffY) > 30) {
            if (diffY > 0 && dy === 0) { nextDx = 0; nextDy = 1; }
            else if (diffY < 0 && dy === 0) { nextDx = 0; nextDy = -1; }
        }
    }
});
