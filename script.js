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
   描画（シンプル安定）
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
    return;
  }

  draw();
  setTimeout(cpuMove, 10);
}

/* =========================
   CPUメイン
========================= */
function cpuMove(){
  if(gameOver) return;

  /* ① 即勝ち */
  let win = findWinningMove(2);
  if(win){
    place(win);
    return;
  }

  /* ② 即死防御 */
  let block = findWinningMove(1);
  if(block){
    place(block);
    return;
  }

  /* ③ 2手勝ち（超重要） */
  let forced = findTwoStepWin(2);
  if(forced){
    place(forced);
    return;
  }

  /* ④ 2手負け回避 */
  let defend2 = findTwoStepWin(1);
  if(defend2){
    place(defend2);
    return;
  }

  /* ⑤ 通常探索 */
  const moves = getMoves();

  let best = moves[0];
  let bestScore = -Infinity;

  for(const m of moves){
    board[m.y][m.x] = 2;

    const score = evaluateBoard();

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

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
   2手勝ち検出（核心）
========================= */
function findTwoStepWin(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      board[y][x] = p;

      let winCount = 0;

      const moves = getMoves();

      for(const m of moves){
        board[m.y][m.x] = p;

        if(checkWin(m.x,m.y,p)){
          winCount++;
        }

        board[m.y][m.x] = 0;
      }

      board[y][x] = 0;

      if(winCount >= 2){
        return {x,y};
      }
    }
  }

  return null;
}

/* =========================
   候補手（中央寄り）
========================= */
function getMoves(){
  const moves = [];
  const c = SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      let score = 0;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){

          const v = board[y+dy]?.[x+dx];

          if(v===2) score += 2;
          if(v===1) score += 3;
        }
      }

      score -= (Math.abs(x-c)+Math.abs(y-c));

      moves.push({x,y,score});
    }
  }

  moves.sort((a,b)=>b.score-a.score);

  return moves.slice(0,10);
}

/* =========================
   評価（簡略だが実戦用）
========================= */
function evaluateBoard(){
  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === 0) continue;

      const p = board[y][x];
      score += evalPoint(x,y,p) * (p===2 ? 1 : -1);
    }
  }

  return score;
}

/* 形評価 */
function evalPoint(x,y,p){

  let score = 0;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count,open} = getLine(x,y,dx,dy,p);

    if(count >= 5) score += 100000;
    if(count === 4) score += 50000;
    if(count === 3 && open === 2) score += 10000;
    if(count === 3 && open === 1) score += 2000;
    if(count === 2) score += 200;
  }

  return score;
}

/* ライン */
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
   着手
========================= */
function place(m){
  board[m.y][m.x]=2;
  playSound();

  if(checkWin(m.x,m.y,2)){
    gameOver=true;
  }

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
