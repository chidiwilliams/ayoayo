const Ayoayo = require('../ayoayo');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.write(`This is Ayoayo. Let's play!
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

  readline.question(`\nPlayer ${ayoayo.nextPlayer + 1}'s turn: `, (cell) => {
    const cellNum = Number(cell);

    if (Number.isNaN(cellNum) || cellNum < 1 || cellNum > 6) {
      readline.write(
        'Invalid input. Please enter a cell number between 1 and 6.',
      );
      requestUserInput();
      return;
    }

    if (!ayoayo.cellHasSeeds(cellNum - 1)) {
      readline.write('Invalid input. The selected cell has no seeds.');
      requestUserInput();
      return;
    }

    readline.write(`You picked from cell ${cellNum}\n`);
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
