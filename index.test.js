var assert = require('assert');
const Ayoayo = require('.');

describe('Ayoayo', function () {
  it('should have the correct board and captured values', function () {
    const ayoayo = new Ayoayo();
    ayoayo.play(0);
    ayoayo.play(2);
    ayoayo.play(4);
    ayoayo.play(2);
    ayoayo.play(0);
    ayoayo.play(0);
    ayoayo.play(2);
    ayoayo.play(0);
    ayoayo.play(5);
    ayoayo.play(2);
    ayoayo.play(5);
    ayoayo.play(3);
    ayoayo.play(4);
    ayoayo.play(4);
    ayoayo.play(2);
    ayoayo.play(2);
    ayoayo.play(0);
    ayoayo.play(0);

    assert.deepEqual(ayoayo.board, [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 1],
    ]);
    assert.deepEqual(ayoayo.captured, [24, 20]);
  });
});
