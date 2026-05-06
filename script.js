const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* 初期化 */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  infoEl.textContent = "あなたの番です";
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

/* 着手 */
function place(x,y,p){
  board[y][x]=p;
  playSound();
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

/* 勝利判定 */
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

/* 候補手（重要：強い順） */
function getMoves(){
  const moves=[];

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

      if(near){
        const score = evalMove(x,y,2);
        moves.push({x,y,score});
      }
    }
  }

  // スコア順ソート
  moves.sort((a,b)=>b.score-a.score);

  return moves.slice(0,8); // ★重要：上位のみ
}

/* 手の評価 */
function evalMove(x,y,p){
  board[y][x]=p;
  const s = evaluate();
  board[y][x]=0;
  return s;
}

/* CPU */
function cpuMove(){

  // 即勝ち
  for(let m of getMoves()){
    board[m.y][m.x]=2;
    if(checkWin(m.x,m.y,2)){
      board[m.y][m.x]=0;
      place(m.x,m.y,2);
      return;
    }
    board[m.y][m.x]=0;
  }

  // 即防御
  for(let m of getMoves()){
    board[m.y][m.x]=1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x]=0;
      place(m.x,m.y,2);
      return;
    }
    board[m.y][m.x]=0;
  }

  const limit = performance.now()+3000;

  let best=null;
  let bestScore=-Infinity;

  const moves = getMoves();

  for(let m of moves){
    if(performance.now()>limit) break;

    const score = search(m.x,m.y,2,3,limit);

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  if(best){
    place(best.x,best.y,2);
  }
}

/* 探索（シンプル深さ優先） */
function search(x,y,p,depth,limit){

  if(performance.now()>limit) return evaluate();

  board[y][x]=p;

  if(checkWin(x,y,p)){
    board[y][x]=0;
    return p===2 ? 100000 : -100000;
  }

  if(depth===0){
    const val=evaluate();
    board[y][x]=0;
    return val;
  }

  const nextMoves=getMoves();

  let best = (p===2) ? -Infinity : Infinity;

  for(let m of nextMoves){

    const val = search(m.x,m.y, p===2?1:2, depth-1, limit);

    if(p===2){
      if(val>best) best=val;
    }else{
      if(val<best) best=val;
    }
  }

  board[y][x]=0;
  return best;
}

/* 評価（重要） */
function evaluate(){
  let score=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const p=board[y][x];
      if(!p) continue;

      for(const [dx,dy] of DIRS){
        let count=1,open=0;

        let nx=x+dx,ny=y+dy;
        while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
        if(board[ny]?.[nx]===0) open++;

        nx=x-dx;ny=y-dy;
        while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
        if(board[ny]?.[nx]===0) open++;

        let val=0;
        if(count>=5) val=100000;
        else if(count===4&&open===2) val=30000;
        else if(count===4&&open===1) val=10000;
        else if(count===3&&open===2) val=5000;
        else if(count===3&&open===1) val=1000;

        score += (p===2?val:-val);
      }
    }
  }
  return score;
}

init();
