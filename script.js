const SIZE = 15;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

/* 初期化 */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* 描画 */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x] === 1) cell.classList.add("black");
      if(board[y][x] === 2) cell.classList.add("white");

      cell.onclick = () => playerMove(x,y);
      row.appendChild(cell);
    }

    boardEl.appendChild(row);
  }
}

/* プレイヤー */
function playerMove(x,y){
  if(gameOver || board[y][x] !== 0) return;

  board[y][x] = 1;
  playSound();

  if(checkWin(x,y,1)){
    infoEl.textContent = "あなたの勝ち";
    gameOver = true;
    draw();
    return;
  }

  draw();
  setTimeout(cpuMove, 50);
}

/* =========================
   CPU（10秒思考・αβ）
========================= */

function cpuMove(){
  if(gameOver) return;

  const moves = getMoves();

  const startTime = performance.now();
  const TIME_LIMIT = 10000; // ★10秒

  let bestMove = moves[0];
  let bestScore = -Infinity;

  let depth = 1;

  // 反復深化
  while(true){

    let localBestMove = null;
    let localBestScore = -Infinity;

    for(const m of moves){

      board[m.y][m.x] = 2;

      const score = minimax(
        3,
        depth - 1,
        -Infinity,
        Infinity,
        false,
        startTime,
        TIME_LIMIT
      );

      board[m.y][m.x] = 0;

      if(score > localBestScore){
        localBestScore = score;
        localBestMove = m;
      }

      if(performance.now() - startTime > TIME_LIMIT){
        break;
      }
    }

    // 更新
    if(localBestMove){
      bestMove = localBestMove;
      bestScore = localBestScore;
    }

    depth++;

    if(performance.now() - startTime > TIME_LIMIT){
      break;
    }

    // 安全上限（暴走防止）
    if(depth > 6) break;
  }

  board[bestMove.y][bestMove.x] = 2;
  finalizeCPU(bestMove);
}

/* =========================
   ミニマックス + αβ + 時間制限
========================= */

function minimax(player, depth, alpha, beta, isMax, startTime, limit){

  if(depth === 0) return evaluateBoard();

  if(performance.now() - startTime > limit){
    return evaluateBoard();
  }

  const moves = getMoves();

  if(isMax){
    let maxEval = -Infinity;

    for(const m of moves){
      board[m.y][m.x] = player;

      if(checkWin(m.x, m.y, player)){
        board[m.y][m.x] = 0;
        return 100000;
      }

      const eval = minimax(
        3 - player,
        depth - 1,
        alpha,
        beta,
        false,
        startTime,
        limit
      );

      board[m.y][m.x] = 0;

      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);

      if(beta <= alpha) break;
    }

    return maxEval;
  }

  else {
    let minEval = Infinity;

    for(const m of moves){
      board[m.y][m.x] = player;

      if(checkWin(m.x, m.y, player)){
        board[m.y][m.x] = 0;
        return -100000;
      }

      const eval = minimax(
        3 - player,
        depth - 1,
        alpha,
        beta,
        true,
        startTime,
        limit
      );

      board[m.y][m.x] = 0;

      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);

      if(beta <= alpha) break;
    }

    return minEval;
  }
}

/* =========================
   評価関数
========================= */

function evaluateBoard(){
  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] === 0) continue;

      const p = board[y][x];
      score += evaluate(x,y,p) * (p === 2 ? 1 : -1);
    }
  }

  return score;
}

/* 形評価 */
function evaluate(x,y,p){
  let score = 0;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count, openEnds} = getLine(x,y,dx,dy,p);
    score += patternScore(count, openEnds);
  }

  const center = SIZE / 2;
  score -= (Math.abs(x-center) + Math.abs(y-center));

  return score;
}

/* ライン解析 */
function getLine(x,y,dx,dy,p){
  let count = 1;
  let openEnds = 0;

  const check = (nx,ny)=> board[ny]?.[nx] === p;

  let nx = x + dx;
  let ny = y + dy;

  while(check(nx,ny)){
    count++;
    nx += dx;
    ny += dy;
  }
  if(board[ny]?.[nx] === 0) openEnds++;

  nx = x - dx;
  ny = y - dy;

  while(check(nx,ny)){
    count++;
    nx -= dx;
    ny -= dy;
  }
  if(board[ny]?.[nx] === 0) openEnds++;

  return {count, openEnds};
}

/* 形スコア */
function patternScore(count, openEnds){
  if(count >= 4) return 100000;
  if(count === 3 && openEnds === 2) return 10000;
  if(count === 3 && openEnds === 1) return 2000;
  if(count === 2 && openEnds === 2) return 500;
  if(count === 2) return 100;
  return 0;
}

/* 候補手 */
function getMoves(){
  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] !== 0) continue;

      let near = false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx] !== 0) near = true;
        }
      }

      if(near) moves.push({x,y});
    }
  }

  return moves.length ? moves : [{x:7,y:7}];
}

/* 勝利判定 */
function checkWin(x,y,p){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    let count = 1;

    for(const d of [-1,1]){
      let nx = x + dx*d;
      let ny = y + dy*d;

      while(board[ny]?.[nx] === p){
        count++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    if(count >= 5) return true;
  }

  return false;
}

/* CPU確定 */
function finalizeCPU(m){
  sound.currentTime = 0;
  sound.play().catch(()=>{});

  if(checkWin(m.x,m.y,2)){
    infoEl.textContent = "CPUの勝ち";
    gameOver = true;
  } else {
    infoEl.textContent = "あなたの番";
  }

  draw();
}

/* 音 */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

/* リセット */
function resetGame(){
  init();
  infoEl.textContent = "あなたの番です";
}

/* 起動 */
init();
