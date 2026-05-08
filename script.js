const SIZE = 13;
const CELL = 40;
const MARGIN = 40;
const BASE = 520;

let canvas, ctx;
let board = [];
let gameOver = false;
let current = 1;

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
   クリック（ここだけ補正）
========================= */
function click(e){

  if(gameOver || current !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = BASE / rect.width;
  const scaleY = BASE / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  const x = Math.floor((mx - MARGIN) / CELL);
  const y = Math.floor((my - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  applyMove(x,y,1);
}

/* =========================
   手
========================= */
function applyMove(x,y,p){

  board[y][x] = p;

  playSound();
  draw();

  if(checkWin(p)){
    gameOver = true;
    alert(p===1 ? "あなたの勝ち" : "CPUの勝ち");
    return;
  }

  current = (p === 1) ? 2 : 1;

  if(current === 2){
    setTimeout(cpuTurn,200);
  }
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
   描画（固定盤面）
========================= */
function draw(){

  ctx.clearRect(0,0,BASE,BASE);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,BASE,BASE);

  const boardSize = CELL * (SIZE - 1);

  ctx.strokeStyle = "#333";

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

  gameOver = false;
  current = 1;

  draw();
}
