function draw(){

  boardEl.innerHTML = "";

  /* 線 */
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

  /* 交点 */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell=document.createElement("div");
      cell.className="cell";
      cell.style.left=(x*CELL)+"px";
      cell.style.top=(y*CELL)+"px";

      // 星
      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        cell.appendChild(s);
      }

      // 石
      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        cell.appendChild(s);
      }

      cell.onclick=()=>{
        if(gameOver || board[y][x]) return;

        place(x,y,1);

        if(!gameOver){
          setTimeout(cpuMove,50);
        }
      };

      boardEl.appendChild(cell);
    }
  }
}
