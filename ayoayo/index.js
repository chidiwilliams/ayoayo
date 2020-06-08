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
  this.permissibleMoves = [0, 1, 2, 3, 4, 5];
}

Ayoayo.NUM_COLUMNS = 6;

Ayoayo.events = {
  GAME_OVER: 'game_over',
  DROP_SEED: 'drop_seed',
  SWITCH_TURN: 'switch_turn',
  MOVE_TO: 'move_to',
  PICKUP_SEEDS: 'pickup_seeds',
  CAPTURE: 'capture',
};

util.inherits(Ayoayo, events.EventEmitter);

// Plays the next turn for the current player
Ayoayo.prototype.play = function play(cell) {
  if (!this.permissibleMoves.includes(cell)) {
    throw new Error('Not permitted to play this cell');
  }

  // Relay-sow. Update board and increment captures.
  let captured;
  [this.board, captured] = Ayoayo.relaySow(
    this.board,
    this.nextPlayer,
    cell,
    (eventType, ...args) => this.emit(eventType, ...args),
  );
  this.captured[0] += captured[0];
  this.captured[1] += captured[1];

  // Toggle to next player
  this.nextPlayer = Ayoayo.togglePlayer(this.nextPlayer);
  this.emit(Ayoayo.events.SWITCH_TURN, this.nextPlayer);

  this.permissibleMoves = Ayoayo.getPermissibleMoves(
    this.board,
    this.nextPlayer,
  );

  // Next player can't move. Capture remaining seeds. Game over.
  if (this.permissibleMoves.length == 0) {
    let countRemaining = 0;
    this.board[this.nextPlayer].forEach((cell, index) => {
      if (cell > 0) {
        countRemaining += cell;
        this.board[this.nextPlayer][index] = 0;
        this.emit(
          Ayoayo.events.CAPTURE,
          this.nextPlayer,
          index,
          this.nextPlayer,
        );
      }
    });
    this.captured[this.nextPlayer] += countRemaining;

    this.isGameOver = true;
    this.winner = Ayoayo.getWinner(this.captured);
    this.emit(Ayoayo.events.GAME_OVER, this.winner);
  }
};

// Relay-sows the seeds starting from cell and returns
// the updated board and number of captured seeds.
// Reports events by calling emit.
Ayoayo.relaySow = function relaySow(
  board,
  player,
  cell,
  emit = function (_eventType, ..._args) {},
) {
  const captured = [0, 0];

  // Pickup seeds
  let numSeedsInHand = board[player][cell];
  board[player][cell] = 0;
  emit(Ayoayo.events.PICKUP_SEEDS, player, cell);

  // Move to next cell position
  const nextPosition = this.next(player, cell);
  emit(Ayoayo.events.MOVE_TO, [player, cell], nextPosition);
  let [nextPositionRow, nextPositionCell] = nextPosition;

  // Terminate when all seeds have been dropped and
  // no continuing pickup was done
  while (numSeedsInHand > 0) {
    // Drop one seed in next cell
    board[nextPositionRow][nextPositionCell]++;
    numSeedsInHand--;
    emit(Ayoayo.events.DROP_SEED, nextPositionRow, nextPositionCell);

    // If the cell has four seeds, capture. If this is the last seed in hand,
    // give to the current player. If not, give to the owner of the row.
    if (board[nextPositionRow][nextPositionCell] == 4) {
      const capturer = numSeedsInHand == 0 ? player : nextPositionRow;
      captured[capturer] += 4;
      board[nextPositionRow][nextPositionCell] = 0;
      emit(Ayoayo.events.CAPTURE, nextPositionRow, nextPositionCell, capturer);
    }

    // Relay. If this is the last seed in hand and the cell was not originally empty,
    // pickup the seeds in the cell.
    if (numSeedsInHand == 0 && board[nextPositionRow][nextPositionCell] > 1) {
      numSeedsInHand = board[nextPositionRow][nextPositionCell];
      board[nextPositionRow][nextPositionCell] = 0;
      emit(Ayoayo.events.PICKUP_SEEDS, nextPositionRow, nextPositionCell);
    }

    // Move to next position
    const nextPosition = Ayoayo.next(nextPositionRow, nextPositionCell);
    emit(
      Ayoayo.events.MOVE_TO,
      [nextPositionRow, nextPositionCell],
      nextPosition,
    );
    [nextPositionRow, nextPositionCell] = nextPosition;
  }

  return [board, captured];
};

Ayoayo.togglePlayer = function togglePlayer(player) {
  return player == 0 ? 1 : 0;
};

// Returns a list of all possible cells the next player can play.
// A player may play only cells with at least one seed.
// If the other player has no seeds, the current player must "feed" them, if possible.
Ayoayo.getPermissibleMoves = function getPermissibleMoves(board, player) {
  const otherPlayer = Ayoayo.togglePlayer(player);
  const nonEmptyCellIndexes = board[player]
    .map((_, index) => index)
    .filter((cellIndex) => board[player][cellIndex] > 0);

  // If the other player has seeds, permit all non-empty cells
  const otherPlayerCanPlayNextTurn = board[otherPlayer].some(
    (cell) => cell > 0,
  );
  if (otherPlayerCanPlayNextTurn) {
    return nonEmptyCellIndexes;
  }

  // Other player has no seeds, permit only non-empty cells that feed
  return nonEmptyCellIndexes.filter((cellIndex) => {
    const boardCopy = [[...board[0]], [...board[1]]];
    const [boardIfCellPlayed] = this.relaySow(boardCopy, player, cellIndex);
    return boardIfCellPlayed[otherPlayer].some((cell) => cell > 0);
  });
};

// Returns the winning player or -1, if draw.
Ayoayo.getWinner = function getWinner(captured) {
  if (captured[0] == captured[1]) {
    return -1;
  }
  if (captured[0] > captured[1]) {
    return 0;
  }
  return 1;
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
