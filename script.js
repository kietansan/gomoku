const SIZE = 15;

let board = [];
let gameOver = false;

let cpuTimer = null;
let turnId = 0;

let lastMove = null;

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

/* =========================
   リセット（完全修正版）
========================= */
function resetGame(){
  turnId++;                 // ★旧CPU完全無効化
  clearTimeout(cpuTimer);
  cpuTimer = null;

  gameOver = false;
  init();
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

      if(lastMove?.x===x && lastMove?.y===y){
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

  const id = ++turnId;

  cpuTimer = setTimeout(() => {
    if(id !== turnId || gameOver) return; // ★古いCPU完全無効
    cpuMove(id);
  }, 80);
}

/* =========================
   CPUメイン
========================= */
function cpuMove(id){
  if(gameOver || id !== turnId) return;

  let m;

  // ★① 即勝ち
  m = findWin(2);
  if(m) return place(m.x,m.y,2);

  // ★② 即防御
  m = findWin(1);
  if(m) return place(m.x,m.y,2);

  // ★③ 脅威防御（3連・4連）
  m = findThreat(1);
  if(m) return place(m.x,m.y,2);

  // ★④ フォーク
  m = findFork(2);
  if(m) return place(m.x,m.y,2);

  // ★⑤ 軽量評価
  m = bestMove();
  return place(m.x,m.y,2);
}

/* =========================
   即勝ち・即防御
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
   脅威防御
========================= */
function findThreat(p){
  let best=null;
  let max=-1;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let t=0;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);

        if(count>=4) t+=100;
        else if(count===3 && open===2) t+=10;
      }

      board[y][x]=0;

      if(t>max){
        max=t;
        best={x,y};
      }
    }
  }

  return best;
}

/* =========================
   フォーク
========================= */
function findFork(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let fork=0;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);
        if(count===3 && open===2) fork++;
      }

      board[y][x]=0;

      if(fork>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   軽量評価
========================= */
function bestMove(){

  const moves = getMoves().slice(0,6);

  let best=null;
  let bestScore=-Infinity;

  for(const m of moves){

    board[m.y][m.x]=2;

    let score = evaluate(2) - opponentRisk(1);

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  return best;
}

/* =========================
   相手リスク
========================= */
function opponentRisk(p){

  let max=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      if(checkWin(x,y,p)){
        board[y][x]=0;
        return 10000;
      }

      let t=0;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);
        if(count===3 && open===2) t++;
      }

      max=Math.max(max,t);

      board[y][x]=0;
    }
  }

  return max;
}

/* =========================
   候補手
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

      if(near || (x===7 && y===7)){
        moves.push({x,y});
      }
    }
  }

  return moves.sort((a,b)=>moveScore(b)-moveScore(a)).slice(0,8);
}

/* =========================
   手評価
========================= */
function moveScore(m){
  board[m.y][m.x]=2;

  let s=0;

  for(const [dx,dy] of DIRS){
    const {count}=line(m.x,m.y,dx,dy,2);
    s+=count*100;
  }

  board[m.y][m.x]=0;

  return s;
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
        const {count,open} = line(x,y,dx,dy,p);

        if(count>=5) score+=1000000;
        else if(count===4) score+=50000;
        else if(count===3 && open===2) score+=8000;
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

    if(c>=5){
      gameOver=true;
      infoEl.textContent = (p===2 ? "CPUの勝ち" : "あなたの勝ち");
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
