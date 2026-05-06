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

      if(board[y][x]){
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
  if(gameOver || board[y][x]) return;

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
   CPUメイン（統合型AI）
========================= */
function cpuMove(){
  if(gameOver) return;

  let bestMove = null;
  let bestScore = -Infinity;

  const moves = getMoves();

  for(const m of moves){

    board[m.y][m.x] = 2;

    let score =
      evaluate(m.x,m.y,2) +   // 自分の形
      evaluateEnemy(m.x,m.y); // 相手阻止力

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      bestMove = m;
    }
  }

  place(bestMove);

  if(checkWin(bestMove.x,bestMove.y,2)){
    gameOver = true;
    infoEl.textContent = "CPUの勝ち";
  }
}

/* =========================
   候補手（近傍のみ）
========================= */
function getMoves(){
  const moves = [];
  const c = SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near = false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]) near = true;
        }
      }

      if(!near && moves.length > 30) continue;

      moves.push({x,y});
    }
  }

  return moves;
}

/* =========================
   自分評価
========================= */
function evaluate(x,y,p){

  let score = 0;

  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count,open} = getLine(x,y,dx,dy,p);

    if(count >= 5) score += 1000000;
    else if(count === 4) score += 50000;
    else if(count === 3 && open === 2) score += 15000;
    else if(count === 3) score += 3000;
    else if(count === 2) score += 500;
  }

  return score;
}

/* =========================
   相手阻止評価（ここ重要）
========================= */
function evaluateEnemy(x,y){

  let score = 0;

  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){

    const {count,open} = getLine(x,y,dx,dy,1);

    if(count >= 5) score += 900000;
    else if(count === 4) score += 80000;
    else if(count === 3 && open === 2) score += 20000;
    else if(count === 3) score += 5000;
  }

  return score;
}

/* =========================
   ライン判定
========================= */
function getLine(x,y,dx,dy,p){
  let count=1, open=0;

  let nx=x+dx, ny=y+dy;
  while(board[ny]?.[nx] === p){
    count++; nx+=dx; ny+=dy;
  }
  if(board[ny]?.[nx] === 0) open++;

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx] === p){
    count++; nx-=dx; ny-=dy;
  }
  if(board[ny]?.[nx] === 0) open++;

  return {count,open};
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

      while(board[ny]?.[nx] === p){
        c++; nx+=dx*d; ny+=dy*d;
      }
    }

    if(c >= 5) return true;
  }

  return false;
}

/* =========================
   着手
========================= */
function place(m){
  board[m.y][m.x] = 2;
  playSound();
  draw();
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
function resetGame(){
  init();
}

init();
