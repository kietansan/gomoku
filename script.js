const SIZE = 13;
const GRID = 12;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;

const WOOD = "#d8b56a";

/* 星の位置（13路） */
const HOSHI = [
  [3,3],[3,9],
  [9,3],[9,9],
  [6,6]
];

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  canvas.width = GRID * CELL + MARGIN * 2;
  canvas.height = GRID * CELL + MARGIN * 2;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  draw();
};

/* 描画 */
function draw(){

  // 背景
  ctx.fillStyle = WOOD;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // 線
  ctx.strokeStyle = "#333";

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

  // ★ 星（5点のみ）
  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(
      MARGIN + x*CELL,
      MARGIN + y*CELL,
      3,0,Math.PI*2
    );

    ctx.fillStyle = "#222";
    ctx.fill();
  }

  // 石
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      ctx.beginPath();
      ctx.arc(
        MARGIN + x*CELL,
        MARGIN + y*CELL,
        14,0,Math.PI*2
      );

      ctx.fillStyle = board[y][x]===1 ? "#000" : "#fff";
      ctx.fill();
    }
  }
}

/* クリック */
document.addEventListener("click",(e)=>{

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX - rect.left - MARGIN) / CELL);
  const y = Math.round((e.clientY - rect.top - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;

  board[y][x]=1;
  draw();
});
