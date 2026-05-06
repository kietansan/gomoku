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

/* 描画 */
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
    draw();
    return;
  }

  draw();
  setTimeout(cpuMove, 80);
}

/* CPU（強化版） */
function cpuMove(){
  if(gameOver) return;

  const moves = getMoves();

  // 1. CPU勝利チェック
  for(const m of moves){
    board[m.y][m.x] = 2;
    if(checkWin(m.x, m.y, 2)){
      finalizeCPU(m);
      return;
    }
    board[m.y][m.x] = 0;
  }

  // 2. プレイヤーの勝ち阻止
  for(const m of moves){
    board[m.y][m.x] = 1;
    if(checkWin(m.x, m.y, 1)){
      board[m.y][m.x] = 0;
      board[m.y][m.x] = 2;
      finalizeCPU(m);
      return;
    }
    board[m.y][m.x] = 0;
  }

  // 3. 評価して最善手
  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){
    const score = evaluate(m.x, m.y, 2);
    if(score > bestScore){
      bestScore = score;
      best = m;
    }
  }

  board[best.y][best.x] = 2;
  finalizeCPU(best);
}

/* CPU確定処理 */
function finalizeCPU(m){
  playSound();

  if(checkWin(m.x, m.y, 2)){
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

    for(const d of [-1,1]){
      let nx = x + dx*d;
      let ny = y + dy*d;

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

/* 候補手生成（近傍だけ） */
function getMoves(){
  const moves = [];
  const center = SIZE / 2;

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

      moves.push({x,y});
    }
  }

  return moves.length ? moves : [{x:7,y:7}];
}

/* 評価関数（強化AIの核） */
function evaluate(x,y,p){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let score = 0;

  for(const [dx,dy] of dirs){
    let count = 0;

    for(const d of [-1,1]){
      let nx = x + dx*d;
      let ny = y + dy*d;

      while(board[ny]?.[nx] === p){
        count++;
        nx += dx*d;
        ny += dy*d;
      }
    }

    score += count * count * 10;
  }

  // 中央ボーナス
  const center = SIZE / 2;
  score -= (Math.abs(x-center) + Math.abs(y-center)) * 2;

  return score;
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
