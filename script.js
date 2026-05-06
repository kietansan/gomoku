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
    if(id !== gameId || gameOver) return;
    cpuMove(id);
  }, 30);
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

  // ② プレイヤー即勝ち防御
  m = findWin(1);
  if(m) return place(m.x,m.y,2);

  // ③ ★3連・4連防御（修正版）
  m = findDanger(1);
  if(m) return place(m.x,m.y,2);

  // ④ フォーク防御
  m = findFork(1);
  if(m) return place(m.x,m.y,2);

  // ⑤ フォーク攻撃
  m = findFork(2);
  if(m) return place(m.x,m.y,2);

  // ⑥ 4手読み
  m = searchBestMove(4);
  if(m) return place(m.x,m.y,2);
}

/* =========================
   即勝ち
========================= */
function findWin(p){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      if(checkWin(x,y,p)){
        board[y][x]=0;
        return {x,y};
      }

      board[y][x]=0;
    }
  }
  return null;
}

/* =========================
   ★危険判定（3連・4連統合）
========================= */
function findDanger(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      for(const [dx,dy] of DIRS){
        const {count} = line(x,y,dx,dy,p);

        // ★ここが本体
        if(count >= 3){
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

      let t = 0;

      for(const [dx,dy] of DIRS){
        const {count} = line(x,y,dx,dy,p);
        if(count === 3) t++;
      }

      board[y][x]=0;

      if(t >= 2) return {x,y};
    }
  }

  return null;
}

/* =========================
   4手読み
========================= */
function searchBestMove(depth){

  const moves = getMoves().slice(0, 8);

  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){

    board[m.y][m.x] = 2;

    const score = -minimax(depth-1, 1, -Infinity, Infinity);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  return best;
}

/* =========================
   ミニマックス
========================= */
function minimax(depth, turn, alpha, beta){

  if(depth === 0 || gameOver){
    return evaluate(2) - evaluate(1);
  }

  const moves = getMoves().slice(0, 6);

  if(turn === 0){

    let best = -Infinity;

    for(const m of moves){

      board[m.y][m.x] = 2;

      const score = minimax(depth-1,1,alpha,beta);

      board[m.y][m.x] = 0;

      best = Math.max(best,score);
      alpha = Math.max(alpha,best);

      if(beta<=alpha) break;
    }

    return best;
  }

  else{

    let best = Infinity;

    for(const m of moves){

      board[m.y][m.x] = 1;

      const score = minimax(depth-1,0,alpha,beta);

      board[m.y][m.x] = 0;

      best = Math.min(best,score);
      beta = Math.min(beta,best);

      if(beta<=alpha) break;
    }

    return best;
  }
}

/* =========================
   候補手
========================= */
function getMoves(){

  const moves = [];
  const c = SIZE/2;

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

      moves.push({
        x,y,
        score: -(Math.abs(x-c)+Math.abs(y-c))
      });
    }
  }

  return moves.sort((a,b)=>b.score-a.score);
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
        const {count} = line(x,y,dx,dy,p);

        if(count>=5) score+=1000000;
        else if(count===4) score+=50000;
        else if(count===3) score+=8000;
        else if(count===2) score+=500;
      }
    }
  }

  return score;
}

/* =========================
   ライン
========================= */
function line(x,y,dx,dy,p){
  let c=1;

  let nx=x+dx, ny=y+dy;
  while(board[ny]?.[nx]===p){
    c++; nx+=dx; ny+=dy;
  }

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx]===p){
    c++; nx-=dx; ny-=dy;
  }

  return {count:c};
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  for(const [dx,dy] of DIRS){

    let c=1;

    for(const d of [-1,1]){

      let nx=x+dx*d;
      let ny=y+dy*d;

      while(board[ny]?.[nx]===p){
        c++;
        nx+=dx*d;
        ny+=dy*d;
      }
    }

    if(c>=5){
      gameOver=true;
      infoEl.textContent = p===2 ? "CPUの勝ち" : "あなたの勝ち";
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

  board[y][x]=p;
  lastMove={x,y};

  playSound();
  draw();

  checkWin(x,y,p);
}

/* =========================
   音
========================= */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

init();
