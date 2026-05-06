const SIZE = 13;
const GRID = 12;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let audio;
let gameOver = false;

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

  setInfo("あなたの番です");
  draw();
};

/* =========================
   UI
========================= */
function setInfo(text){
  document.getElementById("info").textContent = text;
}

/* =========================
   木目（軽量化）
========================= */
function drawWood(){

  const w = canvas.width;
  const h = canvas.height;

  const img = ctx.createImageData(w,h);
  const d = img.data;

  for(let i=0;i<d.length;i+=4){

    const grain = Math.random()*20;

    const base = 200 + grain;

    d[i]=base;
    d[i+1]=170;
    d[i+2]=110;
    d[i+3]=255;
  }

  ctx.putImageData(img,0,0);
}

/* =========================
   描画
========================= */
function draw(){

  drawWood();

  ctx.strokeStyle="#333";
  ctx.lineWidth=1;

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(MARGIN+i*CELL,MARGIN);
    ctx.lineTo(MARGIN+i*CELL,MARGIN+GRID*CELL);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN,MARGIN+i*CELL);
    ctx.lineTo(MARGIN+GRID*CELL,MARGIN+i*CELL);
    ctx.stroke();
  }

  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(MARGIN+x*CELL,MARGIN+y*CELL,3,0,Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) drawStone(x,y,board[y][x]);
    }
  }
}

/* =========================
   石
========================= */
function drawStone(x,y,color){

  const cx=MARGIN+x*CELL;
  const cy=MARGIN+y*CELL;

  const g=ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,16);

  if(color===1){
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
   クリック
========================= */
document.addEventListener("click",(e)=>{

  if(gameOver) return;

  const rect=canvas.getBoundingClientRect();

  const x=Math.round((e.clientX-rect.left-MARGIN)/CELL);
  const y=Math.round((e.clientY-rect.top-MARGIN)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  setInfo("CPU思考中...");

  board[y][x]=1;

  draw();
  playSound();

  if(checkWin(x,y,1)){
    setInfo("あなたの勝ち！");
    gameOver=true;
    return;
  }

  setTimeout(cpuMove,50);
});

/* =========================
   CPU（軽量正規化AI）
========================= */
function cpuMove(){

  if(gameOver) return;

  let move;

  // ① 即勝ち
  move = findWinningMove(2);
  if(move) return place(move.x,move.y,2);

  // ② 即死防御
  move = findWinningMove(1);
  if(move) return place(move.x,move.y,2);

  // ③ 候補生成
  let candidates = generateMoves();

  let best=null;
  let bestScore=-99999;

  // ⑦ 軽量3手読み（制限付き）
  for(let i=0;i<candidates.length;i++){

    const m=candidates[i];

    board[m.y][m.x]=2;

    const score=lightSearch(1,2,false);

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }

    if(i>15) break; // ★重要：爆発防止
  }

  if(best) place(best.x,best.y,2);

  setInfo("あなたの番です");
}

/* =========================
   軽量探索（2手読み）
========================= */
function lightSearch(depth,maxDepth,isHuman){

  if(depth===maxDepth) return evaluate();

  const player=isHuman?1:2;

  const moves=generateMoves().slice(0,10);

  let best=isHuman?99999:-99999;

  for(const m of moves){

    board[m.y][m.x]=player;

    const val=lightSearch(depth+1,maxDepth,!isHuman);

    board[m.y][m.x]=0;

    if(isHuman) best=Math.min(best,val);
    else best=Math.max(best,val);
  }

  return best;
}

/* =========================
   候補生成（超制限）
========================= */
function generateMoves(){

  const list=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      if(hasNeighbor(x,y)){
        list.push({x,y});
      }
    }
  }

  return list.slice(0,20);
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
   評価（軽量）
========================= */
function evaluate(){

  let s=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===2) s++;
      if(board[y][x]===1) s--;
    }
  }

  return s;
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
   勝ち手
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

  if(checkWin(x,y,p)){
    gameOver=true;
    setInfo(p===1?"あなたの勝ち！":"CPUの勝ち！");
  }
}

/* =========================
   音
========================= */
function playSound(){

  if(!audio) return;

  audio.pause();
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
