const SIZE = 13;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let gameOver = false;
let turn = 1; // 1=人間 2=CPU
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

  canvas.width = (SIZE - 1) * CELL + MARGIN * 2;
  canvas.height = (SIZE - 1) * CELL + MARGIN * 2;

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
   人間ターン
========================= */
document.addEventListener("click",(e)=>{

  if(gameOver) return;
  if(turn !== 1) return;

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

  turn = 2;
  setInfo("CPU思考中...");

  setTimeout(cpuMove, 10); // ★超軽量
});

/* =========================
   CPU（軽量・安定版）
========================= */
function cpuMove(){

  if(gameOver) return;

  let move;

  // ① 即勝ち（周囲だけ）
  move = findWinFast(2);
  if(move) return place(move,2);

  // ② 即防御（周囲だけ）
  move = findWinFast(1);
  if(move) return place(move,2);

  // ③ 軽量ランダム
  move = randomMove();
  place(move,2);

  turn = 1;
  setInfo("あなたの番です");
}

/* =========================
   ★高速版勝ちチェック（周囲限定）
========================= */
function findWinFast(p){

  const candidates = getCandidates();

  for(const pos of candidates){

    board[pos.y][pos.x]=p;

    if(checkWin(pos.x,pos.y,p)){
      board[pos.y][pos.x]=0;
      return pos;
    }

    board[pos.y][pos.x]=0;
  }

  return null;
}

/* =========================
   候補生成（周囲だけ）
========================= */
function getCandidates(){

  const list = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      if(hasNeighbor(x,y)){
        list.push({x,y});
      }
    }
  }

  return list;
}

/* =========================
   近傍チェック（軽量の核）
========================= */
function hasNeighbor(x,y){

  for(let dy=-1;dy<=1;dy++){
    for(let dx=-1;dx<=1;dx++){

      if(board[y+dy]?.[x+dx]) return true;
    }
  }

  return false;
}

/* =========================
   ランダム
========================= */
function randomMove(){

  const list = getCandidates();

  return list[Math.floor(Math.random()*list.length)];
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

/* =========================
   リセット
========================= */
window.resetGame=()=>{

  board=Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  gameOver=false;
  turn=1;

  setInfo("あなたの番です");
  draw();
};
