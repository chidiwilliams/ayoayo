const util = require('util');
const events = require('events');

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

Ayoayo.events = {
  GAME_OVER: 'game_over',
  DROP_SEED: 'drop_seed',
  SWITCH_TURN: 'switch_turn',
  MOVE_TO: 'move_to',
  PICKUP_SEEDS: 'pickup_seeds',
  CAPTURE: 'capture',
  END_TURN: 'end_turn',
};

util.inherits(Ayoayo, events.EventEmitter);

Ayoayo.prototype.play = function play(cell) {
  if (this.isGameOver) {
    throw new Error('The game is over');
  }

  const numSeedsInCell = this.board[this.nextPlayer][cell];
  if (numSeedsInCell === 0) {
    throw new Error('Cell has no seeds');
  }

  let numSeedsInHand = this.pickupSeeds(this.nextPlayer, cell);

  let [nextPositionRow, nextPositionCell] = this.moveToNextPosition(
    this.nextPlayer,
    cell,
  );
  // Terminate when all seeds have been dropped and
  // no continuing pickup was done
  while (numSeedsInHand > 0) {
    // Drop one seed in next cell
    this.board[nextPositionRow][nextPositionCell]++;
    numSeedsInHand--;
    this.emit(Ayoayo.events.DROP_SEED, nextPositionRow, nextPositionCell);

    // If the cell has four seeds, capture. If this is the last seed in hand,
    // give to the current player. Else, give to the owner of the row.
    if (this.board[nextPositionRow][nextPositionCell] == 4) {
      this.captureCell(numSeedsInHand, nextPositionRow, nextPositionCell);
    }

    // If this is the last seed in hand and the cell was not originally empty,
    // pickup the seeds in the cell.
    if (
      numSeedsInHand == 0 &&
      this.board[nextPositionRow][nextPositionCell] > 1
    ) {
      numSeedsInHand = this.pickupSeeds(nextPositionRow, nextPositionCell);
    }

    // Move to next position
    [nextPositionRow, nextPositionCell] = this.moveToNextPosition(
      nextPositionRow,
      nextPositionCell,
    );
  }

  // Move to next player by toggling
  this.nextPlayer = this.nextPlayer == 0 ? 1 : 0;
  this.emit(Ayoayo.events.SWITCH_TURN, this.nextPlayer);

  this.isGameOver = this.checkGameOver();
  if (this.isGameOver) {
    this.winner = this.captured[0] > this.captured[1] ? 0 : 1;
    this.emit(Ayoayo.events.GAME_OVER, this.winner);
  }

  this.emit(Ayoayo.events.END_TURN);
};

Ayoayo.prototype.moveToNextPosition = function moveToNextPosition(row, cell) {
  const nextPosition = Ayoayo.next(row, cell);
  this.emit(Ayoayo.events.MOVE_TO, [row, cell], nextPosition);
  return nextPosition;
};

Ayoayo.prototype.captureCell = function captureCell(numSeedsInHand, row, cell) {
  const capturer = numSeedsInHand == 0 ? this.nextPlayer : row;
  this.captured[capturer] += 4;
  this.board[row][cell] = 0;
  this.emit(Ayoayo.events.CAPTURE, row, cell, capturer);
};

Ayoayo.prototype.pickupSeeds = function pickupSeeds(row, cell) {
  const numSeedsInHand = this.board[row][cell];
  this.board[row][cell] = 0;
  this.emit(Ayoayo.events.PICKUP_SEEDS, row, cell);
  return numSeedsInHand;
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
