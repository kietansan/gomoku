const TIME_LIMIT = 5000;
let startTime = 0;
let transTable = new Map();

/* ===== エントリ ===== */
function getBestMove() {
  startTime = Date.now();
  transTable.clear();

  let bestMove = null;
  let depth = 1;

  while (true) {
    if (timeUp()) break;

    const result = searchRoot(depth);

    if (result) bestMove = result;

    depth++;
  }

  console.log("depth:", depth - 1);
  return bestMove || getMoves()[0];
}

/* ===== ルート探索 ===== */
function searchRoot(depth) {
  let best = null;
  let bestScore = -Infinity;

  let moves = getMovesSorted();

  for (let m of moves) {
    if (timeUp()) break;

    board[m.y][m.x] = 2;
    let score = minimax(depth - 1, -Infinity, Infinity, false);
    board[m.y][m.x] = 0;

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return best;
}

/* ===== ミニマックス ===== */
function minimax(depth, alpha, beta, maximizing) {
  if (timeUp()) return 0;

  const key = board.flat().join("");
  if (transTable.has(key)) return transTable.get(key);

  if (depth === 0) {
    const val = evaluate(2);
    transTable.set(key, val);
    return val;
  }

  let moves = getMovesSorted();

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

    transTable.set(key, max);
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

    transTable.set(key, min);
    return min;
  }
}

/* ===== 手の厳選 ===== */
function getMovesSorted() {
  let moves = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) continue;

      let near = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (board[y + dy]?.[x + dx] !== 0) near = true;
        }
      }

      if (!near) continue;

      board[y][x] = 2;
      let score = evaluate(2);
      board[y][x] = 0;

      moves.push({ x, y, score });
    }
  }

  moves.sort((a, b) => b.score - a.score);

  // ★ 超重要（ここで強さが決まる）
  return moves.slice(0, 8);
}

/* ===== 評価関数 ===== */
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
          else if (count === 4) total += 20000;
          else if (count === 3 && open === 2) total += 5000;
          else if (count === 3) total += 500;
        }
      }
    }

    return total;
  }

  return score(player) - score(opponent) * 1.2;
}

/* ===== 時間制御 ===== */
function timeUp() {
  return Date.now() - startTime > TIME_LIMIT;
}
