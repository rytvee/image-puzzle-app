const board = document.getElementById("puzzle-board");
const statusText = document.getElementById("status");
const modeSelect = document.getElementById("modeSelect");

const imageList = [
  "images/image-1.png",
  "images/image-2.png",
  "images/image-3.png",
];

let currentImageIndex = 0;
let pieces = [];
let draggedPiece = null;
let moveCount = 0;
let timer = null;
let timeLeft = 60;
let gameOver = false;
const maxMoves = 20;

function startGame() {
  clearInterval(timer);
  board.innerHTML = "";
  statusText.textContent = "";
  moveCount = 0;
  timeLeft = 60;
  gameOver = false;

  const imageURL = imageList[currentImageIndex];
  pieces = [];

  const tileSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tile-size'));

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * -tileSize;
    const y = Math.floor(i / 3) * -tileSize;

    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundImage = `url(${imageURL})`;
    piece.style.backgroundPosition = `${x}px ${y}px`;
    piece.setAttribute("draggable", true);
    piece.dataset.correctIndex = i;
    pieces.push(piece);
  }

  pieces = shuffleArray(pieces);
  pieces.forEach((piece, index) => {
    piece.dataset.currentIndex = index;
    addDragEvents(piece);
    board.appendChild(piece);
  });

  if (modeSelect.value === "timer") {
    startCountdown();
  } else {
    updateMoveCount();
  }
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function addDragEvents(piece) {
  piece.addEventListener("dragstart", dragStart);
  piece.addEventListener("dragover", dragOver);
  piece.addEventListener("drop", dropPiece);
}

function dragStart() {
  if (gameOver) return;
  draggedPiece = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dropPiece() {
  if (gameOver || !draggedPiece || this === draggedPiece) return;

  const draggedIndex = draggedPiece.dataset.currentIndex;
  const targetIndex = this.dataset.currentIndex;

  board.insertBefore(draggedPiece, this);
  board.insertBefore(this, board.children[draggedIndex]);

  [draggedPiece.dataset.currentIndex, this.dataset.currentIndex] = [targetIndex, draggedIndex];

  if (modeSelect.value === "moves") {
    moveCount++;
    updateMoveCount();
    if (moveCount >= maxMoves) {
      gameOver = true;
      statusText.textContent = "❌ Max moves reached! Game Over.";
      return;
    }
  }

  checkWin();
}

function checkWin() {
  const children = Array.from(board.children);
  const solved = children.every((piece, index) =>
    parseInt(piece.dataset.correctIndex) === index
  );

  if (solved) {
    clearInterval(timer);
    gameOver = true;
    statusText.textContent = "🎉 Puzzle Solved!";
    setTimeout(() => loadNextPuzzle(), 1000);
  }
}

function loadNextPuzzle() {
  currentImageIndex++;
  if (currentImageIndex < imageList.length) {
    startGame();
  } else {
    board.innerHTML = "";
    statusText.textContent = "✅ You completed all puzzles!";
  }
}

function startCountdown() {
  statusText.textContent = `Time Left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    statusText.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver = true;
      statusText.textContent = "⏰ Time's up! Game Over.";
    }
  }, 1000);
}

function updateMoveCount() {
  statusText.textContent = `Moves: ${moveCount} / ${maxMoves}`;
}
