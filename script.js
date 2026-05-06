function draw(){

  boardEl.innerHTML="";

  /* 線レイヤー */
  const lines = document.createElement("div");
  lines.className="lines";

  for(let i=0;i<SIZE;i++){

    const h=document.createElement("div");
    h.className="line h-line";
    h.style.top=(i*CELL+CELL/2)+"px";
    lines.appendChild(h);

    const v=document.createElement("div");
    v.className="line v-line";
    v.style.left=(i*CELL+CELL/2)+"px";
    lines.appendChild(v);
  }

  boardEl.appendChild(lines);

  /* 交点 */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const cell=document.createElement("div");
      cell.className="cell";
      cell.style.left=(x*CELL)+"px";
      cell.style.top=(y*CELL)+"px";

      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        cell.appendChild(s);
      }

      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        cell.appendChild(s);
      }

      cell.onclick=()=>{
        if(gameOver||board[y][x]) return;
        place(x,y,1);
        if(!gameOver) setTimeout(cpuMove,10);
      };

      boardEl.appendChild(cell);
    }
  }
}
