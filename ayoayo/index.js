function Ayoayo() {
  this.board = [
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
  ];
  this.captured = [0, 0];
  this.nextPlayer = 0;
  this.isGameOver = false;
  this.winner = null;
}

Ayoayo.NUM_COLUMNS = 6;

Ayoayo.prototype.play = function play(cell) {
  if (this.isGameOver) {
    throw new Error('The game is over');
  }

  const numSeedsInCell = this.board[this.nextPlayer][cell];
  if (numSeedsInCell === 0) {
    throw new Error('Cell has no seeds');
  }

  // Pickup seeds
  let numSeedsInHand = numSeedsInCell;
  this.board[this.nextPlayer][cell] = 0;

  let [nextPositionRow, nextPositionCell] = Ayoayo.next(this.nextPlayer, cell);
  // Terminate when all seeds have been dropped and
  // no continuing pickup was done
  while (numSeedsInHand > 0) {
    // Drop one seed in next cell
    this.board[nextPositionRow][nextPositionCell]++;
    numSeedsInHand--;

    // If the cell has four seeds, capture. If this is the last seed in hand,
    // give to the current player. Else, give to the owner of the row.
    if (this.board[nextPositionRow][nextPositionCell] == 4) {
      const capturer = numSeedsInHand == 0 ? this.nextPlayer : nextPositionRow;
      this.captured[capturer] += 4;
      this.board[nextPositionRow][nextPositionCell] = 0;
    }

    // If this is the last seed in hand and the cell was not originally empty,
    // pickup the seeds in the cell.
    if (
      numSeedsInHand == 0 &&
      this.board[nextPositionRow][nextPositionCell] > 1
    ) {
      numSeedsInHand = this.board[nextPositionRow][nextPositionCell];
      this.board[nextPositionRow][nextPositionCell] = 0;
    }

    // Move to next position
    [nextPositionRow, nextPositionCell] = Ayoayo.next(
      nextPositionRow,
      nextPositionCell,
    );
  }

  // Move to next player by toggling
  this.nextPlayer = this.nextPlayer == 0 ? 1 : 0;
  this.isGameOver = this.checkGameOver();
  if (this.isGameOver) {
    this.winner = this.captured[0] > this.captured[1] ? 0 : 1;
  }
};

// Returns true if all the cells belonging to the next player are empty
Ayoayo.prototype.checkGameOver = function checkGameOver() {
  const nextPlayerCells = this.board[this.nextPlayer];
  for (let i = 0; i < nextPlayerCells.length; i++) {
    if (nextPlayerCells[i] != 0) {
      return false;
    }
  }
  return true;
};

Ayoayo.prototype.cellHasSeeds = function cellHasSeeds(cell) {
  return this.board[this.nextPlayer][cell] > 0;
};

// Returns the next position moving counter-clockwise from the given row and cell
Ayoayo.next = function next(row, cell) {
  if (row == 0) {
    if (cell == 0) {
      return [1, 0];
    }
    return [0, cell - 1];
  }
  if (cell == Ayoayo.NUM_COLUMNS - 1) {
    return [0, Ayoayo.NUM_COLUMNS - 1];
  }
  return [1, cell + 1];
};

module.exports = Ayoayo;
