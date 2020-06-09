const Ayoayo = require('.');
const tap = require('tap');

tap.test('should finish with the correct board and captured values', function (
  t,
) {
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
  ayoayo.play(1);
  ayoayo.play(0);
  ayoayo.play(3);
  ayoayo.play(5);
  ayoayo.play(5);
  ayoayo.play(5);
  ayoayo.play(1);
  ayoayo.play(3);
  ayoayo.play(0);
  ayoayo.play(1);

  t.deepEqual(ayoayo.board, [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]);
  t.deepEqual(ayoayo.captured, [24, 24]);
  t.equal(ayoayo.isGameOver, true);
  t.equal(ayoayo.winner, -1);
  t.end();
});

tap.test('should throw an error if trying to play an empty cell', function (t) {
  const ayoayo = new Ayoayo();
  ayoayo.play(4);
  t.throws(() => ayoayo.play(3));
  t.end();
});
