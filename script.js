const SIZE = 15;

let board = [];
let gameOver = false;
let lastMove = null;
let gameId = 0;
let cpuStartTime = 0;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* =========================
   星位置（碁盤風）
========================= */
const starPoints = [
  [3,3],[3,11],
  [11,3],[11,11],
  [7,7]
];

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  lastMove = null;

  setInfo("あなたの番です");
  draw();
  markStars();
}

function resetGame(){
  gameId++;
  init();
}

window.resetGame = resetGame;

/* =========================
   UI
========================= */
function setInfo(text){
  infoEl.textContent = text;
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

      if(lastMove?.x === x && lastMove?.y === y){
        cell.style.outline = "2px solid red";
      }

      cell.onclick = () => playerMove(x,y);
      row.appendChild(cell);
    }

    boardEl.appendChild(row);
  }
}

/* =========================
   星を付与
========================= */
function markStars(){
  for(const [x,y] of starPoints){
    const cell = boardEl.children[y]?.children[x];
    if(cell){
      cell.classList.add("star");
    }
  }
}

/* =========================
   プレイヤー
========================= */
function playerMove(x,y){
  if(gameOver || board[y][x]) return;

  place(x,y,1);

  if(gameOver) return;

  setInfo("CPU思考中...");

  const id = gameId;

  setTimeout(()=>{
    if(gameOver || id !== gameId) return;
    cpuMove(id);
  }, 50);
}

/* =========================
   CPU（4手読み）
========================= */
function cpuMove(id){
  if(gameOver || id !== gameId) return;

  cpuStartTime = Date.now();

  const move = searchBestMove(2, 4);

  if(gameOver || id !== gameId) return;

  place(move.x, move.y, 2);
}

/* =========================
   4手読み
========================= */
function searchBestMove(p, depth){

  const moves = getMoves();

  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){

    if(timeUp()) break;

    board[m.y][m.x] = p;

    const score = minimax(3 - p, depth - 1, false);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  return best || moves[0];
}

/* =========================
   ミニマックス
========================= */
function minimax(p, depth, isMax){

  if(timeUp()) return evaluate(2) - evaluate(1);
  if(depth === 0) return evaluate(2) - evaluate(1);

  const moves = getMoves();

  let best = isMax ? -Infinity : Infinity;

  for(const m of moves){

    if(timeUp()) break;

    board[m.y][m.x] = p;

    const score = minimax(3 - p, depth - 1, !isMax);

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
   5秒制限
========================= */
function timeUp(){
  return (Date.now() - cpuStartTime) > 5000;
}

/* =========================
   候補手（安定）
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
   評価
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
   勝利判定
========================= */
function checkWin(x,y,p){

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
   着手
========================= */
function place(x,y,p){

  if(gameOver) return;

  board[y][x]=p;
  lastMove={x,y};

  draw();
  markStars(); // ←重要（再描画後に復活）

  if(checkWin(x,y,p)){
    gameOver=true;
    setInfo(p===2 ? "CPUの勝ち" : "あなたの勝ち");
    playSound();
    return;
  }

  playSound();

  if(p===2){
    setInfo("あなたの番です");
  }
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

init();
