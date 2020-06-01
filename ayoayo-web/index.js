const Ayoayo = require('@chidiwilliams/ayoayo');

(function () {
  let game;
  const newGameButton = document.querySelector('.controls button');
  const sides = document.querySelectorAll('.side');
  const players = document.querySelectorAll('.player');
  const noGamePadding = document.querySelector('.no-game-padding');
  const turnBadges = document.querySelectorAll('.turn-badge');

  newGameButton.addEventListener('click', onClickNewGame);
  document.querySelectorAll('.pit').forEach((pit) => {
    pit.addEventListener('mouseenter', onMouseEnterPit);
    pit.addEventListener('focus', onMouseEnterPit);
    pit.addEventListener('mouseleave', onMouseLeavePit);
    pit.addEventListener('blur', onMouseLeavePit);
  });

  initializeSeeds();

  function onClickNewGame() {
    game = new Ayoayo();
    players.forEach((player) => {
      player.style.display = 'block';
    });
    noGamePadding.style.display = 'none';

    updateTurn();

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

  function updateTurn() {
    const nextPlayer = game.nextPlayer;
    const otherPlayer = game.nextPlayer == 0 ? 1 : 0;

    turnBadges.item(nextPlayer).style.display = 'inline-block';
    turnBadges.item(otherPlayer).style.display = 'none';

    sides.item(nextPlayer).classList.remove('disabled');
    sides.item(otherPlayer).classList.add('disabled');

    const nextPlayerPits = sides.item(nextPlayer).querySelectorAll('.pit');
    nextPlayerPits.forEach((pit) => {
      pit.removeAttribute('disabled');
    });

    const otherPlayerPits = sides.item(otherPlayer).querySelectorAll('.pit');
    otherPlayerPits.forEach((pit) => {
      pit.setAttribute('disabled', 'true');
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

  function initializeSeeds() {
    const seeds = document.querySelectorAll('.seed');
    seeds.forEach((seed) => {
      styleSeed(seed);
    });
  }
})();
