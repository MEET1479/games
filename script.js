// ====== SPA Navigation ======
const menuScreen = document.getElementById('menuScreen');
const guessingGameScreen = document.getElementById('guessingGame');
const tttGameScreen = document.getElementById('tttGame');
const faceGameScreen = document.getElementById('faceGame'); // 🔥 New
const carGameScreen = document.getElementById('carGame'); // <-- new
const backBtn = document.getElementById('backToMenu');

function showScreen(id) {
  menuScreen.style.display = id === 'menu' ? 'block' : 'none';
  guessingGameScreen.style.display = id === 'guess' ? 'block' : 'none';
  tttGameScreen.style.display = id === 'ttt' ? 'block' : 'none';
  faceGameScreen.style.display = id === 'face' ? 'block' : 'none'; // 🔥 New
  carGameScreen.style.display = id === 'car' ? 'block' : 'none'; // <-- handle car
  backBtn.style.display = id === 'menu' ? 'none' : 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
  card.addEventListener('click', () => {
    const target = card.getAttribute('data-target');
    if (target === 'guessingGame') showScreen('guess');
    if (target === 'tttGame') showScreen('ttt');
    if (target === 'faceGame') showScreen('face'); // 🔥 New
  });
});
backBtn.addEventListener('click', () => showScreen('menu'));


// ====== Number Guessing Game (with Points & Rank) ======
let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let finished = false;

const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const resetGuessBtn = document.getElementById('resetGuess');
const resultEl = document.getElementById('result');
const attemptsEl = document.getElementById('attempts');
const pointsEl = document.getElementById('points');
const rankEl = document.getElementById('rank');

function calcPoints(attemptCount) {
  const pts = Math.max(0, 100 - (Math.max(1, attemptCount) - 1) * 5);
  return pts;
}
function getRank(points) {
  if (points >= 90) return '🏆 Gold';
  if (points >= 70) return '🥈 Silver';
  if (points >= 50) return '🥉 Bronze';
  return '😅 Beginner';
}

function checkGuess() {
  if (finished) return;
  const guess = parseInt(guessInput.value);
  attempts++;

  if (isNaN(guess) || guess < 1 || guess > 100) {
    resultEl.innerText = "❌ Please enter a number between 1 and 100.";
  } else if (guess < secretNumber) {
    resultEl.innerText = "🔻 Too low! Try a higher number.";
  } else if (guess > secretNumber) {
    resultEl.innerText = "🔺 Too high! Try a lower number.";
  } else {
    const pts = calcPoints(attempts);
    const rk = getRank(pts);
    resultEl.innerText = `🎉 Correct! The number was ${secretNumber}.`;
    pointsEl.innerText = pts;
    rankEl.innerText = rk;
    finished = true;
  }

  attemptsEl.innerText = `Attempts: ${attempts}`;
  if (!finished) {
    const ptsLive = calcPoints(attempts);
    pointsEl.innerText = ptsLive;
    rankEl.innerText = getRank(ptsLive);
  }
}

function resetGuessGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  finished = false;
  guessInput.value = '';
  resultEl.innerText = '';
  attemptsEl.innerText = 'Attempts: 0';
  pointsEl.innerText = '0';
  rankEl.innerText = '—';
}

guessBtn?.addEventListener('click', checkGuess);
resetGuessBtn?.addEventListener('click', resetGuessGame);
guessInput?.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkGuess(); });

// ====== Tic Tac Toe (AI + 2 Player) ======
const boardEl = document.getElementById('board');
const tttStatus = document.getElementById('tttStatus');
const resetTTT = document.getElementById('resetTTT');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const sideGroup = document.getElementById('sideGroup');
const sideRadios = document.querySelectorAll('input[name="playerSide"]');

let board = Array(9).fill(null);
let current = 'X';
let vsAI = true;
let humanSide = 'X';
let gameOver = false;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

function checkWinner(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a,c,d] };
  }
  if (b.every(x => x)) return { winner: 'draw', line: [] };
  return null;
}

function render() {
  [...boardEl.children].forEach((cellBtn, i) => {
    cellBtn.textContent = board[i] || '';
    cellBtn.classList.remove('win','draw');
  });
  const res = checkWinner(board);
  if (res) {
    gameOver = true;
    if (res.winner === 'draw') {
      tttStatus.textContent = "It's a draw!";
      [...boardEl.children].forEach(c => c.classList.add('draw'));
    } else {
      tttStatus.textContent = `${res.winner} wins!`;
      res.line.forEach(i => boardEl.children[i].classList.add('win'));
    }
  } else {
    tttStatus.textContent = `${current}'s turn`;
  }
}

function availableMoves(b) {
  const moves = [];
  for (let i=0;i<9;i++) if (!b[i]) moves.push(i);
  return moves;
}

function minimax(b, player) {
  const res = checkWinner(b);
  if (res) {
    if (res.winner === 'draw') return { score: 0 };
    return { score: res.winner === humanSide ? -10 : 10 };
  }
  const moves = availableMoves(b);
  let bestMove = null;
  let bestScore = player === humanSide ? Infinity : -Infinity;

  for (const m of moves) {
    b[m] = player;
    const nextPlayer = player === 'X' ? 'O' : 'X';
    const { score } = minimax(b, nextPlayer);
    b[m] = null;

    if (player === humanSide) {
      if (score < bestScore) { bestScore = score; bestMove = m; }
    } else {
      if (score > bestScore) { bestScore = score; bestMove = m; }
    }
  }
  return { move: bestMove, score: bestScore };
}

function aiMove() {
  if (gameOver) return;
  const { move } = minimax([...board], current);
  if (move != null) place(move);
}

function place(i) {
  if (gameOver || board[i]) return;
  board[i] = current;
  current = current === 'X' ? 'O' : 'X';
  render();
  if (gameOver) return;

  // If vs AI and it's AI's turn, make AI move with a slight delay for UX
  if (vsAI && current !== humanSide && !gameOver) {
    setTimeout(aiMove, 250);
  }
}

boardEl?.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const idx = parseInt(cell.getAttribute('data-idx'));
  if (vsAI) {
    // Human can only move if it's their symbol's turn
    if (current !== humanSide) return;
    place(idx);
  } else {
    place(idx);
  }
});

resetTTT?.addEventListener('click', resetTTTGame);

modeRadios.forEach(r => r.addEventListener('change', () => {
  vsAI = document.querySelector('input[name="mode"]:checked').value === 'ai';
  sideGroup.style.display = vsAI ? 'flex' : 'none';
  resetTTTGame();
}));

sideRadios.forEach(r => r.addEventListener('change', () => {
  humanSide = document.querySelector('input[name="playerSide"]:checked').value;
  resetTTTGame();
}));

function resetTTTGame() {
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  render();

  // If vs AI and AI should start (i.e., human picked O), AI plays first
  if (vsAI) {
    if (humanSide === 'O') {
      setTimeout(aiMove, 250);
    }
  }
}

// Initialize default view
showScreen('menu');
render();
