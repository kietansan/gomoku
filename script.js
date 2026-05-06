const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;
let lastMove = null;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* 初期化 */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  lastMove = null;
  infoEl.textContent = "あなたの番です";
  draw();
}
window.resetGame = init;

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

  /* ===== 線（盤全体） ===== */
  const lines = document.createElement("div");
  lines.className = "lines";

  // 横線
  for(let i=0;i<SIZE;i++){
    const l=document.createElement("div");
    l.className="h-line";
    l.style.top = (i*CELL + CELL/2)+"px";
    lines.appendChild(l);
  }

  // 縦線
  for(let i=0;i<SIZE;i++){
    const l=document.createElement("div");
    l.className="v-line";
    l.style.left = (i*CELL + CELL/2)+"px";
    lines.appendChild(l);
  }

  grid.appendChild(lines);

  /* ===== ノード ===== */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const node = document.createElement("div");
      node.className="node";

      // ★これ重要（Grid配置）
      node.style.gridColumn = x+1;
      node.style.gridRow = y+1;

      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        node.appendChild(s);
      }

      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        node.appendChild(s);
      }

      if(lastMove?.x===x && lastMove?.y===y){
        node.classList.add("last");
      }

      node.onclick = ()=>{
        if(gameOver || board[y][x]) return;

        place(x,y,1);
        if(!gameOver){
          infoEl.textContent="CPU思考中...";
          setTimeout(cpuMove,50);
        }
      };

      grid.appendChild(node);
    }
  }

  boardEl.appendChild(grid);
}

/* 着手 */
function place(x,y,p){
  board[y][x]=p;
  lastMove={x,y};
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }else{
    infoEl.textContent = p===1?"CPU思考中...":"あなたの番です";
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

/* ===== CPU（4手読み） ===== */

function cpuMove(){
  const move = minimax(4,true,-Infinity,Infinity).move;
  if(move) place(move.x,move.y,2);
}

function minimax(depth,isMax,alpha,beta){
  if(depth===0) return {score:evaluate()};

  const moves=getMoves();
  let best=null;

  if(isMax){
    let max=-Infinity;
    for(const m of moves){
      board[m.y][m.x]=2;
      const val=minimax(depth-1,false,alpha,beta).score;
      board[m.y][m.x]=0;

      if(val>max){max=val; best=m;}
      alpha=Math.max(alpha,val);
      if(beta<=alpha) break;
    }
    return {score:max,move:best};
  }else{
    let min=Infinity;
    for(const m of moves){
      board[m.y][m.x]=1;
      const val=minimax(depth-1,true,alpha,beta).score;
      board[m.y][m.x]=0;

      if(val<min){min=val; best=m;}
      beta=Math.min(beta,val);
      if(beta<=alpha) break;
    }
    return {score:min,move:best};
  }
}

/* 候補 */
function getMoves(){
  const moves=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      let near=false;
      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]) near=true;
        }
      }
      if(near) moves.push({x,y});
    }
  }
  return moves.length?moves:[{x:6,y:6}];
}

/* 評価（星込み） */
function evaluate(){
  let score=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const p=board[y][x];
      if(!p) continue;

      let val=0;

      for(const [dx,dy] of DIRS){
        let c=1;
        let nx=x+dx,ny=y+dy;
        while(board[ny]?.[nx]===p){c++; nx+=dx; ny+=dy;}
        nx=x-dx; ny=y-dy;
        while(board[ny]?.[nx]===p){c++; nx-=dx; ny-=dy;}

        if(c>=5) val+=100000;
        else if(c===4) val+=10000;
        else if(c===3) val+=1000;
        else if(c===2) val+=100;
      }

      if(isStar(x,y)) val*=1.2;

      score += (p===2?val:-val);
    }
  }

  return score;
}

init();
