var assert = require('assert');
const Ayoayo = require('.');

describe('Ayoayo', function () {
  it('should have the correct board and captured values', function () {
    const ayoayo = new Ayoayo();
    ayoayo.play(1, 0);
    ayoayo.play(0, 2);
    ayoayo.play(1, 4);
    ayoayo.play(0, 2);
    ayoayo.play(1, 0);
    ayoayo.play(0, 5);
    ayoayo.play(1, 0);
    ayoayo.play(0, 3);
    ayoayo.play(1, 1);
    ayoayo.play(0, 4);
    ayoayo.play(1, 2);
    ayoayo.play(0, 2);

    assert.deepEqual(ayoayo.board, [
      [1, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0],
    ]);
    assert.deepEqual(ayoayo.captured, [24, 20]);
  });
});
