const SIZE = 15;

let board = [];
let gameOver = false;
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

  setTimeout(cpuMove, 10);
}

/* =========================
   CPU（5秒思考ハイブリッド）
========================= */
function cpuMove(){
  if(gameOver) return;

  let m;

  // ★① 即勝ち
  m = findWin(2);
  if(m) return place(m.x,m.y,2);

  // ★② 即負け防御（最優先）
  m = findWin(1);
  if(m) return place(m.x,m.y,2);

  // ★③ 3連・フォーク防御
  m = findThreatDefense(1);
  if(m) return place(m.x,m.y,2);

  // ★④ フォーク攻撃
  m = findFork(2);
  if(m) return place(m.x,m.y,2);

  // ★⑤ 5秒用軽量αβ
  m = bestMoveLookahead();
  return place(m.x,m.y,2);
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
   危険防御（3連・フォーク統合）
========================= */
function findThreatDefense(p){

  let best=null;
  let maxThreat=-1;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let threat=0;

      for(const [dx,dy] of DIRS){
        const {count,open} = line(x,y,dx,dy,p);

        if(count>=4) threat+=100;
        else if(count===3 && open===2) threat+=10;
      }

      board[y][x]=0;

      if(threat > maxThreat){
        maxThreat=threat;
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

      if(fork>=2){
        return {x,y};
      }
    }
  }

  return null;
}

/* =========================
   軽量2手読み（ここがコア）
========================= */
function bestMoveLookahead(){

  const moves = getMoves().slice(0,6);

  let best=null;
  let bestScore=-Infinity;

  for(const m of moves){

    board[m.y][m.x]=2;

    let score =
      evaluate(2)
      - opponentResponse(1);

    board[m.y][m.x]=0;

    if(score > bestScore){
      bestScore=score;
      best=m;
    }
  }

  return best;
}

/* =========================
   相手応手評価（1手）
========================= */
function opponentResponse(p){

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
   候補手（圧縮）
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
   手評価（軽量）
========================= */
function moveScore(m){
  let s=0;

  board[m.y][m.x]=2;

  for(const [dx,dy] of DIRS){
    const {count}=line(m.x,m.y,dx,dy,2);
    s+=count*100;
  }

  board[m.y][m.x]=0;

  return s;
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
        const {count,open}=line(x,y,dx,dy,p);

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

  playSound();
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = (p===2 ? "CPUの勝ち" : "あなたの勝ち");
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
