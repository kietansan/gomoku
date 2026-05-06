function cpuMove(){

  let x, y;

  do {
    x = Math.floor(Math.random()*SIZE);
    y = Math.floor(Math.random()*SIZE);
  } while(board[y][x] !== 0);

  return {x, y};
}
