const SIZE = 15;
let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

/* ===== 音 ===== */
const sound = new Audio("1.mp3");
sound.preload = "auto";
function playSound() {
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

/* ===== 初期化 ===== */
function init(){
  board = Array.from({length: SIZE}, ()=>Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* ===== 描画 ===== */
function draw(){
  boardEl.innerHTML="";
  for(let y=0;y<SIZE;y++){
    const row=document.createElement("div");
    row.className="row";

    for(let x=0;x<SIZE;x++){
      const cell=document.createElement("div");
      cell.className="cell";

      if(board[y][x]===1) cell.classList.add("black");
      if(board[y][x]===2) cell.classList.add("white");

      cell.onclick=()=>playerMove(x,y);
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

/* ===== プレイヤー ===== */
function playerMove(x,y){
  if(gameOver || board[y][x]!==0) return;

  board[y][x]=1;
  playSound();

  if(checkWin(x,y,1)){
    infoEl.textContent="あなたの勝ち！";
    gameOver=true;
    draw();
    return;
  }

  draw();
  infoEl.textContent="CPU思考中...";
  setTimeout(cpuMove,30);
}

/* ===== CPU ===== */
function cpuMove(){
  const move = getBestMove();
  if(!move) return;

  board[move.y][move.x]=2;
  playSound();

  if(checkWin(move.x,move.y,2)){
    infoEl.textContent="CPUの勝ち";
    gameOver=true;
    draw();
    return;
  }

  infoEl.textContent="あなたの番";
  draw();
}

/* ===== 勝利判定 ===== */
function checkWin(x,y,p){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  for(let [dx,dy] of dirs){
    let count=1;
    for(let d=-1;d<=1;d+=2){
      let nx=x+dx*d, ny=y+dy*d;
      while(board[ny]?.[nx]===p){
        count++; nx+=dx*d; ny+=dy*d;
      }
    }
    if(count>=5) return true;
  }
  return false;
}

/* ===== 候補手（改善版） ===== */
function getMoves(){
  const moves=[];
  const center=SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==0) continue;

      let near=false;
      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          if(board[y+dy]?.[x+dx]!==0) near=true;
        }
      }
      if(!near) continue;

      let score=0;

      // 中央寄り
      score -= Math.abs(x-center)+Math.abs(y-center);

      // 周囲石
      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]!==0) score+=10;
        }
      }

      moves.push({x,y,score});
    }
  }

  moves.sort((a,b)=>b.score-a.score);
  return moves.slice(0,10);
}

/* ===== 三ブロック検出 ===== */
function findOpenThreeBlocks(player){
  const blocks=[];
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==player) continue;

      for(let [dx,dy] of dirs){
        let line=[[x,y]];

        let nx=x+dx, ny=y+dy;
        while(board[ny]?.[nx]===player){
          line.push([nx,ny]);
          nx+=dx; ny+=dy;
        }

        let nx2=x-dx, ny2=y-dy;
        while(board[ny2]?.[nx2]===player){
          line.unshift([nx2,ny2]);
          nx2-=dx; ny2-=dy;
        }

        if(line.length===3){
          let [sx,sy]=line[0];
          let [ex,ey]=line[2];

          let bx=sx-dx, by=sy-dy;
          let fx=ex+dx, fy=ey+dy;

          if(board[by]?.[bx]===0) blocks.push({x:bx,y:by});
          if(board[fy]?.[fx]===0) blocks.push({x:fx,y:fy});
        }
      }
    }
  }

  return blocks;
}

/* ===== 最終判断 ===== */
function getBestMove(){
  const moves=getMoves();

  // 即勝ち
  for(let m of moves){
    board[m.y][m.x]=2;
    if(checkWin(m.x,m.y,2)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // 即防御
  for(let m of moves){
    board[m.y][m.x]=1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // ★ 三を止める
  const blocks=findOpenThreeBlocks(1);
  if(blocks.length>0) return blocks[0];

  // fallback（中央寄り）
  return moves[0];
}

/* ===== リセット ===== */
function resetGame(){
  init();
  infoEl.textContent="あなたの番です";
}

init();
