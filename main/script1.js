// Set up the main canvas
const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

let knight, ghost; // Declare characters
let currentQuestion = "";  // Stores the math question
let correctAnswer = 0;      // Stores the answer
let userInput = "";         // Stores the user's answer
let points = 0;             // Keeps track of points for difficulty scaling

// Load background image
const bgimg = new Image();
bgimg.src = "resources/mainbg.png";

// Create SpriteManager class that handles loading and scaling sprite sheets
class SpriteManager {
    constructor() {
        // Holds the sprite sheets by name
        this.sprites = {};
        // Tracks the number of loaded images
        this.imagesLoaded = 0;
        // Tracks the total number of images to be loaded
        this.totalImages = 0;
        this.onAllLoaded = null;
    }

    loadSprite(name, src, scaleFactor = 4) {
        this.totalImages++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.sprites[name] = this.scaleSpriteSheet(img, scaleFactor);
            this.imagesLoaded++;
            if (this.imagesLoaded === this.totalImages && this.onAllLoaded) {
                this.onAllLoaded();
            }
        };
        img.onerror = () => console.error(`Failed to load ${src}`);
    }

    scaleSpriteSheet(image, scaleFactor) {
        const scaledCanvas = document.createElement("canvas");
        const scaledCtx = scaledCanvas.getContext("2d");

        scaledCanvas.width = image.width * scaleFactor;
        scaledCanvas.height = image.height * scaleFactor;

        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.drawImage(image, 0, 0, scaledCanvas.width, scaledCanvas.height);

        return scaledCanvas;
    }
}

// Sprite Class
class Sprite {
    constructor(spriteManager, spriteData, width, height, x, y, speed, scaleFactor = 4) {
        this.spriteManager = spriteManager;
        this.spriteData = spriteData;
        this.currentAnimation = "idle";

        this.width = width * scaleFactor;
        this.height = height * scaleFactor;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.frameIndex = 0;
        this.tickCount = 0;

        this.setAnimation("idle");
    }

    setAnimation(name) {
        if (this.spriteData[name]) {
            this.currentAnimation = name;
            this.frameIndex = 0;
            this.frames = this.spriteData[name].frames;
            this.image = this.spriteData[name].image;
        }
    }    

    update() {
        this.tickCount++;
        if (this.tickCount > this.speed) {
            this.tickCount = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames;
        }
    }

    draw(context) { 
        context.drawImage(
            this.image,
            this.frameIndex * this.width, 0,
            this.width, this.height,
            this.x, this.y,
            this.width, this.height
        );
    }
}

// Create a sprite manager
const spriteManager = new SpriteManager();

// Load knight and ghost sprites
spriteManager.loadSprite("knight_idle", "resources/knightsprite/IDLE.png");
spriteManager.loadSprite("knight_attack", "resources/knightsprite/ATTACK 3.png");
spriteManager.loadSprite("knight_hurt", "resources/knightsprite/HURT.png");
spriteManager.loadSprite("ghost_idle", "resources/ghostsprite/FLYING.png");
spriteManager.loadSprite("ghost_attack", "resources/ghostsprite/ATTACK.png");
spriteManager.loadSprite("ghost_hurt", "resources/ghostsprite/HURT.png");

// Start the game loop after all sprites load
spriteManager.onAllLoaded = () => {
    knight = new Sprite(spriteManager, {
        idle: { image: spriteManager.sprites["knight_idle"], frames: 7 },
        attack: { image: spriteManager.sprites["knight_attack"], frames: 6 },
        hurt: { image: spriteManager.sprites["knight_hurt"], frames: 4 }
    }, 96, 84, 90, 210, 15);
    
    ghost = new Sprite(spriteManager, {
        idle: { image: spriteManager.sprites["ghost_idle"], frames: 4 },  
        attack: { image: spriteManager.sprites["ghost_attack"], frames: 8 },
        hurt: { image: spriteManager.sprites["ghost_hurt"], frames: 4 }
    }, 81, 71, 550, 160, 20);

    generateQuestion();  // Generate first math question
    gameLoop();
};

// Function to Draw the Math Question & User Input on the Canvas
function drawMathQuestion() {
    ctx.fillStyle = "white";
    ctx.font = "64px Pixelfont";
    ctx.textAlign = "center";
    
    // Display question at the top
    ctx.fillText(currentQuestion, canvas.width / 2, 200);
    
    // Display user's input below the question
    ctx.fillText(userInput, canvas.width / 2, 550);
}

// Function to Determine the Type of Question
function getType() {
    let factor = Math.floor(points / 5);
    let probability = Math.max(0.15, 0.90 - factor * 0.15);
    let type = 1 + factor;
    return [probability, type];
}

// Get the Operator Based on Type
function getOperator(probability) {
    let rand = Math.random();
    if (rand < probability) return '+';
    if (rand < 2 * probability) return '-';
    if (rand < 0.50 + probability) return '*';
    return '/';
}

// Get a Random Number Based on Difficulty
function getNumber(type) {
    let numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (let i = 0; i < type; i++) {
        numbers.shift();
        numbers.push(13 + i);
    }
    return numbers[Math.floor(Math.random() * numbers.length)];
}

// Generate Math Question
function generateQuestion() {
    let arrayType = getType();
    let probability = arrayType[0];
    let type = arrayType[1];

    let operator = getOperator(probability);
    let num1 = getNumber(type);
    let num2 = getNumber(type);

    if (operator === '-') {
        if (num1 < num2) [num1, num2] = [num2, num1];
        correctAnswer = num1 - num2;
        currentQuestion = `${num1} - ${num2} = ?`;
    } else if (operator === '/') {
        let num3 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12][Math.floor(Math.random() * 10)];
        num1 = num1 * num3;
        correctAnswer = num1 / num3;
        num2 = num3;
        currentQuestion = `${num1} ÷ ${num2} = ?`;
    } else if (operator === '*') {
        correctAnswer = num1 * num2;
        currentQuestion = `${num1} x ${num2} = ?`;
    } else {
        correctAnswer = num1 + num2;
        currentQuestion = `${num1} + ${num2} = ?`;
    }

    userInput = ""; // Reset user input
}

// Only allow users to input numbers and backspace
document.addEventListener("keydown", (event) => {
    if (event.key >= "0" && event.key <= "9") {
        userInput += event.key;
    } else if (event.key === "Backspace") {
        userInput = userInput.slice(0, -1);
    } else if (event.key === "Enter") {
        checkAnswer();
    }
});

let timeLeft = 45;  // Initialize timer

// Function to draw the timer
function drawTimer() {
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelfont";
    ctx.textAlign = "left";
    ctx.fillText(`Time: ${timeLeft}s`, 50, 551);
}

// Countdown Timer
setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
    }
}, 1000);

// Modify checkAnswer function
function checkAnswer() {
    if (parseInt(userInput) === correctAnswer) {
        points += 1;
        timeLeft = Math.min(timeLeft + 2, 45);
        knight.setAnimation("attack");
        ghost.setAnimation("hurt");

        // Return to idle after the attack animation finishes
        setTimeout(() => knight.setAnimation("idle"), 600);
        setTimeout(() => ghost.setAnimation("idle"), 600);
        
        generateQuestion();
    } else {
        console.log("❌ Wrong. Try again.");
        timeLeft = Math.max(timeLeft - 5, 0);
        knight.setAnimation("hurt");
        ghost.setAnimation("attack");

        // Return to idle after the hurt animation finishes
        setTimeout(() => knight.setAnimation("idle"), 400);
        setTimeout(() => ghost.setAnimation("idle"), 800);
    }
}


// Function to draw the points counter
function drawPoints() {
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelfont";
    ctx.textAlign = "right";
    ctx.fillText(`Points: ${points}`, 974, 551);
}

let gameOver = false; // Track game over state

// Function to draw "Game Over" and Play Again button
function drawGameOverScreen() {
    ctx.fillStyle = "white";
    ctx.font = "64px Pixelfont";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, 200);

    // Draw Play Again Button
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 2 - 150, 360, 300, 100); // Button rectangle
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 150, 360, 300, 100); // Border

    // Button Text
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelfont";
    ctx.fillText("Play Again", canvas.width / 2, 425);

    // Button Text
    ctx.fillStyle = "white";
    ctx.font = "64px Pixelfont";
    ctx.fillText(`Points: ${points}`, canvas.width / 2, 320);

}

// Function to reset the game
function resetGame() {
    points = 0;
    timeLeft = 45;
    gameOver = false;
    generateQuestion();
}

let gameStarted = false; // Track if the game has started

// Function to draw the start screen
function drawStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "64px Pixelfont";
    ctx.textAlign = "center";
    ctx.fillText("Math Dungeon", canvas.width / 2, 200);

    // Draw Start Game Button
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 2 - 150, 300, 300, 100);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 150, 300, 300, 100);

    // Button Text
    ctx.fillStyle = "white";
    ctx.font = "48px Pixelfont";
    ctx.fillText("Start Game", canvas.width / 2, 365);
}

// Modify gameLoop to include the start screen
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen(); // Show start screen if game hasn't started
    } else if (timeLeft <= 0) {
        gameOver = true;
        drawGameOverScreen();
    } else {
        knight.update();
        knight.draw(ctx);

        ghost.update();
        ghost.draw(ctx);

        drawMathQuestion();
        drawTimer();
        drawPoints();
    }

    requestAnimationFrame(gameLoop);
}

// Modify event listener to detect "Start Game" and "Play Again" button clicks
canvas.addEventListener("click", (event) => {
    let startButton = { x: canvas.width / 2 - 150, y: 300, width: 300, height: 100 };
    let playAgainButton = { x: canvas.width / 2 - 150, y: 360, width: 300, height: 100 };

    if (!gameStarted) {
        // If clicking on Start Game button, begin the game
        if (
            event.offsetX >= startButton.x &&
            event.offsetX <= startButton.x + startButton.width &&
            event.offsetY >= startButton.y &&
            event.offsetY <= startButton.y + startButton.height
        ) {
            gameStarted = true;
            timeLeft = 45; // Start the timer
            generateQuestion();
        }
    } else if (gameOver) {
        // If clicking on Play Again button, reset the game
        if (
            event.offsetX >= playAgainButton.x &&
            event.offsetX <= playAgainButton.x + playAgainButton.width &&
            event.offsetY >= playAgainButton.y &&
            event.offsetY <= playAgainButton.y + playAgainButton.height
        ) {
            resetGame();
        }
    }
});

// Delay game start until the user clicks "Start Game"
gameLoop();
