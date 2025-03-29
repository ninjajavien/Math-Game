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
spriteManager.loadSprite("ghost_idle", "resources/ghostsprite/FLYING.png");

// Start the game loop after all sprites load
spriteManager.onAllLoaded = () => {
    knight = new Sprite(spriteManager, {
        idle: { image: spriteManager.sprites["knight_idle"], frames: 7 }  
    }, 96, 84, 90, 210, 10);

    ghost = new Sprite(spriteManager, {
        idle: { image: spriteManager.sprites["ghost_idle"], frames: 4 }  
    }, 81, 71, 550, 160, 15);

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

// Check if the User's Answer is Correct
function checkAnswer() {
    if (parseInt(userInput) === correctAnswer) {
        points += 1;  // Increase difficulty over time
        generateQuestion(); // Generate a new question
    } else {
        console.log("❌ Wrong. Try again.");
    }
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);
    
    knight.update();
    knight.draw(ctx);
    
    ghost.update();
    ghost.draw(ctx);

    drawMathQuestion();
    requestAnimationFrame(gameLoop);
}
