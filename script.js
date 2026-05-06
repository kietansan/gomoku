const SIZE = 13;
const GRID = 12;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
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

  canvas.width = GRID * CELL + MARGIN * 2;
  canvas.height = GRID * CELL + MARGIN * 2;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  draw();
};

/* =========================
   木目
========================= */
function drawWood(){

  const w = canvas.width;
  const h = canvas.height;

  const img = ctx.createImageData(w,h);
  const d = img.data;

  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){

      const grain =
        Math.sin(x*0.08)*10 +
        Math.sin(x*0.02)*20 +
        (Math.random()-0.5)*4;

      let base = 216 + grain;

      const i = (y*w + x)*4;

      d[i]   = base;
      d[i+1] = 180;
      d[i+2] = 106;
      d[i+3] = 255;
    }
  }

  ctx.putImageData(img,0,0);
}

/* =========================
   描画
========================= */
function draw(){

  drawWood();

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(MARGIN + i*CELL, MARGIN);
    ctx.lineTo(MARGIN + i*CELL, MARGIN + GRID*CELL);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + i*CELL);
    ctx.lineTo(MARGIN + GRID*CELL, MARGIN + i*CELL);
    ctx.stroke();
  }

  // 星
  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(
      MARGIN + x*CELL,
      MARGIN + y*CELL,
      3,0,Math.PI*2
    );

    ctx.fillStyle="#222";
    ctx.fill();
  }

  // 石
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      drawStone(x,y,board[y][x]);
    }
  }
}

/* =========================
   石
========================= */
function drawStone(x,y,color){

  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;

  const grad = ctx.createRadialGradient(
    cx-4,cy-4,2,
    cx,cy,16
  );

  if(color===1){
    grad.addColorStop(0,"#666");
    grad.addColorStop(0.3,"#111");
    grad.addColorStop(1,"#000");
  }else{
    grad.addColorStop(0,"#fff");
    grad.addColorStop(0.7,"#ddd");
    grad.addColorStop(1,"#aaa");
  }

  ctx.beginPath();
  ctx.arc(cx,cy,14,0,Math.PI*2);

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle="rgba(0,0,0,0.3)";
  ctx.stroke();
}

/* =========================
   クリック（人間）
========================= */
document.addEventListener("click",(e)=>{

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX - rect.left - MARGIN) / CELL);
  const y = Math.round((e.clientY - rect.top - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;

  if(board[y][x]) return;

  board[y][x]=1;

  draw();
  playSound();

  setTimeout(cpuMove, 200);
});

/* =========================
   音
========================= */
function playSound(){

  if(!audio) return;

  audio.pause();
  audio.currentTime = 0;

  audio.play().catch(()=>{});
}

/* =========================
   NPC AI（正規化）
========================= */
function cpuMove(){

  let move = findWinningMove(2);
  if(move) return place(move.x,move.y,2);

  move = findWinningMove(1);
  if(move) return place(move.x,move.y,2);

  move = findOpenThreeBlock();
  if(move) return place(move.x,move.y,2);

  move = findDoubleThreat(2);
  if(move) return place(move.x,move.y,2);

  move = findDoubleThreat(1);
  if(move) return place(move.x,move.y,2);

  const candidates = generateMoves();

  let best = null;
  let bestScore = -Infinity;

  for(const m of candidates){

    board[m.y][m.x] = 2;

    const score = search(1,3,false);

    board[m.y][m.x] = 0;

    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  if(best) place(best.x,best.y,2);
}

/* =========================
   3手読み
========================= */
function search(depth,maxDepth,isHuman){

  if(depth===maxDepth) return evaluate();

  const player = isHuman?1:2;
  const moves = generateMoves();

  let best = isHuman?Infinity:-Infinity;

  for(const m of moves){

    board[m.y][m.x]=player;

    const val = search(depth+1,maxDepth,!isHuman);

    board[m.y][m.x]=0;

    if(isHuman) best = Math.min(best,val);
    else best = Math.max(best,val);
  }

  return best;
}

/* =========================
   候補生成
========================= */
function generateMoves(){

  const list = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      if(hasNeighbor(x,y)){
        list.push({x,y});
      }
    }
  }

  return list.length?list:[{x:6,y:6}];
}

/* =========================
   近傍
========================= */
function hasNeighbor(x,y){

  for(let dy=-2;dy<=2;dy++){
    for(let dx=-2;dx<=2;dx++){

      if(board[y+dy]?.[x+dx]) return true;
    }
  }

  return false;
}

/* =========================
   評価
========================= */
function evaluate(){

  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===2) score++;
      if(board[y][x]===1) score--;
    }
  }

  return score;
}

/* =========================
   勝ち手（簡易）
========================= */
function findWinningMove(p){

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
   置く
========================= */
function place(x,y,p){

  board[y][x]=p;

  draw();

  if(p===2) playSound();
}

/* =========================
   仮（未実装部分ダミー）
========================= */
function findOpenThreeBlock(){ return null; }
function findDoubleThreat(){ return null; }
function checkWin(){ return false; }

/* リセット */
window.resetGame = () => {

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  draw();
};
