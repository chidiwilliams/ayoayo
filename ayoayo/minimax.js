// Implements minimax. Returns the min/max-ed score and list of moves.
// Score is specified as P1's score minus P2's score.
function minimax(game, depth, moves, maximizing) {
  if (depth == 0 || game.winner != null) {
    return [game.captured[0] - game.captured[1], moves];
  }

  if (maximizing) {
    let maxScore = -Infinity;
    let maxMoves;
    game.permissibleMoves.forEach((move) => {
      const gameCopy = game.clone();
      gameCopy.play(move);
      const [score, childMoves] = minimax(
        gameCopy,
        depth - 1,
        moves + move,
        false,
      );
      if (score > maxScore) {
        maxScore = score;
        maxMoves = childMoves;
      }
    });

    return [maxScore, maxMoves];
  } else {
    let minScore = +Infinity;
    let minMoves;
    game.permissibleMoves.forEach((move) => {
      const gameCopy = game.clone();
      gameCopy.play(move);
      const [score, childMoves] = minimax(
        gameCopy,
        depth - 1,
        moves + move,
        true,
      );
      if (score < minScore) {
        minScore = score;
        minMoves = childMoves;
      }
    });

    return [minScore, minMoves];
  }
}

module.exports = minimax;
