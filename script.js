const SIZE = 13;
const CELL = 40;
const MARGIN = 40;
const BASE = 520;

let canvas, ctx;
let board = [];

let current = 1;
let gameOver = false;
let lock = false;

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
   座標変換（唯一の正解ルート）
========================= */
function screenToBoard(clientX, clientY){

  const rect = canvas.getBoundingClientRect();

  const scaleX = BASE / rect.width;
  const scaleY = BASE / rect.height;

  const x = Math.floor(((clientX - rect.left) * scaleX - MARGIN) / CELL);
  const y = Math.floor(((clientY - rect.top) * scaleY - MARGIN) / CELL);

  return {x,y};
}

/* =========================
   クリック処理
========================= */
function click(e){

  if(gameOver || lock || current !== 1) return;

  const {x,y} = screenToBoard(e.clientX, e.clientY);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  place(x,y,1);
}

/* =========================
   着手（共通）
========================= */
function place(x,y,p){

  board[y][x] = p;

  draw();
  playSound();

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
   CPU
========================= */
function cpuTurn(){

  if(gameOver || lock) return;

  lock = true;

  setTimeout(() => {

    const move = cpuMove(board);

    if(!move){
      current = 1;
      lock = false;
      return;
    }

    place(move.x, move.y, 2);

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
   描画（常に520基準）
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

      if(!board[y][x]) continue;

      ctx.beginPath();
      ctx.arc(
        MARGIN + x*CELL,
        MARGIN + y*CELL,
        14,0,Math.PI*2
      );

      ctx.fillStyle = board[y][x] === 1 ? "#000" : "#fff";
      ctx.fill();
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
