const SIZE = 15;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

/* 初期化 */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

/* 描画（見た目安定版） */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x] === 1) cell.classList.add("black");
      if(board[y][x] === 2) cell.classList.add("white");

      cell.onclick = () => playerMove(x,y);
      row.appendChild(cell);
    }

    boardEl.appendChild(row);
  }
}

/* プレイヤー */
function playerMove(x,y){
  if(gameOver || board[y][x] !== 0) return;

  board[y][x] = 1;
  playSound();

  if(checkWin(x,y,1)){
    infoEl.textContent = "あなたの勝ち";
    gameOver = true;
  }

  draw();
  setTimeout(cpuMove, 50);
}

/* CPU（簡易） */
function cpuMove(){
  if(gameOver) return;

  const moves = getMoves();
  const m = moves[0];

  board[m.y][m.x] = 2;
  playSound();

  if(checkWin(m.x,m.y,2)){
    infoEl.textContent = "CPUの勝ち";
    gameOver = true;
  } else {
    infoEl.textContent = "あなたの番";
  }

  draw();
}

/* 勝利判定 */
function checkWin(x,y,p){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    let count = 1;

    for(let d=-1; d<=1; d+=2){
      let nx=x+dx*d, ny=y+dy*d;

      while(board[ny]?.[nx] === p){
        count++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    if(count >= 5) return true;
  }

  return false;
}

/* 候補手 */
function getMoves(){
  const moves = [];
  const center = SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] !== 0) continue;

      let near = false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx] !== 0) near = true;
        }
      }

      if(!near) continue;

      const score =
        -Math.abs(x-center) -
        Math.abs(y-center);

      moves.push({x,y,score});
    }
  }

  moves.sort((a,b)=>b.score-a.score);

  return moves.length ? moves : [{x:7,y:7}];
}

/* 音 */
function playSound(){
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

/* リセット */
function resetGame(){
  init();
  infoEl.textContent = "あなたの番です";
}

/* 起動 */
init();
