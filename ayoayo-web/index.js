const Ayoayo = require('@chidiwilliams/ayoayo');

(function () {
  let game;
  const newGameButton = document.querySelector('.controls button');
  const sides = document.querySelectorAll('.side');
  const players = document.querySelectorAll('.player');
  const noGamePadding = document.querySelector('.no-game-padding');

  newGameButton.addEventListener('click', onClickNewGame);
  document.querySelectorAll('.pit').forEach((pit) => {
    pit.addEventListener('mouseenter', onMouseEnterPit);
    pit.addEventListener('focus', onMouseEnterPit);
    pit.addEventListener('mouseleave', onMouseLeavePit);
    pit.addEventListener('blur', onMouseLeavePit);
  });

  const seeds = document.querySelectorAll('.seed');
  seeds.forEach((seed) => {
    styleSeed(seed);
  });

  function onClickNewGame() {
    game = new Ayoayo();
    players.forEach((player) => {
      player.style.display = 'block';
    });
    noGamePadding.style.display = 'none';

    game.board.forEach((row, rowIndex) => {
      row.forEach((cellCount, cellIndex) => {
        const pit = sides[rowIndex].children.item(cellIndex);
        while (pit.lastElementChild) {
          pit.removeChild(pit.lastElementChild);
        }

        for (let i = 0; i < cellCount; i++) {
          const seed = document.createElement('div');
          seed.classList.add('seed');
          styleSeed(seed);
          pit.appendChild(seed);
        }

        const summary = document.createElement('div');
        summary.classList.add('pit-summary');
        summary.textContent = String(cellCount);
        pit.appendChild(summary);
      });
    });
  }

  function styleSeed(seed) {
    const r = Math.round(Math.random() * 360);
    const x = Math.round(Math.random() * 40) - 20;
    const y = Math.round(Math.random() * 40) - 20;
    seed.style.transform = `rotate(${r}deg) translate(${x}px, ${y}px)`;
  }

  function onMouseEnterPit(evt) {
    const summary = evt.target.querySelector('.pit-summary');
    if (summary) {
      summary.style.opacity = '100%';
    }
  }

  function onMouseLeavePit(evt) {
    const summary = evt.target.querySelector('.pit-summary');
    if (summary) {
      summary.style.opacity = '0%';
    }
  }
})();
