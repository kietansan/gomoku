const SIZE = 13;
const GRID = 12;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let audio;

let gameOver = false;
let isCpuThinking = false;

const WOOD = "#d8b56a";

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

  canvas.addEventListener("click", onClickBoard);
};

/* =========================
   クリック
========================= */
function onClickBoard(e){

  if(gameOver || isCpuThinking) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left - MARGIN + CELL/2) / CELL);
  const y = Math.floor((e.clientY - rect.top - MARGIN + CELL/2) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x] = 1;

  draw();
  playSound();

  if(checkWin(1)){
    endGame("あなたの勝ち！");
    return;
  }

  cpuTurn();
}

/* =========================
   CPUターン
========================= */
function cpuTurn(){

  isCpuThinking = true;
  setInfo("CPU思考中...");

  setTimeout(() => {

    let x,y;

    do {
      x = Math.floor(Math.random()*SIZE);
      y = Math.floor(Math.random()*SIZE);
    } while(board[y][x] !== 0);

    board[y][x] = 2;

    draw();
    playSound();

    if(checkWin(2)){
      endGame("CPUの勝ち！");
      return;
    }

    isCpuThinking = false;
    setInfo("あなたの番です");

  }, 300);
}

/* =========================
   勝敗判定（5連）
========================= */
function checkWin(player){

  const DIR = [
    [1,0],[0,1],[1,1],[1,-1]
  ];

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
   終了
========================= */
function endGame(text){

  gameOver = true;
  setInfo(text);
}

/* =========================
   描画
========================= */
function draw(){

  ctx.fillStyle = WOOD;
  ctx.fillRect(0,0,canvas.width,canvas.height);

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

  for(const [x,y] of HOSHI){

    ctx.beginPath();
    ctx.arc(MARGIN + x*CELL, MARGIN + y*CELL, 3,0,Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) drawStone(x,y,board[y][x]);
    }
  }
}

/* =========================
   石
========================= */
function drawStone(x,y,color){

  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;

  const grad = ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,16);

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
   UI
========================= */
function setInfo(text){
  document.getElementById("info").innerText = text;
}

/* =========================
   音
========================= */
function playSound(){

  if(!audio) return;

  audio.currentTime = 0;
  audio.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
window.resetGame = () => {

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  isCpuThinking = false;

  setInfo("あなたの番です");

  draw();
};
