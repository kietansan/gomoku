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

      /* 星 */
      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        cell.appendChild(s);
      }

      /* 石 */
      if(board[y][x]){
        const stone=document.createElement("div");
        stone.className="stone "+(board[y][x]===1?"black":"white");
        cell.appendChild(stone);
      }

      cell.onclick=()=>{
        if(gameOver || board[y][x]) return;

        place(x,y,1);

        if(!gameOver){
          infoEl.textContent="CPU思考中...";
          setTimeout(cpuMove,10);
        }
      };

      boardEl.appendChild(cell);
    }
  }
}

/* ===== 星位置 ===== */
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
    infoEl.textContent = p===1?"あなたの勝ち":"CPUの勝ち";
  }else if(p===2){
    infoEl.textContent="あなたの番です";
  }
}

/* ===== 勝利 ===== */
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

/* ===== 危険検出 ===== */
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

/* ===== ダブル脅威 ===== */
function countThreats(x,y,p){
  let t=0;

  board[y][x]=p;

  for(const [dx,dy] of DIRS){

    let count=1,open=0;

    let nx=x+dx,ny=y+dy;
    while(board[ny]?.[nx]===p){count++;nx+=dx;ny+=dy;}
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx;ny=y-dy;
    while(board[ny]?.[nx]===p){count++;nx-=dx;ny-=dy;}
    if(board[ny]?.[nx]===0) open++;

    if(count>=4 || (count===3 && open===2)) t++;
  }

  board[y][x]=0;
  return t;
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

/* ===== CPU ===== */
function cpuMove(){

  // 勝ち
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

  // ダブル脅威
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      if(countThreats(x,y,2)>=2){
        place(x,y,2);
        return;
      }
    }
  }

  // 危険防御
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;
      if(isDanger(x,y,1)){
        place(x,y,2);
        return;
      }
    }
  }

  // 評価
  let best=null, bestScore=-Infinity;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      const s = evalPos(x,y,2) + evalPos(x,y,1);

      if(s>bestScore){
        bestScore=s;
        best={x,y};
      }
    }
  }

  if(best) place(best.x,best.y,2);
}

init();
