const SIZE = 13;
const BASE = 520;

let canvas, ctx;
let board = [];

let CELL, MARGIN;

let gameOver = false;
let animating = false;
let current = 1;

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  resize();

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", click);

  window.addEventListener("resize", () => {
    resize();
    draw();
  });
};

/* =========================
   座標統一（最重要）
========================= */
function resize(){

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;

  canvas.width = size;
  canvas.height = size;

  const scale = size / BASE;

  CELL = 40 * scale;
  MARGIN = 40 * scale;
}

/* =========================
   クリック（完全安定版）
========================= */
function click(e){

  if(gameOver || animating) return;
  if(current !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  const x = Math.floor((mx - MARGIN) / CELL);
  const y = Math.floor((my - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  applyMove(x,y,1);
}

/* =========================
   手の処理（必ずここを通る）
========================= */
function applyMove(x,y,player){

  board[y][x] = player;

  playSound();

  draw();

  if(checkWin(player)){
    gameOver = true;
    alert(player===1?"あなたの勝ち":"CPUの勝ち");
    return;
  }

  current = player === 1 ? 2 : 1;

  if(current === 2){
    setTimeout(cpuTurn,200);
  }
}

/* =========================
   CPU
========================= */
function cpuTurn(){

  if(gameOver) return;

  const move = cpuMove(board);

  if(!move){
    current = 1;
    return;
  }

  applyMove(move.x, move.y, 2);
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
   描画
========================= */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#333";

  const boardSize = CELL * (SIZE - 1);

  for(let i=0;i<SIZE;i++){

    const pos = MARGIN + i * CELL;

    ctx.beginPath();
    ctx.moveTo(pos, MARGIN);
    ctx.lineTo(pos, MARGIN + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, pos);
    ctx.lineTo(MARGIN + boardSize, pos);
    ctx.stroke();
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
function drawStone(x,y,p){

  const cx = MARGIN + x * CELL;
  const cy = MARGIN + y * CELL;

  ctx.beginPath();
  ctx.arc(cx,cy,CELL*0.4,0,Math.PI*2);

  ctx.fillStyle = p===1 ? "#000" : "#fff";
  ctx.fill();
}

/* =========================
   音（確実版）
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

  gameOver = false;
  current = 1;

  draw();
}
