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
   CPU
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

  // ③ 3・4連防御（超重要）
  m = findDanger(1);
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
   即勝ち / 即死防御
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

    let line = [{x,y}];

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

    if(line.length >= 5) return line;
  }

  return null;
}

/* =========================
   危険検出（3・4連）
========================= */
function findDanger(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      for(const [dx,dy] of DIRS){
        const len = lineCount(x,y,dx,dy,p);
        const open = isOpen(x,y,dx,dy,p);

        // 4連 or 活3は即防御
        if(len >= 4 || (len === 3 && open)){
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
        if(lineCount(x,y,dx,dy,p) === 3) t++;
      }

      board[y][x]=0;

      if(t>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   ライン長
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
   開放チェック
========================= */
function isOpen(x,y,dx,dy,p){
  let nx=x+dx, ny=y+dy;
  const open1 = board[ny]?.[nx]===0;

  nx=x-dx; ny=y-dy;
  const open2 = board[ny]?.[nx]===0;

  return open1 || open2;
}

/* =========================
   評価
========================= */
function bestMove(){

  let best=null;
  let bestScore=-Infinity;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      // 端抑制（重要）
      let centerPenalty = Math.abs(x-7)+Math.abs(y-7);

      board[y][x]=2;

      let score =
        evaluate(2) -
        evaluate(1)*1.3 -
        centerPenalty*5;

      board[y][x]=0;

      if(score>bestScore){
        bestScore=score;
        best={x,y};
      }
    }
  }

  return best;
}

/* =========================
   評価関数
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
        else if(len===3) score+=8000;
        else if(len===2) score+=500;
      }
    }
  }

  return score;
}

/* =========================
   着手
========================= */
function place(x,y,p){

  if(gameOver) return;

  board[y][x]=p;
  lastMove={x,y};

  draw();

  const win = getWinLine(x,y,p);

  if(win){
    gameOver=true;
    infoEl.textContent = (p===2 ? "CPUの勝ち" : "あなたの勝ち");
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
