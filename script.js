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

/* 描画 */
function draw(){
  boardEl.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "grid";

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

/* 候補手 */
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
        moves.push({x,y});
      }
    }
  }

  return moves.length?moves:[{x:6,y:6}];
}

/* ===== 両空き3検出 ===== */
function findOpenThreeBlock(){

  for(let m of getMoves()){
    board[m.y][m.x] = 1;

    for(const [dx,dy] of DIRS){

      let count=1, open=0;

      let nx=m.x+dx, ny=m.y+dy;
      while(board[ny]?.[nx]===1){
        count++; nx+=dx; ny+=dy;
      }
      if(board[ny]?.[nx]===0) open++;

      nx=m.x-dx; ny=m.y-dy;
      while(board[ny]?.[nx]===1){
        count++; nx-=dx; ny-=dy;
      }
      if(board[ny]?.[nx]===0) open++;

      if(count===3 && open===2){
        board[m.y][m.x] = 0;
        return m;
      }
    }

    board[m.y][m.x] = 0;
  }

  return null;
}

/* ===== CPU ===== */
function cpuMove(){

  // 勝ち
  for(let m of getMoves()){
    board[m.y][m.x]=2;
    if(checkWin(m.x,m.y,2)){
      board[m.y][m.x]=0;
      place(m.x,m.y,2);
      return;
    }
    board[m.y][m.x]=0;
  }

  // 防御
  for(let m of getMoves()){
    board[m.y][m.x]=1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x]=0;
      place(m.x,m.y,2);
      return;
    }
    board[m.y][m.x]=0;
  }

  // ★三連防御（超重要）
  const block3 = findOpenThreeBlock();
  if(block3){
    place(block3.x,block3.y,2);
    return;
  }

  // 探索
  const limit = performance.now()+3000;

  let best=null;
  let bestScore=-Infinity;

  for(let m of getMoves()){
    if(performance.now()>limit) break;

    const score = evaluateMove(m.x,m.y,2);

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  if(best){
    place(best.x,best.y,2);
  }
}

/* ===== 簡易評価 ===== */
function evaluateMove(x,y,p){
  board[y][x]=p;
  const val = evaluate();
  board[y][x]=0;
  return val;
}

/* ===== 評価 ===== */
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
