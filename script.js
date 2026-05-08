const SIZE = 13;
const CELL = 40;
const MARGIN = 40;

let canvas, ctx;
let board = [];

let current = 1;
let gameOver = false;

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", click);
};

/* =========================
   クリック（CSS縮小前提でOK）
========================= */
function click(e){

  if(gameOver || current !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const scaleX = 520 / rect.width;
  const scaleY = 520 / rect.height;

  const x = Math.floor((mx * scaleX - MARGIN) / CELL);
  const y = Math.floor((my * scaleY - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x] = 1;
  draw();

  playSound();

  current = 2;
  setTimeout(cpuTurn,200);
}

/* =========================
   CPU
========================= */
function cpuTurn(){

  const move = cpuMove(board);

  if(!move){
    current = 1;
    return;
  }

  board[move.y][move.x] = 2;
  draw();

  playSound();

  current = 1;
}

/* =========================
   描画
========================= */
function draw(){

  ctx.clearRect(0,0,520,520);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,520,520);

  const boardSize = CELL * (SIZE - 1);

  ctx.strokeStyle = "#333";

  for(let i=0;i<SIZE;i++){

    const p = MARGIN + i * CELL;

    ctx.beginPath();
    ctx.moveTo(p,MARGIN);
    ctx.lineTo(p,MARGIN + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN,p);
    ctx.lineTo(MARGIN + boardSize,p);
    ctx.stroke();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      ctx.beginPath();
      ctx.arc(
        MARGIN + x*CELL,
        MARGIN + y*CELL,
        14,0,Math.PI*2
      );

      ctx.fillStyle = board[y][x] === 1 ? "#000" : "#fff";
      ctx.fill();
    }
  }
}

/* =========================
   音
========================= */
function playSound(){

  const a = document.getElementById("putSound");
  if(!a) return;

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

  current = 1;
  gameOver = false;

  draw();
}
