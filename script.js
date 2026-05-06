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
   プレイヤー
========================= */
function playerMove(x,y){
  if(gameOver || board[y][x]) return;

  place(x,y,1);

  if(gameOver) return;

  const id = gameId;

  setTimeout(() => {
    if(gameOver || id !== gameId) return;
    cpuMove(id);
  }, 0);
}

/* =========================
   CPUメイン
========================= */
function cpuMove(id){
  if(gameOver || id !== gameId) return;

  let m;

  // ① CPU即勝ち
  m = findWin(2);
  if(m) return place(m.x,m.y,2);

  // ② プレイヤー即死防御
  m = findWin(1);
  if(m) return place(m.x,m.y,2);

  // ③ 超重要防御（3・4・活3）
  m = findCriticalDefense(1);
  if(m) return place(m.x,m.y,2);

  // ④ フォーク防御
  m = findFork(1);
  if(m) return place(m.x,m.y,2);

  // ⑤ フォーク攻撃
  m = findFork(2);
  if(m) return place(m.x,m.y,2);

  // ⑥ 評価
  m = bestMove();
  return place(m.x,m.y,2);
}

/* =========================
   勝ち検出
========================= */
function findWin(p){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      if(getWinLine(x,y,p)){
        board[y][x]=0;
        return {x,y};
      }

      board[y][x]=0;
    }
  }
  return null;
}

/* =========================
   勝利ライン確定
========================= */
function getWinLine(x,y,p){

  for(const [dx,dy] of DIRS){

    let line=[{x,y}];

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){
      line.push({x:nx,y:ny});
      nx+=dx; ny+=dy;
    }

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){
      line.unshift({x:nx,y:ny});
      nx-=dx; ny-=dy;
    }

    if(line.length>=5) return line;
  }

  return null;
}

/* =========================
   超重要防御（ここが核心）
========================= */
function findCriticalDefense(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      for(const [dx,dy] of DIRS){
        const len = lineCount(x,y,dx,dy,p);
        const open = isOpen(x,y,dx,dy,p);

        // 4連 or 両活3は必ず止める
        if(len>=4 || (len===3 && open===2)){
          board[y][x]=0;
          return {x,y};
        }
      }

      board[y][x]=0;
    }
  }

  return null;
}

/* =========================
   フォーク
========================= */
function findFork(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let t=0;

      for(const [dx,dy] of DIRS){
        if(lineCount(x,y,dx,dy,p)===3) t++;
      }

      board[y][x]=0;

      if(t>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   候補制御（端排除の核心）
========================= */
function getMoves(){

  const moves=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near=false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]) near=true;
        }
      }

      if(!near) continue;

      moves.push({x,y});
    }
  }

  return moves.length ? moves : [{x:7,y:7}];
}

/* =========================
   評価（補助）
========================= */
function bestMove(){

  const moves=getMoves();

  let best=null;
  let bestScore=-Infinity;

  for(const m of moves){

    board[m.y][m.x]=2;

    let score =
      evaluate(2) -
      evaluate(1)*1.4 -
      (Math.abs(m.x-7)+Math.abs(m.y-7))*8;

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  return best;
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
        const len=lineCount(x,y,dx,dy,p);

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
   開放
========================= */
function isOpen(x,y,dx,dy,p){
  return board[y+dy]?.[x+dx]===0 || board[y-dy]?.[x-dx]===0;
}

/* =========================
   着手
========================= */
function place(x,y,p){

  if(gameOver) return;

  board[y][x]=p;
  lastMove={x,y};

  draw();

  const win=getWinLine(x,y,p);

  if(win){
    gameOver=true;
    infoEl.textContent=(p===2?"CPUの勝ち":"あなたの勝ち");
  }

  playSound();
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

init();
