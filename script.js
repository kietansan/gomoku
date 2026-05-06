function draw(){
  boardEl.innerHTML="";

  const grid=document.createElement("div");
  grid.className="grid";

  /* 横線 */
  const hWrap=document.createElement("div");
  hWrap.className="h-lines";

  for(let i=0;i<SIZE;i++){
    const l=document.createElement("div");
    l.style.top = (i*34 + 17)+"px";
    hWrap.appendChild(l);
  }

  /* 縦線 */
  const vWrap=document.createElement("div");
  vWrap.className="v-lines";

  for(let i=0;i<SIZE;i++){
    const l=document.createElement("div");
    l.style.left = (i*34 + 17)+"px";
    vWrap.appendChild(l);
  }

  grid.appendChild(hWrap);
  grid.appendChild(vWrap);

  /* ノード */
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const node=document.createElement("div");
      node.className="node";

      if(isStar(x,y)){
        const s=document.createElement("div");
        s.className="star";
        node.appendChild(s);
      }

      if(board[y][x]){
        const s=document.createElement("div");
        s.className="stone "+(board[y][x]===1?"black":"white");
        node.appendChild(s);
      }

      node.onclick=()=>{
        if(gameOver||board[y][x]) return;
        place(x,y,1);
        if(!gameOver) setTimeout(cpuMove,50);
      };

      grid.appendChild(node);
    }
  }

  boardEl.appendChild(grid);
}
