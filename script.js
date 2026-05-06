const SIZE = 13;
const CELL = 34;
const DEPTH = 3;

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

/* ===== 描画 ===== */
function draw(){

  boardEl.innerHTML = "";

  /* 線 */
  for(let i=0;i<SIZE;i++){

    const h=document.createElement("div");
    h.className="line h-line";
    h.style.top=(i*CELL+CELL/2)+"px";
    boardEl.appendChild(h);

    const v=document.createElement("div");
    v.className="line v-line";
    v.style.left=(i*CELL+CELL/2)+"px";
    boardEl.appendChild(v);
  }

  /* 交点 */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell=document.createElement("div");
      cell.className="cell";
      cell.style.left=(x*CELL)+"px";
      cell.style.top=(y*CELL)+"px";

      // 星
      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        cell.appendChild(s);
      }

      // 石
      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        cell.appendChild(s);
      }

      cell.onclick=()=>{
        if(gameOver || board[y][x]) return;

        place(x,y,1);

        if(!gameOver){
          infoEl.textContent="CPU思考中...";
          setTimeout(cpuMove,50);
        }
      };

      boardEl.appendChild(cell);
    }
  }
}

/* ===== 星 ===== */
function isStar(x,y){
  return (
    (x===3&&y===3)||(x===3&&y===9)||
    (x===9&&y===3)||(x===9&&y===9)||
    (x===6&&y===6)
  );
}

/* ===== 着手 ===== */
function place(x,y,p){
  board[y][x]=p;
  draw();

  if(checkWin(x,y,p)){
    gameOver=true;
    infoEl.textContent=p===1?"あなたの勝ち":"CPUの勝ち";
  }else if(p===2){
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

      const score =
        evalPos(x,y,2)*1.2 +
        evalPos(x,y,1);

      list.push({x,y,score});
    }
  }

  list.sort((a,b)=>b.score-a.score);
  return list.slice(0,8);
}

/* ===== ネガマックス ===== */
function negamax(depth,player){

  if(depth===0) return evaluate();

  let best=-Infinity;

  const moves = getMoves();

  for(let m of moves){

    board[m.y][m.x]=player;

    const val = -negamax(depth-1,3-player);

    board[m.y][m.x]=0;

    if(val>best) best=val;
  }

  return best;
}

/* ===== 全体評価 ===== */
function evaluate(){
  let s=0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]===2) s+=evalPos(x,y,2);
      if(board[y][x]===1) s-=evalPos(x,y,1);
    }
  }

  return s;
}

/* ===== CPU ===== */
function cpuMove(){

  const moves = getMoves();

  let best=null;
  let bestScore=-Infinity;

  for(let m of moves){

    board[m.y][m.x]=2;

    const score = -negamax(DEPTH-1,1);

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  if(best) place(best.x,best.y,2);
}

init();
