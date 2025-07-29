let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function checkGuess() {
  const guess = parseInt(document.getElementById("guessInput").value);
  attempts++;

  if (isNaN(guess) || guess < 1 || guess > 100) {
    document.getElementById("result").innerText = "❌ Please enter a number between 1 and 100.";
  } else if (guess < secretNumber) {
    document.getElementById("result").innerText = "🔻 Too low! Try a higher number.";
  } else if (guess > secretNumber) {
    document.getElementById("result").innerText = "🔺 Too high! Try a lower number.";
  } else {
    document.getElementById("result").innerText = `🎉 Congratulations! You guessed the number ${secretNumber} in ${attempts} tries.`;
  }

  document.getElementById("attempts").innerText = `Attempts: ${attempts}`;
}
