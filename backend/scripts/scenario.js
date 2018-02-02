import io from 'socket.io-client';
import TWEEN from 'tween.js';
import { generateProgress } from '../src/utils';

import serverStatus from '../assets/status.json';
import Protocol from '../src/Protocol';

const fullRemote = `http://${serverStatus.devRemote}:${serverStatus.port}`;

console.log(`Connecting to ${fullRemote}`);

const table = io(fullRemote);
const tablet = io(fullRemote);
const vr = io(fullRemote);

const connect = () => new Promise((resolve, reject) => {
  const progress = generateProgress(3, () => {
    resolve();
  });
  table.on('connect', () => {
    console.log(`Fake table connected to ${fullRemote}`);
    progress();
  });
  tablet.on('connect', () => {
    console.log(`Fake tablet connected to ${fullRemote}`);
    progress();
  });
  vr.on('connect', () => {
    console.log(`Fake VR connected to ${fullRemote}`);
    progress();
  });
});

const register = () => new Promise((resolve, reject) => {
  const progress = generateProgress(3, () => {
    resolve();
  });
  table.emit(Protocol.REGISTER, { type: 'TABLE' }, (status) => {
    if (status.success)
      progress();
    else throw new Error(status.error);
  });
  tablet.emit(Protocol.REGISTER, { type: 'TABLET' }, (status) => {
    if (status.success)
      progress();
    else throw new Error(status.error);
  });
  vr.emit(Protocol.REGISTER, { type: 'VR' }, (status) => {
    if (status.success)
      progress();
    else throw new Error(status.error);
  });
});

const init = async () => {
  await connect();
  await register();
  const playerCoords = { x: 3, y: 0, z: 3, r: 0 };
  const ghost1Coords = { x: 20, y: 0, z: 20, r: 0 };
  const ghost2Coords = { x: 3, y: 0, z: 30, r: 0 };
  let intervalId;
  const moveProgress = generateProgress(3, () => {
    clearInterval(intervalId);
    vr.emit(Protocol.GAME_OVER, { won: true });
    setTimeout(() => {
      vr.emit(Protocol.RESTART);
      setTimeout(() => {
        vr.emit(Protocol.GAME_OVER, { won: false });
        setTimeout(() => {
          vr.emit(Protocol.RESTART);
          console.log('Scenario finished');
          vr.disconnect();
        }, 1000);
      }, 1000);
    }, 1000);
  });
  setTimeout(() => {
    table.emit(Protocol.CREATE_TRAP, {
      name: '3F',
      player: 0,
      position: {
        x: 5,
        y: 5,
        z: 5,
      },
      type: 'DeathTrap',
    });
    setTimeout(() => {
      table.emit(Protocol.REMOVE_TRAP, {
        id: '3F',
      });
    }, 1000);
  }, 2000);
  const tweenPlayer = new TWEEN.Tween(playerCoords)
    .to({ x: 12, y: 0, z: 12, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.PLAYER_POSITION_UPDATE, {
        position: { x: playerCoords.x, y: playerCoords.y, z: playerCoords.z },
        rotation: { x: 0, y: playerCoords.r, z: 0 },
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost1 = new TWEEN.Tween(ghost1Coords)
    .to({ x: 12, y: 0, z: 12, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.GHOST_POSITION_UPDATE, {
        player: 0,
        position: { x: ghost1Coords.x, y: ghost1Coords.y, z: ghost1Coords.z },
        rotation: { x: 0, y: ghost1Coords.r, z: 0 },
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost2 = new TWEEN.Tween(ghost2Coords)
    .to({ x: 10, y: 0, z: 13, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.GHOST_POSITION_UPDATE, {
        player: 1,
        position: { x: ghost2Coords.x, y: ghost2Coords.y, z: ghost2Coords.z },
        rotation: { x: 0, y: ghost2Coords.r, z: 0 },
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  intervalId = setInterval(() => {
    TWEEN.update();
  }, 1000 / 20);
};

init();
