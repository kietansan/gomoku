function cpuMove(){

  // =========================
  // ① 即勝ち
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=2;
      if(checkWin(x,y,2)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // =========================
  // ② 即死防御
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      board[y][x]=1;
      if(checkWin(x,y,1)){
        board[y][x]=0;
        place(x,y,2);
        return;
      }
      board[y][x]=0;
    }
  }

  // =========================
  // ③ 危険形防御
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(isDanger(x,y,1)){
        place(x,y,2);
        return;
      }
    }
  }

  // =========================
  // ④ ダブル脅威（攻め）
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(threatCount(x,y,2) >= 2){
        place(x,y,2);
        return;
      }
    }
  }

  // =========================
  // ⑤ ダブル脅威防御
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]) continue;

      if(threatCount(x,y,1) >= 2){
        place(x,y,2);
        return;
      }
    }
  }

  // =========================
  // ⑥ 候補生成
  // =========================
  const moves = getMoves();

  // =========================
  // ⑦ 評価（最良選択）
  // =========================
  let best = null;
  let bestScore = -Infinity;

  for(const m of moves){

    board[m.y][m.x] = 2;

    let worst = Infinity;

    const replies = getMoves();

    for(const n of replies){

      board[n.y][n.x] = 1;

      const score =
        evalPos(n.x,n.y,1) -
        evalPos(m.x,m.y,2);

      board[n.y][n.x] = 0;

      if(score < worst) worst = score;
    }

    board[m.y][m.x] = 0;

    if(worst > bestScore){
      bestScore = worst;
      best = m;
    }
  }

  if(best){
    place(best.x,best.y,2);
  }
}
