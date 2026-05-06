const SIZE = 15;
let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

/* ===== 音 ===== */
const sound = new Audio("1.mp3");
sound.preload = "auto";

function playSound() {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

/* ===== 初期化 ===== */
function init() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* ===== 描画 ===== */
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

/* ===== プレイヤー ===== */
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
  setTimeout(cpuMove, 20);
}

/* ===== CPU ===== */
function cpuMove() {
  let finished = false;

  // 強制復帰（フリーズ防止）
  setTimeout(() => {
    if (!finished) {
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

/* ===== CPU配置 ===== */
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

/* ===== 勝利判定 ===== */
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

/* ===== 評価 ===== */
function getScore(x, y, p) {
  let score = 0;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (let [dx, dy] of dirs) {
    let count = 1;
    let open = 0;

    let nx = x + dx, ny = y + dy;
    while (board[ny]?.[nx] === p) {
      count++; nx += dx; ny += dy;
    }
    if (board[ny]?.[nx] === 0) open++;

    nx = x - dx; ny = y - dy;
    while (board[ny]?.[nx] === p) {
      count++; nx -= dx; ny -= dy;
    }
    if (board[ny]?.[nx] === 0) open++;

    if (count >= 5) score += 1000000;
    else if (count === 4 && open > 0) score += 50000;
    else if (count === 3 && open > 0) score += 5000;
    else if (count === 2) score += 200;
  }

  return score;
}

/* ===== 候補手 ===== */
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

/* ===== CPU思考（強化版） ===== */
function getBestMove() {
  const moves = getMoves();

  // ① 即勝ち
  for (let m of moves) {
    board[m.y][m.x] = 2;
    if (checkWin(m.x, m.y, 2)) {
      board[m.y][m.x] = 0;
      return m;
    }
    board[m.y][m.x] = 0;
  }

  // ② 即防御
  for (let m of moves) {
    board[m.y][m.x] = 1;
    if (checkWin(m.x, m.y, 1)) {
      board[m.y][m.x] = 0;
      return m;
    }
    board[m.y][m.x] = 0;
  }

  let best = moves[0];
  let bestScore = -Infinity;

  const limit = Math.min(moves.length, 15);

  for (let i = 0; i < limit; i++) {
    const m = moves[i];

    board[m.y][m.x] = 2;
    let myScore = getScore(m.x, m.y, 2);

    // ★ 相手の最善手を見る
    let worstEnemy = 0;
    const enemyMoves = getMoves();
    const enemyLimit = Math.min(enemyMoves.length, 8);

    for (let j = 0; j < enemyLimit; j++) {
      const e = enemyMoves[j];

      board[e.y][e.x] = 1;
      let s = getScore(e.x, e.y, 1);
      board[e.y][e.x] = 0;

      if (s > worstEnemy) worstEnemy = s;
    }

    board[m.y][m.x] = 0;

    let score = myScore - worstEnemy * 1.3;

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return best;
}

/* ===== リセット ===== */
function resetGame() {
  init();
  infoEl.textContent = "あなたの番です";
}

init();
