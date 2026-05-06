const SIZE = 15;
let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

function playSound() {
  const s = new Audio("1.mp3");
  s.play();
}

function init() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

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
  setTimeout(cpuMove, 50);
}

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

/* ===== 勝利判定 ===== */
function checkWin(x, y, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (let [dx, dy] of dirs) {
    let count = 1;

    for (let d = -1; d <= 1; d += 2) {
      let nx = x + dx * d;
      let ny = y + dy * d;

      while (board[ny]?.[nx] === player) {
        count++;
        nx += dx * d;
        ny += dy * d;
      }
    }

    if (count >= 5) return true;
  }

  return false;
}

/* ===== 候補手 ===== */
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

/* ===== 評価関数（強化） ===== */
function evaluate(player) {
  const opponent = player === 1 ? 2 : 1;

  function score(p) {
    let total = 0;
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (board[y][x] !== p) continue;

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

          if (count >= 5) return 1000000;
          if (count === 4 && open === 2) total += 100000;
          else if (count === 4 && open === 1) total += 10000;
          else if (count === 3 && open === 2) total += 3000;
          else if (count === 3 && open === 1) total += 300;
          else if (count === 2 && open === 2) total += 50;
        }
      }
    }

    return total;
  }

  return score(player) - score(opponent) * 1.2;
}

/* ===== ミニマックス ===== */
function minimax(depth, alpha, beta, maximizing) {
  if (depth === 0) return evaluate(2);

  const moves = getMoves();

  if (maximizing) {
    let max = -Infinity;

    for (let m of moves) {
      board[m.y][m.x] = 2;
      let val = minimax(depth - 1, alpha, beta, false);
      board[m.y][m.x] = 0;

      max = Math.max(max, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }

    return max;

  } else {
    let min = Infinity;

    for (let m of moves) {
      board[m.y][m.x] = 1;
      let val = minimax(depth - 1, alpha, beta, true);
      board[m.y][m.x] = 0;

      min = Math.min(min, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }

    return min;
  }
}

/* ===== 最重要：CPU判断 ===== */
function getBestMove() {
  const moves = getMoves();

  // ① 自分の即勝ち
  for (let m of moves) {
    board[m.y][m.x] = 2;
    if (checkWin(m.x, m.y, 2)) {
      board[m.y][m.x] = 0;
      return m;
    }
    board[m.y][m.x] = 0;
  }

  // ② 相手の即勝ちを防ぐ
  for (let m of moves) {
    board[m.y][m.x] = 1;
    if (checkWin(m.x, m.y, 1)) {
      board[m.y][m.x] = 0;
      return m;
    }
    board[m.y][m.x] = 0;
  }

  // ③ 通常探索
  let bestScore = -Infinity;
  let bestMove = null;

  for (let m of moves) {
    board[m.y][m.x] = 2;

    let score = minimax(3, -Infinity, Infinity, false);

    board[m.y][m.x] = 0;

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
