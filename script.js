const SIZE = 15;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* =========================
   描画
========================= */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x] !== 0){
        const stone = document.createElement("div");
        stone.className = board[y][x] === 1 ? "black" : "white";
        cell.appendChild(stone);
      }

      cell.onclick = () => playerMove(x,y);
      row.appendChild(cell);
    }

    boardEl.appendChild(row);
  }
}

/* =========================
   プレイヤー
========================= */
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
  setTimeout(cpuMove, 20);
}

/* =========================
   CPU（完全強化版）
========================= */
function cpuMove(){
  if(gameOver) return;

  const start = performance.now();
  const TIME_LIMIT = 10000;

  let moves = getMovesThreatOrdered();
  if(!moves.length) return;

  let bestMove = moves[0];

  for(let depth=1; depth<=4; depth++){

    let localBest = null;
    let localScore = -Infinity;

    for(const m of moves){

      board[m.y][m.x] = 2;

      const score = minimax(
        3,
        depth-1,
        -Infinity,
        Infinity,
        false,
        start,
        TIME_LIMIT
      );

      board[m.y][m.x] = 0;

      if(score > localScore){
        localScore = score;
        localBest = m;
      }

      if(performance.now() - start > TIME_LIMIT) break;
    }

    if(localBest) bestMove = localBest;

    if(performance.now() - start > TIME_LIMIT) break;
  }

  if(!bestMove) bestMove = {x:7,y:7};

  board[bestMove.y][bestMove.x] = 2;
  finalizeCPU(bestMove);
}

/* =========================
   αβ探索
========================= */
function minimax(player, depth, alpha, beta, isMax, start, limit){

  if(depth === 0) return evaluateBoard();

  if(performance.now() - start > limit){
    return evaluateBoard();
  }

  const moves = getMovesThreatOrdered();

  if(isMax){
    let best = -Infinity;

    for(const m of moves){
      board[m.y][m.x] = player;

      if(checkWin(m.x,m.y,player)){
        board[m.y][m.x] = 0;
        return 1000000;
      }

      const val = minimax(3-player, depth-1, alpha, beta, false, start, limit);

      board[m.y][m.x] = 0;

      best = Math.max(best, val);
      alpha = Math.max(alpha, val);

      if(beta <= alpha) break;
    }

    return best;
  }

  else {
    let best = Infinity;

    for(const m of moves){
      board[m.y][m.x] = player;

      if(checkWin(m.x,m.y,player)){
        board[m.y][m.x] = 0;
        return -1000000;
      }

      const val = minimax(3-player, depth-1, alpha, beta, true, start, limit);

      board[m.y][m.x] = 0;

      best = Math.min(best, val);
      beta = Math.min(beta, val);

      if(beta <= alpha) break;
    }

    return best;
  }
}

/* =========================
   評価（核心）
========================= */
function evaluateBoard(){
  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] === 0) continue;

      const p = board[y][x];
      score += evaluate(x,y,p) * (p===2 ? 1 : -1);
    }
  }

  return score;
}

function evaluate(x,y,p){
  let score = 0;

  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count, openEnds} = getLine(x,y,dx,dy,p);
    score += patternScore(count, openEnds);
  }

  const c = SIZE/2;
  score -= (Math.abs(x-c)+Math.abs(y-c))*6;

  return score;
}

/* =========================
   形評価（勝ち構造ベース）
========================= */
function patternScore(count, open){

  if(count >= 5) return 1000000;

  if(count === 4) return 200000;

  if(count === 3 && open === 2) return 80000; // 活三（超重要）

  if(count === 3 && open === 1) return 30000;

  if(count === 2 && open === 2) return 5000;

  return 0;
}

/* =========================
   ダブルスレット検出
========================= */
function hasDoubleThreat(x,y,p){

  let threats = 0;

  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count, openEnds} = getLine(x,y,dx,dy,p);
    if(count === 3 && openEnds === 2) threats++;
  }

  return threats >= 2;
}

/* =========================
   候補手（脅威＋中央＋優先）
========================= */
function getMovesThreatOrdered(){
  const moves = [];
  const center = SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] !== 0) continue;

      let score = 0;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          const v = board[y+dy]?.[x+dx];

          if(v===2) score += 3;
          if(v===1) score += 5;
        }
      }

      if(hasDoubleThreat(x,y,2)) score += 50000;
      if(hasDoubleThreat(x,y,1)) score += 60000;

      score -= (Math.abs(x-center)+Math.abs(y-center));

      moves.push({x,y,score});
    }
  }

  moves.sort((a,b)=>b.score-a.score);

  return moves.slice(0, 12);
}

/* =========================
   ライン判定
========================= */
function getLine(x,y,dx,dy,p){
  let count=1, open=0;

  const chk=(nx,ny)=>board[ny]?.[nx]===p;

  let nx=x+dx, ny=y+dy;
  while(chk(nx,ny)){count++; nx+=dx; ny+=dy;}
  if(board[ny]?.[nx]===0) open++;

  nx=x-dx; ny=y-dy;
  while(chk(nx,ny)){count++; nx-=dx; ny-=dy;}
  if(board[ny]?.[nx]===0) open++;

  return {count,openEnds:open};
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    let c=1;

    for(const d of [-1,1]){
      let nx=x+dx*d, ny=y+dy*d;
      while(board[ny]?.[nx]===p){
        c++; nx+=dx*d; ny+=dy*d;
      }
    }

    if(c>=5) return true;
  }

  return false;
}

/* =========================
   終了
========================= */
function finalizeCPU(m){
  playSound();

  if(checkWin(m.x,m.y,2)){
    infoEl.textContent="CPUの勝ち";
    gameOver=true;
  } else {
    infoEl.textContent="あなたの番";
  }

  draw();
}

/* 音 */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

/* リセット */
function resetGame(){
  init();
  infoEl.textContent="あなたの番です";
}

init();
