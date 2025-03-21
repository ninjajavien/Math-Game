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


// Timer


// Animate sprite
