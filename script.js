const SIZE = 13;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let gameOver = false;
let audio;

const HOSHI = [
  [3,3],[3,9],
  [9,3],[9,9],
  [6,6]
];

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");
  audio = document.getElementById("putSound");

  canvas.width = SIZE * CELL;
  canvas.height = SIZE * CELL;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  setInfo("あなたの番です");
  draw();
};

function setInfo(t){
  document.getElementById("info").textContent = t;
}

/* =========================
   描画
========================= */
function draw(){

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#333";

  for(let i=0;i<SIZE;i++){
    ctx.beginPath();
    ctx.moveTo(MARGIN+i*CELL, MARGIN);
    ctx.lineTo(MARGIN+i*CELL, MARGIN+(SIZE-1)*CELL);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN+i*CELL);
    ctx.lineTo(MARGIN+(SIZE-1)*CELL, MARGIN+i*CELL);
    ctx.stroke();
  }

  for(const [x,y] of HOSHI){
    ctx.beginPath();
    ctx.arc(MARGIN+x*CELL, MARGIN+y*CELL, 3, 0, Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) drawStone(x,y,board[y][x]);
    }
  }
}

function drawStone(x,y,p){

  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;

  const g = ctx.createRadialGradient(cx-3,cy-3,2,cx,cy,14);

  if(p===1){
    g.addColorStop(0,"#666");
    g.addColorStop(1,"#000");
  }else{
    g.addColorStop(0,"#fff");
    g.addColorStop(1,"#aaa");
  }

  ctx.beginPath();
  ctx.arc(cx,cy,14,0,Math.PI*2);
  ctx.fillStyle=g;
  ctx.fill();
}

/* =========================
   入力
========================= */
document.addEventListener("click",(e)=>{

  if(gameOver) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX-rect.left-MARGIN)/CELL);
  const y = Math.round((e.clientY-rect.top-MARGIN)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x]=1;

  draw();
  playSound();

  if(checkWin(x,y,1)){
    gameOver=true;
    setInfo("あなたの勝ち！");
    return;
  }

  setInfo("CPU思考中...");
  setTimeout(cpuMove,50);
});

/* =========================
   CPU（完全シンプル版）
========================= */
function cpuMove(){

  if(gameOver) return;

  // ① 即勝ち
  let move = findWin(2);
  if(move) return place(move,2);

  // ② 即負け防御
  move = findWin(1);
  if(move) return place(move,2);

  // ③ ランダム＋隣接
  move = findRandomMove();
  place(move,2);

  setInfo("あなたの番です");
}

/* =========================
   勝ち手探索
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
   ランダム（近く優先）
========================= */
function findRandomMove(){

  const list=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      if(hasNeighbor(x,y)){
        list.push({x,y});
      }
    }
  }

  return list[Math.floor(Math.random()*list.length)];
}

function hasNeighbor(x,y){

  for(let dy=-1;dy<=1;dy++){
    for(let dx=-1;dx<=1;dx++){

      if(board[y+dy]?.[x+dx]) return true;
    }
  }

  return false;
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  const d=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of d){

    let c=1;

    for(let i=1;i<5;i++){
      if(board[y+dy*i]?.[x+dx*i]===p) c++;
      else break;
    }

    for(let i=1;i<5;i++){
      if(board[y-dy*i]?.[x-dx*i]===p) c++;
      else break;
    }

    if(c>=5) return true;
  }

  return false;
}

/* =========================
   置く
========================= */
function place(pos,p){

  board[pos.y][pos.x]=p;
  draw();

  if(checkWin(pos.x,pos.y,p)){
    gameOver=true;
    setInfo(p===1?"あなたの勝ち！":"CPUの勝ち！");
  }
}

/* =========================
   音
========================= */
function playSound(){
  if(!audio) return;
  audio.currentTime=0;
  audio.play().catch(()=>{});
}

/* リセット */
window.resetGame=()=>{

  board=Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  gameOver=false;

  setInfo("あなたの番です");
  draw();
};
