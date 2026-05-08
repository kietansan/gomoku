const SIZE = 13;

const BASE = 520;
const MARGIN = 40;

const CELL = (BASE - MARGIN * 2) / (SIZE - 1);

let canvas, ctx;

let board = [];
let current = 1;

let gameOver = false;
let lock = false;

let hover = { x: -1, y: -1 };

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  initBoard();
  draw();

  canvas.addEventListener("click", handleClick);
  canvas.addEventListener("mousemove", handleMove);
};

/* =========================
   初期化
========================= */
function initBoard(){

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );
}

/* =========================
   画面→盤面変換
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
   マウス移動（カーソル）
========================= */
function handleMove(e){

  if(gameOver) return;

  const {x,y} = screenToBoard(e.clientX, e.clientY);

  if(inRange(x,y)){
    hover.x = x;
    hover.y = y;
  }else{
    hover.x = -1;
    hover.y = -1;
  }

  draw();
}

/* =========================
   クリック
========================= */
function handleClick(e){

  if(gameOver || lock) return;
  if(current !== 1) return;

  const {x,y} = screenToBoard(e.clientX, e.clientY);

  if(!inRange(x,y)) return;
  if(board[y][x]) return;

  place(x,y,1);
}

/* =========================
   着手
========================= */
function place(x,y,p){

  board[y][x] = p;

  draw();
  playSound();

  if(checkWin(x,y,p)){
    gameOver = true;
    setInfo(p === 1 ? "あなたの勝ち！" : "CPUの勝ち！");
    return;
  }

  current = (p === 1) ? 2 : 1;

  if(current === 2){
    setTimeout(cpuTurn, 200);
  }
}

/* =========================
   CPU
========================= */
function cpuTurn(){

  if(gameOver) return;

  lock = true;

  const move = cpuMove(board);

  if(!move){
    current = 1;
    lock = false;
    return;
  }

  place(move.x, move.y, 2);

  current = 1;
  lock = false;
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  const DIR = [
    [1,0],[0,1],[1,1],[1,-1]
  ];

  for(const [dx,dy] of DIR){

    let count = 1;

    for(let i=1;i<5;i++){
      const nx = x + dx*i;
      const ny = y + dy*i;

      if(!inRange(nx,ny) || board[ny][nx] !== p) break;
      count++;
    }

    for(let i=1;i<5;i++){
      const nx = x - dx*i;
      const ny = y - dy*i;

      if(!inRange(nx,ny) || board[ny][nx] !== p) break;
      count++;
    }

    if(count >= 5) return true;
  }

  return false;
}

/* =========================
   範囲
========================= */
function inRange(x,y){
  return x>=0 && y>=0 && x<SIZE && y<SIZE;
}

/* =========================
   描画
========================= */
function draw(){

  ctx.clearRect(0,0,BASE,BASE);

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,BASE,BASE);

  const boardSize = CELL * (SIZE - 1);

  ctx.strokeStyle = "#333";

  for(let i=0;i<SIZE;i++){

    const p = MARGIN + i * CELL;

    ctx.beginPath();
    ctx.moveTo(p,MARGIN);
    ctx.lineTo(p,MARGIN + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN,p);
    ctx.lineTo(MARGIN + boardSize,p);
    ctx.stroke();
  }

  // 石描画
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

  // =========================
  // 補助カーソル
  // =========================
  if(!gameOver && current === 1 && hover.x >= 0){

    ctx.beginPath();
    ctx.arc(
      MARGIN + hover.x * CELL,
      MARGIN + hover.y * CELL,
      14,0,Math.PI*2
    );

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.stroke();
  }
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

  const a = document.getElementById("putSound");
  if(!a) return;

  a.currentTime = 0;
  a.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
function resetGame(){

  initBoard();
  current = 1;
  gameOver = false;
  lock = false;
  hover = {x:-1,y:-1};

  setInfo("あなたの番です");

  draw();
}
