const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

const DIRS = [[1,0],[0,1],[1,1],[1,-1]];

/* ===== 初期化 ===== */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  infoEl.textContent = "あなたの番です";
  draw();
}
window.resetGame = init;

/* ===== 音 ===== */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

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

  /* クリック → 最近傍交点 */
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
      setTimeout(cpuMove,10);
    }
  };
}

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;
  playSound();
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
    return;
  }

  // ★ここが重要（表示更新）
  if(p===2){
    infoEl.textContent = "あなたの番です";
  }
}

/* ===== 勝利判定 ===== */
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
  const result = minimax(4, true, -Infinity, Infinity);
  if(result.move){
    place(result.move.x, result.move.y, 2);
  }
}

/* ===== 候補手（近傍のみ） ===== */
function getMoves(){
  const moves = [];
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

      if(near) moves.push({x,y});
    }
  }

  // 初手対策
  return moves.length ? moves : [{x:6,y:6}];
}

/* ===== ミニマックス ===== */
function minimax(depth, isMax, alpha, beta){
  if(depth===0){
    return {score:evaluate()};
  }

  const moves = getMoves();
  let bestMove = null;

  if(isMax){
    let maxEval = -Infinity;

    for(const m of moves){
      board[m.y][m.x] = 2;

      if(checkWin(m.x,m.y,2)){
        board[m.y][m.x] = 0;
        return {score:100000, move:m};
      }

      const evalResult = minimax(depth-1,false,alpha,beta).score;
      board[m.y][m.x] = 0;

      if(evalResult > maxEval){
        maxEval = evalResult;
        bestMove = m;
      }

      alpha = Math.max(alpha, evalResult);
      if(beta <= alpha) break;
    }

    return {score:maxEval, move:bestMove};

  }else{
    let minEval = Infinity;

    for(const m of moves){
      board[m.y][m.x] = 1;

      if(checkWin(m.x,m.y,1)){
        board[m.y][m.x] = 0;
        return {score:-100000, move:m};
      }

      const evalResult = minimax(depth-1,true,alpha,beta).score;
      board[m.y][m.x] = 0;

      if(evalResult < minEval){
        minEval = evalResult;
        bestMove = m;
      }

      beta = Math.min(beta, evalResult);
      if(beta <= alpha) break;
    }

    return {score:minEval, move:bestMove};
  }
}

/* ===== 評価関数 ===== */
function evaluate(){
  let score = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const p = board[y][x];
      if(!p) continue;

      let val = 0;

      for(const [dx,dy] of DIRS){
        let count = 1;

        let nx=x+dx, ny=y+dy;
        while(board[ny]?.[nx]===p){
          count++; nx+=dx; ny+=dy;
        }

        nx=x-dx; ny=y-dy;
        while(board[ny]?.[nx]===p){
          count++; nx-=dx; ny-=dy;
        }

        if(count>=5) val += 100000;
        else if(count===4) val += 10000;
        else if(count===3) val += 1000;
        else if(count===2) val += 100;
      }

      score += (p===2 ? val : -val);
    }
  }

  return score;
}

init();
