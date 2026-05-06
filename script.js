const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

function resetGame(){
  init();
}

/* =========================
   星
========================= */
function isStar(x,y){
  return (
    (x===3 && y===3) ||
    (x===3 && y===9) ||
    (x===9 && y===3) ||
    (x===9 && y===9) ||
    (x===6 && y===6)
  );
}

/* =========================
   描画（完全交点）
========================= */
function draw(){

  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className = "node";

      node.style.left = (x * CELL) + "px";
      node.style.top  = (y * CELL) + "px";

      if(isStar(x,y)){
        node.classList.add("star");
      }

      if(board[y][x] === 1){
        const s = document.createElement("div");
        s.className = "stone black";
        node.appendChild(s);
      }

      if(board[y][x] === 2){
        const s = document.createElement("div");
        s.className = "stone white";
        node.appendChild(s);
      }

      node.onclick = () => playerMove(x,y);

      boardEl.appendChild(node);
    }
  }
}

/* =========================
   プレイヤー
========================= */
function playerMove(x,y){

  if(gameOver || board[y][x]) return;

  board[y][x] = 1;
  draw();

  if(checkWin(x,y,1)){
    gameOver = true;
    infoEl.textContent = "あなたの勝ち";
    return;
  }

  setTimeout(cpuMove, 150);
}

/* =========================
   CPU（安全版）
========================= */
function cpuMove(){

  if(gameOver) return;

  // 即勝ち or ランダム
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === 0){
        board[y][x] = 2;

        if(checkWin(x,y,2)){
          draw();
          gameOver = true;
          infoEl.textContent = "CPUの勝ち";
          return;
        }

        board[y][x] = 0;
      }
    }
  }

  // ランダム配置
  while(true){
    const x = Math.floor(Math.random()*SIZE);
    const y = Math.floor(Math.random()*SIZE);

    if(board[y][x] === 0){
      board[y][x] = 2;
      break;
    }
  }

  draw();
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  for(const [dx,dy] of DIRS){
    let c = 1;

    for(const d of [-1,1]){
      let nx = x + dx*d;
      let ny = y + dy*d;

      while(board[ny]?.[nx] === p){
        c++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    if(c >= 5) return true;
  }

  return false;
}

init();
