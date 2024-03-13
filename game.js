const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

let dino = {
    x: 10,
    y: 300,
    width: 50,
    height: 50,
    velocityY: 0,
    jumpPower: -10, // 점프 파워를 조정해 더 높이 점프
    gravity: 0.4
};

let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore'), 10) : 0;
let gameOver = false;
let obstacleSpeed = 5;
let isJumping = false;
let lastObstacleTime = 0;
let obstacleGap = 750 + Math.random() * 250; // 장애물 간격을 일정하게 설정
let scoreUpdateTime = 0; // 점수가 마지막으로 업데이트된 시간
let scoreIncreaseInterval = 100; // 점수가 증가하는 시간 간격 (밀리초)

function drawDino() {
    ctx.fillStyle = 'green';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function addObstacle() {
    const randomHeight = 75 + Math.random() * 75;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - randomHeight,
        width: 20,
        height: randomHeight
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    if (obstacles.length === 0 || (obstacles[obstacles.length - 1].x < canvas.width - obstacleGap)) {
        addObstacle();
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            gameOver = true;
            return;
        }
    }
}

function jump() {
    if (!isJumping && !gameOver) {
        dino.velocityY = dino.jumpPower;
        isJumping = true;
    }
}

function handleInput() {
    document.addEventListener('keydown', function (event) {
        if ((event.code === 'Space' || event.code === 'ArrowUp') && !isJumping && !gameOver) {
            jump();
        }
    });

    canvas.addEventListener('click', function () {
        if (!gameOver) {
            jump();
        } else {
            document.location.reload();
        }
    });
}

function displayScoreAndHighScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 50);
}

function updateScore(time) {
    if (time - scoreUpdateTime > scoreIncreaseInterval) {
        score++;
        scoreUpdateTime = time;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }
    }
}

let lastTime = 0;
function update(time) {
    if (!lastTime) lastTime = time;
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (!gameOver) {
        requestAnimationFrame(update);
        updateScore(time);

        if (isJumping) {
            dino.velocityY += dino.gravity;
            dino.y += dino.velocityY;

            if (dino.y > 300) {
                dino.y = 300;
                isJumping = false;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateObstacles();
        drawDino();
        drawObstacles();
        checkCollision();
        displayScoreAndHighScore();
    } else {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 100, canvas.height / 2 + 40);
    }
}

handleInput();
requestAnimationFrame(update);