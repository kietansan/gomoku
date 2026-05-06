const SIZE = 13;

let board = [];
let gameOver = false;
let lastMove = null;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

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
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className = "node";

      // 横線
      const h = document.createElement("div");
      h.className = "h-line";
      node.appendChild(h);

      // 縦線
      const v = document.createElement("div");
      v.className = "v-line";
      node.appendChild(v);

      // 星
      if(isStar(x,y)){
        const s = document.createElement("div");
        s.className = "star";
        node.appendChild(s);
      }

      // 石
      if(board[y][x]){
        const stone = document.createElement("div");
        stone.className = "stone " + (board[y][x]===1 ? "black" : "white");
        node.appendChild(stone);
      }

      // 最後の手
      if(lastMove?.x===x && lastMove?.y===y){
        node.classList.add("last");
      }

      // クリック
      node.onclick = () => {
        if(gameOver || board[y][x]) return;

        place(x,y,1);

        if(!gameOver){
          setTimeout(cpuMove, 100);
        }
      };

      row.appendChild(node);
    }

    boardEl.appendChild(row);
  }
}

/* =========================
   着手
========================= */
function place(x,y,p){
  board[y][x] = p;
  lastMove = {x,y};
  draw();

  if(checkWin(x,y,p)){
    gameOver = true;
    setInfo(p===1 ? "あなたの勝ち" : "CPUの勝ち");
  }
}

/* =========================
   CPU（簡易）
========================= */
function cpuMove(){
  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x]) moves.push({x,y});
    }
  }

  if(!moves.length) return;

  const m = moves[Math.floor(Math.random()*moves.length)];
  place(m.x, m.y, 2);
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){
  const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

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

/* ========================= */
function setInfo(t){
  infoEl.textContent = t;
}

init();
