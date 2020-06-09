const Ayoayo = require('../ayoayo');

(function () {
  let game;
  const newGameButton = document.querySelector('.controls button');
  const players = document.querySelectorAll('.player');
  const noGamePadding = document.querySelector('.no-game-padding');
  const turnBadges = document.querySelectorAll('.turn-badge');
  const seedingHand = document.querySelector('.hand.seeding');
  const capturingHand = document.querySelector('.hand.capturing');
  const winnerBadges = document.querySelectorAll('.winner-badge');
  let currentEvent;
  let eventQueue = [];

  // TODO: Disable all buttons during event handling

  const eventTypeToHandler = {
    [Ayoayo.events.PICKUP_SEEDS]: handlePickupSeedsEvent,
    [Ayoayo.events.MOVE_TO]: handleMoveToEvent,
    [Ayoayo.events.DROP_SEED]: handleDropSeedEvent,
    [Ayoayo.events.SWITCH_TURN]: handleSwitchTurnEvent,
    [Ayoayo.events.CAPTURE]: handleCaptureEvent,
    [Ayoayo.events.GAME_OVER]: handleGameOverEvent,
  };

  const DEFAULT_EVENT_DURATION = 250;

  newGameButton.addEventListener('click', onClickNewGame);
  document.querySelectorAll('.side .pit').forEach((pit) => {
    pit.addEventListener('mouseenter', onMouseEnterPit);
    pit.addEventListener('focus', onMouseEnterPit);
    pit.addEventListener('mouseleave', onMouseLeavePit);
    pit.addEventListener('blur', onMouseLeavePit);
    pit.addEventListener('click', onClickPit);
  });
  document.querySelectorAll('.captured').forEach((pit) => {
    pit.addEventListener('mouseenter', onMouseEnterPit);
    pit.addEventListener('mouseleave', onMouseLeavePit);
  });

  init();
  requestAnimationFrame(handleEventQueue);

  function onClickNewGame() {
    const onPickupSeeds = onGameEvent(Ayoayo.events.PICKUP_SEEDS);
    const onMoveTo = onGameEvent(Ayoayo.events.MOVE_TO);
    const onDropSeed = onGameEvent(Ayoayo.events.DROP_SEED);
    const onSwitchTurn = onGameEvent(Ayoayo.events.SWITCH_TURN);
    const onCapture = onGameEvent(Ayoayo.events.CAPTURE);
    const onGameOver = onGameEvent(Ayoayo.events.GAME_OVER);

    game = new Ayoayo();
    game.on(Ayoayo.events.PICKUP_SEEDS, onPickupSeeds);
    game.on(Ayoayo.events.MOVE_TO, onMoveTo);
    game.on(Ayoayo.events.DROP_SEED, onDropSeed);
    game.on(Ayoayo.events.SWITCH_TURN, onSwitchTurn);
    game.on(Ayoayo.events.CAPTURE, onCapture);
    game.on(Ayoayo.events.GAME_OVER, onGameOver);

    players.forEach((player) => {
      player.style.display = 'block';
    });
    noGamePadding.style.display = 'none';

    initDisplay(game);

    currentEvent = null;
    eventQueue = [];
  }

  function initDisplay(game) {
    // Set in-game seeds
    game.board.forEach((row, rowIndex) => {
      row.forEach((cellCount, cellIndex) => {
        const pit = getPitAtPosition(rowIndex, cellIndex);
        initSeedStore(pit, cellCount);
      });
    });

    // Set captured seeds
    game.captured.forEach((capturedCount, index) => {
      const captureStore = captureStoreByPlayer(index);
      initSeedStore(captureStore, capturedCount);
    });

    // Clear seeds in hands
    [seedingHand, capturingHand].forEach((hand) => {
      const seedsInHand = hand.querySelectorAll('.seed');
      seedsInHand.forEach((seed) => {
        hand.removeChild(seed);
      });
    });

    winnerBadges.forEach((badge) => {
      badge.style.display = 'none';
    });

    updateTurnBadges();
    disableUnplayablePits();
  }

  function initSeedStore(store, count) {
    while (store.lastElementChild) {
      store.removeChild(store.lastElementChild);
    }

    for (let i = 0; i < count; i++) {
      const seed = document.createElement('div');
      seed.classList.add('seed');
      styleSeed(seed);
      store.appendChild(seed);
    }
    appendSummary(store, count);
  }

  function disableUnplayablePits() {
    const nextPlayer = game.nextPlayer;
    const otherPlayer = Ayoayo.togglePlayer(game.nextPlayer);

    game.board[otherPlayer].forEach((_cell, cellIndex) => {
      const pit = getPitAtPosition(otherPlayer, cellIndex);
      pit.classList.add('disabled');
    });

    game.board[nextPlayer].forEach((_cell, cellIndex) => {
      const pit = getPitAtPosition(nextPlayer, cellIndex);
      if (game.permissibleMoves.includes(cellIndex)) {
        pit.classList.remove('disabled');
      } else {
        pit.classList.add('disabled');
      }
    });
  }

  function updateTurnBadges() {
    const nextPlayer = game.nextPlayer;
    const otherPlayer = Ayoayo.togglePlayer(game.nextPlayer);

    turnBadges.item(nextPlayer).style.display = 'inline-block';
    turnBadges.item(otherPlayer).style.display = 'none';
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

  function appendSummary(parent, count) {
    const summary = document.createElement('div');
    summary.classList.add('pit-summary');
    summary.textContent = String(count);
    parent.appendChild(summary);
  }

  function init() {
    const seeds = document.querySelectorAll('.seed');
    seeds.forEach((seed) => {
      styleSeed(seed);
    });
  }

  function onClickPit(evt) {
    if (game && !evt.currentTarget.classList.contains('disabled')) {
      const classList = evt.currentTarget.classList.toString().split(' ');
      const idxClassName = classList.find((className) =>
        className.includes('pit-'),
      );
      const cellIndex = idxClassName[4] - 1;
      game.play(cellIndex);
    }
  }

  function onGameEvent(type) {
    return function (...args) {
      eventQueue.push({ type, args });
    };
  }

  function handleEventQueue(time) {
    if (!currentEvent) {
      if (eventQueue.length == 0) {
        requestAnimationFrame(handleEventQueue);
        return;
      }

      currentEvent = eventQueue.shift();
      currentEvent.start = time;
    }

    const fractionDone = (time - currentEvent.start) / DEFAULT_EVENT_DURATION;

    if (fractionDone > 1) {
      currentEvent = null;
      requestAnimationFrame(handleEventQueue);
      return;
    }

    const handler = eventTypeToHandler[currentEvent.type];
    handler(currentEvent, fractionDone);

    requestAnimationFrame(handleEventQueue);
  }

  function handlePickupSeedsEvent(event) {
    const [row, column] = event.args;
    const [handRowPosition, handColumnPosition] = getPitPosition(row, column);
    seedingHand.style.left = `${handColumnPosition}px`;
    seedingHand.style.top = `${handRowPosition}px`;

    const pit = getPitAtPosition(row, column);
    const seeds = pit.querySelectorAll(`.seed`);

    if (seeds.length) {
      seeds.forEach((seed) => {
        pit.removeChild(seed);
        seedingHand.appendChild(seed);
      });
      pit.querySelector('.pit-summary').textContent = '0';
    }
  }

  function getPitPosition(row, column) {
    return [45 + row * 180, 42 + column * 106];
  }

  function getPitAtPosition(row, column) {
    return document.querySelector(`.side-${row + 1} .pit-${column + 1}`);
  }

  function handleMoveToEvent(event, fractionDone) {
    const [[initialRow, initialColumn], [nextRow, nextColumn]] = event.args;
    const [initialRowHandPosition, initialColumnHandPosition] = getPitPosition(
      initialRow,
      initialColumn,
    );
    const [nextRowHandPosition, nextColumnHandPosition] = getPitPosition(
      nextRow,
      nextColumn,
    );
    const currentRowHandPosition =
      initialRowHandPosition +
      fractionDone * (nextRowHandPosition - initialRowHandPosition);
    const currentColumnHandPosition =
      initialColumnHandPosition +
      fractionDone * (nextColumnHandPosition - initialColumnHandPosition);
    seedingHand.style.left = `${currentColumnHandPosition}px`;
    seedingHand.style.top = `${currentRowHandPosition}px`;

    finishCapture();
  }

  // Reset captured seeds status
  // Transfer seeds from capturing hand to capture store
  function finishCapture() {
    const seedsInCapturingHand = capturingHand.querySelectorAll('.seed');
    const playerThatCaptured = capturingHand.style.top[0] == '-' ? 0 : 1;
    const captureStore = captureStoreByPlayer(playerThatCaptured);

    seedsInCapturingHand.forEach((seed) => {
      capturingHand.removeChild(seed);
      captureStore.appendChild(seed);
    });

    const pitSummary = captureStore.querySelector('.pit-summary');
    pitSummary.textContent = `${
      Number(pitSummary.textContent) + seedsInCapturingHand.length
    }`;
  }

  function handleDropSeedEvent(event, fractionDone) {
    if (fractionDone == 0) {
      const firstSeedInHand = seedingHand.querySelector('.seed');
      seedingHand.removeChild(firstSeedInHand);
      const [row, column] = event.args;
      const pit = getPitAtPosition(row, column);
      pit.appendChild(firstSeedInHand);
      const pitSummary = pit.querySelector('.pit-summary');
      pitSummary.textContent = `${Number(pitSummary.textContent) + 1}`;
    }
  }

  function handleSwitchTurnEvent(_event, fractionDone) {
    if (fractionDone == 0) {
      updateTurnBadges();
      disableUnplayablePits();
    }
  }

  function captureStoreByPlayer(player) {
    return document.querySelector(`.player-${player + 1} .captured`);
  }

  function handleCaptureEvent(event, fractionDone) {
    if (fractionDone == 0) {
      finishCapture();
    }

    const [row, column, capturingPlayer] = event.args;

    const pit = getPitAtPosition(row, column);
    const seedsInPit = pit.querySelectorAll('.seed');
    seedsInPit.forEach((seed) => {
      pit.removeChild(seed);
      capturingHand.appendChild(seed);
    });

    const [capturedPitRowPosition, capturedPitColumnPosition] = getPitPosition(
      row,
      column,
    );
    const [
      captureStoreRowPosition,
      captureStoreColumnPosition,
    ] = getCaptureStorePosition(capturingPlayer);

    capturingHand.style.top = `${
      capturedPitRowPosition +
      fractionDone * (captureStoreRowPosition - capturedPitRowPosition)
    }px`;
    capturingHand.style.left = `${
      capturedPitColumnPosition +
      fractionDone * (captureStoreColumnPosition - capturedPitColumnPosition)
    }px`;

    const pitSummary = pit.querySelector('.pit-summary');
    pitSummary.textContent = '0';
  }

  function handleGameOverEvent(event, fractionDone) {
    if (fractionDone == 0) {
      finishCapture();

      disableUnplayablePits();

      const [winner] = event.args;

      turnBadges.forEach((badge) => {
        badge.style.display = 'none';
      });

      if (winner == -1) {
        winnerBadges.forEach((badge) => {
          badge.textContent = 'Draw!';
          badge.style.display = 'inline-block';
        });
        return;
      }

      const badge = winnerBadges.item(winner);
      badge.textContent = 'Winner!';
      badge.style.display = 'inline-block';
    }
  }

  function getCaptureStorePosition(player) {
    return [-90 + player * 450, 315];
  }
})();
