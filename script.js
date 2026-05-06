const SIZE = 13;
const CELL = 34;

let board = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");

function init(){
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  gameOver = false;
  draw();
}

function draw(){

  boardEl.innerHTML = "";

  // 線
  for(let i=0;i<SIZE;i++){

    const h=document.createElement("div");
    h.className="line h-line";
    h.style.top=(i*CELL+CELL/2)+"px";
    boardEl.appendChild(h);

    const v=document.createElement("div");
    v.className="line v-line";
    v.style.left=(i*CELL+CELL/2)+"px";
    boardEl.appendChild(v);
  }

  // マス
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell=document.createElement("div");
      cell.className="cell";
      cell.style.left=(x*CELL)+"px";
      cell.style.top=(y*CELL)+"px";

      if(board[y][x]){
        const stone=document.createElement("div");
        stone.className="stone " + (board[y][x]===1 ? "black" : "white");
        cell.appendChild(stone);
      }

      cell.onclick=()=>{
        if(gameOver || board[y][x]) return;

        board[y][x]=1;
        draw();

        setTimeout(cpuMove,200);
      };

      boardEl.appendChild(cell);
    }
  }
}

function cpuMove(){

  // 適当に置く（まず動作優先）
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]===0){
        board[y][x]=2;
        draw();
        return;
      }
    }
  }
}

function resetGame(){
  init();
}

init();
