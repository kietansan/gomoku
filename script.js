const TIME_LIMIT = 5000; // ★ 5秒
let startTime = 0;

function getBestMove() {
  startTime = Date.now();

  let bestMove = null;
  let depth = 1;

  while (true) {
    if (Date.now() - startTime > TIME_LIMIT) break;

    const result = searchRoot(depth);

    if (result) {
      bestMove = result;
    }

    depth++;
  }

  console.log("depth:", depth - 1);

  return bestMove || getMoves()[0];
}

/* ルート探索 */
function searchRoot(depth) {
  let best = null;
  let bestScore = -Infinity;

  const moves = getMoves();

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

/* ミニマックス（αβ） */
function minimax(depth, alpha, beta, maximizing) {
  if (timeUp()) return 0;

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

/* 時間チェック */
function timeUp() {
  return Date.now() - startTime > TIME_LIMIT;
}
