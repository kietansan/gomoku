const SIZE = 13;   // 交点
const GRID = 12;   // 盤マス
const CELL = 40;

const MARGIN = 40; // ★これが余白

let board = [];

let canvas, ctx;

/* 初期化 */
window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  // ★余白込みサイズ
  canvas.width = GRID * CELL + MARGIN * 2;
  canvas.height = GRID * CELL + MARGIN * 2;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  draw();
};

/* 描画 */
function draw(){

  // ======================
  // ① 外側余白（木）
  // ======================
  ctx.fillStyle = "#caa46a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // ======================
  // ② 内側盤（12×12）
  // ======================
  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(MARGIN,MARGIN,GRID*CELL,GRID*CELL);

  // ======================
  // ③ 線（盤の中だけ）
  // ======================
  ctx.strokeStyle = "#333";

  for(let i=0;i<SIZE;i++){

    // 縦
    ctx.beginPath();
    ctx.moveTo(MARGIN + i*CELL, MARGIN);
    ctx.lineTo(MARGIN + i*CELL, MARGIN + GRID*CELL);
    ctx.stroke();

    // 横
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + i*CELL);
    ctx.lineTo(MARGIN + GRID*CELL, MARGIN + i*CELL);
    ctx.stroke();
  }
}

/* クリック */
document.addEventListener("click",(e)=>{

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX - rect.left - MARGIN) / CELL);
  const y = Math.round((e.clientY - rect.top - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;

  board[y][x]=1;

  drawStone(x,y);
});

/* 石 */
function drawStone(x,y){

  ctx.beginPath();
  ctx.arc(
    MARGIN + x*CELL,
    MARGIN + y*CELL,
    14,0,Math.PI*2
  );

  ctx.fillStyle="#000";
  ctx.fill();
}
