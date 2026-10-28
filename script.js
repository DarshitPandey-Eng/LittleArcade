// Little Arcade — six independent games built with plain JavaScript.
// Each game's variables and restart function are kept together below.

const gameDetails = {
    ttt: {
        title: "Tic-Tac-Toe", category: "01 / THE CLASSICS",
        instructions: "Take turns selecting a square. Line up three of your marks horizontally, vertically, or diagonally to win.",
        tip: "Two players can play together on the same screen. No account needed."
    },
    rps: {
        title: "Rock Paper Scissors", category: "02 / VS THE COMPUTER",
        instructions: "Rock beats scissors, scissors beats paper, and paper beats rock. Choose one move each round.",
        tip: "The computer uses Math.random() to choose from three options. Scores add up until you restart."
    },
    guess: {
        title: "Number Guess", category: "03 / A LITTLE LOGIC",
        instructions: "Guess a number from 1 to 100. After every valid guess, you'll see whether you should go higher or lower.",
        tip: "Only whole numbers between 1 and 100 count as attempts. Correct guesses finish the round."
    },
    memory: {
        title: "Memory Match", category: "04 / TEST YOUR MEMORY",
        instructions: "Open two cards. Matching shapes stay face up; different shapes turn over again. Find all six pairs.",
        tip: "A move is one attempt to match two cards. Try to finish in as few moves as possible."
    },
    reaction: {
        title: "Reaction Test", category: "05 / BEAT THE CLOCK",
        instructions: "Press the test area to begin. Wait for green, then press it immediately. If you press early, start again.",
        tip: "Your result is measured in milliseconds using the browser's high-resolution clock. Smaller is faster."
    },
    math: {
        title: "Quick Math", category: "06 / THINK FAST",
        instructions: "Work through ten arithmetic questions. Enter a whole number and press Check to move to the next question.",
        tip: "Questions include addition, subtraction and multiplication. Your score is out of ten."
    }
};

const navButtons = document.querySelectorAll(".game-nav-item");
let selectedGame = "ttt";

navButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
        const nextGame = button.dataset.game;
        if (nextGame === selectedGame) return;

        // Don't let a pending reaction timer run after leaving its game.
        if (selectedGame === "reaction" && (reactionState === "waiting" || reactionState === "go")) {
            restartReaction(false);
            reactionStatus.textContent = "Round canceled when you changed games.";
        }

        selectedGame = nextGame;
        document.querySelectorAll(".game-view").forEach(function (view) {
            view.hidden = view.id !== selectedGame;
        });
        navButtons.forEach(function (item) {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        const details = gameDetails[selectedGame];
        document.getElementById("game-heading").textContent = details.title;
        document.getElementById("game-category").textContent = details.category;
        document.getElementById("game-instructions").textContent = details.instructions;
        document.getElementById("game-tip").textContent = details.tip;

        // When using the keyboard, move focus to the new game heading.
        // preventScroll avoids an unexpected page jump on phones.
        if (event.detail === 0) {
            document.getElementById("game-heading").focus({ preventScroll: true });
        }
    });
});

// THEME ---------------------------------------------------------------------
const themeButton = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");
let savedTheme = null;
try { savedTheme = localStorage.getItem("little-arcade-theme"); } catch (error) { /* local storage may be unavailable */ }
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme === "dark" || (savedTheme !== "light" && prefersDark) ? "dark" : "light");

function setTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeLabel.textContent = dark ? "Light mode" : "Dark mode";
    document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#0d0e10" : "#f5f5f7");
}
themeButton.addEventListener("click", function () {
    const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try { localStorage.setItem("little-arcade-theme", newTheme); } catch (error) { /* still works without storage */ }
});

// 01 — TIC-TAC-TOE ----------------------------------------------------------
const tttCells = Array.from(document.querySelectorAll(".ttt-cell"));
const tttStatus = document.getElementById("ttt-status");
const tttWinningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
let tttBoard = Array(9).fill("");
let tttTurn = "X";
let tttFinished = false;

tttCells.forEach(function (cell, index) {
    cell.addEventListener("click", function () {
        if (tttFinished || tttBoard[index] !== "") return;

        tttBoard[index] = tttTurn;
        cell.textContent = tttTurn;
        cell.disabled = true;
        cell.setAttribute("aria-label", "Row " + (Math.floor(index / 3) + 1) + ", column " + (index % 3 + 1) + ": " + tttTurn);
        cell.classList.toggle("player-o", tttTurn === "O");

        const winningLine = tttWinningLines.find(function (line) {
            return line.every(function (position) { return tttBoard[position] === tttTurn; });
        });

        if (winningLine) {
            tttStatus.textContent = "Player " + tttTurn + " wins!";
            tttFinished = true;
            winningLine.forEach(function (position) { tttCells[position].classList.add("winning-cell"); });
        } else if (tttBoard.every(function (mark) { return mark !== ""; })) {
            tttStatus.textContent = "It's a draw!";
            tttFinished = true;
        } else {
            tttTurn = tttTurn === "X" ? "O" : "X";
            tttStatus.textContent = "Player " + tttTurn + "'s turn";
        }

        if (tttFinished) {
            tttCells.forEach(function (square) { square.disabled = true; });
        }
    });
});

function restartTtt() {
    tttBoard = Array(9).fill("");
    tttTurn = "X";
    tttFinished = false;
    tttStatus.textContent = "Player X's turn";
    tttCells.forEach(function (cell, index) {
        cell.textContent = "";
        cell.disabled = false;
        cell.classList.remove("player-o", "winning-cell");
        cell.setAttribute("aria-label", "Row " + (Math.floor(index / 3) + 1) + ", column " + (index % 3 + 1));
    });
}

// 02 — ROCK PAPER SCISSORS --------------------------------------------------
const rpsMoves = ["Rock", "Paper", "Scissors"];
let rpsScores = { you: 0, computer: 0, draws: 0 };
const rpsStatus = document.getElementById("rps-status");
const rpsDetail = document.getElementById("rps-detail");
const rpsButtons = document.querySelectorAll(".rps-choice");

function updateRpsScores() {
    document.getElementById("rps-you").textContent = rpsScores.you;
    document.getElementById("rps-computer").textContent = rpsScores.computer;
    document.getElementById("rps-draws").textContent = rpsScores.draws;
}

rpsButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const yourMove = button.dataset.move;
        const computerMove = rpsMoves[Math.floor(Math.random() * rpsMoves.length)];
        rpsButtons.forEach(function (item) { item.classList.toggle("selected", item === button); });

        if (yourMove === computerMove) {
            rpsScores.draws++;
            rpsStatus.textContent = "It's a draw.";
        } else if (
            (yourMove === "Rock" && computerMove === "Scissors") ||
            (yourMove === "Paper" && computerMove === "Rock") ||
            (yourMove === "Scissors" && computerMove === "Paper")
        ) {
            rpsScores.you++;
            rpsStatus.textContent = "You win this round!";
        } else {
            rpsScores.computer++;
            rpsStatus.textContent = "Computer wins this round.";
        }
        rpsDetail.textContent = "You: " + yourMove + "  ·  Computer: " + computerMove;
        updateRpsScores();
    });
});

function restartRps() {
    rpsScores = { you: 0, computer: 0, draws: 0 };
    rpsStatus.textContent = "Choose a move to begin";
    rpsDetail.textContent = "Your result will appear here.";
    rpsButtons.forEach(function (button) { button.classList.remove("selected"); });
    updateRpsScores();
}

// 03 — NUMBER GUESS ---------------------------------------------------------
const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const guessStatus = document.getElementById("guess-status");
const guessSubmit = document.getElementById("guess-submit");
let secretNumber;
let guessAttempts;

function restartGuess() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    guessAttempts = 0;
    guessInput.value = "";
    guessInput.disabled = false;
    guessSubmit.disabled = false;
    guessStatus.textContent = "Take your first guess";
    document.getElementById("guess-attempts").textContent = "0";
}

guessForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (guessSubmit.disabled) return;
    const entry = guessInput.value.trim();
    const guess = Number(entry);
    if (!/^\d+$/.test(entry) || !Number.isInteger(guess) || guess < 1 || guess > 100) {
        guessStatus.textContent = "Enter a whole number from 1 to 100.";
        return;
    }
    guessAttempts++;
    document.getElementById("guess-attempts").textContent = guessAttempts;

    if (guess === secretNumber) {
        guessStatus.textContent = "Correct! You found it in " + guessAttempts + (guessAttempts === 1 ? " attempt." : " attempts.");
        guessInput.disabled = true;
        guessSubmit.disabled = true;
    } else {
        guessStatus.textContent = guess < secretNumber ? "Too low — try a higher number." : "Too high — try a lower number.";
        guessInput.value = "";
        guessInput.focus();
    }
});

// 04 — MEMORY MATCH ---------------------------------------------------------
const memoryGrid = document.getElementById("memory-grid");
const memoryStatus = document.getElementById("memory-status");
const memorySymbols = ["●", "◆", "▲", "■", "✦", "✳"];
let memoryDeck = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryMoves = 0;
let memoryLocked = false;
let memoryTimer = null;

function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function updateMemoryScore() {
    document.getElementById("memory-pairs").textContent = memoryMatched + " / 6";
    document.getElementById("memory-moves").textContent = memoryMoves;
}

function restartMemory() {
    if (memoryTimer !== null) clearTimeout(memoryTimer);
    memoryTimer = null;
    memoryDeck = shuffle(memorySymbols.concat(memorySymbols));
    memoryFlipped = [];
    memoryMatched = 0;
    memoryMoves = 0;
    memoryLocked = false;
    memoryStatus.textContent = "Choose two cards";
    memoryGrid.replaceChildren();

    memoryDeck.forEach(function (symbol, index) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "memory-tile";
        tile.setAttribute("aria-label", "Hidden card " + (index + 1));
        tile.addEventListener("click", function () { flipMemoryCard(index); });
        memoryGrid.append(tile);
    });
    updateMemoryScore();
}

function flipMemoryCard(index) {
    if (memoryLocked || memoryFlipped.includes(index) || memoryMatched === 6) return;
    const tile = memoryGrid.children[index];
    if (!tile || tile.classList.contains("matched")) return;

    tile.textContent = memoryDeck[index];
    tile.classList.add("revealed");
    tile.setAttribute("aria-label", "Card " + (index + 1) + ": " + memoryDeck[index]);
    memoryFlipped.push(index);

    if (memoryFlipped.length !== 2) return;
    memoryMoves++;
    updateMemoryScore();
    const [first, second] = memoryFlipped;

    if (memoryDeck[first] === memoryDeck[second]) {
        memoryMatched++;
        [first, second].forEach(function (position) {
            memoryGrid.children[position].classList.remove("revealed");
            memoryGrid.children[position].classList.add("matched");
            memoryGrid.children[position].disabled = true;
            memoryGrid.children[position].setAttribute("aria-label", "Matched: " + memoryDeck[position]);
        });
        memoryFlipped = [];
        memoryStatus.textContent = memoryMatched === 6 ? "Perfect! All six pairs found in " + memoryMoves + " moves." : "Nice match! Keep going.";
        updateMemoryScore();
    } else {
        memoryLocked = true;
        memoryStatus.textContent = "Not a match. Try again.";
        memoryTimer = setTimeout(function () {
            [first, second].forEach(function (position) {
                const card = memoryGrid.children[position];
                card.textContent = "";
                card.classList.remove("revealed");
                card.setAttribute("aria-label", "Hidden card " + (position + 1));
            });
            memoryFlipped = [];
            memoryLocked = false;
            memoryTimer = null;
        }, 780);
    }
}

// 05 — REACTION TEST --------------------------------------------------------
const reactionPad = document.getElementById("reaction-pad");
const reactionPadHeading = document.getElementById("reaction-pad-heading");
const reactionPadCaption = document.getElementById("reaction-pad-caption");
const reactionStatus = document.getElementById("reaction-status");
let reactionState = "idle";
let reactionTimer = null;
let reactionStart = 0;
let reactionBest = null;

function showReaction(state, heading, caption) {
    reactionState = state;
    reactionPad.dataset.state = state;
    reactionPadHeading.textContent = heading;
    reactionPadCaption.textContent = caption;
}

function restartReaction(clearBest = true) {
    if (reactionTimer !== null) clearTimeout(reactionTimer);
    reactionTimer = null;
    reactionStart = 0;
    if (clearBest) reactionBest = null;
    document.getElementById("reaction-best").textContent = reactionBest === null ? "—" : reactionBest + " ms";
    reactionStatus.textContent = "Your reaction time will appear here";
    showReaction("idle", "Ready when you are.", "Click here to start");
}

// Leaving the browser tab can delay timers and make the test inaccurate.
document.addEventListener("visibilitychange", function () {
    if (document.hidden && (reactionState === "waiting" || reactionState === "go")) {
        restartReaction(false);
        reactionStatus.textContent = "Round canceled while the tab was hidden. Try again.";
    }
});

reactionPad.addEventListener("click", function () {
    if (reactionState === "idle" || reactionState === "result" || reactionState === "early") {
        showReaction("waiting", "Wait for green…", "Not yet. Keep watching.");
        reactionStatus.textContent = "Wait for the color to change.";
        reactionTimer = setTimeout(function () {
            reactionTimer = null;
            reactionStart = performance.now();
            showReaction("go", "Click now!", "As quickly as you can");
        }, 1500 + Math.floor(Math.random() * 2000));
    } else if (reactionState === "waiting") {
        if (reactionTimer !== null) clearTimeout(reactionTimer);
        reactionTimer = null;
        showReaction("early", "Too soon!", "Click to try again");
        reactionStatus.textContent = "You clicked before green. Try again.";
    } else if (reactionState === "go") {
        const milliseconds = Math.max(0, Math.round(performance.now() - reactionStart));
        if (reactionBest === null || milliseconds < reactionBest) reactionBest = milliseconds;
        document.getElementById("reaction-best").textContent = reactionBest + " ms";
        showReaction("result", milliseconds + " ms", "Click to test again");
        reactionStatus.textContent = "Reaction recorded. Can you beat it?";
    }
});

// 06 — QUICK MATH -----------------------------------------------------------
const mathForm = document.getElementById("math-form");
const mathInput = document.getElementById("math-input");
const mathStatus = document.getElementById("math-status");
const mathSubmit = document.getElementById("math-submit");
const mathEquation = document.getElementById("math-equation");
let mathQuestionNumber = 1;
let mathScore = 0;
let mathAnswer = 0;
let mathFinished = false;
let previousMathEquation = "";

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateMathQuestion() {
    let equation = "";
    let answer = 0;
    let attempts = 0;

    // Avoid repeats where possible; limit retries so we never loop forever.
    do {
        attempts++;
        const operator = ["+", "−", "×"][randomInt(0, 2)];
        let left = randomInt(2, 24);
        let right = randomInt(1, 20);

        if (operator === "+") answer = left + right;
        if (operator === "−") {
            if (left < right) [left, right] = [right, left];
            answer = left - right; // Keep the beginner questions non-negative.
        }
        if (operator === "×") {
            left = randomInt(2, 12);
            right = randomInt(2, 12);
            answer = left * right;
        }
        equation = left + " " + operator + " " + right;
    } while (equation === previousMathEquation && attempts < 8);

    previousMathEquation = equation;
    mathAnswer = answer;
    mathEquation.textContent = equation + " = ?";
    document.getElementById("math-progress").textContent = mathQuestionNumber + " / 10";
}

function restartMath() {
    mathQuestionNumber = 1;
    mathScore = 0;
    mathFinished = false;
    previousMathEquation = "";
    mathInput.disabled = false;
    mathSubmit.disabled = false;
    document.getElementById("math-meter").value = 0;
    mathInput.value = "";
    mathStatus.textContent = "Ready to solve?";
    document.getElementById("math-score").textContent = "0";
    generateMathQuestion();
}

mathForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (mathFinished) return;
    const input = mathInput.value.trim();
    const answer = Number(input);
    if (!/^-?\d+$/.test(input) || !Number.isSafeInteger(answer)) {
        mathStatus.textContent = "Please enter a whole number.";
        return;
    }

    const correct = answer === mathAnswer;
    const rightAnswer = mathAnswer;
    if (correct) mathScore++;
    document.getElementById("math-score").textContent = mathScore;
    mathInput.value = "";
    document.getElementById("math-meter").value = mathQuestionNumber;

    if (mathQuestionNumber === 10) {
        mathFinished = true;
        mathInput.disabled = true;
        mathSubmit.disabled = true;
        mathEquation.textContent = mathScore + " / 10";
        mathStatus.textContent = (correct ? "Correct! " : "The answer was " + rightAnswer + ". ") + "Finished! Press Restart to play again.";
    } else {
        mathQuestionNumber++;
        generateMathQuestion();
        mathStatus.textContent = correct ? "Correct! Here's the next one." : "Not quite — the answer was " + rightAnswer + ". Try the next one.";
    }
});

// RESTART BUTTON ------------------------------------------------------------
const restartFunctions = {
    ttt: restartTtt,
    rps: restartRps,
    guess: restartGuess,
    memory: restartMemory,
    reaction: restartReaction,
    math: restartMath
};
document.getElementById("restart-button").addEventListener("click", function () {
    restartFunctions[selectedGame]();
});

// Initialize the games that create random content.
restartGuess();
restartMemory();
restartReaction();
restartMath();
