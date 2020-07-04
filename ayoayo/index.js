const util = require('util');
const events = require('events');
const minimax = require('./minimax');

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

Ayoayo.TOTAL_NUM_SEEDS = 48;
Ayoayo.NUM_CELLS_PER_ROW = 6;

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

  // No point proceeding if the next player has no more moves,
  // or if someone has more than half of the seeds
  const shouldEndGame =
    this.permissibleMoves.length == 0 ||
    this.captured.some((count) => count > Ayoayo.TOTAL_NUM_SEEDS / 2);
  // Capture remaining seeds if the opponent is out of moves
  const shouldCaptureRemainingSeeds = this.permissibleMoves.length == 0;

  if (shouldCaptureRemainingSeeds) {
    let numRemainingSeeds = 0;
    this.board[this.nextPlayer] = this.board[this.nextPlayer].map(
      (cell, index) => {
        numRemainingSeeds += cell;
        this.emit(
          Ayoayo.events.CAPTURE,
          this.nextPlayer,
          index,
          this.nextPlayer,
        );
        return 0;
      },
    );
    this.captured[this.nextPlayer] += numRemainingSeeds;
  }

  if (shouldEndGame) {
    this.permissibleMoves = [];
    this.isGameOver = true;
    this.winner = Ayoayo.getWinner(this.captured);
    this.emit(Ayoayo.events.GAME_OVER, this.winner);
  }
};

// Returns a copy of the game state.
// Event listeners are not copied.
Ayoayo.prototype.clone = function clone() {
  const clone = new Ayoayo();
  clone.winner = this.winner;
  clone.captured = this.captured.slice();
  clone.board = this.board.map((row) => row.slice());
  clone.permissibleMoves = this.permissibleMoves.slice();
  clone.nextPlayer = this.nextPlayer;
  return clone;
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
  return (player + 1) % 2;
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
  const otherPlayerHasSeeds = board[otherPlayer].some((cell) => cell > 0);
  if (otherPlayerHasSeeds) {
    return nonEmptyCellIndexes;
  }

  // Other player has no seeds, permit only non-empty cells that feed
  return nonEmptyCellIndexes.filter((cellIndex) => {
    const boardCopy = board.map((row) => row.slice());
    const [boardIfCellPlayed] = Ayoayo.relaySow(boardCopy, player, cellIndex);
    return boardIfCellPlayed[otherPlayer].some((cell) => cell > 0);
  });
};

// Returns the winning player, or -1, if draw.
Ayoayo.getWinner = function getWinner(captured) {
  if (captured[0] == captured[1]) return -1;
  if (captured[0] > captured[1]) return 0;
  return 1;
};

// Returns the next position moving counter-clockwise from the given row and cell
Ayoayo.next = function next(row, cell) {
  if (row == 0) return cell == 0 ? [1, 0] : [0, cell - 1];
  return cell == Ayoayo.NUM_CELLS_PER_ROW - 1
    ? [0, Ayoayo.NUM_CELLS_PER_ROW - 1]
    : [1, cell + 1];
};

// Returns a new instance of Ayoayo that plays
// a minimax move after each call to play()
Ayoayo.vsMinimax = function vsMinimax(depth = 5) {
  const game = new Ayoayo();
  const oldPlayFunc = game.play.bind(game);
  game.play = function minimaxPlay(...args) {
    oldPlayFunc(...args);
    if (game.winner == null) {
      const [, moves] = minimax(game, depth, '', game.nextPlayer == 0);
      const move = Number(moves[0]);
      oldPlayFunc(move);
    }
  };
  return game;
};

module.exports = Ayoayo;
