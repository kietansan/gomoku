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

function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

function isStar(x,y){
  return (
    (x===3&&y===3)||(x===3&&y===9)||
    (x===9&&y===3)||(x===9&&y===9)||
    (x===6&&y===6)
  );
}

function draw(){
  boardEl.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "grid";

  const lines = document.createElement("div");
  lines.className = "lines";

  for(let i=0;i<SIZE;i++){

    const h=document.createElement("div");
    h.className="h-line";
    h.style.top = (i*CELL + CELL/2)+"px";
    lines.appendChild(h);

    const v=document.createElement("div");
    v.className="v-line";
    v.style.left = (i*CELL + CELL/2)+"px";
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

      grid.appendChild(node);
    }
  }

  boardEl.appendChild(grid);

  /* ★クリック完全修正（ここが核心） */
  grid.onclick = (e)=>{
    if(gameOver) return;

    const rect = grid.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gx = Math.round(x / CELL - 0.5);
    const gy = Math.round(y / CELL - 0.5);

    if(gx<0||gy<0||gx>=SIZE||gy>=SIZE) return;
    if(board[gy][gx]) return;

    place(gx,gy,1);

    if(!gameOver){
      infoEl.textContent="CPU思考中...";
      setTimeout(cpuMove,50);
    }
  };
}

function place(x,y,p){
  board[y][x]=p;
  playSound();
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }
}

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

/* ★強化CPU */
function cpuMove(){

  // 勝ち
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      board[y][x]=2;
      if(checkWin(x,y,2)){
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

  // 中央寄り
  let best=null;
  let bestScore=999;

  const cx=SIZE/2;
  const cy=SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      const dist=Math.abs(x-cx)+Math.abs(y-cy);

      if(dist<bestScore){
        bestScore=dist;
        best={x,y};
      }
    }
  }

  if(best) place(best.x,best.y,2);
}

init();
