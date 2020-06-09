const Ayoayo = require('.');
const tap = require('tap');

tap.test('should finish with the correct board and captured values', function (
  t,
) {
  const ayoayo = new Ayoayo();
  const plays = [
    0,
    2,
    4,
    2,
    0,
    0,
    2,
    0,
    5,
    2,
    5,
    3,
    4,
    4,
    2,
    1,
    0,
    3,
    5,
    5,
    5,
    1,
    3,
    0,
    1,
  ];

  plays.forEach((play) => ayoayo.play(play));

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

tap.todo('player 2 winning game');

tap.todo('draw game');
