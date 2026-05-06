const SIZE = 13;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");

function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  draw();
}

function isStar(x,y){
  return (
    (x===3 && y===3) ||
    (x===3 && y===9) ||
    (x===9 && y===3) ||
    (x===9 && y===9) ||
    (x===6 && y===6)
  );
}

function draw(){
  boardEl.innerHTML = "";

  for(let y=0;y<SIZE;y++){
    const row = document.createElement("div");
    row.className = "row";

    for(let x=0;x<SIZE;x++){
      const node = document.createElement("div");
      node.className = "node";

      if(isStar(x,y)) node.classList.add("star");

      if(board[y][x]){
        const s = document.createElement("div");
        s.className = "stone " + (board[y][x]===1 ? "black" : "white");
        node.appendChild(s);
      }

      node.onclick = () => {
        if(board[y][x]) return;
        board[y][x] = 1;
        draw();
      };

      row.appendChild(node);
    }

    boardEl.appendChild(row);
  }
}

init();
