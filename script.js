const SIZE = 13;
const CELL = 40;

let board = [];
let gameOver = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){
  canvas.width = CELL*(SIZE-1);
  canvas.height = CELL*(SIZE-1);

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;

  infoEl.textContent = "あなたの番です";

  draw();
}
window.resetGame = init;

/* ===== 星 ===== */
function isStar(x,y){
  return (
    (x===3&&y===3)||(x===3&&y===9)||
    (x===9&&y===3)||(x===9&&y===9)||
    (x===6&&y===6)
  );
}

/* ===== 描画 ===== */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#333";
  ctx.lineWidth=1;

  for(let i=0;i<SIZE;i++){
    ctx.beginPath();
    ctx.moveTo(i*CELL,0);
    ctx.lineTo(i*CELL,CELL*(SIZE-1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*CELL);
    ctx.lineTo(CELL*(SIZE-1),i*CELL);
    ctx.stroke();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(isStar(x,y)){
        ctx.fillStyle="#111";
        ctx.beginPath();
        ctx.arc(x*CELL,y*CELL,4,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===0) continue;

      ctx.beginPath();
      ctx.arc(x*CELL,y*CELL,14,0,Math.PI*2);

      if(board[y][x]===1){
        ctx.fillStyle="#000";
      }else{
        ctx.fillStyle="#fff";
        ctx.strokeStyle="#000";
        ctx.lineWidth=2;
        ctx.stroke();
      }

      ctx.fill();
    }
  }
}

/* ===== クリック ===== */
canvas.onclick = (e)=>{

  if(gameOver) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX-rect.left)/CELL);
  const y = Math.round((e.clientY-rect.top)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  place(x,y,1);

  if(!gameOver){
    infoEl.textContent="CPU思考中...";
    setTimeout(cpuMove,10);
  }
};

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;

  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }
}

/* ===== 勝利判定 ===== */
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

/* ===== 脅威判定（副作用なし） ===== */
function threatCount(x,y,p){

  let t=0;

  for(const [dx,dy] of DIRS){

    let c=1,o=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){c++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) o++;

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){c++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) o++;

    if(c>=4 || (c===3 && o>=2)) t++;
  }

  return t;
}

/* ===== 評価 ===== */
function evalPos(x,y,p){

  let s=0;

  for(const [dx,dy] of DIRS){

    let c=1,o=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){c++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) o++;

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){c++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) o++;

    if(c>=5) s+=100000;
    else if(c===4&&o===2) s+=20000;
    else if(c===4&&o===1) s+=5000;
    else if(c===3&&o===2) s+=2000;
    else if(c===2&&o===2) s+=500;
  }

  return s;
}

/* ===== 候補手 ===== */
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

      const score =
        evalPos(x,y,2)*1.2 +
        evalPos(x,y,1);

      list.push({x,y,score});
    }
  }

  list.sort((a,b)=>b.score-a.score);
  return list.slice(0,10);
}

/* ===== CPU ===== */
function cpuMove(){

  // ① 即勝ち
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

  // ② 即防御（修正済み）
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=1;
      const danger = checkWin(x,y,1);
      board[y][x]=0;

      if(danger){
        place(x,y,2);
        return;
      }
    }
  }

  // ③ ダブル脅威
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(threatCount(x,y,2)>=2){
        place(x,y,2);
        return;
      }
    }
  }

  // ④ 相手脅威回避
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(threatCount(x,y,1)>=2){
        place(x,y,2);
        return;
      }
    }
  }

  // ⑤ 評価選択
  const moves=getMoves();

  let best=moves[0];
  let bestScore=-Infinity;

  for(const m of moves){

    board[m.y][m.x]=2;

    let score =
      evalPos(m.x,m.y,2)*1.3 -
      evalPos(m.x,m.y,1)*1.0;

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  place(best.x,best.y,2);
}

init();
