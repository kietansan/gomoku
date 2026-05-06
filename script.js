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
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  lastMove = null;
  setInfo("あなたの番です");
  draw();
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
   星（交点ベース）
========================= */
function isStar(x,y){
  return (
    (x===3 && y===3) ||
    (x===3 && y===11) ||
    (x===11 && y===3) ||
    (x===11 && y===11) ||
    (x===7 && y===7)
  );
}

/* =========================
   描画（交点）
========================= */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row-intersection";

    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className = "node";

      // 星
      if(isStar(x,y)){
        node.classList.add("star");
      }

      // 石
      if(board[y][x] === 1){
        const s = document.createElement("div");
        s.className = "stone black";
        node.appendChild(s);
      }

      if(board[y][x] === 2){
        const s = document.createElement("div");
        s.className = "stone white";
        node.appendChild(s);
      }

      if(lastMove?.x === x && lastMove?.y === y){
        node.classList.add("last");
      }

      node.onclick = () => playerMove(x,y);

      row.appendChild(node);
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

  setInfo("CPU思考中...");

  const id = gameId;

  setTimeout(()=>{
    if(gameOver || id !== gameId) return;
    cpuMove(id);
  }, 50);
}

/* =========================
   CPU（簡易）
========================= */
function cpuMove(id){

  cpuStartTime = Date.now();

  const move = bestMove(2);

  if(gameOver || id !== gameId) return;

  place(move.x, move.y, 2);
}

/* =========================
   手選び
========================= */
function bestMove(p){

  const moves = getMoves();

  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){

    board[m.y][m.x] = p;

    const score = evaluate(2) - evaluate(1)*1.1;

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  return best || moves[0];
}

/* =========================
   候補手（交点）
========================= */
function getMoves(){

  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near = false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]) near = true;
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

  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== p) continue;

      for(const [dx,dy] of DIRS){

        const len = lineCount(x,y,dx,dy,p);

        if(len >= 5) score += 1000000;
        else if(len === 4) score += 50000;
        else if(len === 3) score += 8000;
        else if(len === 2) score += 500;
      }
    }
  }

  return score;
}

/* =========================
   連結数
========================= */
function lineCount(x,y,dx,dy,p){

  let c = 1;

  let nx = x+dx, ny = y+dy;
  while(board[ny]?.[nx] === p){
    c++; nx+=dx; ny+=dy;
  }

  nx = x-dx; ny = y-dy;
  while(board[ny]?.[nx] === p){
    c++; nx-=dx; ny-=dy;
  }

  return c;
}

/* =========================
   勝利
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

    if(c >= 5) return true;
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

  draw();

  if(checkWin(x,y,p)){
    gameOver = true;
    setInfo(p===2 ? "CPUの勝ち" : "あなたの勝ち");
    return;
  }

  if(p === 2){
    setInfo("あなたの番です");
  }
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

init();
