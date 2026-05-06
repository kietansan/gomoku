function cpuMove(board){

  const SIZE = board.length;

  // 方向（横・縦・斜め）
  const DIR = [
    [1,0],[0,1],[1,1],[1,-1]
  ];

  let bestMove = null;
  let bestScore = -Infinity;

  // =========================
  // 評価関数
  // =========================
  function evaluate(x, y, player){

    let score = 0;

    for(const [dx,dy] of DIR){

      let count = 0;

      // 前方向
      for(let i=1;i<5;i++){
        const nx = x + dx*i;
        const ny = y + dy*i;
        if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
        if(board[ny][nx] === player) count++;
        else break;
      }

      // 後ろ方向
      for(let i=1;i<5;i++){
        const nx = x - dx*i;
        const ny = y - dy*i;
        if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
        if(board[ny][nx] === player) count++;
        else break;
      }

      // スコア化
      if(count >= 4) score += 10000;
      else if(count === 3) score += 1000;
      else if(count === 2) score += 100;
      else if(count === 1) score += 10;
    }

    return score;
  }

  // =========================
  // 1. 即勝ちチェック
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      board[y][x] = 2;

      if(isWin(board, x, y, 2)){
        board[y][x] = 0;
        return {x, y};
      }

      board[y][x] = 0;
    }
  }

  // =========================
  // 2. 相手の即勝ち防御
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      board[y][x] = 1;

      if(isWin(board, x, y, 1)){
        board[y][x] = 0;
        return {x, y};
      }

      board[y][x] = 0;
    }
  }

  // =========================
  // 3. 通常評価（攻撃重視）
  // =========================
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] !== 0) continue;

      let attack = evaluate(x, y, 2);
      let defense = evaluate(x, y, 1) * 0.9;

      let score = attack + defense;

      if(score > bestScore){
        bestScore = score;
        bestMove = {x, y};
      }
    }
  }

  return bestMove;
}

/* =========================
   勝利チェック（局所用）
========================= */
function isWin(board, x, y, player){

  const DIR = [
    [1,0],[0,1],[1,1],[1,-1]
  ];

  const SIZE = board.length;

  for(const [dx,dy] of DIR){

    let count = 1;

    for(let i=1;i<5;i++){
      const nx = x + dx*i;
      const ny = y + dy*i;

      if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
      if(board[ny][nx] !== player) break;

      count++;
    }

    for(let i=1;i<5;i++){
      const nx = x - dx*i;
      const ny = y - dy*i;

      if(nx<0||ny<0||nx>=SIZE||ny>=SIZE) break;
      if(board[ny][nx] !== player) break;

      count++;
    }

    if(count >= 5) return true;
  }

  return false;
}
