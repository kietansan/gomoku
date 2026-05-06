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
  setTimeout(cpuMove, 5);
}

/* =========================
   CPU（本体）
========================= */
function cpuMove(){
  if(gameOver) return;

  let move;

  // 1. 自分即勝ち
  move = findWin(2);
  if(move) return place(move);

  // 2. 相手即勝ち阻止
  move = findWin(1);
  if(move) return place(move);

  // 3. 相手の両取り（フォーク）阻止
  move = findForkBlock(1);
  if(move) return place(move);

  // 4. 自分の両取り作成
  move = findForkCreate(2);
  if(move) return place(move);

  // 5. 最終評価
  move = bestMove();
  return place(move);
}

/* =========================
   即勝ち/即防御
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
   フォーク防御（超重要）
   2方向以上の3を潰す
========================= */
function findForkBlock(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=p;

      let threats=0;

      for(const [dx,dy] of DIRS){
        const {count,open}=line(x,y,dx,dy,p);
        if(count===3 && open===2) threats++;
      }

      board[y][x]=0;

      if(threats>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   フォーク生成（攻撃核）
========================= */
function findForkCreate(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=p;

      let threats=0;

      for(const [dx,dy] of DIRS){
        const {count,open}=line(x,y,dx,dy,p);
        if(count===3 && open===2) threats++;
      }

      board[y][x]=0;

      if(threats>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   最終評価（シンプルで強い）
========================= */
function bestMove(){

  let best=null;
  let bestScore=-Infinity;

  const moves=getMoves();

  for(const m of moves){

    board[m.y][m.x]=2;

    let score = evaluate(2) - evaluate(1)*1.2;

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  return best;
}

/* =========================
   候補手（重要：中央＋近傍のみ）
========================= */
function getMoves(){
  const moves=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      let near=false;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]) near=true;
        }
      }

      if(near) moves.push({x,y});
    }
  }

  return moves;
}

/* =========================
   評価関数（単純・強い）
========================= */
function evaluate(p){

  let score=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==p) continue;

      for(const [dx,dy] of DIRS){
        const {count,open}=line(x,y,dx,dy,p);

        if(count>=5) score+=1000000;
        else if(count===4) score+=50000;
        else if(count===3 && open===2) score+=12000;
        else if(count===2) score+=800;
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
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];

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
