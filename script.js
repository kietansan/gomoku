const SIZE = 13;
const CELL = 40;
const MARGIN = 40;

let board = [];
let canvas, ctx;
let gameOver = false;
let turn = 1;
let audio;

let cpuCandidates = [];
let cpuIndex = 0;
let cpuPhase = 0; // 0=即勝ち,1=防御,2=ランダム

const HOSHI = [
  [3,3],[3,9],
  [9,3],[9,9],
  [6,6]
];

window.onload = () => {

  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");
  audio = document.getElementById("putSound");

  canvas.width = (SIZE - 1) * CELL + MARGIN * 2;
  canvas.height = (SIZE - 1) * CELL + MARGIN * 2;

  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

  setInfo("あなたの番です");
  draw();
};

function setInfo(t){
  document.getElementById("info").textContent = t;
}

/* =========================
   描画
========================= */
function draw(){

  ctx.fillStyle = "#d8b56a";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#333";

  for(let i=0;i<SIZE;i++){

    ctx.beginPath();
    ctx.moveTo(MARGIN+i*CELL, MARGIN);
    ctx.lineTo(MARGIN+i*CELL, MARGIN+(SIZE-1)*CELL);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN+i*CELL);
    ctx.lineTo(MARGIN+(SIZE-1)*CELL, MARGIN+i*CELL);
    ctx.stroke();
  }

  for(const [x,y] of HOSHI){
    ctx.beginPath();
    ctx.arc(MARGIN+x*CELL, MARGIN+y*CELL, 3, 0, Math.PI*2);
    ctx.fillStyle="#222";
    ctx.fill();
  }

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) drawStone(x,y,board[y][x]);
    }
  }
}

function drawStone(x,y,p){

  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;

  const g = ctx.createRadialGradient(cx-3,cy-3,2,cx,cy,14);

  if(p===1){
    g.addColorStop(0,"#666");
    g.addColorStop(1,"#000");
  }else{
    g.addColorStop(0,"#fff");
    g.addColorStop(1,"#aaa");
  }

  ctx.beginPath();
  ctx.arc(cx,cy,14,0,Math.PI*2);
  ctx.fillStyle=g;
  ctx.fill();
}

/* =========================
   人間ターン
========================= */
document.addEventListener("click",(e)=>{

  if(gameOver) return;
  if(turn !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX-rect.left-MARGIN)/CELL);
  const y = Math.round((e.clientY-rect.top-MARGIN)/CELL);

  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  if(board[y][x]) return;

  board[y][x]=1;

  draw();
  playSound();

  if(checkWin(x,y,1)){
    gameOver=true;
    setInfo("あなたの勝ち！");
    return;
  }

  turn = 2;
  setInfo("CPU思考中...");

  cpuPhase = 0;
  cpuIndex = 0;

  setTimeout(cpuStep, 5);
});

/* =========================
   ★CPU分割処理（ここが核心）
========================= */
function cpuStep(){

  if(gameOver) return;

  // 候補が空なら作る
  if(cpuCandidates.length === 0){

    cpuCandidates = getCandidates();

    // フェーズごとに切り替え
    if(cpuPhase === 0){
      cpuCandidates = shuffle(cpuCandidates);
    }
  }

  // 1フレームで数手だけ処理（重要）
  for(let i=0;i<5;i++){

    if(cpuIndex >= cpuCandidates.length){

      cpuIndex = 0;

      if(cpuPhase === 0){
        cpuPhase = 1; // 防御へ
        cpuCandidates = [];
        setTimeout(cpuStep,5);
        return;
      }

      if(cpuPhase === 1){
        cpuPhase = 2; // ランダムへ
        cpuCandidates = [];
        setTimeout(cpuStep,5);
        return;
      }

      // 完了
      turn = 1;
      setInfo("あなたの番です");
      cpuCandidates = [];
      return;
    }

    const pos = cpuCandidates[cpuIndex++];
    const x = pos.x;
    const y = pos.y;

    if(board[y][x]) continue;

    // ①即勝ち
    if(cpuPhase === 0){
      board[y][x]=2;
      if(checkWin(x,y,2)){
        finishCPU(x,y);
        return;
      }
      board[y][x]=0;
    }

    // ②即防御
    if(cpuPhase === 1){
      board[y][x]=1;
      if(checkWin(x,y,1)){
        board[y][x]=2;
        finishCPU(x,y);
        return;
      }
      board[y][x]=0;
    }

    // ③ランダム
    if(cpuPhase === 2){
      place({x,y},2);
      return;
    }
  }

  setTimeout(cpuStep, 1);
}

/* =========================
   候補生成（超制限）
========================= */
function getCandidates(){

  const list = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x]) continue;

      if(hasNeighbor(x,y)) list.push({x,y});
    }
  }

  // 少なすぎる場合は全体少し補完
  if(list.length < 3){
    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){
        if(!board[y][x]) list.push({x,y});
      }
    }
  }

  return list;
}

/* =========================
   近傍判定
========================= */
function hasNeighbor(x,y){

  for(let dy=-1;dy<=1;dy++){
    for(let dx=-1;dx<=1;dx++){
      if(board[y+dy]?.[x+dx]) return true;
    }
  }

  return false;
}

/* =========================
   決着処理
========================= */
function finishCPU(x,y){

  board[y][x]=2;
  draw();

  gameOver=true;
  setInfo("CPUの勝ち！");
}

/* =========================
   通常配置
========================= */
function place(pos,p){

  board[pos.y][pos.x]=p;
  draw();

  if(checkWin(pos.x,pos.y,p)){
    gameOver=true;
    setInfo(p===1?"あなたの勝ち！":"CPUの勝ち！");
  }
}

/* =========================
   勝利判定
========================= */
function checkWin(x,y,p){

  const d=[[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of d){

    let c=1;

    for(let i=1;i<5;i++){
      if(board[y+dy*i]?.[x+dx*i]===p) c++;
      else break;
    }

    for(let i=1;i<5;i++){
      if(board[y-dy*i]?.[x-dx*i]===p) c++;
      else break;
    }

    if(c>=5) return true;
  }

  return false;
}

/* =========================
   音
========================= */
function playSound(){

  if(!audio) return;

  audio.currentTime=0;
  audio.play().catch(()=>{});
}

/* =========================
   ランダム補助
========================= */
function shuffle(arr){

  return arr.sort(()=>Math.random()-0.5);
}

/* =========================
   リセット
========================= */
window.resetGame=()=>{

  board=Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  gameOver=false;
  turn=1;

  cpuCandidates=[];
  cpuIndex=0;
  cpuPhase=0;

  setInfo("あなたの番です");
  draw();
};
