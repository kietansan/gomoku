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
    gameOver = true;
    infoEl.textContent = "あなたの勝ち";
    draw();
    return;
  }

  draw();
  setTimeout(cpuMove, 10);
}

/* =========================
   CPU
========================= */
function cpuMove(){
  if(gameOver) return;

  /* ★① CPU即勝ち */
  let win = findWinningMove(2);
  if(win){
    place(win);

    if(checkWin(win.x,win.y,2)){
      gameOver = true;
      infoEl.textContent = "CPUの勝ち";
    }

    return;
  }

  /* ★② 4連・3連・即死防御 */
  let block = findStrongThreat(1);
  if(block){
    place(block);
    return;
  }

  /* ★③ 攻撃優先 */
  let best = getBestMove();

  place(best);
}

/* =========================
   即勝ち・即防御
========================= */
function findWinningMove(p){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      board[y][x] = p;
      if(checkWin(x,y,p)){
        board[y][x] = 0;
        return {x,y};
      }
      board[y][x] = 0;
    }
  }
  return null;
}

/* =========================
   強化防御（ここが核心）
   4連・3連・即死全部対応
========================= */
function findStrongThreat(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      board[y][x] = p;

      if(
        checkWin(x,y,p) ||        // 即死
        isFour(x,y,p) ||          // 4連
        isOpenThree(x,y,p)        // 活三
      ){
        board[y][x] = 0;
        return {x,y};
      }

      board[y][x] = 0;
    }
  }

  return null;
}

/* =========================
   4連判定（強化版）
========================= */
function isFour(x,y,p){
  return getMaxLine(x,y,p) === 4;
}

/* =========================
   活三判定
========================= */
function isOpenThree(x,y,p){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count,open}=getLine(x,y,dx,dy,p);
    if(count===3 && open===2) return true;
  }

  return false;
}

/* =========================
   ライン最大長
========================= */
function getMaxLine(x,y,p){
  let max=0;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count}=getLine(x,y,dx,dy,p);
    max=Math.max(max,count);
  }

  return max;
}

/* =========================
   ライン計算
========================= */
function getLine(x,y,dx,dy,p){
  let count=1, open=0;

  let nx=x+dx, ny=y+dy;
  while(board[ny]?.[nx]===p){
    count++; nx+=dx; ny+=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx]===p){
    count++; nx-=dx; ny-=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  return {count,open};
}

/* =========================
   攻撃AI（シンプル強化）
========================= */
function getBestMove(){

  let best=null;
  let bestScore=-Infinity;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]!==0) continue;

      board[y][x]=2;

      let score = evaluate(x,y);

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
function evaluate(x,y){
  let score=0;

  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count,open}=getLine(x,y,dx,dy,2);

    if(count>=5) score+=100000;
    else if(count===4) score+=50000;
    else if(count===3 && open===2) score+=10000;
    else if(count===2) score+=1000;
  }

  const c=SIZE/2;
  score -= (Math.abs(x-c)+Math.abs(y-c))*3;

  return score;
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
   着手処理
========================= */
function place(m){
  board[m.y][m.x]=2;
  playSound();
  draw();
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
function resetGame(){
  init();
}

init();
