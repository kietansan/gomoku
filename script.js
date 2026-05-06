const SIZE = 13;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* =========================
   初期化
========================= */
function init(){

  boardEl.innerHTML = "";

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;

  infoEl.textContent = "あなたの番です";

  drawGrid();
  drawStars();
}
window.resetGame = init;

/* =========================
   グリッド生成
========================= */
function drawGrid(){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell = document.createElement("div");
      cell.className = "cell";

      cell.onclick = () => clickCell(x,y);

      boardEl.appendChild(cell);
    }
  }
}

/* =========================
   星（天元・星）
========================= */
function drawStars(){

  const stars = [
    [3,3],[3,9],[9,3],[9,9],[6,6]
  ];

  const cells = document.querySelectorAll(".cell");

  for(const [x,y] of stars){
    const idx = y * SIZE + x;
    const starCell = cells[idx];

    const s = document.createElement("div");
    s.className = "star";

    starCell.appendChild(s);
  }
}

/* =========================
   クリック処理
========================= */
function clickCell(x,y){

  if(gameOver) return;
  if(board[y][x]) return;

  place(x,y,1);

  if(!gameOver){
    infoEl.textContent = "CPU思考中...";
    setTimeout(cpuMove, 50);
  }
}

/* =========================
   着手
========================= */
function place(x,y,p){

  board[y][x] = p;

  render();

  if(checkWin(x,y,p)){
    gameOver = true;
    infoEl.textContent = p===1 ? "あなたの勝ち" : "CPUの勝ち";
  }
}

/* =========================
   描画
========================= */
function render(){

  document.querySelectorAll(".stone").forEach(e=>e.remove());

  const cells = document.querySelectorAll(".cell");

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===0) continue;

      const idx = y * SIZE + x;
      const cell = cells[idx];

      const stone = document.createElement("div");
      stone.className = "stone " + (board[y][x]===1 ? "black" : "white");

      cell.appendChild(stone);
    }
  }
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  for(const [dx,dy] of DIRS){

    let count = 1;

    for(const d of [-1,1]){

      let nx = x + dx*d;
      let ny = y + dy*d;

      while(board[ny]?.[nx] === p){
        count++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    if(count >= 5) return true;
  }

  return false;
}

/* =========================
   CPU（安定版）
========================= */
function cpuMove(){

  // ① 即勝ち
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x] = 2;
      if(checkWin(x,y,2)){
        board[y][x] = 0;
        place(x,y,2);
        return;
      }
      board[y][x] = 0;
    }
  }

  // ② 防御
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x] = 1;
      const danger = checkWin(x,y,1);
      board[y][x] = 0;

      if(danger){
        place(x,y,2);
        return;
      }
    }
  }

  // ③ ランダム埋め（最低限）
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(!board[y][x]){
        place(x,y,2);
        return;
      }
    }
  }
}

/* =========================
   起動
========================= */
init();
