const SIZE = 13;

let board = [];
let gameOver = false;
let lastMove = null;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  lastMove = null;
  setInfo("あなたの番です");
  draw();
}

function resetGame(){
  init();
}
window.resetGame = resetGame;

/* =========================
   星（13路標準）
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
   描画（交点）
========================= */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className = "node";

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

      if(lastMove?.x === x && lastMove?.y === y){
        node.style.outline = "2px solid red";
        node.style.outlineOffset = "-2px";
      }

      node.onclick = () => place(x,y,1);

      row.appendChild(node);
    }

    boardEl.appendChild(row);
  }
}

/* =========================
   着手
========================= */
function place(x,y,p){
  if(gameOver || board[y][x]) return;

  board[y][x] = p;
  lastMove = {x,y};

  draw();

  if(checkWin(x,y,p)){
    gameOver = true;
    setInfo(p===1 ? "あなたの勝ち" : "CPUの勝ち");
  }
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

/* =========================
   UI
========================= */
function setInfo(t){
  infoEl.textContent = t;
}

init();
