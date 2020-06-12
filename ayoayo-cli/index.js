const Ayoayo = require('@chidiwilliams/ayoayo');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.write(` █████  ██    ██  ██████   █████  ██    ██  ██████ 
██   ██  ██  ██  ██    ██ ██   ██  ██  ██  ██    ██ 
███████   ████   ██    ██ ███████   ████   ██    ██ 
██   ██    ██    ██    ██ ██   ██    ██    ██    ██ 
██   ██    ██     ██████  ██   ██    ██     ██████  
                                                   
Let's play!
To begin, enter the column number for the cell you wish to pick from (1-6).`);

const ayoayo = new Ayoayo();

requestUserInput();

function requestUserInput() {
  readline.write(boardText(ayoayo.board, ayoayo.captured));

  if (ayoayo.isGameOver) {
    readline.write(`GAME OVER. Winner: Player ${ayoayo.winner + 1}`);
    readline.close();
    return;
  }

  const question = `\nPlayer ${ayoayo.nextPlayer + 1}'s turn. Pick a cell: `;
  readline.question(question, (cell) => {
    const cellNum = Number(cell);

    if (
      Number.isNaN(cellNum) ||
      !ayoayo.permissibleMoves.includes(cellNum - 1)
    ) {
      readline.write('Please enter a valid and allowed cell index.');
      requestUserInput();
      return;
    }

    ayoayo.play(cellNum - 1);
    requestUserInput();
  });
}

function boardText(board, captured) {
  let s = `\n\n             1      2      3      4      5      6       Captured\n         -------------------------------------------  ------------\n`;

  board.forEach((row, rowIndex) => {
    s += `Player ${rowIndex + 1} |`;
    row.forEach((cell) => {
      s += `  ${padDigit(cell)}  |`;
    });

    const capturedCount = padDigit(captured[rowIndex]);
    s += `  |    ${capturedCount}    |\n         -------------------------------------------  ------------\n`;
  });

  return s;
}

function padDigit(val) {
  if (val < 10) {
    return ' ' + val;
  }
  return '' + val;
}
