const Ayoayo = require('.');
const minimax = require('./minimax');

const MINIMAX_DEPTH = 3;

function randomPlayer(game) {
  const randIndex = Math.floor(Math.random() * game.permissibleMoves.length);
  return game.permissibleMoves[randIndex];
}

function minimaxPlayer(game, isFirstPlayer) {
  const [, moves] = minimax(game, MINIMAX_DEPTH, '', isFirstPlayer);
  return Number(moves[0]);
}

function playGame(player1, player2) {
  const game = new Ayoayo();

  while (true) {
    const player1Move = player1(game, true);
    game.play(player1Move);
    if (game.isGameOver) break;

    const player2Move = player2(game, false);
    game.play(player2Move);
    if (game.isGameOver) break;
  }

  return game.winner;
}

function testAll() {
  // {
  //   // minimax vs random
  //   const n = 50;
  //   const scores = [0, 0, 0];
  //   for (let i = 0; i < n; i++) {
  //     const winner = playGame(minimaxPlayer, randomPlayer);
  //     scores[winner + 1]++;
  //   }
  //   console.log(
  //     `Played ${n} game(s)\nMinimax: ${scores[1]}\nRandom: ${scores[2]}\nDraw: ${scores[0]}`,
  //   );
  // }

  // {
  //   // random vs minimax
  //   const n = 100;
  //   const scores = [0, 0, 0];
  //   for (let i = 0; i < n; i++) {
  //     const winner = playGame(randomPlayer, minimaxPlayer);
  //     scores[winner + 1]++;
  //   }
  //   console.log(
  //     `Played ${n} game(s)\nMinimax: ${scores[2]}\nRandom: ${scores[1]}\nDraw: ${scores[0]}`,
  //   );
  // }

  {
    // random vs random
    const n = 2000;
    const scores = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const winner = playGame(randomPlayer, randomPlayer);
      scores[winner + 1]++;
    }
    console.log(
      `Played ${n} game(s)\nRandom 1: ${scores[1]}\nRandom 2: ${scores[2]}\nDraw: ${scores[0]}`,
    );
  }
}

testAll();
