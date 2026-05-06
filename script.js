const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){

  boardEl.innerHTML = "";

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;

  infoEl.textContent = "あなたの番です";

  drawGrid();
  drawStars();
  draw();
}
window.resetGame = init;

/* ===== 13×13交点生成 ===== */
function drawGrid(){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.left = x*CELL + "px";
      cell.style.top = y*CELL + "px";

      cell.onclick = () => clickCell(x,y);

      boardEl.appendChild(cell);
    }
  }
}

/* ===== 星（天元など） ===== */
function drawStars(){

  const stars = [
    [3,3],[3,9],[9,3],[9,9],[6,6]
  ];

  for(const [x,y] of stars){

    const s = document.createElement("div");
    s.className = "star";
    s.style.left = x*CELL + "px";
    s.style.top = y*CELL + "px";

    boardEl.appendChild(s);
  }
}

/* ===== 描画 ===== */
function draw(){

  document.querySelectorAll(".stone").forEach(e=>e.remove());

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===0) continue;

      const stone = document.createElement("div");
      stone.className = "stone " + (board[y][x]===1 ? "black":"white");

      stone.style.left = x*CELL + "px";
      stone.style.top = y*CELL + "px";

      boardEl.appendChild(stone);
    }
  }
}

/* ===== クリック ===== */
function clickCell(x,y){

  if(gameOver) return;
  if(board[y][x]) return;

  place(x,y,1);

  if(!gameOver){
    infoEl.textContent="CPU思考中...";
    setTimeout(cpuMove,10);
  }
}

/* ===== 着手 ===== */
function place(x,y,p){

  board[y][x]=p;

  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1 ? "あなたの勝ち" : "CPUの勝ち";
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

/* ===== CPU（安定版） ===== */
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
      const danger = checkWin(x,y,1);
      board[y][x]=0;

      if(danger){
        place(x,y,2);
        return;
      }
    }
  }

  // 適当着手（安定用）
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x]){
        place(x,y,2);
        return;
      }
    }
  }
}

init();
