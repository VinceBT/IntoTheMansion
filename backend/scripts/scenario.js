import io from 'socket.io-client';
import TWEEN from 'tween.js';
import {generateProgress} from '../src/utils';

import serverStatus from '../assets/status.json';
import Protocol from '../src/Protocol';

const fullRemote = `http://${serverStatus.devRemote}:${serverStatus.port}`;

console.log(`Connecting to ${fullRemote}`);

const external = io(fullRemote);

const connect = () => new Promise((resolve, reject) => {
  const progress = generateProgress(1, () => {
    resolve();
  });
  external.on('connect', () => {
    console.log(`External sender connected to ${fullRemote}`);
    progress();
  });
});

const register = () => new Promise((resolve, reject) => {
  const progress = generateProgress(1, () => {
    resolve();
  });
  external.emit(Protocol.REGISTER, {type: 'EXTERNAL'}, (status) => {
    if (status.success)
      progress();
    else throw new Error(status.error);
  });
});

const getMap = () => new Promise((resolve, reject) => {
  external.emit(Protocol.GET_MAP_DEBUG, (mapData) => {
    if (mapData)
      resolve(mapData);
    else reject();
  });
});

const init = async () => {
  await connect();
  await register();
  const mapData = await getMap();
  console.log(mapData);

  const playerCoords = {x: 3, y: 0, z: 3, r: 0};
  const ghost1Coords = {x: 20, y: 0, z: 20, r: 0};
  const ghost2Coords = {x: 3, y: 0, z: 30, r: 0};

  let intervalId;

  const moveProgress = generateProgress(3, () => {
    clearInterval(intervalId);
    external.emit(Protocol.GAME_OVER, {won: true});
    setTimeout(() => {
      external.emit(Protocol.RESTART);
      setTimeout(() => {
        external.emit(Protocol.GAME_OVER, {won: false, killedBy: 1, deathType: 'trap'});
        setTimeout(() => {
          external.emit(Protocol.RESTART);
          console.log('Scenario finished');
          external.disconnect();
        }, 1000);
      }, 1000);
    }, 1000);
  });

  for (let i = 0; i < 50; i++) {
    const id = 'trap_' + Math.round(Math.random() * 3000000).toString();
    setTimeout(() => {
      external.emit(Protocol.CREATE_TRAP, {
        name: id,
        player: Math.floor(Math.random() * 2),
        position: {
          x: Math.round(Math.random() * mapData.terrain.width),
          y: 5,
          z: Math.round(Math.random() * mapData.terrain.height),
        },
        type: Math.floor(Math.random() * 2) == 0 ? 'DeathTrap' : 'ScreamerTrap',
      });
      setTimeout(() => {
          external.emit(Protocol.TRAP_TRIGGERED, {
            trapId: id,
          });
          setTimeout(() => {
            external.emit(Protocol.REMOVE_TRAP, {
              id: id,
            }, 5000);
          });
      }, 500);
    }, 1000 + i * 10);
  }

  for (let i = 0; i < mapData.objects.doors.length; i++) {
    const door = mapData.objects.doors[i];
    setTimeout(() => {
      external.emit(Protocol.DOOR_UPDATE, {
        name: door.id,
        open: true,
      });
      setTimeout(() => {
        external.emit(Protocol.DOOR_UPDATE, {
          name: door.id,
          open: false,
        });
      }, 500);
    }, 1000 + i * 50);
  }

  const tweenPlayer = new TWEEN.Tween(playerCoords)
    .to({x: 12, y: 0, z: 12, r: Math.PI * 2 * 10}, 5000)
    .onUpdate(() => {
      external.emit(Protocol.PLAYER_POSITION_UPDATE, {
        position: {x: playerCoords.x, y: playerCoords.y, z: playerCoords.z},
        rotation: {x: 0, y: playerCoords.r, z: 0},
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost1 = new TWEEN.Tween(ghost1Coords)
    .to({x: 12, y: 0, z: 12, r: Math.PI * 2 * 10}, 5000)
    .onUpdate(() => {
      external.emit(Protocol.GHOST_POSITION_UPDATE, {
        player: 0,
        position: {x: ghost1Coords.x, y: ghost1Coords.y, z: ghost1Coords.z},
        rotation: {x: 0, y: ghost1Coords.r, z: 0},
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost2 = new TWEEN.Tween(ghost2Coords)
    .to({x: 10, y: 0, z: 13, r: Math.PI * 2 * 10}, 5000)
    .onUpdate(() => {
      external.emit(Protocol.GHOST_POSITION_UPDATE, {
        player: 1,
        position: {x: ghost2Coords.x, y: ghost2Coords.y, z: ghost2Coords.z},
        rotation: {x: 0, y: ghost2Coords.r, z: 0},
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
