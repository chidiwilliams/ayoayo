const Ayoayo = require('../ayoayo');

(function () {
  let game;
  const newGameButton = document.querySelector('.controls button');
  const sides = document.querySelectorAll('.side');
  const players = document.querySelectorAll('.player');
  const noGamePadding = document.querySelector('.no-game-padding');
  const turnBadges = document.querySelectorAll('.turn-badge');
  const hand = document.querySelector('.hand');
  let currentEvent;
  let eventQueue = [];

  newGameButton.addEventListener('click', onClickNewGame);
  document.querySelectorAll('.side .pit').forEach((pit) => {
    pit.addEventListener('mouseenter', onMouseEnterPit);
    pit.addEventListener('focus', onMouseEnterPit);
    pit.addEventListener('mouseleave', onMouseLeavePit);
    pit.addEventListener('blur', onMouseLeavePit);
    pit.addEventListener('click', onClickPit);
  });

  initializeSeeds();

  function onClickNewGame() {
    game = new Ayoayo();
    game.on(Ayoayo.events.PICKUP_SEEDS, onPickupSeeds);
    game.on(Ayoayo.events.MOVE_TO, onMoveTo);
    game.on(Ayoayo.events.DROP_SEED, onDropSeed);
    game.on(Ayoayo.events.END_TURN, onEndTurn);

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

    const seedsInHand = hand.querySelectorAll('.seed');
    seedsInHand.forEach((seed) => {
      hand.removeChild(seed);
    });

    currentEvent = null;
    eventQueue = [];
  }

  function updateTurn() {
    const nextPlayer = game.nextPlayer;
    const otherPlayer = game.nextPlayer == 0 ? 1 : 0;

    turnBadges.item(nextPlayer).style.display = 'inline-block';
    turnBadges.item(otherPlayer).style.display = 'none';

    sides.item(nextPlayer).classList.remove('disabled');
    sides.item(otherPlayer).classList.add('disabled');
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

  function onClickPit(evt) {
    const sideElement = evt.currentTarget.parentElement;
    if (game && !sideElement.classList.contains('disabled')) {
      const classList = evt.currentTarget.classList.toString().split(' ');
      const idxClassName = classList.find((className) =>
        className.includes('pit-'),
      );
      const cellIndex = idxClassName[4] - 1;
      game.play(cellIndex);
    }
  }

  function onPickupSeeds(...args) {
    eventQueue.push({ type: Ayoayo.events.PICKUP_SEEDS, args });
  }

  function onMoveTo(...args) {
    eventQueue.push({ type: Ayoayo.events.MOVE_TO, args });
  }

  function onDropSeed(...args) {
    eventQueue.push({ type: Ayoayo.events.DROP_SEED, args });
  }

  function onEndTurn(...args) {
    eventQueue.push({ type: Ayoayo.events.END_TURN, args });
    requestAnimationFrame(handleEventQueue);
  }

  const eventDurations = {
    [Ayoayo.events.PICKUP_SEEDS]: 250,
    [Ayoayo.events.MOVE_TO]: 250,
  };

  function handleEventQueue(time) {
    if (!currentEvent) {
      currentEvent = eventQueue.shift();
      if (!currentEvent) {
        requestAnimationFrame(handleEventQueue);
        return;
      }

      currentEvent.start = time;
      console.log(currentEvent, time);
      requestAnimationFrame(handleEventQueue);
      return;
    }

    const fractionDone =
      (time - currentEvent.start) / (eventDurations[currentEvent.type] || 250);

    if (fractionDone > 1) {
      currentEvent = null;
      requestAnimationFrame(handleEventQueue);
      return;
    }

    switch (currentEvent.type) {
      case Ayoayo.events.PICKUP_SEEDS:
        handlePickupSeedsEvent(currentEvent, fractionDone);
        break;
      case Ayoayo.events.MOVE_TO:
        handleMoveToEvent(currentEvent, fractionDone);
        break;
      case Ayoayo.events.DROP_SEED:
        handleDropSeedEvent(currentEvent, fractionDone);
        break;
      default:
        break;
    }

    requestAnimationFrame(handleEventQueue);
  }

  function handPositionByColumn(column) {
    return 42 + column * 106;
  }

  function handlePickupSeedsEvent(event, fractionDone) {
    const [row, column] = event.args;
    hand.style.left = `${handPositionByColumn(column)}px`;
    hand.style.top = `${45 + fractionDone * 90}px`;

    const pit = document.querySelector(`.side-${row + 1} .pit-${column + 1}`);
    const seeds = pit.querySelectorAll(`.seed`);

    if (seeds.length) {
      seeds.forEach((seed) => {
        pit.removeChild(seed);
        hand.appendChild(seed);
      });
      pit.querySelector('.pit-summary').textContent = '0';
    }
  }

  function handleMoveToEvent(event, fractionDone) {
    const [[, fromColumn], [, toColumn]] = event.args;
    const fromColumnHandPosition = handPositionByColumn(fromColumn);
    const toColumnHandPosition = handPositionByColumn(toColumn);
    const newHandPosition =
      fromColumnHandPosition +
      fractionDone * (toColumnHandPosition - fromColumnHandPosition);
    hand.style.left = `${newHandPosition}px`;
  }

  function handleDropSeedEvent(event, fractionDone) {
    console.log('dropping seed', event, fractionDone);
  }
})();
