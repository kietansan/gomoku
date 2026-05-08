const SIZE = 13;
const GRID = 12;

let canvas, ctx;
let board = [];

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
   canvasレスポンシブ化
========================= */
function resizeCanvas(){

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;

  canvas.width = size;
  canvas.height = size;
}

/* =========================
   クリック
========================= */
function onClickBoard(e){

  if(gameOver || isCpuThinking) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX / (canvas.width / SIZE));
  const y = Math.floor((e.clientY - rect.top) * scaleY / (canvas.height / SIZE));

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
function checkWin(player){

  const DIR = [[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== player) continue;

      for(const [dx,dy] of DIR){

        let count = 1;

        for(let i=1;i<5;i++){

          const nx = x + dx*i;
          const ny = y + dy*i;

          if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
          if(board[ny][nx] !== player) break;

          count++;
        }

        if(count >= 5) return true;
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

  const cell = canvas.width / SIZE;

  ctx.strokeStyle = "#333";

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(cell*i,0);
    ctx.lineTo(cell*i,canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,cell*i);
    ctx.lineTo(canvas.width,cell*i);
    ctx.stroke();
  }

  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(x*cell, y*cell, 3,0,Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]){
        drawStone(x,y,board[y][x],cell);
      }
    }
  }
}

/* =========================
   石
========================= */
function drawStone(x,y,color,cell){

  const cx = x*cell;
  const cy = y*cell;

  ctx.beginPath();
  ctx.arc(cx,cy,cell*0.4,0,Math.PI*2);

  ctx.fillStyle = color===1 ? "#000" : "#fff";
  ctx.fill();

  ctx.strokeStyle="rgba(0,0,0,0.3)";
  ctx.stroke();
}

/* =========================
   音
========================= */
function playSound(){
  const audio = document.getElementById("putSound");
  audio.currentTime = 0;
  audio.play().catch(()=>{});
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
