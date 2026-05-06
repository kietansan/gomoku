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
   木目背景（安定版）
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
   全描画
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
   リアル石
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
   クリック
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
});

/* =========================
   音（完全安定版）
========================= */
function playSound(){

  if(!audio){
    console.log("audio未取得");
    return;
  }

  audio.pause();
  audio.currentTime = 0;

  const p = audio.play();

  if(p !== undefined){
    p.catch(err=>{
      console.log("音再生失敗:", err);
    });
  }
}

/* リセット */
window.resetGame = () => {

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  draw();
};
