// Implements minimax. Returns the min/max-ed score and list of moves.
// Score is specified as the P1's score minus P2's scored.
function minimax(game, depth, moves, maximizing) {
  if (depth == 0 || game.winner != null) {
    return [game.captured[0] - game.captured[1], moves];
  }

  if (maximizing) {
    let maxEval = -Infinity;
    let maxMoves;
    game.permissibleMoves.forEach((move) => {
      const gameClone = game.clone();
      gameClone.play(move);
      const [score, nodeMoves] = minimax(
        gameClone,
        depth - 1,
        moves + move,
        false,
      );
      if (score > maxEval) {
        maxEval = score;
        maxMoves = nodeMoves;
      }
    });

    return [maxEval, maxMoves];
  } else {
    let minEval = +Infinity;
    let minMoves;
    game.permissibleMoves.forEach((move) => {
      const gameClone = game.clone();
      gameClone.play(move);
      const [score, nodeMoves] = minimax(
        gameClone,
        depth - 1,
        moves + move,
        true,
      );
      if (score < minEval) {
        minEval = score;
        minMoves = nodeMoves;
      }
    });

    return [minEval, minMoves];
  }
}

module.exports = minimax;
