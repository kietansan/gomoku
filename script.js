const SIZE = 15;
let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

/* 音 */
const sound = new Audio("1.mp3");
sound.preload = "auto";

function playSound() {
  sound.currentTime = 0;
  sound.play().catch(() => {});
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

  setTimeout(cpuMove, 10);
}

/* CPU（絶対止まらない） */
function cpuMove() {
  let finished = false;

  // ★ 強制復帰（保険）
  setTimeout(() => {
    if (!finished) {
      console.warn("CPUタイムアウト");

      const fallback = getMoves()[0] || { x: 7, y: 7 };
      placeCPU(fallback);
    }
  }, 200);

  try {
    const move = getBestMove();
    finished = true;

    if (!move) {
      const fallback = getMoves()[0] || { x: 7, y: 7 };
      placeCPU(fallback);
      return;
    }

    placeCPU(move);

  } catch (e) {
    console.error(e);

    const fallback = getMoves()[0] || { x: 7, y: 7 };
    placeCPU(fallback);
  }
}

/* CPU配置 */
function placeCPU(move) {
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
      let nx = x + dx * d;
      let ny = y + dy * d;

      while (board[ny]?.[nx] === p) {
        count++;
        nx += dx * d;
        ny += dy * d;
      }
    }

    if (count >= 5) return true;
  }

  return false;
}

/* 候補手（さらに軽量） */
function getMoves() {
  const moves = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) continue;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (board[y + dy]?.[x + dx] !== 0) {
            moves.push({ x, y });
            dy = 2;
            break;
          }
        }
      }
    }
  }

  return moves.length ? moves : [{ x: 7, y: 7 }];
}

/* 超軽量評価 */
function getScore(x, y, p) {
  let score = 0;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (let [dx, dy] of dirs) {
    let count = 1;

    let nx = x + dx, ny = y + dy;
    while (board[ny]?.[nx] === p) {
      count++; nx += dx; ny += dy;
    }

    nx = x - dx; ny = y - dy;
    while (board[ny]?.[nx] === p) {
      count++; nx -= dx; ny -= dy;
    }

    if (count >= 5) score += 100000;
    else if (count === 4) score += 10000;
    else if (count === 3) score += 1000;
  }

  return score;
}

/* CPU思考（超軽量） */
function getBestMove() {
  const moves = getMoves();

  let best = moves[0];
  let bestScore = -Infinity;

  const limit = Math.min(moves.length, 12); // ★さらに制限

  for (let i = 0; i < limit; i++) {
    const m = moves[i];

    board[m.y][m.x] = 2;
    let my = getScore(m.x, m.y, 2);
    board[m.y][m.x] = 0;

    board[m.y][m.x] = 1;
    let enemy = getScore(m.x, m.y, 1);
    board[m.y][m.x] = 0;

    let score = my + enemy * 1.2;

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return best;
}

function resetGame() {
  init();
  infoEl.textContent = "あなたの番です";
}

init();
