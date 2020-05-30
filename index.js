function Ayoayo() {
  this.board = [
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
  ];
  this.captured = [0, 0];
}

Ayoayo.NUM_COLUMNS = 6;

// TODO: Add turns
Ayoayo.prototype.play = function play(player, cell) {
  const numSeedsInCell = this.board[player][cell];
  if (numSeedsInCell === 0) {
    throw new Error('Cell has no seeds');
  }

  // Pickup seeds
  let numSeedsInHand = numSeedsInCell;
  // Remove seeds from pickup position
  this.board[player][cell] = 0;
  let [nextPositionRow, nextPositionCell] = Ayoayo.next(player, cell);
  while (numSeedsInHand > 0) {
    this.board[nextPositionRow][nextPositionCell]++;
    numSeedsInHand--;

    if (this.board[nextPositionRow][nextPositionCell] == 4) {
      const capturer = numSeedsInHand == 0 ? player : nextPositionRow;
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
};

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
