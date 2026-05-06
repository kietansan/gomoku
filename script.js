const SIZE = 15;

let board = [];
let gameOver = false;
let lastMove = null;
let gameId = 0;

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

function resetGame(){
  gameId++;
  init();
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
        cell.style.outline="2px solid red";
      }

      cell.onclick=()=>playerMove(x,y);
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

  setTimeout(()=>{
    if(gameOver || id!==gameId) return;
    cpuMove(id);
  },0);
}

/* =========================
   CPU（4手読み）
========================= */
function cpuMove(id){
  if(gameOver || id!==gameId) return;

  let move = searchBestMove(2, 4);

  return place(move.x, move.y, 2);
}

/* =========================
   4手読みエンジン（制限付き）
========================= */
function searchBestMove(p, depth){

  const moves = getMoves();

  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){

    board[m.y][m.x] = p;

    let score = minimax(3 - p, depth - 1, false);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  return best || moves[0];
}

/* =========================
   擬似ミニマックス（軽量）
========================= */
function minimax(p, depth, isMax){

  if(depth === 0) return evaluate(2) - evaluate(1);

  const moves = getMoves();

  let best = isMax ? -Infinity : Infinity;

  for(const m of moves){

    board[m.y][m.x] = p;

    let score = minimax(3 - p, depth - 1, !isMax);

    board[m.y][m.x] = 0;

    if(isMax){
      if(score > best) best = score;
    }else{
      if(score < best) best = score;
    }
  }

  return best;
}

/* =========================
   候補手制限（安定の核）
========================= */
function getMoves(){

  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near=false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]) near=true;
        }
      }

      if(near) moves.push({x,y});
    }
  }

  return moves.length ? moves : [{x:7,y:7}];
}

/* =========================
   評価関数（安定型）
========================= */
function evaluate(p){

  let score=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]!==p) continue;

      for(const [dx,dy] of DIRS){
        const len = lineCount(x,y,dx,dy,p);

        if(len>=5) score+=1000000;
        else if(len===4) score+=50000;
        else if(len===3) score+=12000;
        else if(len===2) score+=800;
      }
    }
  }

  return score;
}

/* =========================
   ライン
========================= */
function lineCount(x,y,dx,dy,p){
  let c=1;

  let nx=x+dx, ny=y+dy;
  while(board[ny]?.[nx]===p){
    c++; nx+=dx; ny+=dy;
  }

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx]===p){
    c++; nx-=dx; ny-=dy;
  }

  return c;
}

/* =========================
   着手
========================= */
function place(x,y,p){

  if(gameOver) return;

  board[y][x]=p;
  lastMove={x,y};

  draw();

  if(getWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = (p===2?"CPUの勝ち":"あなたの勝ち");
  }

  playSound();
}

/* =========================
   勝利判定
========================= */
function getWin(x,y,p){

  for(const [dx,dy] of DIRS){

    let c=1;

    for(const d of [-1,1]){
      let nx=x+dx*d, ny=y+dy*d;

      while(board[ny]?.[nx]===p){
        c++;
        nx+=dx*d;
        ny+=dy*d;
      }
    }

    if(c>=5) return true;
  }

  return false;
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

init();
