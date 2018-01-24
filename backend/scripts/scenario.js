import io from 'socket.io-client';
import TWEEN from 'tween.js';
import { generateProgress } from '../src/utils';

import serverStatus from '../assets/status.json';
import Protocol from '../src/Protocol';

const fullRemote = `http://${serverStatus.devRemote}:${serverStatus.port}`;

console.log(`Connecting to ${fullRemote}`);
const vr = io(fullRemote);

const connect = () => new Promise((resolve, reject) => {
  vr.on('connect', () => {
    resolve();
  });
});

const register = () => new Promise((resolve, reject) => {
  vr.emit(Protocol.REGISTER, { type: 'VR' }, (status) => {
    if (status.success)
      resolve();
    else throw new Error(status.error);
  });
});

const init = async () => {
  await connect();
  await register();
  const playerCoords = { x: 3, y: 0, z: 3 };
  const ghostCoords = { x: 20, y: 0, z: 20, r: 0 };
  let intervalId;
  const moveProgress = generateProgress(2, () => {
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
  const tweenPlayer = new TWEEN.Tween(playerCoords)
    .to({ x: 12, y: 0, z: 12 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.PLAYER_POSITION_UPDATE, { position: playerCoords, rotation: { x: 0, y: 0, z: 0 } });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost = new TWEEN.Tween(ghostCoords)
    .to({ x: 12, y: 0, z: 12, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.GHOST_POSITION_UPDATE, { position: ghostCoords, rotation: { x: 0, y: ghostCoords.r, z: 0 } });
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
