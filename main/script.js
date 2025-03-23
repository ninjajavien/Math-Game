// Initialize variables
    // For timer
let timeLeft = 45; // Initial time in seconds
let startTime = Date.now();
let endTime = startTime + timeLeft * 1000;
let timerRunning = true;

    // For animation
let imagesLoaded = 0;
let knightIdle;


// Pick a random element from an array
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

// Get the type of question
function getType() {

    // For every 5 points, decrease the probability by 0.15 and increase type by 1
    let factor = Math.floor(points / 5);
    let probability;

    if (0.90 - factor * 0.15 < 0) {
        probability = 0.15;
    }

    else {
        probability = (0.90 - factor * 0.15);
    }

    let type = 1 + factor;

    return [probability, type]
}

// Get the operator based on type of question
function getOperator(x) {

    let rand = Math.random();
    if (rand < x) return '+';
    if (rand < 2 * x) return '-';
    if (rand < 0.50 + x) return '*';
    else return '/';
}

// Get the list of possible numbers based on type of question
function getNumber(type) {

    var numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let x = 13;

    // Loop through 'type' times
    for (let i = 0; i < type; i++) {

        // Remove the first number in the list
        numbers.shift()

        // Add a larger number into the list
        numbers.push(x)
        x++;
    }

    // Return a random number
    return numbers.sample();
}

// Generate question
function generateQuestion() {

    // Find the type of question generated
    arraytype = getType();
    type = arraytype[1];

    // Decide the operator
    probability = arraytype[0];
    operator = getOperator(probability);

    // Get the numbers
    num1 = getNumber(type);
    num2 = getNumber(type);
    let answer;

    // For subtraction questions
    if (operator === '-') {

        // Ensure answer is not negative
        if (num1 > num2) {
            document.getElementById("problem").innerText = `${num1} ${operator} ${num2} = ?`;
            answer = num1 - num2;
        }

        else {
            document.getElementById("problem").innerText = `${num2} ${operator} ${num1} = ?`;
            answer = num2 - num1;
        }
    }

    // For division questions
    else if (operator === '/') {

        // List so that the numbers don't get too big)
        var divide = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        num3 = divide.sample();

        // Ensure answer is an integer
        num1 = num1 * num3;
        document.getElementById("problem").innerText = `${num1} ${operator} ${num3} = ?`;
        answer = num1 / num3;
    }

    // For multiplication questions
    else if (operator === '*') {
        document.getElementById("problem").innerText = `${num1} ${operator} ${num2} = ?`;
        answer = num1 * num2;
    }

    // For addition questions
    else if (operator === '+') {
        document.getElementById("problem").innerText = `${num1} ${operator} ${num2} = ?`;
        answer = num1 + num2;
    }

    return answer;
}

// Function to update the timer display and progress bar
function updateTimer() {
    if (!timerRunning) return;

    let currentTime = Date.now();
    timeLeft = Math.max(0, (endTime - currentTime) / 1000); // Convert ms to seconds

    // Update timer display
    document.getElementById("timer").innerText = `${timeLeft.toFixed(1)}s`;

    if (timeLeft > 0) {
        requestAnimationFrame(updateTimer); // Keep updating smoothly
    } else {
        document.getElementById("timer").innerText = "Time's up!";
        timerRunning = false;
    }
}

// Function to change the time dynamically
function changeTime(seconds) {
    let newTimeLeft = (endTime - Date.now()) / 1000 + seconds;

    // Prevent time from exceeding 45 seconds or going below 0
    if (newTimeLeft > 45) {
        newTimeLeft = 45;
    } else if (newTimeLeft < 0) {
        newTimeLeft = 0;
    }

    endTime = Date.now() + newTimeLeft * 1000; // Update the end time
}

// Set the main canvas
const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

// Load background image
const bgimg = new Image();
bgimg.src = "resources/mainbg.png";
bgimg.onload = checkImagesLoaded;
bgimg.onerror = () => console.error("Failed to load background image.");

// Load sprite sheets
const knightSpriteSheet = new Image();
knightSpriteSheet.src = "resources/knightsprite/IDLE.png";
knightSpriteSheet.onerror = () => console.error("Failed to load knight sprite.");

// Function to check when all images are loaded
function checkImagesLoaded() {
    imagesLoaded++;
    console.log(`Images Loaded: ${imagesLoaded}/2`);
    
    if (imagesLoaded === 2) {
        console.log("All images loaded. Starting game loop...");
        gameLoop();
    }
}

// Create a scaled knight sprite sheet
const scaledSpriteSheet = document.createElement("canvas");
const scaledCtx = scaledSpriteSheet.getContext("2d");

knightSpriteSheet.onload = function () {
    const scaleFactor = 4;
    scaledSpriteSheet.width = knightSpriteSheet.width * scaleFactor;
    scaledSpriteSheet.height = knightSpriteSheet.height * scaleFactor;

    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(knightSpriteSheet, 0, 0, scaledSpriteSheet.width, scaledSpriteSheet.height);

    // Now create knight sprite
    knightIdle = new Sprite(scaledSpriteSheet, 96 * scaleFactor, 84 * scaleFactor, 90, 210, 7, 10);

    checkImagesLoaded();
};

// Sprite class
class Sprite {
    constructor(image, width, height, x, y, frames, speed) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.frames = frames;
        this.speed = speed;
        this.frameIndex = 0;
        this.tickCount = 0;
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
            this.frameIndex * this.width, 0,  // Crop the correct frame
            this.width, this.height,          // Crop size
            this.x, this.y,                   // Position on canvas
            this.width, this.height            // Draw size (already scaled)
        );
    }
}

// Game loop function
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);

    knightIdle.update();
    knightIdle.draw(ctx);

    requestAnimationFrame(gameLoop); // Keep a smooth refresh rate
}
