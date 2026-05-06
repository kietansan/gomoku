function cpuMove(){
  if(gameOver) return;

  const moves = getMoves();

  // 1. 勝ちチェック
  for(const m of moves){
    board[m.y][m.x] = 2;
    if(checkWin(m.x,m.y,2)){
      finalizeCPU(m);
      return;
    }
    board[m.y][m.x] = 0;
  }

  // 2. プレイヤーの勝ち阻止
  for(const m of moves){
    board[m.y][m.x] = 1;
    if(checkWin(m.x,m.y,1)){
      board[m.y][m.x] = 0;
      board[m.y][m.x] = 2;
      finalizeCPU(m);
      return;
    }
    board[m.y][m.x] = 0;
  }

  // 3. 評価スコア
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
