const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}
window.resetGame = init;

/* 音 */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

/* 星 */
function isStar(x,y){
  return (
    (x===3&&y===3)||(x===3&&y===9)||
    (x===9&&y===3)||(x===9&&y===9)||
    (x===6&&y===6)
  );
}

/* 描画 */
function draw(){
  boardEl.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "grid";

  const lines = document.createElement("div");
  lines.className = "lines";

  /* ★線＝交点中央 */
  for(let i=0;i<SIZE;i++){

    const h=document.createElement("div");
    h.className="h-line";
    h.style.top = (i*CELL + CELL/2) + "px";
    lines.appendChild(h);

    const v=document.createElement("div");
    v.className="v-line";
    v.style.left = (i*CELL + CELL/2) + "px";
    lines.appendChild(v);
  }

  grid.appendChild(lines);

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className="node";

      node.style.gridColumn = x+1;
      node.style.gridRow = y+1;

      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        node.appendChild(s);
      }

      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        node.appendChild(s);
      }

      node.onclick=()=>{
        if(gameOver || board[y][x]) return;

        board[y][x]=1;
        playSound();
        draw();

        if(checkWin(x,y,1)){
          gameOver=true;
          infoEl.textContent="あなたの勝ち";
          return;
        }

        setTimeout(cpuMove,50);
      };

      grid.appendChild(node);
    }
  }

  boardEl.appendChild(grid);
}

/* CPU */
function cpuMove(){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x]){
        board[y][x]=2;
        draw();
        if(checkWin(x,y,2)){
          gameOver=true;
          infoEl.textContent="CPUの勝ち";
        }
        return;
      }
    }
  }
}

/* 勝利 */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){
    let c=1;
    for(const d of [-1,1]){
      let nx=x+dx*d, ny=y+dy*d;
      while(board[ny]?.[nx]===p){
        c++; nx+=dx*d; ny+=dy*d;
      }
    }
    if(c>=5) return true;
  }
  return false;
}

init();
