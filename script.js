const SIZE = 8;
const BASE = 520;

const PADDING = 40;
const BOARD_SIZE = BASE - PADDING * 2;
const CELL = BOARD_SIZE / SIZE;

let canvas, ctx;

let board;
let current = 1;

let animating = false;

const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  document.getElementById("restartBtn")
    .addEventListener("click", resetGame);

  initBoard();
  draw();

  canvas.addEventListener("click", handleClick);
};

/* =========================
   初期化
========================= */
function initBoard(){

  board = Array.from({length: SIZE}, () =>
    Array(SIZE).fill(0)
  );

  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
}

/* =========================
   座標変換（唯一の入口）
========================= */
function toBoard(x,y){

  const rect = canvas.getBoundingClientRect();

  const scaleX = BASE / rect.width;
  const scaleY = BASE / rect.height;

  const bx = Math.floor(((x - rect.left) * scaleX - PADDING) / CELL);
  const by = Math.floor(((y - rect.top) * scaleY - PADDING) / CELL);

  return {bx,by};
}

/* =========================
   クリック
========================= */
function handleClick(e){

  if(animating) return;
  if(current !== 1) return;

  const {bx,by} = toBoard(e.clientX,e.clientY);

  if(!inRange(bx,by)) return;

  const flips = getFlips(bx,by,1);
  if(flips.length === 0) return;

  place(bx,by,1);
}

/* =========================
   着手処理
========================= */
function place(x,y,p){

  board[y][x] = p;

  draw();
  playSound();

  current = (p === 1) ? 2 : 1;

  if(current === 2){
    setTimeout(cpuTurn, 200);
  }
}

/* =========================
   CPU
========================= */
function cpuTurn(){

  const cpuSelect = document.getElementById("cpuSelect");

  let move;

  if(cpuSelect.value === "easy"){
    move = cpuMove(board);
  }else if(cpuSelect.value === "hard"){
    move = cpuMove2(board);
  }else{
    move = cpuMove3(board);
  }

  if(!move){
    current = 1;
    return;
  }

  place(move.x, move.y, 2);
}

/* =========================
   反転判定
========================= */
function getFlips(x,y,p){

  if(board[y][x] !== 0) return [];

  const opp = p === 1 ? 2 : 1;
  let flips = [];

  for(const [dx,dy] of dirs){

    let nx = x + dx;
    let ny = y + dy;

    let tmp = [];

    while(inRange(nx,ny) && board[ny][nx] === opp){
      tmp.push([nx,ny]);
      nx += dx;
      ny += dy;
    }

    if(inRange(nx,ny) && board[ny][nx] === p && tmp.length){
      flips = flips.concat(tmp);
    }
  }

  return flips;
}

/* =========================
   範囲チェック
========================= */
function inRange(x,y){
  return x>=0 && y>=0 && x<SIZE && y<SIZE;
}

/* =========================
   描画（常に520基準）
========================= */
function draw(){

  ctx.clearRect(0,0,BASE,BASE);

  const boardSize = CELL * (SIZE - 1);

  ctx.strokeStyle = "#000";

  for(let i=0;i<SIZE;i++){

    const p = PADDING + i * CELL;

    ctx.beginPath();
    ctx.moveTo(p,PADDING);
    ctx.lineTo(p,PADDING+boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING,p);
    ctx.lineTo(PADDING+boardSize,p);
    ctx.stroke();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      ctx.beginPath();
      ctx.arc(
        PADDING + x*CELL,
        PADDING + y*CELL,
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

  initBoard();
  current = 1;
  draw();
}
