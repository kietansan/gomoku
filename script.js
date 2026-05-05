const SIZE = 10;
const board = document.getElementById("board");

for (let y = 0; y < SIZE; y++) {
  const row = document.createElement("div");

  for (let x = 0; x < SIZE; x++) {
    const cell = document.createElement("button");

    cell.onclick = () => {
      cell.textContent = "●";
    };

    row.appendChild(cell);
  }

  board.appendChild(row);
}
