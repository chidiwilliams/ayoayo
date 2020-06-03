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
  let droppedNextSeed = false;

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
    droppedNextSeed = false;
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
    console.log(eventQueue);
  }

  const eventDurations = {
    [Ayoayo.events.PICKUP_SEEDS]: 250,
    [Ayoayo.events.MOVE_TO]: 250,
    [Ayoayo.events.DROP_SEED]: 250,
  };

  const eventTypeToHandler = {
    [Ayoayo.events.PICKUP_SEEDS]: handlePickupSeedsEvent,
    [Ayoayo.events.MOVE_TO]: handleMoveToEvent,
    [Ayoayo.events.DROP_SEED]: handleDropSeedEvent,
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

    const handler = eventTypeToHandler[currentEvent.type];
    if (handler) {
      handler(currentEvent, fractionDone);
    }

    requestAnimationFrame(handleEventQueue);
  }

  function handlePickupSeedsEvent(event) {
    const [row, column] = event.args;
    const [handRowPosition, handColumnPosition] = getHandPosition(row, column);
    hand.style.left = `${handColumnPosition}px`;
    hand.style.top = `${handRowPosition}px`;

    const pit = getPitAtPosition(row, column);
    const seeds = pit.querySelectorAll(`.seed`);

    if (seeds.length) {
      seeds.forEach((seed) => {
        pit.removeChild(seed);
        hand.appendChild(seed);
      });
      pit.querySelector('.pit-summary').textContent = '0';
    }
  }

  function getHandPosition(row, column) {
    return [45 + row * 180, 42 + column * 106];
  }

  function getPitAtPosition(row, column) {
    return document.querySelector(`.side-${row + 1} .pit-${column + 1}`);
  }

  function handleMoveToEvent(event, fractionDone) {
    const [[initialRow, initialColumn], [nextRow, nextColumn]] = event.args;
    const [initialRowHandPosition, initialColumnHandPosition] = getHandPosition(
      initialRow,
      initialColumn,
    );
    const [nextRowHandPosition, nextColumnHandPosition] = getHandPosition(
      nextRow,
      nextColumn,
    );
    const currentRowHandPosition =
      initialRowHandPosition +
      fractionDone * (nextRowHandPosition - initialRowHandPosition);
    const currentColumnHandPosition =
      initialColumnHandPosition +
      fractionDone * (nextColumnHandPosition - initialColumnHandPosition);
    hand.style.left = `${currentColumnHandPosition}px`;
    hand.style.top = `${currentRowHandPosition}px`;

    droppedNextSeed = false;
  }

  function handleDropSeedEvent(event) {
    if (!droppedNextSeed) {
      const firstSeedInHand = hand.querySelector('.seed');
      hand.removeChild(firstSeedInHand);
      const [row, column] = event.args;
      const pit = getPitAtPosition(row, column);
      pit.appendChild(firstSeedInHand);
      const pitSummary = pit.querySelector('.pit-summary');
      pitSummary.textContent = `${Number(pitSummary.textContent) + 1}`;
      droppedNextSeed = true;
    }
  }
})();
