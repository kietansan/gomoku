const SIZE = 13;
const CELL = 40;
const MARGIN = 40;
const BASE = 520;

let canvas, ctx;
let board = [];

let current = 1;
let gameOver = false;
let lock = false; // ★これ重要（暴走防止）

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  canvas.width = BASE;
  canvas.height = BASE;

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  draw();

  canvas.addEventListener("click", click);
};

/* =========================
   クリック（完全固定）
========================= */
function click(e){

  if(gameOver || lock || current !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const mx = (e.clientX - rect.left);
  const my = (e.clientY - rect.top);

  const scaleX = BASE / rect.width;
  const scaleY = BASE / rect.height;

  const x = Math.floor(((mx * scaleX) - MARGIN) / CELL);
  const y = Math.floor(((my * scaleY) - MARGIN) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  applyMove(x,y,1);
}

/* =========================
   手処理（ここでターン制御）
========================= */
function applyMove(x,y,p){

  if(gameOver) return;

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
    cpuTurn();
  }
}

/* =========================
   CPU（暴走防止ロック）
========================= */
function cpuTurn(){

  if(gameOver || lock) return;

  lock = true;

  setTimeout(() => {

    if(current !== 2){
      lock = false;
      return;
    }

    const move = cpuMove(board);

    if(!move){
      current = 1;
      lock = false;
      return;
    }

    board[move.y][move.x] = 2;

    draw();

    if(checkWin(2)){
      gameOver = true;
      alert("CPUの勝ち");
      lock = false;
      return;
    }

    current = 1;
    lock = false;

  }, 200);
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
   描画（固定）
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
          CELL*0.4,
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
  lock = false;

  draw();
}
