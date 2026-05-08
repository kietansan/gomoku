const SIZE = 13;
const BASE = 520;

let canvas, ctx;
let board = [];

let CELL, MARGIN, scale;

let gameOver = false;
let isCpuThinking = false;

const HOSHI = [
  [3,3],[3,9],
  [9,3],[9,9],
  [6,6]
];

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  resizeCanvas();

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", onClickBoard);

  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });
};

/* =========================
   重要：完全スケール統一
========================= */
function resizeCanvas(){

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;

  canvas.width = size;
  canvas.height = size;

  scale = size / BASE;

  CELL = 40 * scale;
  MARGIN = 40 * scale;
}

/* =========================
   クリック（完全補正）
========================= */
function onClickBoard(e){

  if(gameOver || isCpuThinking) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor(
    ((e.clientX - rect.left) * scaleX - MARGIN) / CELL
  );

  const y = Math.floor(
    ((e.clientY - rect.top) * scaleY - MARGIN) / CELL
  );

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x] = 1;

  draw();
  playSound();

  if(checkWin(1)){
    alert("あなたの勝ち！");
    gameOver = true;
    return;
  }

  cpuTurn();
}

/* =========================
   CPU
========================= */
function cpuTurn(){

  isCpuThinking = true;

  setTimeout(()=>{

    const move = cpuMove(board);

    if(!move){
      isCpuThinking = false;
      return;
    }

    board[move.y][move.x] = 2;

    draw();
    playSound();

    if(checkWin(2)){
      alert("CPUの勝ち！");
      gameOver = true;
      return;
    }

    isCpuThinking = false;

  },300);
}

/* =========================
   勝利判定
========================= */
function checkWin(p){

  const DIR = [[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== p) continue;

      for(const [dx,dy] of DIR){

        let c = 1;

        for(let i=1;i<5;i++){

          const nx = x + dx*i;
          const ny = y + dy*i;

          if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
          if(board[ny][nx] !== p) break;

          c++;
        }

        if(c >= 5) return true;
      }
    }
  }

  return false;
}

/* =========================
   描画（碁盤完全復活）
========================= */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1 * scale;

  const boardSize = CELL * (SIZE - 1);

  for(let i=0;i<SIZE;i++){

    const pos = MARGIN + i*CELL;

    ctx.beginPath();
    ctx.moveTo(pos, MARGIN);
    ctx.lineTo(pos, MARGIN + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, pos);
    ctx.lineTo(MARGIN + boardSize, pos);
    ctx.stroke();
  }

  const starR = 3 * scale;

  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(
      MARGIN + x*CELL,
      MARGIN + y*CELL,
      starR,
      0,
      Math.PI*2
    );
    ctx.fillStyle = "#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]){
        drawStone(x,y,board[y][x]);
      }
    }
  }
}

/* =========================
   石
========================= */
function drawStone(x,y,color){

  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;

  const r = CELL * 0.4;

  const grad = ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,r);

  if(color===1){
    grad.addColorStop(0,"#666");
    grad.addColorStop(1,"#000");
  }else{
    grad.addColorStop(0,"#fff");
    grad.addColorStop(1,"#aaa");
  }

  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle="rgba(0,0,0,0.3)";
  ctx.stroke();
}

/* =========================
   音
========================= */
function playSound(){
  const a = document.getElementById("putSound");
  a.currentTime = 0;
  a.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
function resetGame(){

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  gameOver = false;
  isCpuThinking = false;

  draw();
}
