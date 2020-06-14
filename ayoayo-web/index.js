const Ayoayo = require('@chidiwilliams/ayoayo');

(function () {
  let game;
  const newPVPGameButton = document.querySelector('.controls button.pvp');
  const newAIGameButton = document.querySelector('.controls button.ai');
  const players = document.querySelectorAll('.player');
  const noGamePadding = document.querySelector('.no-game-padding');
  const turnBadges = document.querySelectorAll('.turn-badge');
  const seedingHand = document.querySelector('.hand.seeding');
  const capturingHand = document.querySelector('.hand.capturing');
  const winnerBadges = document.querySelectorAll('.winner-badge');
  const pits = document.querySelectorAll('.pit');
  const board = document.querySelector('.board');
  let currentEvent;
  let eventQueue = [];

  const eventTypeToHandler = {
    [Ayoayo.events.PICKUP_SEEDS]: handlePickupSeedsEvent,
    [Ayoayo.events.MOVE_TO]: handleMoveToEvent,
    [Ayoayo.events.DROP_SEED]: handleDropSeedEvent,
    [Ayoayo.events.SWITCH_TURN]: handleSwitchTurnEvent,
    [Ayoayo.events.CAPTURE]: handleCaptureEvent,
    [Ayoayo.events.GAME_OVER]: handleGameOverEvent,
  };

  const DEFAULT_EVENT_DURATION = 200;

  const onPickupSeeds = onGameEvent(Ayoayo.events.PICKUP_SEEDS);
  const onMoveTo = onGameEvent(Ayoayo.events.MOVE_TO);
  const onDropSeed = onGameEvent(Ayoayo.events.DROP_SEED);
  const onSwitchTurn = onGameEvent(Ayoayo.events.SWITCH_TURN);
  const onCapture = onGameEvent(Ayoayo.events.CAPTURE);
  const onGameOver = onGameEvent(Ayoayo.events.GAME_OVER);

  newPVPGameButton.addEventListener('click', onClickNewPVPGame);
  newAIGameButton.addEventListener('click', onClickNewAIGame);
  document.querySelectorAll('.side .pit').forEach((pit) => {
    pit.addEventListener('click', onClickPit);
  });

  init();
  requestAnimationFrame(handleEventQueue);

  function onClickNewPVPGame() {
    game = new Ayoayo();
    onNewGame('Player 2');
  }

  function onClickNewAIGame() {
    game = Ayoayo.vsMinimax();
    onNewGame('AI');
  }

  function onNewGame(playerTwoName) {
    game.on(Ayoayo.events.PICKUP_SEEDS, onPickupSeeds);
    game.on(Ayoayo.events.MOVE_TO, onMoveTo);
    game.on(Ayoayo.events.DROP_SEED, onDropSeed);
    game.on(Ayoayo.events.SWITCH_TURN, onSwitchTurn);
    game.on(Ayoayo.events.CAPTURE, onCapture);
    game.on(Ayoayo.events.GAME_OVER, onGameOver);

    players.forEach((player, index) => {
      player.style.display = 'block';
      if (index == 1) {
        const playerName = player.querySelector('.player-name');
        playerName.textContent = playerTwoName;
      }
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

    updateTurnBadges(game.nextPlayer);
    enableOnlyPermissiblePits();
  }

  function initSeedStore(store, count) {
    while (store.lastElementChild) {
      store.removeChild(store.lastElementChild);
    }

    for (let i = 0; i < count; i++) {
      const seed = document.createElement('div');
      seed.classList.add('seed');
      store.appendChild(seed);
      styleSeed(seed);
    }
    appendSummary(store, count);
  }

  function enableOnlyPermissiblePits() {
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

  function updateTurnBadges(nextPlayer) {
    const otherPlayer = Ayoayo.togglePlayer(nextPlayer);
    turnBadges.item(nextPlayer).style.display = 'inline-block';
    turnBadges.item(otherPlayer).style.display = 'none';
  }

  function styleSeed(seed) {
    const parentWidth = seed.parentElement.clientWidth;
    const range = (40 * parentWidth) / 90; // by how much will the random position extend
    const offset = (-20 * parentWidth) / 90; // from what point
    const r = Math.round(Math.random() * 360);
    const x = Math.round(Math.random() * range) + offset;
    const y = Math.round(Math.random() * range) + offset;
    seed.style.transform = `rotate(${r}deg) translate(${x}px, ${y}px)`;
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
      // End of animation. Enable permissible pits.
      if (eventQueue.length == 0) {
        enableOnlyPermissiblePits();
      }

      currentEvent = null;
      requestAnimationFrame(handleEventQueue);
      return;
    }

    // Disable all pits during animations
    pits.forEach((pit) => {
      pit.classList.add('disabled');
    });

    const handler = eventTypeToHandler[currentEvent.type];
    handler(currentEvent, fractionDone);

    requestAnimationFrame(handleEventQueue);
  }

  function handlePickupSeedsEvent(event) {
    const [row, column] = event.args;
    const [handX, handY] = getPitPosition(row, column);
    seedingHand.style.left = `${handX}px`;
    seedingHand.style.top = `${handY}px`;

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
    const pit = getPitAtPosition(row, column);
    const pitRect = pit.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return [pitRect.x - boardRect.x, pitRect.y - boardRect.y];
  }

  function getPitAtPosition(row, column) {
    return document.querySelector(`.side-${row + 1} .pit-${column + 1}`);
  }

  function handleMoveToEvent(event, fractionDone) {
    const [[initialRow, initialColumn], [nextRow, nextColumn]] = event.args;
    const [initialPitX, initialPitY] = getPitPosition(
      initialRow,
      initialColumn,
    );
    const [nextPitX, nextPitY] = getPitPosition(nextRow, nextColumn);
    const currentHandX = initialPitX + fractionDone * (nextPitX - initialPitX);
    const currentHandY = initialPitY + fractionDone * (nextPitY - initialPitY);
    seedingHand.style.left = `${currentHandX}px`;
    seedingHand.style.top = `${currentHandY}px`;

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

  function handleSwitchTurnEvent(event, fractionDone) {
    if (fractionDone == 0) {
      const [nextPlayer] = event.args;
      updateTurnBadges(nextPlayer);
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

    const [pitX, pitY] = getPitPosition(row, column);
    const [captureStoreX, captureStoreY] = getCaptureStorePosition(
      capturingPlayer,
    );

    const currentHandX = pitX + fractionDone * (captureStoreX - pitX);
    const currentHandY = pitY + fractionDone * (captureStoreY - pitY);
    capturingHand.style.left = `${currentHandX}px`;
    capturingHand.style.top = `${currentHandY}px`;

    const pitSummary = pit.querySelector('.pit-summary');
    pitSummary.textContent = '0';
  }

  function handleGameOverEvent(event, fractionDone) {
    if (fractionDone == 0) {
      finishCapture();

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
    const captureStore = captureStoreByPlayer(player);
    const captureStoreRect = captureStore.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return [captureStoreRect.x - boardRect.x, captureStoreRect.y - boardRect.y];
  }
})();
