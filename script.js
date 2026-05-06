const SIZE = 13;

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
}
window.resetGame = init;

/* ===== グリッド生成（完全一致） ===== */
function drawGrid(){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell = document.createElement("div");
      cell.className = "cell";

      cell.onclick = () => click(x,y);

      boardEl.appendChild(cell);
    }
  }
}

/* ===== クリック ===== */
function click(x,y){

  if(gameOver) return;
  if(board[y][x]) return;

  place(x,y,1);

  if(!gameOver){
    setTimeout(cpuMove,50);
  }
}

/* ===== 着手 ===== */
function place(x,y,p){

  board[y][x]=p;

  render();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }
}

/* ===== 描画（完全同期） ===== */
function render(){

  document.querySelectorAll(".stone").forEach(e=>e.remove());

  const cells = document.querySelectorAll(".cell");

  let i=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]===0){
        i++;
        continue;
      }

      const stone = document.createElement("div");
      stone.className = "stone " + (board[y][x]===1?"black":"white");

      cells[i].appendChild(stone);

      i++;
    }
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

/* ===== CPU（簡易安定） ===== */
function cpuMove(){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      place(x,y,2);
      return;
    }
  }
}

init();
