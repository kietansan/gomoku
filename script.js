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
  boardEl.innerHTML = "";
  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x]===1) cell.classList.add("black");
      if(board[y][x]===2) cell.classList.add("white");

      cell.onclick = ()=>playerMove(x,y);
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
  setTimeout(cpuMove,10);
}

/* ===== CPU ===== */
function cpuMove(){
  try{
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
  }catch(e){
    console.error(e);
  }
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

/* ===== 評価 ===== */
function getScore(x,y,p){
  let score=0;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(let [dx,dy] of dirs){
    let count=1, open=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){ count++; nx+=dx; ny+=dy; }
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){ count++; nx-=dx; ny-=dy; }
    if(board[ny]?.[nx]===0) open++;

    if(count>=5) return 1000000;
    if(count===4 && open===2) score+=100000;
    else if(count===4) score+=20000;
    else if(count===3 && open===2) score+=5000;
    else if(count===3) score+=500;
  }
  return score;
}

/* ===== 候補手 ===== */
function getMoves(){
  const moves=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==0) continue;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx]!==0){
            moves.push({x,y});
            dy=2;
            break;
          }
        }
      }
    }
  }
  return moves.length?moves:[{x:7,y:7}];
}

/* ===== VCT（強制勝ち探索） ===== */
function vctSearch(player, depth){
  if(depth===0) return false;

  const moves = getMoves();

  for(let m of moves){
    board[m.y][m.x]=player;

    if(checkWin(m.x,m.y,player)){
      board[m.y][m.x]=0;
      return m;
    }

    // 相手が防げないか確認
    const opponent = player===1?2:1;
    let forced=true;

    const replies = getMoves();
    for(let r of replies){
      board[r.y][r.x]=opponent;

      if(!vctSearch(player, depth-1)){
        forced=false;
      }

      board[r.y][r.x]=0;
      if(!forced) break;
    }

    board[m.y][m.x]=0;

    if(forced) return m;
  }

  return false;
}

/* ===== 最終判断 ===== */
function getBestMove(){
  const moves = getMoves();

  // ① 即勝ち
  for(let m of moves){
    board[m.y][m.x]=2;
    if(checkWin(m.x,m.y,2)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // ② 即防御
  for(let m of moves){
    board[m.y][m.x]=1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // ③ VCT（詰み）
  const vct = vctSearch(2,2);
  if(vct) return vct;

  // ④ 通常評価
  let best = moves[0];
  let bestScore = -Infinity;

  const limit = Math.min(moves.length,15);

  for(let i=0;i<limit;i++){
    const m = moves[i];

    board[m.y][m.x]=2;
    let my = getScore(m.x,m.y,2);
    board[m.y][m.x]=0;

    board[m.y][m.x]=1;
    let enemy = getScore(m.x,m.y,1);
    board[m.y][m.x]=0;

    let score = my + enemy*1.3;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  return best;
}

function resetGame(){
  init();
  infoEl.textContent="あなたの番です";
}

init();
