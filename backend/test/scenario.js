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
  const ghostCoords = { x: 20, y: 0, z: 20 };
  let intervalId;
  const progress = generateProgress(2, () => {
    clearInterval(intervalId);
    vr.emit(Protocol.GAME_OVER, { won: false });
    console.log('Scenario finished');
  });
  const tweenPlayer = new TWEEN.Tween(playerCoords)
    .to({ x: 12, y: 0, z: 15 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.PLAYER_POSITION_UPDATE, { position: playerCoords, rotation: { x: 0, y: 0, z: 0 } });
    })
    .onComplete(() => {
      progress();
    })
    .start();
  const tweenGhost = new TWEEN.Tween(ghostCoords)
    .to({ x: 12, y: 0, z: 12 }, 5000)
    .onUpdate(() => {
      vr.emit(Protocol.GHOST_POSITION_UPDATE, { position: ghostCoords, rotation: { x: 0, y: 0, z: 0 } });
    })
    .onComplete(() => {
      progress();
    })
    .start();
  intervalId = setInterval(() => {
    TWEEN.update();
  }, 1000 / 20);
};

init();
