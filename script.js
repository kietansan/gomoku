const SIZE = 13;
const CELL = 40;

let board = [];
let gameOver = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;

  canvas.width = CELL*(SIZE-1);
  canvas.height = CELL*(SIZE-1);

  infoEl.textContent = "あなたの番です";

  draw();
}
window.resetGame = init;

/* ===== 星 ===== */
function isStar(x,y){
  return (
    (x===3&&y===3)||(x===3&&y===9)||
    (x===9&&y===3)||(x===9&&y===9)||
    (x===6&&y===6)
  );
}

/* ===== 描画（完全安定） ===== */
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 背景
  ctx.fillStyle="#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // 縦横線
  ctx.strokeStyle="#333";
  ctx.lineWidth=1;

  for(let i=0;i<SIZE;i++){
    ctx.beginPath();
    ctx.moveTo(i*CELL,0);
    ctx.lineTo(i*CELL,CELL*(SIZE-1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*CELL);
    ctx.lineTo(CELL*(SIZE-1),i*CELL);
    ctx.stroke();
  }

  // 星
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(isStar(x,y)){
        ctx.beginPath();
        ctx.arc(x*CELL,y*CELL,3,0,Math.PI*2);
        ctx.fillStyle="#000";
        ctx.fill();
      }
    }
  }

  // 石
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===0) continue;

      ctx.beginPath();
      ctx.arc(x*CELL,y*CELL,15,0,Math.PI*2);

      if(board[y][x]===1){
        ctx.fillStyle="#000";
      }else{
        ctx.fillStyle="#fff";
        ctx.strokeStyle="#000";
        ctx.lineWidth=2;
        ctx.stroke();
      }

      ctx.fill();
    }
  }
}

/* ===== クリック（ズレ完全修正） ===== */
canvas.onclick = (e)=>{

  if(gameOver) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.round(((e.clientX - rect.left) * scaleX) / CELL);
  const y = Math.round(((e.clientY - rect.top) * scaleY) / CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  place(x,y,1);

  if(!gameOver){
    infoEl.textContent="CPU思考中...";
    setTimeout(cpuMove,10);
  }
};

/* ===== 着手 ===== */
function place(x,y,p){

  board[y][x]=p;
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }
}

/* ===== 勝利 ===== */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){

    let c=1;

    for(const d of [-1,1]){
      let nx=x+dx*d, ny=y+dy*d;

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

/* ===== CPU（簡易強化） ===== */
function cpuMove(){

  // 即勝ち
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=2;
      if(checkWin(x,y,2)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // 防御
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=1;
      if(checkWin(x,y,1)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // 適当評価（最低限安定）
  let best=null;
  let bestScore=-Infinity;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let s=0;

      for(const [dx,dy] of DIRS){

        let c=1;

        let nx=x+dx,ny=y+dy;
        while(board[ny]?.[nx]){c++;nx+=dx;ny+=dy;}

        nx=x-dx;ny=y-dy;
        while(board[ny]?.[nx]){c++;nx-=dx;ny-=dy;}

        s += c;
      }

      if(s>bestScore){
        bestScore=s;
        best={x,y};
      }
    }
  }

  if(best){
    place(best.x,best.y,2);
  }
}

init();
