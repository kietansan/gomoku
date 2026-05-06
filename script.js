const SIZE = 15;
let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

/* ★ 音（ここ重要） */
const placeSound = new Audio("1.mp3");
placeSound.preload = "auto";

function playSound() {
  placeSound.currentTime = 0;
  placeSound.play().catch(() => {});
}

/* 初期化 */
function init() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* 描画 */
function draw() {
  boardEl.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (board[y][x] === 1) cell.classList.add("black");
      if (board[y][x] === 2) cell.classList.add("white");

      cell.onclick = () => playerMove(x, y);

      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

/* プレイヤー */
function playerMove(x, y) {
  if (gameOver || board[y][x] !== 0) return;

  board[y][x] = 1;
  playSound();

  if (checkWin(x, y, 1)) {
    infoEl.textContent = "あなたの勝ち！";
    gameOver = true;
    draw();
    return;
  }

  draw();
  infoEl.textContent = "CPU思考中...";
  setTimeout(cpuMove, 30);
}

/* CPU */
function cpuMove() {
  const move = getBestMove();
  if (!move) return;

  board[move.y][move.x] = 2;
  playSound();

  if (checkWin(move.x, move.y, 2)) {
    infoEl.textContent = "CPUの勝ち";
    gameOver = true;
    draw();
    return;
  }

  infoEl.textContent = "あなたの番";
  draw();
}

/* 勝利判定 */
function checkWin(x, y, p) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (let [dx, dy] of dirs) {
    let count = 1;

    for (let d = -1; d <= 1; d += 2) {
      let nx = x + dx*d;
      let ny = y + dy*d;

      while (board[ny]?.[nx] === p) {
        count++;
        nx += dx*d;
        ny += dy*d;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

/* ★ 最重要：脅威検出 */
function getThreatScore(x, y, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let score = 0;

  for (let [dx, dy] of dirs) {
    let count = 1;
    let open = 0;

    let nx = x + dx, ny = y + dy;
    while (board[ny]?.[nx] === player) {
      count++; nx += dx; ny += dy;
    }
    if (board[ny]?.[nx] === 0) open++;

    nx = x - dx; ny = y - dy;
    while (board[ny]?.[nx] === player) {
      count++; nx -= dx; ny -= dy;
    }
    if (board[ny]?.[nx] === 0) open++;

    if (count >= 5) return 1000000;
    if (count === 4 && open === 2) score += 100000;
    else if (count === 4 && open === 1) score += 20000;
    else if (count === 3 && open === 2) score += 5000;
    else if (count === 3 && open === 1) score += 500;
  }

  return score;
}

/* 候補手 */
function getMoves() {
  const moves = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) continue;

      let near = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (board[y + dy]?.[x + dx] !== 0) near = true;
        }
      }

      if (near) moves.push({ x, y });
    }
  }

  return moves.length ? moves : [{ x: 7, y: 7 }];
}

/* ★ 最強ロジック */
function getBestMove() {
  const moves = getMoves();

  let bestMove = null;
  let bestScore = -Infinity;

  for (let m of moves) {
    // 自分評価
    board[m.y][m.x] = 2;
    let myScore = getThreatScore(m.x, m.y, 2);
    board[m.y][m.x] = 0;

    // 相手評価（防御）
    board[m.y][m.x] = 1;
    let enemyScore = getThreatScore(m.x, m.y, 1);
    board[m.y][m.x] = 0;

    // ★ 防御を強くする
    let score = myScore + enemyScore * 1.3;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}

function resetGame() {
  init();
  infoEl.textContent = "あなたの番です";
}

init();
