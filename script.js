const SIZE = 15;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

/* ======================
   初期化
====================== */
function init() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  gameOver = false;

  console.log("init OK");
  draw();
}

/* ======================
   描画（絶対に壊れない版）
====================== */
function draw() {
  const el = document.getElementById("board");

  if (!el) {
    console.error("❌ #board が見つかりません");
    return;
  }

  el.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement("div");
    row.style.display = "flex";

    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");

      cell.style.width = "30px";
      cell.style.height = "30px";
      cell.style.border = "1px solid #999";
      cell.style.boxSizing = "border-box";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.cursor = "pointer";

      // 石表示
      if (board[y][x] === 1) {
        cell.style.background = "black";
        cell.style.borderRadius = "50%";
      }

      if (board[y][x] === 2) {
        cell.style.background = "white";
        cell.style.borderRadius = "50%";
        cell.style.border = "2px solid #333";
      }

      cell.onclick = () => playerMove(x, y);

      row.appendChild(cell);
    }

    el.appendChild(row);
  }
}

/* ======================
   プレイヤー
====================== */
function playerMove(x, y) {
  if (gameOver) return;
  if (board[y][x] !== 0) return;

  board[y][x] = 1;
  playSound();

  if (checkWin(x, y, 1)) {
    infoEl.textContent = "あなたの勝ち";
    gameOver = true;
    draw();
    return;
  }

  draw();
  setTimeout(cpuMove, 50);
}

/* ======================
   CPU（超安定・軽量）
====================== */
function cpuMove() {
  if (gameOver) return;

  const move = getMoves()[0];

  board[move.y][move.x] = 2;
  playSound();

  if (checkWin(move.x, move.y, 2)) {
    infoEl.textContent = "CPUの勝ち";
    gameOver = true;
  } else {
    infoEl.textContent = "あなたの番";
  }

  draw();
}

/* ======================
   勝利判定
====================== */
function checkWin(x, y, p) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for (const [dx, dy] of dirs) {
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

/* ======================
   候補手（安定・中央優先）
====================== */
function getMoves() {
  const moves = [];
  const center = SIZE / 2;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) continue;

      let near = false;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (board[y + dy]?.[x + dx] !== 0) {
            near = true;
          }
        }
      }

      if (!near) continue;

      const score =
        -Math.abs(x - center) -
        Math.abs(y - center);

      moves.push({ x, y, score });
    }
  }

  moves.sort((a, b) => b.score - a.score);

  return moves.length ? moves : [{ x: 7, y: 7 }];
}

/* ======================
   音
====================== */
function playSound() {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

/* ======================
   リセット
====================== */
function resetGame() {
  init();
  if (infoEl) infoEl.textContent = "あなたの番です";
}

/* ======================
   起動
====================== */
init();
