function Ayoayo() {
  this.board = [
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
  ];
  this.captured = [0, 0];
  this.nextPlayer = 0;
  this.isGameOver = false;
}

Ayoayo.NUM_COLUMNS = 6;

Ayoayo.prototype.play = function play(cell) {
  const numSeedsInCell = this.board[this.nextPlayer][cell];
  if (numSeedsInCell === 0) {
    throw new Error('Cell has no seeds');
  }

  // Pickup seeds
  let numSeedsInHand = numSeedsInCell;
  this.board[this.nextPlayer][cell] = 0;

  let [nextPositionRow, nextPositionCell] = Ayoayo.next(this.nextPlayer, cell);
  while (numSeedsInHand > 0) {
    this.board[nextPositionRow][nextPositionCell]++;
    numSeedsInHand--;

    if (this.board[nextPositionRow][nextPositionCell] == 4) {
      const capturer = numSeedsInHand == 0 ? this.nextPlayer : nextPositionRow;
      this.captured[capturer] += 4;
      this.board[nextPositionRow][nextPositionCell] = 0;
    }

    // if last seed in hand, and lands on non-empty, break
    if (
      numSeedsInHand == 0 &&
      this.board[nextPositionRow][nextPositionCell] > 1
    ) {
      // pickup this cell again
      numSeedsInHand = this.board[nextPositionRow][nextPositionCell];
      this.board[nextPositionRow][nextPositionCell] = 0;
    }

    [nextPositionRow, nextPositionCell] = Ayoayo.next(
      nextPositionRow,
      nextPositionCell,
    );
  }

  // Move to next player by toggling
  this.nextPlayer = this.nextPlayer == 0 ? 1 : 0;
  this.isGameOver = this.checkGameOver();
};

Ayoayo.prototype.checkGameOver = function checkGameOver() {
  const nextPlayerCells = this.board[this.nextPlayer];
  for (let i = 0; i < nextPlayerCells.length; i++) {
    if (nextPlayerCells[i] != 0) {
      return false;
    }
  }
  return true;
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
