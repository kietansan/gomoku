const SIZE = 15;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const sound = document.getElementById("sound");

/* =========================
   初期化
========================= */
function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  infoEl.textContent = "";
  draw();
}

/* =========================
   描画
========================= */
function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x]){
        const stone = document.createElement("div");
        stone.className = board[y][x]===1?"black":"white";
        cell.appendChild(stone);
      }

      cell.onclick = () => playerMove(x,y);
      row.appendChild(cell);
    }

    boardEl.appendChild(row);
  }
}

/* =========================
   プレイヤー
========================= */
function playerMove(x,y){
  if(gameOver || board[y][x]) return;

  board[y][x]=1;
  playSound();

  if(checkWin(x,y,1)){
    gameOver=true;
    infoEl.textContent="あなたの勝ち";
    draw();
    return;
  }

  draw();
  setTimeout(cpuMove, 5);
}

/* =========================
   CPU（超強化）
========================= */
function cpuMove(){
  if(gameOver) return;

  /* ★① 即勝ち */
  let win = findWin(2);
  if(win){
    place(win);
    if(checkWin(win.x,win.y,2)){
      gameOver=true;
      infoEl.textContent="CPUの勝ち";
    }
    return;
  }

  /* ★② 即死防御 */
  let block = findWin(1);
  if(block){
    place(block);
    return;
  }

  /* ★③ 2手必勝（攻撃） */
  let attack = findTwoStepWin(2);
  if(attack){
    place(attack);
    return;
  }

  /* ★④ 2手必敗回避 */
  let defend = findTwoStepWin(1);
  if(defend){
    place(defend);
    return;
  }

  /* ★⑤ ダブルスレット作成 */
  let ds = findDoubleThreat(2);
  if(ds){
    place(ds);
    return;
  }

  /* ★⑥ 通常探索（強化評価） */
  let best = null;
  let bestScore = -Infinity;

  const moves = getMoves();

  for(const m of moves){

    board[m.y][m.x]=2;

    const score =
      evaluate(m.x,m.y) +
      lookAhead(m.x,m.y,1); // ★2手読み

    board[m.y][m.x]=0;

    if(score>bestScore){
      bestScore=score;
      best=m;
    }
  }

  place(best);
}

/* =========================
   即勝ち・即防御
========================= */
function findWin(p){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;
      if(checkWin(x,y,p)){
        board[y][x]=0;
        return {x,y};
      }
      board[y][x]=0;
    }
  }
  return null;
}

/* =========================
   2手必勝・必敗
========================= */
function findTwoStepWin(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let winCount=0;

      for(const m of getMoves()){
        board[m.y][m.x]=p;
        if(checkWin(m.x,m.y,p)) winCount++;
        board[m.y][m.x]=0;
      }

      board[y][x]=0;

      if(winCount>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   ダブルスレット（超重要）
========================= */
function findDoubleThreat(p){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      board[y][x]=p;

      let threat=0;

      for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
        const {count,open}=getLine(x,y,dx,dy,p);
        if(count===3 && open===2) threat++;
      }

      board[y][x]=0;

      if(threat>=2) return {x,y};
    }
  }

  return null;
}

/* =========================
   候補手
========================= */
function getMoves(){
  const moves=[];
  const c=SIZE/2;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      let score=0;

      for(let dy=-2;dy<=2;dy++){
        for(let dx=-2;dx<=2;dx++){
          const v=board[y+dy]?.[x+dx];
          if(v===2) score+=3;
          if(v===1) score+=4;
        }
      }

      score-=Math.abs(x-c)+Math.abs(y-c);

      moves.push({x,y,score});
    }
  }

  moves.sort((a,b)=>b.score-a.score);
  return moves.slice(0,12);
}

/* =========================
   2手先読み（超重要）
========================= */
function lookAhead(x,y,depth){

  if(depth===0) return 0;

  let score=0;

  for(const m of getMoves()){

    board[m.y][m.x]=2;

    if(checkWin(m.x,m.y,2)) score+=50000;

    score += evaluate(m.x,m.y);

    board[m.y][m.x]=0;
  }

  return score;
}

/* =========================
   評価
========================= */
function evaluate(x,y){
  let score=0;

  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){

    const {count,open}=getLine(x,y,dx,dy,2);

    if(count>=5) score+=100000;
    else if(count===4) score+=40000;
    else if(count===3 && open===2) score+=12000;
    else if(count===2) score+=1500;
  }

  return score;
}

/* =========================
   ライン
========================= */
function getLine(x,y,dx,dy,p){
  let count=1,open=0;

  let nx=x+dx,ny=y+dy;
  while(board[ny]?.[nx]===p){
    count++; nx+=dx; ny+=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  nx=x-dx; ny=y-dy;
  while(board[ny]?.[nx]===p){
    count++; nx-=dx; ny-=dy;
  }
  if(board[ny]?.[nx]===0) open++;

  return {count,open};
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
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

/* =========================
   着手
========================= */
function place(m){
  board[m.y][m.x]=2;
  playSound();
  draw();
}

/* 音 */
function playSound(){
  sound.currentTime=0;
  sound.play().catch(()=>{});
}

/* リセット */
function resetGame(){
  init();
}

init();
