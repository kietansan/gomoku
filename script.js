const SIZE = 15;

let board = [];
let gameOver = false;
let lastMove = null;

let gameId = 0; // 探索キャンセル用

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  lastMove = null;
  infoEl.textContent = "";
  draw();
}

/* =========================
   リセット
========================= */
function resetGame(){
  gameId++;
  gameOver = false;
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  lastMove = null;
  infoEl.textContent = "";
  draw();
}

window.resetGame = resetGame;

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

      if(board[y][x]){
        const stone = document.createElement("div");
        stone.className = board[y][x] === 1 ? "black" : "white";
        cell.appendChild(stone);
      }

      if(lastMove?.x===x && lastMove?.y===y){
        cell.style.outline = "2px solid red";
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
  if(gameOver || board[y][x]) return;

  place(x,y,1);

  if(gameOver) return;

  const id = gameId;

  setTimeout(() => {
    if(id !== gameId || gameOver) return;
    cpuMove(id);
  }, 50);
}

/* =========================
   CPU（4手読み）
========================= */
function cpuMove(id){
  if(gameOver || id !== gameId) return;

  const move = searchBestMove(4);

  if(move) place(move.x, move.y, 2);
}

/* =========================
   4手読み探索
========================= */
function searchBestMove(depth){

  const moves = getMoves().slice(0, 8);

  let bestMove = null;
  let bestScore = -Infinity;

  for(const m of moves){

    board[m.y][m.x] = 2;

    const score = -minimax(depth - 1, 1, -Infinity, Infinity);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}

/* =========================
   ミニマックス（簡易αβ）
========================= */
function minimax(depth, turn, alpha, beta){

  if(depth === 0 || gameOver){
    return evaluate(2) - evaluate(1);
  }

  const moves = getMoves().slice(0, 6);

  if(turn === 0){ // CPU
    let best = -Infinity;

    for(const m of moves){

      board[m.y][m.x] = 2;

      const score = minimax(depth - 1, 1, alpha, beta);

      board[m.y][m.x] = 0;

      best = Math.max(best, score);
      alpha = Math.max(alpha, best);

      if(beta <= alpha) break;
    }

    return best;
  }

  else { // プレイヤー
    let best = Infinity;

    for(const m of moves){

      board[m.y][m.x] = 1;

      const score = minimax(depth - 1, 0, alpha, beta);

      board[m.y][m.x] = 0;

      best = Math.min(best, score);
      beta = Math.min(beta, best);

      if(beta <= alpha) break;
    }

    return best;
  }
}

/* =========================
   候補手生成
========================= */
function getMoves(){
  const moves = [];

  const c = SIZE / 2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near = false;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]) near = true;
        }
      }

      if(!near) continue;

      let score = 0;

      // 中央優先
      score -= (Math.abs(x-c) + Math.abs(y-c));

      moves.push({x,y,score});
    }
  }

  return moves.sort((a,b)=>b.score-a.score);
}

/* =========================
   評価関数
========================= */
function evaluate(p){
  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== p) continue;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);

        if(count >= 5) score += 1000000;
        else if(count === 4) score += 50000;
        else if(count === 3 && open === 2) score += 8000;
        else if(count === 2) score += 500;
      }
    }
  }

  return score;
}

/* =========================
   ライン判定
========================= */
function line(x,y,dx,dy,p){
  let c = 1, open = 0;

  let nx = x + dx, ny = y + dy;
  while(board[ny]?.[nx] === p){
    c++; nx+=dx; ny+=dy;
  }
  if(board[ny]?.[nx] === 0) open++;

  nx = x - dx; ny = y - dy;
  while(board[ny]?.[nx] === p){
    c++; nx-=dx; ny-=dy;
  }
  if(board[ny]?.[nx] === 0) open++;

  return {count:c, open};
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){
    let c = 1;

    for(const d of [-1,1]){
      let nx = x + dx*d;
      let ny = y + dy*d;

      while(board[ny]?.[nx] === p){
        c++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    if(c >= 5){
      gameOver = true;
      infoEl.textContent = (p === 2 ? "CPUの勝ち" : "あなたの勝ち");
      return true;
    }
  }

  return false;
}

/* =========================
   着手
========================= */
function place(x,y,p){
  if(gameOver) return;

  board[y][x] = p;
  lastMove = {x,y};

  playSound();
  draw();

  checkWin(x,y,p);
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

init();
