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

// game.board => [[4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4]]
// game.capture => [0, 0]

game.play(4); // Player 1 plays cell 4
game.play(2); // Player 2 plays cell 2

// game.board => [[2, 0, 10, 2, 0, 1], [0, 9, 1, 10, 1, 0]]
// game.captured => [4, 8]
```

To run tests:

```js
npm test
```
