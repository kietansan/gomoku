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

  resizeCanvas();

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", click);

  window.addEventListener("resize", resizeCanvas);
};

/* =========================
   超重要：表示と内部を一致させる
========================= */
function resizeCanvas(){

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;

  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  canvas.width = 520;
  canvas.height = 520;
}

/* =========================
   クリック（完全一致版）
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
   描画（520基準で統一）
========================= */
function draw(){

  ctx.clearRect(0,0,520,520);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,520,520);

  const boardSize = CELL * (SIZE - 1);

  ctx.strokeStyle = "#333";

  for(let i=0;i<SIZE;i++){

    const pos = MARGIN + i * CELL;

    ctx.beginPath();
    ctx.moveTo(pos,MARGIN);
    ctx.lineTo(pos,MARGIN + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN,pos);
    ctx.lineTo(MARGIN + boardSize,pos);
    ctx.stroke();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]){
        ctx.beginPath();
        ctx.arc(
          MARGIN + x*CELL,
          MARGIN + y*CELL,
          14,
          0,Math.PI*2
        );
        ctx.fillStyle = board[y][x] === 1 ? "#000" : "#fff";
        ctx.fill();
      }
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

  gameOver = false;
  current = 1;

  draw();
}
