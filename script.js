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

  // ① CPU即勝ち
  for(const m of moves){
    board[m.y][m.x] = 2;
    if(checkWin(m.x, m.y, 2)){
      finalizeCPU(m);
      return;
    }
    board[m.y][m.x] = 0;
  }

  // ② プレイヤー即死防止（4連・3連ブロック）
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

  // ③ 評価最大手
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

/* 候補手生成（近傍のみ） */
function getMoves(){
  const moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x] !== 0) continue;

      let near = false;

      for(let dy=-1;dy<=1;dy++){
        for(let dx=-1;dx<=1;dx++){
          if(board[y+dy]?.[x+dx] !== 0) near = true;
        }
      }

      if(near) moves.push({x,y});
    }
  }

  return moves.length ? moves : [{x:7,y:7}];
}

/* 評価関数（3連・4連対応） */
function evaluate(x,y,p){
  let score = 0;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    const {count, openEnds} = getLine(x,y,dx,dy,p);
    score += patternScore(count, openEnds);
  }

  // 中央ボーナス（弱め）
  const center = SIZE / 2;
  score -= (Math.abs(x-center) + Math.abs(y-center));

  return score;
}

/* ライン解析 */
function getLine(x,y,dx,dy,p){
  let count = 1;
  let openEnds = 0;

  const check = (nx,ny)=> board[ny]?.[nx] === p;

  // 正方向
  let nx = x + dx;
  let ny = y + dy;
  while(check(nx,ny)){
    count++;
    nx += dx;
    ny += dy;
  }
  if(board[ny]?.[nx] === 0) openEnds++;

  // 逆方向
  nx = x - dx;
  ny = y - dy;
  while(check(nx,ny)){
    count++;
    nx -= dx;
    ny -= dy;
  }
  if(board[ny]?.[nx] === 0) openEnds++;

  return {count, openEnds};
}

/* 形評価 */
function patternScore(count, openEnds){
  if(count >= 4) return 100000;              // 即死
  if(count === 3 && openEnds === 2) return 10000; // 活三
  if(count === 3 && openEnds === 1) return 2000;  // 死三
  if(count === 2 && openEnds === 2) return 500;    // 活二
  if(count === 2) return 100;

  return 0;
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
