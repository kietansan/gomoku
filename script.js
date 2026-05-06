const SIZE = 15;

let board = [];
let gameOver = false;
let lastMove = null;

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
  infoEl.textContent = "";
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

      if(board[y][x]){
        const stone = document.createElement("div");
        stone.className = board[y][x] === 1 ? "black" : "white";
        cell.appendChild(stone);
      }

      if(lastMove?.x===x && lastMove?.y===y){
        cell.style.outline="2px solid red";
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

  setTimeout(cpuMove, 5);
}

/* =========================
   CPU（αβミニ版）
========================= */
function cpuMove(){
  if(gameOver) return;

  let bestMove = null;
  let bestScore = -Infinity;

  const moves = getMoves();

  for(const m of moves){
    board[m.y][m.x] = 2;

    const score = alphaBeta(2, 3, -Infinity, Infinity, false);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      bestMove = m;
    }
  }

  place(bestMove.x, bestMove.y, 2);
}

/* =========================
   αβ探索（深さ3）
========================= */
function alphaBeta(p, depth, alpha, beta, maximizing){

  if(depth === 0) return evaluate();

  const moves = getMoves();

  if(maximizing){
    let maxEval = -Infinity;

    for(const m of moves){
      board[m.y][m.x] = p;

      if(checkWin(m.x,m.y,p)){
        board[m.y][m.x]=0;
        return 100000;
      }

      const val = alphaBeta(3-p, depth-1, alpha, beta, false);

      board[m.y][m.x] = 0;

      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);

      if(beta <= alpha) break;
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for(const m of moves){
      board[m.y][m.x] = p;

      if(checkWin(m.x,m.y,p)){
        board[m.y][m.x]=0;
        return -100000;
      }

      const val = alphaBeta(3-p, depth-1, alpha, beta, true);

      board[m.y][m.x] = 0;

      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);

      if(beta <= alpha) break;
    }

    return minEval;
  }
}

/* =========================
   候補手（超重要）
========================= */
function getMoves(){
  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near = false;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]) near = true;
        }
      }

      if(near) moves.push({x,y});
    }
  }

  // 評価で上位だけ残す（10手）
  moves.sort((a,b)=>evaluateMove(b.x,b.y)-evaluateMove(a.x,a.y));

  return moves.slice(0,10);
}

/* =========================
   1手評価（軽量）
========================= */
function evaluateMove(x,y){

  let score = 0;

  for(const p of [1,2]){
    board[y][x] = p;

    for(const [dx,dy] of DIRS){
      const {count,open} = line(x,y,dx,dy,p);

      if(count>=5) score += (p===2?100000:-100000);
      else if(count===4) score += (p===2?50000:-50000);
      else if(count===3 && open===2) score += (p===2?8000:-8000);
      else if(count===2) score += (p===2?500:-500);
    }

    board[y][x] = 0;
  }

  return score;
}

/* =========================
   総合評価
========================= */
function evaluate(){

  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const p = board[y][x];
      if(!p) continue;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);

        if(count>=5) score += (p===2?1000000:-1000000);
        else if(count===4) score += (p===2?50000:-50000);
        else if(count===3 && open===2) score += (p===2?8000:-8000);
        else if(count===2) score += (p===2?500:-500);
      }
    }
  }

  return score;
}

/* =========================
   ライン判定
========================= */
function line(x,y,dx,dy,p){
  let c=1, open=0;

  let nx=x+dx, ny=y+dy;
  while(board[ny]?.[nx]===p){
    c++; nx+=dx; ny+=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx]===p){
    c++; nx-=dx; ny-=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  return {count:c,open};
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){
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
   着手
========================= */
function place(x,y,p){
  board[y][x]=p;
  lastMove={x,y};
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===2 ? "CPUの勝ち" : "あなたの勝ち";
  }
}

/* =========================
   リセット
========================= */
function resetGame(){
  init();
}

init();
