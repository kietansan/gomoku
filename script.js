const SIZE = 13;
const CELL = 34;
const TIME_LIMIT = 2800; // ms

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== Zobrist Hash ===== */
const zobrist = [];
for(let y=0;y<SIZE;y++){
  zobrist[y]=[];
  for(let x=0;x<SIZE;x++){
    zobrist[y][x]=[
      Math.random()*1e9|0,
      Math.random()*1e9|0
    ];
  }
}
let hash = 0;
const TT = new Map();

/* ===== 初期化 ===== */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  hash = 0;
  TT.clear();
  infoEl.textContent = "あなたの番です";
  draw();
}
window.resetGame = init;

/* ===== hash更新 ===== */
function applyHash(x,y,p){
  if(p===1) hash ^= zobrist[y][x][0];
  if(p===2) hash ^= zobrist[y][x][1];
}

/* ===== 描画 ===== */
function draw(){
  boardEl.innerHTML="";
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const d=document.createElement("div");
      d.className="cell";
      d.style.left=x*CELL+"px";
      d.style.top=y*CELL+"px";
      if(board[y][x]) d.textContent=board[y][x]===1?"●":"○";

      d.onclick=()=>{
        if(gameOver||board[y][x]) return;
        place(x,y,1);
        if(!gameOver){
          infoEl.textContent="CPU思考中...";
          setTimeout(cpuMove,10);
        }
      };
      boardEl.appendChild(d);
    }
  }
}

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;
  applyHash(x,y,p);
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent=p===1?"あなたの勝ち":"CPUの勝ち";
  }else if(p===2){
    infoEl.textContent="あなたの番です";
  }
}

/* ===== 勝利 ===== */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){
    let c=1;
    for(const d of [-1,1]){
      let nx=x+dx*d,ny=y+dy*d;
      while(board[ny]?.[nx]===p){
        c++; nx+=dx*d; ny+=dy*d;
      }
    }
    if(c>=5) return true;
  }
  return false;
}

/* ===== 危険検出 ===== */
function isDanger(x,y,p){
  board[y][x]=p;
  for(const [dx,dy] of DIRS){
    let count=1,open=0;

    let nx=x+dx,ny=y+dy;
    while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx;ny=y-dy;
    while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) open++;

    if(count>=4 || (count===3 && open===2)){
      board[y][x]=0;
      return true;
    }
  }
  board[y][x]=0;
  return false;
}

/* ===== ダブル脅威 ===== */
function countThreats(x,y,p){
  let t=0;
  board[y][x]=p;

  for(const [dx,dy] of DIRS){
    let count=1,open=0;

    let nx=x+dx,ny=y+dy;
    while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx;ny=y-dy;
    while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) open++;

    if(count>=4 || (count===3 && open===2)) t++;
  }

  board[y][x]=0;
  return t;
}

/* ===== 評価 ===== */
function evaluate(){
  let score=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const p=board[y][x];
      if(!p) continue;

      for(const [dx,dy] of DIRS){
        let count=1,open=0;

        let nx=x+dx,ny=y+dy;
        while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
        if(board[ny]?.[nx]===0) open++;

        nx=x-dx;ny=y-dy;
        while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
        if(board[ny]?.[nx]===0) open++;

        let val=0;
        if(count>=5) val=100000;
        else if(count===4&&open===2) val=20000;
        else if(count===4&&open===1) val=5000;
        else if(count===3&&open===2) val=2000;

        score += (p===2?val:-val);
      }
    }
  }
  return score;
}

/* ===== 候補 ===== */
function getMoves(){
  const list=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      let near=false;
      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]) near=true;
        }
      }
      if(!near) continue;

      list.push({x,y});
    }
  }
  return list;
}

/* ===== ミニマックス＋TT ===== */
function search(depth,alpha,beta,start){

  if(Date.now()-start > TIME_LIMIT) return evaluate();

  const key = hash+"_"+depth;
  if(TT.has(key)) return TT.get(key);

  if(depth===0){
    const v = evaluate();
    TT.set(key,v);
    return v;
  }

  const moves = getMoves();

  let best = -Infinity;

  for(let m of moves){

    board[m.y][m.x]=2;
    applyHash(m.x,m.y,2);

    const val = -search(depth-1,-beta,-alpha,start);

    board[m.y][m.x]=0;
    applyHash(m.x,m.y,2);

    if(val>best) best=val;
    if(best>alpha) alpha=best;
    if(alpha>=beta) break;
  }

  TT.set(key,best);
  return best;
}

/* ===== CPU ===== */
function cpuMove(){

  const start = Date.now();

  // 即勝ち
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      board[y][x]=2;
      if(checkWin(x,y,2)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // 即防御
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      board[y][x]=1;
      if(checkWin(x,y,1)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // ダブル脅威
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      if(countThreats(x,y,2)>=2){
        place(x,y,2);
        return;
      }
    }
  }

  // 防御
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      if(isDanger(x,y,1)){
        place(x,y,2);
        return;
      }
    }
  }

  // ★反復深化
  let best=null;
  let depth=1;

  while(Date.now()-start < TIME_LIMIT){
    let bestLocal=null;
    let bestScore=-Infinity;

    const moves = getMoves();

    for(let m of moves){

      board[m.y][m.x]=2;
      applyHash(m.x,m.y,2);

      const score = -search(depth,-Infinity,Infinity,start);

      board[m.y][m.x]=0;
      applyHash(m.x,m.y,2);

      if(score>bestScore){
        bestScore=score;
        bestLocal=m;
      }
    }

    if(bestLocal) best=bestLocal;
    depth++;
  }

  if(best){
    place(best.x,best.y,2);
  }
}

init();
