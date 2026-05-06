function cpuMove(){

  // 超シンプルCPU（ランダム）
  let x, y;

  do {
    x = Math.floor(Math.random() * SIZE);
    y = Math.floor(Math.random() * SIZE);
  } while(board[y][x] !== 0);

  board[y][x] = 2;

  draw();
  playSound();
}
