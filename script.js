const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
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

/* ===== 描画 ===== */
function draw(){
  boardEl.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "grid";

  const lines = document.createElement("div");
  lines.className = "lines";

  for(let i=0;i<SIZE;i++){
    const h=document.createElement("div");
    h.className="h-line";
    h.style.top=(i*CELL+CELL/2)+"px";
    lines.appendChild(h);

    const v=document.createElement("div");
    v.className="v-line";
    v.style.left=(i*CELL+CELL/2)+"px";
    lines.appendChild(v);
  }

  grid.appendChild(lines);

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const node=document.createElement("div");
      node.className="node";
      node.style.gridColumn=x+1;
      node.style.gridRow=y+1;

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

  grid.onclick=(e)=>{
    if(gameOver) return;

    const rect=grid.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;

    const gx=Math.round(x/CELL-0.5);
    const gy=Math.round(y/CELL-0.5);

    if(gx<0||gy<0||gx>=SIZE||gy>=SIZE) return;
    if(board[gy][gx]) return;

    place(gx,gy,1);

    if(!gameOver){
      infoEl.textContent="CPU思考中...";
      setTimeout(cpuMove,10);
    }
  };
}

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent=p===1?"あなたの勝ち":"CPUの勝ち";
    return;
  }

  if(p===2){
    infoEl.textContent="あなたの番です";
  }
}

/* ===== 勝利判定 ===== */
function checkWin(x,y,p){
  for(const [dx,dy] of DIRS){
    let c=1;
    for(const d of [-1,1]){
      let nx=x+dx*d,ny=y+dy*d;
      while(board[ny]?.[nx]===p){
        c++; nx+=dx*d; ny+=dy*d;
      }
    }
    if(c>=5) return true;
  }
  return false;
}

/* ===== 危険検出（核心） ===== */
function isDanger(x,y,p){

  board[y][x]=p;

  for(const [dx,dy] of DIRS){

    let count=1,open=0;

    let nx=x+dx,ny=y+dy;
    while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx;ny=y-dy;
    while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) open++;

    if(count>=4 || (count===3 && open===2)){
      board[y][x]=0;
      return true;
    }
  }

  board[y][x]=0;
  return false;
}

/* ===== 評価 ===== */
function evalPos(x,y,p){

  let score=0;

  for(const [dx,dy] of DIRS){

    let count=1,open=0;

    let nx=x+dx,ny=y+dy;
    while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx;ny=y-dy;
    while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) open++;

    if(count>=5) score+=100000;
    else if(count===4&&open===2) score+=20000;
    else if(count===4&&open===1) score+=5000;
    else if(count===3&&open===2) score+=2000;
    else if(count===3&&open===1) score+=200;
  }

  return score;
}

/* ===== 候補手 ===== */
function getMoves(){

  const list=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let near=false;
      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]){
            near=true;
            break;
          }
        }
        if(near) break;
      }

      if(!near) continue;

      const s =
        evalPos(x,y,2)*1.2 +
        evalPos(x,y,1);

      list.push({x,y,s});
    }
  }

  list.sort((a,b)=>b.s-a.s);
  return list.slice(0,8);
}

/* ===== CPU ===== */
function cpuMove(){

  // 1 勝ち
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

  // 2 即防御
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

  // 3 ★危険防御（最重要）
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(isDanger(x,y,1)){
        place(x,y,2);
        return;
      }
    }
  }

  // 4 思考（相手の最善反撃を見る）
  const moves = getMoves();

  let best=null;
  let bestScore=-Infinity;

  for(let m of moves){

    board[m.y][m.x]=2;

    let worst=Infinity;

    const next = getMoves();

    for(let n of next){

      board[n.y][n.x]=1;

      const val =
        evalPos(n.x,n.y,1) -
        evalPos(m.x,m.y,2);

      board[n.y][n.x]=0;

      if(val<worst) worst=val;
    }

    board[m.y][m.x]=0;

    if(worst>bestScore){
      bestScore=worst;
      best=m;
    }
  }

  if(best){
    place(best.x,best.y,2);
  }
}

init();
