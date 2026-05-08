const SIZE = 13;

const BASE = 520;
const MARGIN = 40;

const CELL = (BASE - MARGIN * 2) / (SIZE - 1);

let canvas, ctx;

let board = [];
let current = 1;

let gameOver = false;
let lock = false;

let hover = { x:-1, y:-1 };

/* 星 */
const HOSHI = [
  [3,3],[3,9],
  [9,3],[9,9],
  [6,6]
];

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

  board = Array.from(
    { length: SIZE },
    () => Array(SIZE).fill(0)
  );
}

/* =========================
   交点→画面座標
========================= */
function intersectionToScreen(x,y){

  return {
    px: MARGIN + x * CELL,
    py: MARGIN + y * CELL
  };
}

/* =========================
   画面→交点
   （最近傍交点スナップ）
========================= */
function screenToIntersection(clientX, clientY){

  const rect = canvas.getBoundingClientRect();

  /* CSS縮小補正 */
  const scaleX = BASE / rect.width;
  const scaleY = BASE / rect.height;

  /* canvas内部座標 */
  const px =
    (clientX - rect.left) * scaleX;

  const py =
    (clientY - rect.top) * scaleY;

  /* 最近傍交点へスナップ */
  const x = Math.floor(
    (px - MARGIN + CELL / 2) / CELL
  );

  const y = Math.floor(
    (py - MARGIN + CELL / 2) / CELL
  );

  return { x, y };
}

/* =========================
   マウス移動
========================= */
function handleMove(e){

  const pos =
    screenToIntersection(
      e.clientX,
      e.clientY
    );

  if(inRange(pos.x, pos.y)){

    hover = pos;

  }else{

    hover = { x:-1, y:-1 };
  }

  draw();
}

/* =========================
   クリック
========================= */
function handleClick(e){

  if(gameOver) return;
  if(lock) return;
  if(current !== 1) return;

  const pos =
    screenToIntersection(
      e.clientX,
      e.clientY
    );

  const x = pos.x;
  const y = pos.y;

  if(!inRange(x,y)) return;
  if(board[y][x]) return;

  placeStone(x,y,1);
}

/* =========================
   石を置く
========================= */
function placeStone(x,y,player){

  board[y][x] = player;

  draw();
  playSound();

  if(checkWin(x,y,player)){

    gameOver = true;

    setInfo(
      player === 1
      ? "あなたの勝ち！"
      : "CPUの勝ち！"
    );

    return;
  }

  current =
    player === 1 ? 2 : 1;

  if(current === 2){

    setInfo("CPU思考中...");

    setTimeout(cpuTurn, 250);
  }
}

/* =========================
   CPUターン
========================= */
function cpuTurn(){

  lock = true;

  const move = cpuMove(board);

  if(!move){

    current = 1;
    lock = false;

    setInfo("あなたの番です");

    return;
  }

  placeStone(move.x, move.y, 2);

  current = 1;
  lock = false;

  if(!gameOver){
    setInfo("あなたの番です");
  }
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,player){

  const DIR = [
    [1,0],
    [0,1],
    [1,1],
    [1,-1]
  ];

  for(const [dx,dy] of DIR){

    let count = 1;

    /* 正方向 */
    for(let i=1;i<5;i++){

      const nx = x + dx*i;
      const ny = y + dy*i;

      if(!inRange(nx,ny)) break;
      if(board[ny][nx] !== player) break;

      count++;
    }

    /* 逆方向 */
    for(let i=1;i<5;i++){

      const nx = x - dx*i;
      const ny = y - dy*i;

      if(!inRange(nx,ny)) break;
      if(board[ny][nx] !== player) break;

      count++;
    }

    if(count >= 5){
      return true;
    }
  }

  return false;
}

/* =========================
   範囲
========================= */
function inRange(x,y){

  return (
    x >= 0 &&
    y >= 0 &&
    x < SIZE &&
    y < SIZE
  );
}

/* =========================
   描画
========================= */
function draw(){

  ctx.clearRect(0,0,BASE,BASE);

  /* 木 */
  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,BASE,BASE);

  const boardSize =
    CELL * (SIZE - 1);

  /* 線 */
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  for(let i=0;i<SIZE;i++){

    const p =
      MARGIN + i * CELL;

    /* 縦 */
    ctx.beginPath();
    ctx.moveTo(p, MARGIN);
    ctx.lineTo(
      p,
      MARGIN + boardSize
    );
    ctx.stroke();

    /* 横 */
    ctx.beginPath();
    ctx.moveTo(MARGIN, p);
    ctx.lineTo(
      MARGIN + boardSize,
      p
    );
    ctx.stroke();
  }

  /* 星 */
  for(const [x,y] of HOSHI){

    const pos =
      intersectionToScreen(x,y);

    ctx.beginPath();

    ctx.arc(
      pos.px,
      pos.py,
      3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#222";
    ctx.fill();
  }

  /* 石 */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      drawStone(
        x,
        y,
        board[y][x]
      );
    }
  }

  /* カーソル */
  if(
    !gameOver &&
    current === 1 &&
    hover.x >= 0
  ){

    const pos =
      intersectionToScreen(
        hover.x,
        hover.y
      );

    ctx.beginPath();

    ctx.arc(
      pos.px,
      pos.py,
      14,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(0,0,0,0.18)";

    ctx.fill();
  }
}

/* =========================
   石描画
========================= */
function drawStone(x,y,color){

  const pos =
    intersectionToScreen(x,y);

  const cx = pos.px;
  const cy = pos.py;

  const r = 14;

  /* 影 */
  ctx.beginPath();

  ctx.arc(
    cx + 2,
    cy + 3,
    r,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(0,0,0,0.25)";

  ctx.fill();

  /* 本体 */
  const grad =
    ctx.createRadialGradient(
      cx - 4,
      cy - 4,
      2,
      cx,
      cy,
      r
    );

  if(color === 1){

    grad.addColorStop(0,"#666");
    grad.addColorStop(0.35,"#111");
    grad.addColorStop(1,"#000");

  }else{

    grad.addColorStop(0,"#fff");
    grad.addColorStop(0.7,"#ddd");
    grad.addColorStop(1,"#aaa");
  }

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = grad;
  ctx.fill();

  /* 光沢 */
  ctx.beginPath();

  ctx.arc(
    cx - 4,
    cy - 5,
    4,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(255,255,255,0.25)";

  ctx.fill();
}

/* =========================
   UI
========================= */
function setInfo(text){

  document.getElementById("info")
    .innerText = text;
}

/* =========================
   音
========================= */
function playSound(){

  const audio =
    document.getElementById("putSound");

  if(!audio) return;

  audio.currentTime = 0;

  audio.play().catch(()=>{});
}

/* =========================
   リセット
========================= */
function resetGame(){

  initBoard();

  current = 1;

  gameOver = false;
  lock = false;

  hover = { x:-1, y:-1 };

  setInfo("あなたの番です");

  draw();
}
