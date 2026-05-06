const SIZE = 15;
let board = [];

/* ===== 初期化 ===== */
function init() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

/* ===== 勝利判定 ===== */
function checkWin(x, y, p) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (let [dx,dy] of dirs) {
    let count = 1;
    for (let d=-1; d<=1; d+=2) {
      let nx=x+dx*d, ny=y+dy*d;
      while (board[ny]?.[nx] === p) {
        count++; nx+=dx*d; ny+=dy*d;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

/* ===== 近傍手 ===== */
function getMoves() {
  const moves = [];
  for (let y=0;y<SIZE;y++){
    for (let x=0;x<SIZE;x++){
      if (board[y][x]!==0) continue;
      for (let dy=-1;dy<=1;dy++){
        for (let dx=-1;dx<=1;dx++){
          if (board[y+dy]?.[x+dx]!==0){
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

/* ===== 4検出 ===== */
function isOpenFour(x,y,p){
  board[y][x]=p;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  let result=false;

  for(let [dx,dy] of dirs){
    let count=1;
    let open=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){ count++; nx+=dx; ny+=dy; }
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){ count++; nx-=dx; ny-=dy; }
    if(board[ny]?.[nx]===0) open++;

    if(count===4 && open===2){
      result=true;
      break;
    }
  }

  board[y][x]=0;
  return result;
}

/* ===== ダブル三検出 ===== */
function isDoubleThree(x,y,p){
  board[y][x]=p;
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  let threes=0;

  for(let [dx,dy] of dirs){
    let count=1;
    let open=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){ count++; nx+=dx; ny+=dy; }
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx; ny=y-dy;
    while(board[ny]?.[nx]===p){ count++; nx-=dx; ny-=dy; }
    if(board[ny]?.[nx]===0) open++;

    if(count===3 && open===2) threes++;
  }

  board[y][x]=0;
  return threes>=2;
}

/* ===== 脅威探索 ===== */
function threatSearch(player, depth){
  if(depth===0) return null;

  const moves=getMoves();

  for(let m of moves){
    board[m.y][m.x]=player;

    // 勝ち
    if(checkWin(m.x,m.y,player)){
      board[m.y][m.x]=0;
      return m;
    }

    // 開いた4
    if(isOpenFour(m.x,m.y,player)){
      board[m.y][m.x]=0;
      return m;
    }

    // ダブル三
    if(isDoubleThree(m.x,m.y,player)){
      board[m.y][m.x]=0;
      return m;
    }

    // 相手が全部受けても勝てるか
    let forced=true;
    const opponent = player===1?2:1;

    const replies=getMoves();
    for(let r of replies){
      board[r.y][r.x]=opponent;

      const next=threatSearch(player, depth-1);
      board[r.y][r.x]=0;

      if(!next){
        forced=false;
        break;
      }
    }

    board[m.y][m.x]=0;

    if(forced) return m;
  }

  return null;
}

/* ===== 最終手 ===== */
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

  // 脅威探索（ここが本体）
  const move = threatSearch(2,2);
  if(move) return move;

  // fallback（中央寄り）
  return moves[Math.floor(Math.random()*moves.length)];
}
