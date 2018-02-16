import io from 'socket.io-client';
import TWEEN from 'tween.js';
import { generateProgress } from '../src/utils';

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
  external.emit(Protocol.REGISTER, { type: 'EXTERNAL' }, (status) => {
    if (status.success)
      progress();
    else throw new Error(status.error);
  });
});

const getMap = () => new Promise((resolve, reject) => {
  external.emit(Protocol.GET_MAP, 'mansion1', (mapData) => {
    if (mapData)
      resolve(mapData);
    else reject();
  });
});

const init = async () => {
  await connect();
  await register();

  const mapData = await getMap();
  // console.log(mapData);

  const playerCoords = { x: mapData.player.spawn[0], z: mapData.player.spawn[1], r: 0 };
  const ghost1Coords = { x: mapData.ghosts[0].spawn[0], z: mapData.ghosts[0].spawn[1], r: 0 };
  const ghost2Coords = { x: mapData.ghosts[1].spawn[0], z: mapData.ghosts[1].spawn[1], r: 0 };

  const FINAL_DESTINATION = {x: mapData.terrain.width / 2, z: mapData.terrain.height / 2};

  let intervalId;

  const moveProgress = generateProgress(3, () => {
    clearInterval(intervalId);
    external.emit(Protocol.GAME_OVER, { won: true });
    setTimeout(() => {
      external.emit(Protocol.RESTART);
      setTimeout(() => {
        external.emit(Protocol.GAME_OVER, { won: false, killedBy: 1, deathType: 'trap' });
        setTimeout(() => {
          external.emit(Protocol.RESTART);
          console.log('Scenario finished');
          external.disconnect();
        }, 1000);
      }, 1000);
    }, 1000);
  });

  for (let i = 0; i < 30; i++) {
    const id = `trap_${Math.round(Math.random() * 3000000).toString()}`;
    setTimeout(() => {
      external.emit(Protocol.CREATE_TRAP, {
        id,
        player: Math.floor(Math.random() * 2),
        position: [
          Math.round(Math.random() * mapData.terrain.width),
          Math.round(Math.random() * mapData.terrain.height),
        ],
        type: 'DeathTrap',
      });
      setTimeout(() => {
        external.emit(Protocol.TRAP_TRIGGERED, {
          id,
        });
        setTimeout(() => {
          external.emit(Protocol.REMOVE_TRAP, {
            id,
          }, 5000);
        });
      }, 500);
    }, 1000 + i * 10);
  }

  for (let i = 0; i < mapData.objects.doors.length; i++) {
    const door = mapData.objects.doors[i];
    setTimeout(() => {
      external.emit(Protocol.DOOR_UPDATE, {
        id: door.id,
        open: true,
      });
      setTimeout(() => {
        external.emit(Protocol.DOOR_UPDATE, {
          id: door.id,
          open: false,
        });
      }, 500);
    }, 1000 + i * 50);
  }

  const tweenPlayer = new TWEEN.Tween(playerCoords)
    .to({ ...FINAL_DESTINATION, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      external.emit(Protocol.PLAYER_POSITION_UPDATE, {
        position: [playerCoords.x, playerCoords.z],
        rotation: { x: 0, y: playerCoords.r, z: 0 },
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost1 = new TWEEN.Tween(ghost1Coords)
    .to({ ...FINAL_DESTINATION, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      external.emit(Protocol.GHOST_POSITION_UPDATE, {
        id: 0,
        position: [ghost1Coords.x, ghost1Coords.z],
        rotation: { x: 0, y: ghost1Coords.r, z: 0 },
      });
    })
    .onComplete(() => {
      moveProgress();
    })
    .start();
  const tweenGhost2 = new TWEEN.Tween(ghost2Coords)
    .to({ ...FINAL_DESTINATION, r: Math.PI * 2 * 10 }, 5000)
    .onUpdate(() => {
      external.emit(Protocol.GHOST_POSITION_UPDATE, {
        id: 1,
        position: [ghost2Coords.x, ghost2Coords.z],
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
