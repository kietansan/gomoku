const SIZE = 13;   // 交点
const GRID = 12;   // マス
const CELL = 40;

let board = [];

let canvas, ctx, info;

/* ===== 初期化（超重要：DOM待ち） ===== */
window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");
  info = document.getElementById("info");

  canvas.width = GRID * CELL;
  canvas.height = GRID * CELL;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  draw();
};

/* ===== 描画（最小安定版） ===== */
function draw(){

  // 背景
  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // 線
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(i*CELL,0);
    ctx.lineTo(i*CELL,canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*CELL);
    ctx.lineTo(canvas.width,i*CELL);
    ctx.stroke();
  }
}

/* ===== クリック（必ず動く版） ===== */
document.addEventListener("click",(e)=>{

  if(!canvas) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX-rect.left)/CELL);
  const y = Math.round((e.clientY-rect.top)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;

  board[y][x]=1;
  drawStone(x,y);
});

/* ===== 石描画 ===== */
function drawStone(x,y){

  ctx.beginPath();
  ctx.arc(x*CELL,y*CELL,14,0,Math.PI*2);
  ctx.fillStyle="#000";
  ctx.fill();
}

/* ===== リセット ===== */
function resetGame(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  draw();
}
