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
   CPU
========================= */
function cpuMove(){

  if(gameOver) return;

  // ① 即勝ち
  let move = findWin(2);
  if(move) return place(move,2);

  // ② 即負け防御
  move = findWin(1);
  if(move) return place(move,2);

  // ③ ★3連防御（復活：両端なし対応）
  move = findOpenThreeBlock(1);
  if(move) return place(move,2);

  // ④ ランダム（軽量）
  move = randomMove();
  place(move,2);

  setInfo("あなたの番です");
}

/* =========================
   ★3連検出＆防御（本体）
   ●●●・ / ・●●●・ を検出
========================= */
function findOpenThree(player){

  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== player) continue;

      for(const [dx,dy] of dirs){

        let count = 1;
        let openEnds = 0;

        // 正方向
        let i=1;
        while(board[y+dy*i]?.[x+dx*i]===player){
          count++; i++;
        }
        if(board[y+dy*i]?.[x+dx*i]===0) openEnds++;

        // 逆方向
        i=1;
        while(board[y-dy*i]?.[x-dx*i]===player){
          count++; i++;
        }
        if(board[y-dy*i]?.[x-dx*i]===0) openEnds++;

        // ★3連＋片側以上空き（両端なし含む）
        if(count===3 && openEnds>=1){
          return findBlockAtLine(x,y,dx,dy);
        }
      }
    }
  }

  return null;
}

/* =========================
   そのライン上の防御手を探す
========================= */
function findBlockAtLine(x,y,dx,dy){

  for(let i=-3;i<=3;i++){

    const nx = x + dx*i;
    const ny = y + dy*i;

    if(board[ny]?.[nx]===0){
      return {x:nx,y:ny};
    }
  }

  return null;
}

/* =========================
   勝ち手
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
   ランダム
========================= */
function randomMove(){

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

/* 音 */
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
