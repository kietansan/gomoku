const SIZE = 13;

let canvas, ctx;
let board = [];

const MARGIN = 40; // 固定でOK（重要）

let CELL;

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  resize();

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", click);
  window.addEventListener("resize", resize);
};

/* =========================
   超重要：完全一致化
========================= */
function resize(){

  // ★これが最重要ポイント
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;

  canvas.width = size;
  canvas.height = size;

  CELL = (size - MARGIN * 2) / (SIZE - 1);
}

/* =========================
   クリック（補正不要）
========================= */
function click(e){

  const rect = canvas.getBoundingClientRect();

  const x = Math.round(
    (e.clientX - rect.left - MARGIN) / CELL
  );

  const y = Math.round(
    (e.clientY - rect.top - MARGIN) / CELL
  );

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x] = 1;

  draw();
}

/* =========================
   描画（右下欠け完全防止）
========================= */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  for(let i=0;i<SIZE;i++){

    const pos = MARGIN + i * CELL;

    ctx.beginPath();
    ctx.moveTo(pos, MARGIN);
    ctx.lineTo(pos, MARGIN + CELL*(SIZE-1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, pos);
    ctx.lineTo(MARGIN + CELL*(SIZE-1), pos);
    ctx.stroke();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]){
        drawStone(x,y);
      }
    }
  }
}

function drawStone(x,y){

  const cx = MARGIN + x * CELL;
  const cy = MARGIN + y * CELL;

  ctx.beginPath();
  ctx.arc(cx,cy,CELL*0.4,0,Math.PI*2);

  ctx.fillStyle = "black";
  ctx.fill();
}

/* =========================
   リセット
========================= */
window.resetGame = () => {

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();
};
