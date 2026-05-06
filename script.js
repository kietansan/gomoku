const SIZE = 13;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let turn = 1;
let gameOver = false;
let thinking = false;
let audio;

const HOSHI = [[3,3],[3,9],[9,3],[9,9],[6,6]];

window.onload = () => {
  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");
  audio = document.getElementById("putSound");

  canvas.width = (SIZE-1)*CELL + MARGIN*2;
  canvas.height = (SIZE-1)*CELL + MARGIN*2;

  board = Array.from({length: SIZE}, ()=>Array(SIZE).fill(0));

  setInfo("あなたの番です");
  draw();
};

function setInfo(t){
  document.getElementById("info").textContent = t;
}

function draw(){
  ctx.fillStyle="#d8b56a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle="#333";
  for(let i=0; i<SIZE; i++){
    ctx.beginPath();
    ctx.moveTo(MARGIN + i*CELL, MARGIN);
    ctx.lineTo(MARGIN + i*CELL, MARGIN + (SIZE-1)*CELL);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + i*CELL);
    ctx.lineTo(MARGIN + (SIZE-1)*CELL, MARGIN + i*CELL);
    ctx.stroke();
  }

  for(const [x,y] of HOSHI){
    ctx.beginPath();
    ctx.arc(MARGIN + x*CELL, MARGIN + y*CELL, 3, 0, Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0; y<SIZE; y++){
    for(let x=0; x<SIZE; x++){
      if(board[y][x]) drawStone(x,y,board[y][x]);
    }
  }
}

function drawStone(x, y, p){
  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;
  const g = ctx.createRadialGradient(cx-3, cy-3, 2, cx, cy, 14);
  if(p===1){
    g.addColorStop(0, "#666");
    g.addColorStop(1, "#000");
  } else {
    g.addColorStop(0, "#fff");
    g.addColorStop(1, "#aaa");
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI*2);
  ctx.fillStyle = g;
  ctx.fill();
}

document.addEventListener("click", (e) => {
  if(gameOver || turn!==1 || thinking) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left - MARGIN)/CELL);
  const y = Math.round((e.clientY - rect.top - MARGIN)/CELL);

  if(x<0 || y<0 || x>=SIZE || y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x] = 1;
  draw();
  playSound();

  if(checkWin(x,y,1)){
    gameOver=true;
    setInfo("あなたの勝ち！");
    return;
  }

  turn = 2;
  thinking = true;
  setInfo("CPU思考中...");
  setTimeout(cpuMove, 10);
});

function playSound(){
  if(!audio) return;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
}

/* ================= CPU ================= */
function cpuMove(){
  if(gameOver) return;

  const candidates = getAllEmptyCells();
  let best = null;
  let maxScore = -Infinity;

  for(const pos of candidates){
    const score = evaluateMove(pos,2);
    if(score>maxScore){
      maxScore = score;
      best = pos;
    }
  }

  if(best) place(best,2);
}

function evaluateMove(pos,p){
  const opp = (p===1)?2:1;

  // ①即勝ち
  board[pos.y][pos.x]=p;
  if(checkWin(pos.x,pos.y,p)){
    board[pos.y][pos.x]=0;
    return 100000;
  }
  board[pos.y][pos.x]=0;

  // ②即死防御（4連）
  board[pos.y][pos.x]=opp;
  if(checkWin(pos.x,pos.y,opp)){
    board[pos.y][pos.x]=0;
    return 90000;
  }
  board[pos.y][pos.x]=0;

  // ③両端空き3防御
  if(isDoubleEnded3(pos,opp)) return 80000;

  // ④ダブル脅威攻め
  if(isDoubleEnded3(pos,p)) return 70000;

  // ⑤ダブル脅威防御
  if(isTwoThreats(pos,opp)) return 60000;

  // ⑥候補生成周囲優先
  let score = evaluateLinePotential(pos,p);

  // ⑦簡易3手先先読み
  score += simulateNext(pos,p);

  return score;
}

function isDoubleEnded3(pos,p){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let count=1, emptyBefore=false, emptyAfter=false;
    for(let i=1;i<=2;i++){
      const nx=pos.x-dx*i, ny=pos.y-dy*i;
      if(board[ny]?.[nx]===p) count++;
      else if(board[ny]?.[nx]===0){emptyBefore=true; break;}
      else break;
    }
    for(let i=1;i<=2;i++){
      const nx=pos.x+dx*i, ny=pos.y+dy*i;
      if(board[ny]?.[nx]===p) count++;
      else if(board[ny]?.[nx]===0){emptyAfter=true; break;}
      else break;
    }
    if(count===3 && emptyBefore && emptyAfter) return true;
  }
  return false;
}

function isTwoThreats(pos,p){
  let cnt=0;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let count=1;
    for(let i=1;i<=2;i++){
      const nx=pos.x+dx*i, ny=pos.y+dy*i;
      if(board[ny]?.[nx]===p) count++;
      else break;
    }
    for(let i=1;i<=2;i++){
      const nx=pos.x-dx*i, ny=pos.y-dy*i;
      if(board[ny]?.[nx]===p) count++;
      else break;
    }
    if(count>=3) cnt++;
  }
  return cnt>=2;
}

function evaluateLinePotential(pos,p){
  let score=0;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let count=0;
    for(let i=1;i<=2;i++){
      const nx=pos.x+dx*i, ny=pos.y+dy*i;
      if(board[ny]?.[nx]===p) count++;
    }
    for(let i=1;i<=2;i++){
      const nx=pos.x-dx*i, ny=pos.y-dy*i;
      if(board[ny]?.[nx]===p) count++;
    }
    score += count*10;
  }
  return score;
}

// 簡易3手先評価（周囲1手のみ）
function simulateNext(pos,p){
  let score=0;
  board[pos.y][pos.x]=p;
  const opp = (p===1)?2:1;
  const candidates = getAllEmptyCells();
  for(const next of candidates){
    board[next.y][next.x]=opp;
    if(checkWin(next.x,next.y,opp)) score -= 500;
    board[next.y][next.x]=0;
  }
  board[pos.y][pos.x]=0;
  return score;
}

function getAllEmptyCells(){
  const list=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x]) list.push({x,y});
    }
  }
  return list;
}

function place(pos,p){
  board[pos.y][pos.x]=p;
  draw();
  playSound();

  if(checkWin(pos.x,pos.y,p)){
    gameOver=true;
    setInfo(p===1?"あなたの勝ち！":"CPUの勝ち！");
  }

  turn=1;
  thinking=false;
  if(!game
