// ====== 設定 ======
const SIZE = 13;       // 盤面交点数
const CELL = 40;       // セルサイズ
const MARGIN = 40;     // 余白
let board = [];        // 盤面配列
let canvas, ctx;       // Canvas
let turn = 1;          // 1=Player, 2=CPU
let gameOver = false;
let thinking = false;
let audio;             // 石置き音

// 星の位置
const HOSHI = [[3,3],[3,9],[9,3],[9,9],[6,6]];

// ====== 初期化 ======
window.onload = () => {
  canvas = document.getElementById("board");
  if(!canvas){ alert("Canvas取得失敗"); return; }
  ctx = canvas.getContext("2d");
  audio = document.getElementById("putSound");

  canvas.width = (SIZE-1)*CELL + MARGIN*2;
  canvas.height = (SIZE-1)*CELL + MARGIN*2;

  // 盤面初期化
  board = Array.from({length: SIZE},()=>Array(SIZE).fill(0));

  // 初期状態
  turn = 1;
  gameOver = false;
  thinking = false;

  setInfo("あなたの番です");
  draw();
};

// ====== Info表示 ======
function setInfo(txt){
  document.getElementById("info").textContent = txt;
}

// ====== 盤面描画 ======
function draw(){
  try{
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // 線
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for(let i=0;i<SIZE;i++){
      ctx.beginPath();
      ctx.moveTo(MARGIN + i*CELL, MARGIN);
      ctx.lineTo(MARGIN + i*CELL, MARGIN + (SIZE-1)*CELL);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(MARGIN, MARGIN + i*CELL);
      ctx.lineTo(MARGIN + (SIZE-1)*CELL, MARGIN + i*CELL);
      ctx.stroke();
    }

    // 星
    ctx.fillStyle="#222";
    for(const [x,y] of HOSHI){
      ctx.beginPath();
      ctx.arc(MARGIN + x*CELL, MARGIN + y*CELL, 3, 0, Math.PI*2);
      ctx.fill();
    }

    // 石
    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){
        if(board[y][x]) drawStone(x,y,board[y][x]);
      }
    }

  }catch(e){
    console.error("draw error:", e);
  }
}

// ====== 石描画 ======
function drawStone(x,y,p){
  const cx = MARGIN + x*CELL;
  const cy = MARGIN + y*CELL;
  const g = ctx.createRadialGradient(cx-3, cy-3, 2, cx, cy, 14);
  if(p===1){ g.addColorStop(0,"#666"); g.addColorStop(1,"#000"); }
  else{ g.addColorStop(0,"#fff"); g.addColorStop(1,"#aaa"); }
  ctx.beginPath();
  ctx.arc(cx,cy,14,0,Math.PI*2);
  ctx.fillStyle = g;
  ctx.fill();
}

// ====== クリック処理 ======
canvas.addEventListener("click", (e)=>{
  if(gameOver || turn!==1 || thinking) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left - MARGIN)/CELL);
  const y = Math.round((e.clientY - rect.top - MARGIN)/CELL);

  if(x<0 || y<0 || x>=SIZE || y>=SIZE) return;
  if(board[y][x]) return;

  // プレイヤーの石を置く
  board[y][x] = 1;
  draw();
  playSound();

  if(checkWin(x,y,1)){
    gameOver = true;
    setInfo("あなたの勝ち！");
    return;
  }

  turn = 2;
  thinking = true;
  setInfo("CPU思考中...");
  setTimeout(cpuMove, 50);
});

// ====== 石置き音 ======
function playSound(){
  if(!audio) return;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
}

// ====== CPU思考 ======
function cpuMove(){
  if(gameOver) return;

  const candidates = getAllEmptyCells();
  if(candidates.length===0){ gameOver=true; setInfo("引き分け"); return; }

  let best = null;
  let maxScore = -Infinity;
  for(const pos of candidates){
    const score = evaluateMove(pos,2);
    if(score>maxScore){
      maxScore = score;
      best = pos;
    }
  }

  if(best) placeStone(best,2);

  thinking = false;
  turn = 1;
  setInfo("あなたの番です");
  draw();
}

// ====== 空マス取得 ======
function getAllEmptyCells(){
  const arr = [];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]===0){
        arr.push({x:x,y:y});
      }
    }
  }
  return arr;
}

// ====== 石配置 ======
function placeStone(pos,p){
  board[pos.y][pos.x] = p;
  playSound();
  if(checkWin(pos.x,pos.y,p)){
    gameOver = true;
    setInfo(p===1?"あなたの勝ち！":"CPUの勝ち！");
  }
}

// ====== 勝利判定 ======
function checkWin(x,y,p){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let count=1;
    for(let i=1;i<=4;i++){
      const nx=x+dx*i, ny=y+dy*i;
      if(board[ny]?.[nx]===p) count++;
      else break;
    }
    for(let i=1;i<=4;i++){
      const nx=x-dx*i, ny=y-dy*i;
      if(board[ny]?.[nx]===p) count++;
      else break;
    }
    if(count>=5) return true;
  }
  return false;
}

// ====== 評価関数（正規化AI順序①～⑦） ======
function evaluateMove(pos,p){
  const opp = p===1?2:1;

  // ①即勝ち
  board[pos.y][pos.x] = p;
  if(checkWin(pos.x,pos.y,p)){ board[pos.y][pos.x]=0; return 100000; }
  board[pos.y][pos.x] = 0;

  // ②即死防御(4連)
  board[pos.y][pos.x] = opp;
  if(checkWin(pos.x,pos.y,opp)){ board[pos.y][pos.x]=0; return 90000; }
  board[pos.y][pos.x] = 0;

  // ③両端空き3防御
  if(isDoubleEnded3(pos,opp)) return 80000;

  // ④ダブル脅威攻め
  if(isDoubleEnded3(pos,p)) return 70000;

  // ⑤ダブル脅威防御
  if(isTwoThreats(pos,opp)) return 60000;

  // ⑥候補生成（周囲優先）
  let score = evaluateLinePotential(pos,p);

  // ⑦簡易3手先先読み
  score += simulateNext(pos,p);

  return score;
}

// ====== 両端空き3チェック ======
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
      else if(board[ny]?.[nx]===0){emptyAfter
