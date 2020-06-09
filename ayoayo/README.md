# ayoayo

This package implements the Ayoayo game.

## Installation

```shellscript
npm install @chidiwilliams/ayoayo
```

## Usage

```js
const Ayoayo = require('@chidiwilliams/ayoayo');

const game = new Ayoayo();
console.log(game);
// Ayoayo {
//   board: [ [ 4, 4, 4, 4, 4, 4 ], [ 4, 4, 4, 4, 4, 4 ] ],
//   captured: [ 0, 0 ],
//   nextPlayer: 0,
//   isGameOver: false,
//   winner: null,
//   permissibleMoves: [ 0, 1, 2, 3, 4, 5 ] }

game.play(4); // Player 1 plays cell 4
game.play(2); // Player 2 plays cell 2
console.log(game);
// Ayoayo {
//   board: [ [ 2, 7, 2, 0, 0, 8 ], [ 7, 7, 1, 2, 0, 8 ] ],
//   captured: [ 0, 4 ],
//   nextPlayer: 0,
//   isGameOver: false,
//   winner: null,
//   permissibleMoves: [ 0, 1, 2, 5 ] }
```

To run tests:

```js
npm test
```
