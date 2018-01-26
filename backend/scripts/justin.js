import io from 'socket.io-client';

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
  vr.emit(Protocol.REGISTER, {type: 'VR'}, (status) => {
    if (status.success) {
      resolve();
    } else {
      throw new Error(status.error);
    }
  });
});

const init = async () => {
  await connect();
  await register();
  vr.emit(Protocol.CREATE_TRAP, {
    name: '3F',
    player: 0,
    position: {
      x: 3,
      y: 3,
      z: 3,
    },
    type: 'DeathTrap',
  });
};

init();
