const SIZE = 13;      // 交点（重要）
const GRID = 12;      // マス数
const CELL = 40;

let board = [];
let gameOver = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;

  canvas.width = GRID * CELL;
  canvas.height = GRID * CELL;

  info.textContent = "あなたの番です";

  draw();
}
window.resetGame = init;

/* ===== 交点座標変換 ===== */
function toPx(i){
  return i * CELL;
}

/* ===== 描画 ===== */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ① 盤面（12×12の正方形）
  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // ② 線（12マス → 13交点のうち内側線）
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(toPx(i),0);
    ctx.lineTo(toPx(i),canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,toPx(i));
    ctx.lineTo(canvas.width,toPx(i));
    ctx.stroke();
  }

  // ③ 石
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]) continue;

      ctx.beginPath();
      ctx.arc(toPx(x),toPx(y),14,0,Math.PI*2);

      if(board[y][x]===1){
        ctx.fillStyle="#000";
      }else{
        ctx.fillStyle="#fff";
        ctx.strokeStyle="#000";
        ctx.stroke();
      }

      ctx.fill();
    }
  }
}

/* ===== クリック（交点スナップ） ===== */
canvas.onclick = (e)=>{

  if(gameOver) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX-rect.left)/CELL);
  const y = Math.round((e.clientY-rect.top)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  place(x,y,1);
};

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    info.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }
}

/* ===== 勝利判定 ===== */
function checkWin(x,y,p){

  for(const [dx,dy] of DIRS){

    let c=1;

    for(const d of [-1,1]){

      let nx=x+dx*d;
      let ny=y+dy*d;

      while(board[ny]?.[nx]===p){
        c++;
        nx+=dx*d;
        ny+=dy*d;
      }
    }

    if(c>=5) return true;
  }

  return false;
}

init();
