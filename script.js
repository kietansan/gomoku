function isOpenThree(x,y,p){
  board[y][x]=p;

  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  let found=false;

  for(let [dx,dy] of dirs){
    let count=1;
    let open=0;

    let nx=x+dx, ny=y+dy;
    while(board[ny]?.[nx]===p){ count++; nx+=dx; ny+=dy; }
    if(board[ny]?.[nx]===0) open++;

    nx=x-dx, ny=y-dy;
    while(board[ny]?.[nx]===p){ count++; nx-=dx; ny-=dy; }
    if(board[ny]?.[nx]===0) open++;

    if(count===3 && open===2){
      found=true;
      break;
    }
  }

  board[y][x]=0;
  return found;
}

/* ===== 最終判断（修正版） ===== */
function getBestMove(){
  const moves=getMoves();

  // ① 即勝ち
  for(let m of moves){
    board[m.y][m.x]=2;
    if(checkWin(m.x,m.y,2)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // ② 即防御（5）
  for(let m of moves){
    board[m.y][m.x]=1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x]=0;
      return m;
    }
    board[m.y][m.x]=0;
  }

  // ③ 相手の4を止める
  for(let m of moves){
    if(isOpenFour(m.x,m.y,1)){
      return m;
    }
  }

  // ★ ④ 相手の開いた3を止める（追加）
  for(let m of moves){
    if(isOpenThree(m.x,m.y,1)){
      return m;
    }
  }

  // ⑤ 自分の4
  for(let m of moves){
    if(isOpenFour(m.x,m.y,2)){
      return m;
    }
  }

  // ⑥ ダブル三
  for(let m of moves){
    if(isDoubleThree(m.x,m.y,2)){
      return m;
    }
  }

  // ⑦ 脅威探索
  const move = threatSearch(2,2);
  if(move) return move;

  // fallback
  return moves[Math.floor(Math.random()*moves.length)];
}
